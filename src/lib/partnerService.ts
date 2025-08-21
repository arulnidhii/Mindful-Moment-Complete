import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  serverTimestamp,
  addDoc,
  query,
  limit,
  orderBy
} from 'firebase/firestore';
import { db, auth, signIn } from './firebase';
import { usePartnerStore } from '../state/partnerStore';
import { useUserStore } from '../../store/userStore';
import { generatePartnerPostcard } from './insightsEngine';
import { MoodEntry } from '@/types/mood';

// --- Connection Management ---

export const createConnectionRequest = async (): Promise<string> => {
  // Ensure we have a valid authenticated user; avoid creating invites while offline
  let currentUser = auth?.currentUser as any;
  if (!currentUser) {
    try {
      currentUser = await signIn();
    } catch {}
  }
  const userName = useUserStore.getState().userName;
  if (!currentUser || !userName || currentUser.uid === 'offline-user') {
    throw new Error("Please ensure you're online and your name is set in Settings before inviting a partner.");
  }

  const requestRef = doc(collection(db, 'connectionRequests'));
  await setDoc(requestRef, {
    fromUserId: currentUser.uid,
    fromUserName: userName,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return requestRef.id;
};

export const getRequestDetails = async (requestId: string): Promise<{ fromUserName: string } | null> => {
    const requestRef = doc(db, 'connectionRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    if (requestSnap.exists() && requestSnap.data().status === 'pending') {
        return { fromUserName: requestSnap.data().fromUserName };
    }
    return null;
};

export const acceptConnectionRequest = async (requestId: string) => {
  const acceptorUser = auth.currentUser;
  const acceptorName = useUserStore.getState().userName;
  if (!acceptorUser || !acceptorName) throw new Error("Please set your name in Settings before accepting an invitation.");

  const requestRef = doc(db, 'connectionRequests', requestId);
  const requestSnap = await getDoc(requestRef);

  if (!requestSnap.exists() || requestSnap.data().status !== 'pending') {
    throw new Error("Invalid or expired connection request.");
  }

  const { fromUserId: requesterId, fromUserName: requesterName } = requestSnap.data();
  if (requesterId === 'offline-user') {
    throw new Error("This invitation was created while the sender was offline. Please ask them to open the app online and share a new link.");
  }

  await setDoc(doc(db, 'users', acceptorUser.uid), { partner: { id: requesterId, name: requesterName } }, { merge: true });
  await setDoc(doc(db, 'users', requesterId), { partner: { id: acceptorUser.uid, name: acceptorName } }, { merge: true });

  await setDoc(requestRef, { status: 'accepted' }, { merge: true });

  // Set partner locally to the requester (inviter) so the displayed name is correct
  usePartnerStore.getState().setPartner({ id: requesterId, name: requesterName });
};

export const listenForConnectionChanges = () => {
  try {
    if (!auth || !auth.currentUser) return () => {};
    const userRef = doc(db, 'users', auth.currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        usePartnerStore.getState().setPartner(userData.partner || null);
      } else {
        usePartnerStore.getState().clearPartner();
      }
    });

    return unsubscribe;
  } catch (e) {
    console.warn('listenForConnectionChanges setup skipped:', e);
    return () => {};
  }
};

// --- Feature flag ---
export const USE_DAILY_ROLLUP = true;

// --- Insight "Postcard" Sharing ---

export interface InsightPostcard {
    type: 'mood_booster' | 'gentle_nudge' | 'rhythm_note';
    text: string;
    emoji: string;
    highlights?: string[];
    timestamp: any;
}

export const sendInsightPostcard = async (postcard: Omit<InsightPostcard, 'timestamp'>) => {
  const partner = usePartnerStore.getState().partner;
  if (!auth.currentUser || !partner) return;

  const postcardWithTimestamp = { ...postcard, fromId: auth.currentUser.uid, timestamp: serverTimestamp() };
  const partnerPostcardsRef = collection(db, 'users', partner.id, 'postcards');
  await addDoc(partnerPostcardsRef, postcardWithTimestamp);
};

// --- Daily Rollup Types & Helpers ---
export interface DailyInsightItem { type: InsightPostcard['type']; text: string; emoji: string; highlights?: string[]; createdAt: any; }
export interface DailyInsightsDay { date: string; items: DailyInsightItem[]; counts?: Record<string, number>; updatedAt?: any; }

const todayKey = () => new Date().toISOString().split('T')[0];

export const upsertDailyInsight = async (item: Omit<DailyInsightItem, 'createdAt'>) => {
  const partner = usePartnerStore.getState().partner;
  if (!auth.currentUser || !partner) return;
  const dateKey = todayKey();
  const docRef = doc(db, 'users', partner.id, 'insights_daily', dateKey);
  const snap = await getDoc(docRef);
  // Firestore does not allow serverTimestamp() inside arrays. Use a numeric epoch.
  const createdAt = Date.now();
  let items: DailyInsightItem[] = [];
  let counts: Record<string, number> = {};
  if (snap.exists()) {
    const d = snap.data() as DailyInsightsDay;
    items = Array.isArray(d.items) ? [...d.items] as DailyInsightItem[] : [];
    counts = { ...(d.counts || {}) };
  }
  // replace by type to avoid duplicates
  const idx = items.findIndex(i => i.type === item.type);
  const newItem: DailyInsightItem = { ...item, createdAt } as DailyInsightItem;
  const isInsert = idx < 0;
  if (!isInsert) items[idx] = newItem; else items.unshift(newItem);
  // cap items to 3
  items = items.slice(0, 3);
  // update counts only when inserting a new type for the day
  if (isInsert) counts[item.type] = (counts[item.type] || 0) + 1;
  await setDoc(docRef, { date: dateKey, items, counts, updatedAt: serverTimestamp() }, { merge: true });
};

export const listenForDailyInsights = (onDays: (days: DailyInsightsDay[]) => void) => {
  if (!auth.currentUser) return () => {};
  const daysRef = collection(db, 'users', auth.currentUser.uid, 'insights_daily');
  const q = query(daysRef, orderBy('date', 'desc'), limit(7));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const out: DailyInsightsDay[] = [];
    snapshot.forEach((docSnap) => out.push(docSnap.data() as DailyInsightsDay));
    onDays(out);
  });
  return unsubscribe;
};

// --- Daily Postcard Generation ---

/**
 * Generates and sends a daily postcard to partner if meaningful insights are found.
 * This should be called once per day, typically in the morning or after a certain number of check-ins.
 */
export const generateAndSendDailyPostcard = async (allEntries: MoodEntry[]) => {
  const partner = usePartnerStore.getState().partner;
  if (!partner) { console.log('📭 Skipping partner postcard: no partner connected'); return; }
  if (!auth?.currentUser) { console.log('📭 Skipping partner postcard: not authenticated'); return; }

  // Get today's entries
  const today = new Date();
  const todayKey = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const todayEntries = allEntries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    const entryKey = entryDate.toISOString().split('T')[0];
    return entryKey === todayKey;
  });

  // Generate postcard using insights engine
  const postcard = generatePartnerPostcard(todayEntries);

  if (postcard) {
    try {
      if (USE_DAILY_ROLLUP) {
        await upsertDailyInsight({ type: postcard.type, text: postcard.text, emoji: postcard.emoji, highlights: postcard.highlights });
        console.log('📬 Daily insight upserted for rollup:', postcard.text);
      } else {
        await sendInsightPostcard(postcard);
        console.log('📬 Daily postcard sent to partner:', postcard.text);
      }
    } catch (error) {
      console.error('Failed to persist daily insight:', error);
    }
  } else {
    console.log('📭 No meaningful daily insight found for postcard');
  }
};

export const listenForInsightPostcards = (onPostcardsReceived: (postcards: InsightPostcard[]) => void) => {
    if (!auth.currentUser) return () => {};
    const postcardsRef = collection(db, 'users', auth.currentUser.uid, 'postcards');
    const q = query(postcardsRef, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const receivedPostcards: InsightPostcard[] = [];
        snapshot.forEach((doc) => {
            receivedPostcards.push(doc.data() as InsightPostcard);
        });
        onPostcardsReceived(receivedPostcards);
    });
    return unsubscribe;
};

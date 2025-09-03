import { createConnectionRequest } from '../lib/partnerService';

// Public universal link used in emails/QR (handled by web fallback on the domain)
export const UNIVERSAL_LINK_BASE_URL = "https://app.quantifylabs.ai/connect";
// Private app scheme best for camera QR scans and direct app-to-app handoff
export const SCHEME_LINK_BASE_URL = "myapp://connect";

export const generatePartnerRequestLinks = async (): Promise<{ universal: string; scheme: string }> => {
  try {
    const requestId = await createConnectionRequest();
    return {
      universal: `${UNIVERSAL_LINK_BASE_URL}/${requestId}`,
      scheme: `${SCHEME_LINK_BASE_URL}/${requestId}`,
    };
  } catch (error) {
    console.error("Failed to generate partner link:", error);
    throw new Error('Could not create an invitation link. Please try again.');
  }
};

// Back-compat helper if anything still imports the old name
export const generatePartnerRequestLink = async (): Promise<string> => {
  const links = await generatePartnerRequestLinks();
  return links.universal;
};

// Accept both:
// - https://app.quantifylabs.ai/connect/<id>
// - myapp://connect/<id>
// and tolerate optional query strings or trailing slashes
export const parseRequestIdFromUrl = (url: string): string | null => {
  try {
    if (url.startsWith('myapp://')) {
      // myapp://connect/<id>[?...]
      const withoutScheme = url.replace('myapp://', '');
      const parts = withoutScheme.split(/[/?#]/).filter(Boolean); // ['connect', '<id>', ...]
      if (parts[0] === 'connect' && parts[1]) return parts[1];
    }

    // Try URL parsing for https links
    const u = new URL(url);
    // Path could be /connect/<id> or sometimes a trailing slash
    const segments = u.pathname.split('/').filter(Boolean);
    const connectIndex = segments.indexOf('connect');
    if (connectIndex !== -1 && segments[connectIndex + 1]) {
      return segments[connectIndex + 1];
    }
  } catch (_) {
    // Fallback to regex for any odd strings
    const match = url.match(/connect\/([A-Za-z0-9]+)/);
    if (match && match[1]) return match[1];
  }
  return null;
};


// Parse internal app actions like myapp://set-reminder?hour=22&minute=30&label=...
export const parseInternalActionFromUrl = (url: string): { action: 'set-reminder'; params: Record<string,string> } | null => {
  try{
    if(!url.startsWith('myapp://')) return null
    const u = new URL(url)
    const host = u.host || u.pathname.replace(/^\//,'')
    if(host === 'set-reminder' || u.pathname.replace(/^\//,'') === 'set-reminder'){
      const params: Record<string,string> = {}
      u.searchParams.forEach((v,k)=>{ params[k]=v })
      return { action: 'set-reminder', params }
    }
  }catch{}
  return null
}

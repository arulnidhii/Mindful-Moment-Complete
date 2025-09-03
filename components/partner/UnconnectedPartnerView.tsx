import React, { useState } from 'react';
import { View, Text, StyleSheet, Share, ActivityIndicator, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import GradientBackground from '../GradientBackground';
import Button from '../Button';
import Card from '../Card';
import typography from '@/constants/typography';
import { generatePartnerRequestLinks } from '@/src/utils/deeplinks';

type InviteLinks = { universal: string; scheme: string };

const UnconnectedPartnerView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState<InviteLinks | null>(null);

  const handleGenerateInvite = async () => {
    setIsLoading(true);
    try {
      const links = await generatePartnerRequestLinks();
      setInvitation(links);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (!invitation) return;
    // Share the universal https link for best compatibility in email/messaging
    Share.share({
      message: `Let's connect on Mindful Moment! This link will guide you: ${invitation.universal}`,
      url: invitation.universal,
    });
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Share the Journey</Text>
        <Text style={styles.subtitle}>
          Connect with a partner to share supportive, privacy-first insights and grow together.
        </Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFF" />
        ) : (
          <Button title="💌 Send an Invitation" onPress={handleGenerateInvite} />
        )}
        
        <Modal visible={!!invitation} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <Card style={styles.modalContent}>
              <Text style={styles.modalTitle}>Invite Your Partner</Text>
              <View style={styles.qrContainer}>
                {/* Use the app scheme in the QR for camera scan reliability */}
                <QRCode value={invitation?.scheme || ''} size={200} />
              </View>
              <Text style={styles.modalSubtitle}>
                Scan this code (opens the app), or share the link below (best for email).
              </Text>
              <Button title="🔗 Share Invitation Link" onPress={handleShare} />
              <Button
                title="Close"
                variant="outlined"
                onPress={() => setInvitation(null)}
                style={{ marginTop: 10 }}
              />
            </Card>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  title: { 
    ...typography.headlineMedium, 
    color: 'white', 
    textAlign: 'center', 
    marginBottom: 10 
  },
  subtitle: { 
    ...typography.bodyMedium, 
    color: 'white', 
    textAlign: 'center', 
    marginBottom: 40 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.5)' 
  },
  modalContent: { 
    width: '90%', 
    padding: 20, 
    alignItems: 'center' 
  },
  modalTitle: { 
    ...typography.headlineSmall, 
    color: 'black', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  modalSubtitle: { 
    ...typography.bodyMedium, 
    color: 'black', 
    textAlign: 'center', 
    marginBottom: 20 
  },
  qrContainer: { 
    marginVertical: 20 
  }
});

export default UnconnectedPartnerView;

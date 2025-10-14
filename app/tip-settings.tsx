import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { usePayments, TipSettings } from '@/providers/PaymentProvider';
import { useAuth } from '@/providers/AuthProvider';
import { ArrowLeft, Plus, Minus, Save, Settings } from 'lucide-react-native';

export default function TipSettingsScreen() {
  const { user } = useAuth();
  const { tipSettings, updateTipSettings, isLoading } = usePayments();
  
  const currentSettings = tipSettings.find(ts => ts.providerId === user?.id);
  
  const [percentages, setPercentages] = useState<number[]>(currentSettings?.preferredPercentages || [15, 18, 20, 25]);
  const [allowCustomTip, setAllowCustomTip] = useState<boolean>(currentSettings?.allowCustomTip ?? true);
  const [allowNoTip, setAllowNoTip] = useState<boolean>(currentSettings?.allowNoTip ?? true);
  const [defaultPercentage, setDefaultPercentage] = useState<number>(currentSettings?.defaultPercentage || 18);
  const [thankYouMessage, setThankYouMessage] = useState<string>(currentSettings?.thankYouMessage || 'Thank you for your generous tip! 🙏');
  const [splitTipEnabled, setSplitTipEnabled] = useState<boolean>(currentSettings?.splitTipEnabled ?? false);
  const [newPercentage, setNewPercentage] = useState<string>('');

  useEffect(() => {
    if (currentSettings) {
      setPercentages(currentSettings.preferredPercentages);
      setAllowCustomTip(currentSettings.allowCustomTip);
      setAllowNoTip(currentSettings.allowNoTip);
      setDefaultPercentage(currentSettings.defaultPercentage || 18);
      setThankYouMessage(currentSettings.thankYouMessage || 'Thank you for your generous tip! 🙏');
      setSplitTipEnabled(currentSettings.splitTipEnabled);
    }
  }, [currentSettings]);

  const addPercentage = useCallback(() => {
    const pct = parseInt(newPercentage);
    if (pct > 0 && pct <= 100 && !percentages.includes(pct)) {
      setPercentages(prev => [...prev, pct].sort((a, b) => a - b));
      setNewPercentage('');
    }
  }, [newPercentage, percentages]);

  const removePercentage = useCallback((pct: number) => {
    if (percentages.length > 1) {
      setPercentages(prev => prev.filter(p => p !== pct));
      if (defaultPercentage === pct) {
        setDefaultPercentage(percentages.find(p => p !== pct) || 18);
      }
    }
  }, [percentages, defaultPercentage]);

  const saveSettings = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      const settings: Partial<TipSettings> = {
        preferredPercentages: percentages,
        allowCustomTip,
        allowNoTip,
        defaultPercentage,
        thankYouMessage: thankYouMessage.trim(),
        splitTipEnabled,
      };
      
      await updateTipSettings(user.id, settings);
      Alert.alert('Settings Saved', 'Your tip preferences have been updated.');
      router.back();
    } catch (error) {
      console.error('Error saving tip settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  }, [user?.id, percentages, allowCustomTip, allowNoTip, defaultPercentage, thankYouMessage, splitTipEnabled, updateTipSettings]);

  if (user?.role === 'client') {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tip Settings</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Settings color="#666" size={64} />
          <Text style={styles.errorTitle}>Access Restricted</Text>
          <Text style={styles.errorText}>Only service providers can customize tip settings.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Go back">
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tip Settings</Text>
        <TouchableOpacity onPress={saveSettings} disabled={isLoading}>
          <Save color={isLoading ? '#666' : '#D4AF37'} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tip Percentages</Text>
          <Text style={styles.sectionSubtitle}>Set your preferred tip options for clients</Text>
          
          <View style={styles.percentageGrid}>
            {percentages.map(pct => (
              <View key={pct} style={styles.percentageItem}>
                <TouchableOpacity
                  style={[styles.percentageButton, defaultPercentage === pct && styles.percentageButtonDefault]}
                  onPress={() => setDefaultPercentage(pct)}
                >
                  <Text style={[styles.percentageText, defaultPercentage === pct && styles.percentageTextDefault]}>{pct}%</Text>
                  {defaultPercentage === pct && <Text style={styles.defaultLabel}>Default</Text>}
                </TouchableOpacity>
                {percentages.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removePercentage(pct)}
                  >
                    <Minus color="#ff4444" size={16} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <View style={styles.addPercentageRow}>
            <TextInput
              style={styles.percentageInput}
              placeholder="Add %"
              placeholderTextColor="#666"
              value={newPercentage}
              onChangeText={setNewPercentage}
              keyboardType="numeric"
              maxLength={3}
            />
            <TouchableOpacity
              style={[styles.addButton, !newPercentage && styles.addButtonDisabled]}
              onPress={addPercentage}
              disabled={!newPercentage}
            >
              <Plus color={newPercentage ? '#000' : '#666'} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tip Options</Text>
          
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Allow Custom Tips</Text>
              <Text style={styles.optionSubtitle}>Let clients enter any tip amount</Text>
            </View>
            <Switch
              value={allowCustomTip}
              onValueChange={setAllowCustomTip}
              trackColor={{ false: '#333', true: '#D4AF37' }}
              thumbColor={allowCustomTip ? '#000' : '#666'}
            />
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Allow No Tip</Text>
              <Text style={styles.optionSubtitle}>Include a "No Tip" option</Text>
            </View>
            <Switch
              value={allowNoTip}
              onValueChange={setAllowNoTip}
              trackColor={{ false: '#333', true: '#D4AF37' }}
              thumbColor={allowNoTip ? '#000' : '#666'}
            />
          </View>

          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Enable Tip Splitting</Text>
              <Text style={styles.optionSubtitle}>For multi-service appointments</Text>
            </View>
            <Switch
              value={splitTipEnabled}
              onValueChange={setSplitTipEnabled}
              trackColor={{ false: '#333', true: '#D4AF37' }}
              thumbColor={splitTipEnabled ? '#000' : '#666'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thank You Message</Text>
          <Text style={styles.sectionSubtitle}>Shown after clients leave a tip</Text>
          
          <TextInput
            style={styles.messageInput}
            placeholder="Enter your thank you message..."
            placeholderTextColor="#666"
            value={thankYouMessage}
            onChangeText={setThankYouMessage}
            multiline
            maxLength={200}
          />
          <Text style={styles.characterCount}>{thankYouMessage.length}/200</Text>
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Client will see:</Text>
            <View style={styles.previewTipRow}>
              {percentages.slice(0, 4).map(pct => (
                <View key={pct} style={[styles.previewTipButton, defaultPercentage === pct && styles.previewTipButtonDefault]}>
                  <Text style={[styles.previewTipText, defaultPercentage === pct && styles.previewTipTextDefault]}>{pct}%</Text>
                </View>
              ))}
              {allowCustomTip && (
                <View style={styles.previewTipButton}>
                  <Text style={styles.previewTipText}>Custom</Text>
                </View>
              )}
              {allowNoTip && (
                <View style={styles.previewTipButton}>
                  <Text style={styles.previewTipText}>No Tip</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  headerSpacer: { width: 24 },
  content: { padding: 20 },
  section: { marginBottom: 32 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  sectionSubtitle: { color: '#666', fontSize: 14, marginBottom: 16 },
  percentageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  percentageItem: { position: 'relative' },
  percentageButton: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#333', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, minWidth: 70, alignItems: 'center' },
  percentageButtonDefault: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  percentageText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  percentageTextDefault: { color: '#000' },
  defaultLabel: { color: '#000', fontSize: 10, marginTop: 2 },
  removeButton: { position: 'absolute', top: -6, right: -6, backgroundColor: '#222', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  addPercentageRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  percentageInput: { flex: 1, backgroundColor: '#141414', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, color: '#fff', fontSize: 16 },
  addButton: { backgroundColor: '#D4AF37', borderRadius: 8, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  addButtonDisabled: { backgroundColor: '#333' },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#222' },
  optionInfo: { flex: 1 },
  optionTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  optionSubtitle: { color: '#666', fontSize: 14, marginTop: 2 },
  messageInput: { backgroundColor: '#141414', borderWidth: 1, borderColor: '#333', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, color: '#fff', fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  characterCount: { color: '#666', fontSize: 12, textAlign: 'right', marginTop: 4 },
  previewSection: { marginTop: 16 },
  previewCard: { backgroundColor: '#0b0b0b', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#222' },
  previewTitle: { color: '#999', fontSize: 14, marginBottom: 12 },
  previewTipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  previewTipButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333', backgroundColor: '#141414' },
  previewTipButtonDefault: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  previewTipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  previewTipTextDefault: { color: '#000' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  errorTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 16, textAlign: 'center' },
  errorText: { color: '#666', fontSize: 16, textAlign: 'center', marginTop: 8 },
});
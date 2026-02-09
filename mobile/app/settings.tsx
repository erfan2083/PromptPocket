import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { usePromptStore } from '../src/stores/promptStore';

export default function SettingsScreen() {
  const { email, signOut } = useAuthStore();
  const { prompts } = usePromptStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Your prompts will still be stored in the cloud. Sign in again to access them.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const uniqueTags = new Set(prompts.flatMap((p) => p.tags)).size;
  const platforms = new Set(
    prompts.map((p) => p.metadata.source.platform).filter((p) => p !== 'unknown')
  ).size;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(124, 108, 255, 0.1)' }]}>
            <Ionicons name="person" size={16} color="#7c6cff" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{email || 'Not signed in'}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <Ionicons name="cloud-done" size={16} color="#22c55e" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Sync Status</Text>
            <Text style={[styles.rowValue, { color: '#22c55e' }]}>Connected</Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <Text style={styles.sectionTitle}>Statistics</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(124, 108, 255, 0.1)' }]}>
            <Ionicons name="document-text" size={16} color="#7c6cff" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Total Prompts</Text>
            <Text style={styles.rowValue}>{prompts.length}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(124, 108, 255, 0.1)' }]}>
            <Ionicons name="pricetag" size={16} color="#7c6cff" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Unique Tags</Text>
            <Text style={styles.rowValue}>{uniqueTags}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(124, 108, 255, 0.1)' }]}>
            <Ionicons name="globe" size={16} color="#7c6cff" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Platforms Used</Text>
            <Text style={styles.rowValue}>{platforms}</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(124, 108, 255, 0.1)' }]}>
            <Ionicons name="information-circle" size={16} color="#7c6cff" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: 'rgba(124, 108, 255, 0.1)' }]}>
            <Ionicons name="sync" size={16} color="#7c6cff" />
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Sync Backend</Text>
            <Text style={styles.rowValue}>Firebase Firestore</Text>
          </View>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={18} color="#ef4444" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        PromptPocket syncs with the Chrome extension using the same account.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginLeft: 58,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#475569',
    fontSize: 12,
    marginTop: 20,
    lineHeight: 18,
  },
});

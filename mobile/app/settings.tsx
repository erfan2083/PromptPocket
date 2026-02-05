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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="person-circle-outline" size={22} color="#6c63ff" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{email || 'Not signed in'}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="cloud-done-outline" size={22} color="#4ade80" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Sync Status</Text>
            <Text style={[styles.rowValue, { color: '#4ade80' }]}>Connected</Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <Text style={styles.sectionTitle}>Statistics</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="document-text-outline" size={22} color="#6c63ff" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Total Prompts</Text>
            <Text style={styles.rowValue}>{prompts.length}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="pricetag-outline" size={22} color="#6c63ff" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Unique Tags</Text>
            <Text style={styles.rowValue}>
              {new Set(prompts.flatMap((p) => p.tags)).size}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="globe-outline" size={22} color="#6c63ff" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Platforms Used</Text>
            <Text style={styles.rowValue}>
              {new Set(prompts.map((p) => p.metadata.source.platform).filter((p) => p !== 'unknown')).size}
            </Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="information-circle-outline" size={22} color="#6c63ff" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Ionicons name="sync-outline" size={22} color="#6c63ff" />
          <View style={styles.rowContent}>
            <Text style={styles.rowLabel}>Sync</Text>
            <Text style={styles.rowValue}>Firebase Firestore</Text>
          </View>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
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
    backgroundColor: '#16213e',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    color: '#e0e0e0',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a4e',
    marginLeft: 52,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff6b6b33',
    backgroundColor: '#ff6b6b11',
  },
  signOutText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    color: '#555',
    fontSize: 12,
    marginTop: 20,
    lineHeight: 18,
  },
});

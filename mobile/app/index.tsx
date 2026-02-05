import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';
import { usePromptStore } from '../src/stores/promptStore';
import { PromptDTO } from '../src/types';

export default function HomeScreen() {
  const { isAuthenticated } = useAuthStore();
  const { prompts, isLoading, error, loadPrompts } = usePromptStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    loadPrompts();
  }, [isAuthenticated]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPrompts();
    setRefreshing(false);
  }, [loadPrompts]);

  const filteredPrompts = prompts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPromptCard = ({ item }: { item: PromptDTO }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/prompt/${item.id}`)}
      activeOpacity={0.7}
    >
      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.cardContent} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.tagsRow}>
          {item.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.cardDate}>
          {new Date(item.metadata.createdAt).toLocaleDateString()}
        </Text>
      </View>
      {item.metadata.source.platform !== 'unknown' && (
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>{item.metadata.source.platform}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search prompts..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Prompt List */}
      {isLoading && prompts.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6c63ff" />
          <Text style={styles.loadingText}>Loading prompts...</Text>
        </View>
      ) : filteredPrompts.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="document-text-outline" size={64} color="#555" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No matches' : 'No prompts yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery
              ? 'Try a different search term'
              : 'Save prompts from the Chrome extension or create one here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPrompts}
          keyExtractor={(item) => item.id}
          renderItem={renderPromptCard}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6c63ff"
              colors={['#6c63ff']}
            />
          }
        />
      )}

      {/* FAB: New Prompt */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/prompt/create')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomText}>
          {prompts.length} {prompts.length === 1 ? 'prompt' : 'prompts'}
        </Text>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={20} color="#888" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#e0e0e0',
  },
  errorBanner: {
    backgroundColor: '#ff6b6b22',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 13,
    color: '#a0a0a0',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  tag: {
    backgroundColor: '#2a2a4e',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#a0a0ff',
  },
  cardDate: {
    fontSize: 11,
    color: '#666',
  },
  platformBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  platformText: {
    fontSize: 10,
    color: '#6c63ff',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },
  emptyTitle: {
    color: '#e0e0e0',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#6c63ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    backgroundColor: '#1a1a2e',
  },
  bottomText: {
    color: '#888',
    fontSize: 13,
  },
});

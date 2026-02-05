import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { usePromptStore } from '../../src/stores/promptStore';

export default function PromptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { prompts, deletePrompt } = usePromptStore();
  const [copied, setCopied] = useState(false);

  const prompt = prompts.find((p) => p.id === id);

  useEffect(() => {
    if (!prompt) {
      router.back();
    }
  }, [prompt]);

  if (!prompt) return null;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    Alert.alert('Delete Prompt', 'Are you sure you want to delete this prompt?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePrompt(prompt.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={styles.title}>{prompt.title}</Text>

        {/* Platform */}
        {prompt.metadata.source.platform !== 'unknown' && (
          <View style={styles.platformRow}>
            <Text style={styles.platformLabel}>Source:</Text>
            <Text style={styles.platformValue}>{prompt.metadata.source.platform}</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Content</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText}>{prompt.content}</Text>
          </View>
        </View>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagsRow}>
              {prompt.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color="#888" />
            <Text style={styles.metaText}>
              Created: {new Date(prompt.metadata.createdAt).toLocaleString()}
            </Text>
          </View>
          {prompt.metadata.updatedAt !== prompt.metadata.createdAt && (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.metaText}>
                Updated: {new Date(prompt.metadata.updatedAt).toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Ionicons name="bar-chart-outline" size={14} color="#888" />
            <Text style={styles.metaText}>Used {prompt.stats.usedCount} times</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
          <Ionicons
            name={copied ? 'checkmark-circle' : 'copy-outline'}
            size={20}
            color={copied ? '#4ade80' : '#e0e0e0'}
          />
          <Text style={[styles.actionText, copied && styles.actionTextSuccess]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/prompt/edit/${prompt.id}`)}
        >
          <Ionicons name="pencil-outline" size={20} color="#e0e0e0" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
          <Text style={[styles.actionText, { color: '#ff6b6b' }]}>Delete</Text>
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#e0e0e0',
    marginBottom: 12,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  platformLabel: {
    fontSize: 12,
    color: '#888',
  },
  platformValue: {
    fontSize: 12,
    color: '#6c63ff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a4e',
  },
  contentText: {
    fontSize: 14,
    color: '#d0d0d0',
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#2a2a4e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#a0a0ff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
    backgroundColor: '#1a1a2e',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#e0e0e0',
  },
  actionTextSuccess: {
    color: '#4ade80',
  },
});

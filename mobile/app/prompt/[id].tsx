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
            <View style={styles.platformBadge}>
              <Text style={styles.platformText}>{prompt.metadata.source.platform}</Text>
            </View>
          </View>
        )}

        {/* Content */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Content</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentText} selectable>{prompt.content}</Text>
          </View>
        </View>

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagsRow}>
              {prompt.tags.map((tag, index) => (
                <View key={`${tag}-${index}`} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Metadata */}
        <View style={styles.section}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color="#64748b" />
            <Text style={styles.metaText}>
              Created: {new Date(prompt.metadata.createdAt).toLocaleString()}
            </Text>
          </View>
          {prompt.metadata.updatedAt !== prompt.metadata.createdAt && (
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={13} color="#64748b" />
              <Text style={styles.metaText}>
                Updated: {new Date(prompt.metadata.updatedAt).toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Ionicons name="bar-chart-outline" size={13} color="#64748b" />
            <Text style={styles.metaText}>Used {prompt.stats.usedCount} times</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, copied && styles.actionIconSuccess]}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={18}
              color={copied ? '#fff' : '#e2e8f0'}
            />
          </View>
          <Text style={[styles.actionText, copied && styles.actionTextSuccess]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/prompt/edit/${prompt.id}`)}
          activeOpacity={0.7}
        >
          <View style={styles.actionIconWrap}>
            <Ionicons name="pencil-outline" size={18} color="#e2e8f0" />
          </View>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={handleDelete} activeOpacity={0.7}>
          <View style={[styles.actionIconWrap, styles.actionIconDanger]}>
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </View>
          <Text style={[styles.actionText, styles.actionTextDanger]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e2e8f0',
    marginBottom: 12,
    lineHeight: 28,
  },
  platformRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  platformBadge: {
    backgroundColor: 'rgba(124, 108, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  platformText: {
    fontSize: 11,
    color: '#7c6cff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentBox: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  contentText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(124, 108, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#a5b4fc',
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconSuccess: {
    backgroundColor: '#22c55e',
  },
  actionIconDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  actionTextSuccess: {
    color: '#22c55e',
  },
  actionTextDanger: {
    color: '#ef4444',
  },
});

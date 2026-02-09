import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { usePromptStore } from '../../src/stores/promptStore';
import { PromptDTO } from '../../src/types';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function CreatePromptScreen() {
  const { savePrompt } = usePromptStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    if (content.length > 10000) {
      setError('Content exceeds maximum length (10,000 characters)');
      return;
    }

    setSaving(true);
    setError(null);

    const now = Date.now();
    const generatedTitle =
      title.trim() ||
      (content.trim().length > 60
        ? content.trim().substring(0, 60) + '...'
        : content.trim());

    const prompt: PromptDTO = {
      id: generateUUID(),
      title: generatedTitle,
      content: content.trim(),
      folderId: 'default',
      tags: tags.trim()
        ? tags
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean)
        : [],
      metadata: {
        createdAt: now,
        updatedAt: now,
        source: {
          platform: 'mobile',
        },
      },
      stats: {
        usedCount: 0,
        lastUsedAt: 0,
      },
    };

    try {
      await savePrompt(prompt);
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Title (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Give your prompt a name..."
            placeholderTextColor="#475569"
            value={title}
            onChangeText={setTitle}
            maxLength={200}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Content</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter your prompt content..."
            placeholderTextColor="#475569"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={10000}
          />
          <Text style={styles.charCount}>{content.length}/10,000</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tags (comma separated)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. coding, writing, brainstorm"
            placeholderTextColor="#475569"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Prompt</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scroll: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#e2e8f0',
  },
  textArea: {
    minHeight: 200,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'right',
    marginTop: 4,
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#7c6cff',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

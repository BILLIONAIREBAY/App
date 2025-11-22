import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { getDatabase } from '../../db';
import WhisperRequest from '../../db/models/WhisperRequest';

interface AIResponse {
  tags: string[];
  category: string;
  confidence: number;
  status: string;
}

export default function WhisperCreate() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('[WHISPER] Creating local whisper request...');

      const database = getDatabase();
      let whisperRequest: WhisperRequest | null = null;

      await database.write(async () => {
        const whisperRequestsCollection = database.get<WhisperRequest>('whisper_requests');
        whisperRequest = await whisperRequestsCollection.create((wr) => {
          wr.userId = 'demo-user-id';
          wr.textQuery = query.trim();
          wr.aiAnalysisJson = '';
          wr.status = 'pending';
        });
      });

      if (!whisperRequest) {
        throw new Error('Failed to create whisper request');
      }

      console.log('[WHISPER] Sending query to backend:', whisperRequest.id);

      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      const res = await fetch(`${backendUrl}/whisper/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: whisperRequest.id,
          text_query: whisperRequest.textQuery,
          user_id: whisperRequest.userId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      console.log('[WHISPER] Response:', data);

      await database.write(async () => {
        await whisperRequest!.update((wr) => {
          wr.aiAnalysisJson = JSON.stringify(data.ai_analysis);
          wr.status = 'completed';
        });
      });

      setResponse(data.ai_analysis || data);
    } catch (err) {
      console.error('[WHISPER] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Whisper Search',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#0A0A0A',
          },
          headerTintColor: '#D4AF37',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Le Génie</Text>
            <Text style={styles.headerSubtitle}>
              Describe what you're looking for in natural language
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="e.g., Bordeaux wine from 1988..."
              placeholderTextColor="#666"
              value={query}
              onChangeText={setQuery}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
            <Pressable
              style={({ pressed }) => [
                styles.submitButton,
                (loading || !query.trim()) && styles.submitButtonDisabled,
                pressed && styles.submitButtonPressed,
              ]}
              onPress={handleSubmit}
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.submitButtonText}>Search</Text>
              )}
            </Pressable>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {error}</Text>
            </View>
          )}

          {response && (
            <View style={styles.responseContainer}>
              <Text style={styles.responseTitle}>AI Analysis</Text>

              <View style={styles.responseSection}>
                <Text style={styles.responseLabel}>Status:</Text>
                <Text style={styles.responseValue}>{response.status || 'completed'}</Text>
              </View>

              <View style={styles.responseSection}>
                <Text style={styles.responseLabel}>Category:</Text>
                <Text style={styles.responseValue}>{response.category || 'Unknown'}</Text>
              </View>

              <View style={styles.responseSection}>
                <Text style={styles.responseLabel}>Confidence:</Text>
                <Text style={styles.responseValue}>
                  {((response.confidence || 0) * 100).toFixed(0)}%
                </Text>
              </View>

              {response.tags && response.tags.length > 0 && (
                <View style={styles.responseSection}>
                  <Text style={styles.responseLabel}>Extracted Tags:</Text>
                  <View style={styles.tagsContainer}>
                    {response.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {!response && !error && !loading && (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Examples:{'\n\n'}
                • "Rolex from the 1960s"{'\n'}
                • "Vintage Bordeaux wine 1988"{'\n'}
                • "Limited edition Hermès bag"{'\n'}
                • "Classic Ferrari model"
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#222',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonPressed: {
    opacity: 0.8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  errorContainer: {
    backgroundColor: '#330000',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#660000',
  },
  errorText: {
    color: '#FF6666',
    fontSize: 14,
  },
  responseContainer: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  responseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 16,
  },
  responseSection: {
    marginBottom: 12,
  },
  responseLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  responseValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    backgroundColor: '#111',
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 24,
  },
});

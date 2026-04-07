import { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native'
import { supabase } from '@/lib/supabase'
import { ChatMessage } from '@/lib/types'

const QUICK_CHIPS = [
  { id: '1', label: '📖 Explain a verse' },
  { id: '2', label: '🙏 Need guidance' },
  { id: '3', label: '🔍 Find a verse for me' },
  { id: '4', label: '📚 Bible trivia' },
]

const WELCOME: ChatMessage = {
  id: 'welcome',
  user_id: '',
  role: 'assistant',
  content: "Hello! I'm your Bible companion. Ask me anything about the Old or New Testament. 🙏",
  created_at: new Date().toISOString(),
}

export default function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const listRef = useRef<FlatList>(null)

  useEffect(() => { loadHistory() }, [])

  async function loadHistory() {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(50)
    if (data && data.length > 0) setMessages([WELCOME, ...data])
    setHistoryLoaded(true)
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    setInput('')
    setLoading(true)
    const tempId = `temp-${Date.now()}`
    const userMsg: ChatMessage = { id: tempId, user_id: '', role: 'user', content: trimmed, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/bible-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
            apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ message: trimmed }),
        }
      )
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? 'Server error') }
      const { response } = await res.json()
      const assistantMsg: ChatMessage = { id: `ai-${Date.now()}`, user_id: '', role: 'assistant', content: response, created_at: new Date().toISOString() }
      setMessages(prev => [...prev, assistantMsg])
    } catch (e: any) {
      setMessages(prev => prev.filter(m => m.id !== tempId))
      Alert.alert('Error', e.message ?? 'Failed to get a response. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    const isUser = item.role === 'user'
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.aiText]}>{item.content}</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListHeaderComponent={
          historyLoaded && messages.length <= 1 ? (
            <View style={styles.chipsRow}>
              {QUICK_CHIPS.map(chip => (
                <TouchableOpacity key={chip.id} style={styles.chip} onPress={() => sendMessage(chip.label)}>
                  <Text style={styles.chipText}>{chip.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
      />
      {loading && (
        <View style={styles.typing}>
          <ActivityIndicator size="small" color="#967f42" />
          <Text style={styles.typingText}>Thinking...</Text>
        </View>
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about the Bible..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.send, (!input.trim() || loading) && styles.sendDisabled]}
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || loading}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  list: { padding: 16, paddingBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { backgroundColor: '#faf7f2', borderWidth: 1, borderColor: '#967f42', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { color: '#967f42', fontSize: 13, fontFamily: 'OpenSans_600SemiBold' },
  bubble: { maxWidth: '82%', borderRadius: 16, padding: 12, marginBottom: 10 },
  userBubble: { backgroundColor: '#967f42', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#faf7f2', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#e0d8c8' },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff', fontFamily: 'OpenSans_400Regular' },
  aiText: { color: '#1a1a1a', fontFamily: 'OpenSans_400Regular' },
  typing: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  typingText: { color: '#888888', fontSize: 13, fontFamily: 'OpenSans_400Regular' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#f5f0e8', borderTopWidth: 1, borderTopColor: '#e0d8c8', gap: 10 },
  input: { flex: 1, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e0d8c8', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, fontFamily: 'OpenSans_400Regular', color: '#1a1a1a', maxHeight: 100 },
  send: { backgroundColor: '#967f42', borderRadius: 22, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendDisabled: { backgroundColor: '#c4b08a' },
  sendIcon: { color: '#fff', fontSize: 16 },
})

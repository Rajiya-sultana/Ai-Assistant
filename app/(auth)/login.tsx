import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Login Failed', error.message)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.icon}>✝</Text>
        <Text style={styles.title}>Bible Assistant</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
          <Text style={styles.link}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  icon: { fontSize: 52, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 30, fontFamily: 'OpenSans_700Bold', color: '#A52A2A', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, fontFamily: 'OpenSans_400Regular', color: '#888888', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: '#e0d8c8',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    fontSize: 15,
    fontFamily: 'OpenSans_400Regular',
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#967f42',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontFamily: 'OpenSans_700Bold' },
  link: { color: '#967f42', textAlign: 'center', fontSize: 14, fontFamily: 'OpenSans_600SemiBold' },
})

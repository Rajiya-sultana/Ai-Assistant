import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email and password.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      Alert.alert('Sign Up Failed', error.message)
    } else {
      Alert.alert('Account Created!', 'Check your email to confirm your account, then sign in.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ])
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.icon}>✝</Text>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Bible community</Text>
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
          placeholder="Password (min 6 characters)"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
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

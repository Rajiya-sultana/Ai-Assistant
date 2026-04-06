import { View, Text, StyleSheet } from 'react-native'

export default function AssistantScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>💬</Text>
      <Text style={styles.title}>AI Assistant</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f0e8', alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: { fontSize: 52, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#8b4513', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#a08060', textAlign: 'center' },
})

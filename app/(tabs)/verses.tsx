import { View, Text, StyleSheet } from 'react-native'
export default function VersesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📖</Text>
      <Text style={styles.title}>Bible Verses</Text>
      <Text style={styles.subtitle}>Coming soon</Text>
    </View>
  )
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  icon: { fontSize: 52, marginBottom: 12 },
  title: { fontSize: 22, fontFamily: 'OpenSans_700Bold', color: '#A52A2A', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, fontFamily: 'OpenSans_400Regular', color: '#888888', textAlign: 'center' },
})

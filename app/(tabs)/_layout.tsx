import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#967f42',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e0d8c8' },
        tabBarLabelStyle: { fontFamily: 'OpenSans_600SemiBold', fontSize: 11 },
        headerStyle: { backgroundColor: '#967f42' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: 'OpenSans_700Bold', fontSize: 18 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="verses" options={{ title: 'Verses', tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} /> }} />
      <Tabs.Screen name="assistant" options={{ title: 'Assistant', tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-ellipses" size={size} color={color} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <Ionicons name="scan" size={size} color={color} /> }} />
      <Tabs.Screen name="buy" options={{ title: 'Buy', tabBarIcon: ({ color, size }) => <Ionicons name="cart" size={size} color={color} /> }} />
    </Tabs>
  )
}

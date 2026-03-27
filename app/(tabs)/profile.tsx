import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>You are not logged in.</Text>
        <Button title="Login now" onPress={() => router.push('/login')} color="#e91e63" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.username}!</Text>
      <Button title="Logout" onPress={logout} color="#e91e63" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  text: { fontSize: 18, marginBottom: 20 }
});

import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { router } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { dbName } from '../db/database';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore(state => state.login);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    try {
      const db = await SQLite.openDatabaseAsync(dbName);
      let user = await db.getFirstAsync<{id: number, username: string, password: string}>('SELECT * FROM Users WHERE username = ?', [username]);
      
      if (!user) {
        // Auto register for dummy simplicity
        const result = await db.runAsync('INSERT INTO Users (username, password) VALUES (?, ?)', [username, password]);
        user = { id: result.lastInsertRowId, username, password };
        Alert.alert('Success', 'Account created and logged in!');
      } else {
        if (user.password !== password) {
          Alert.alert('Error', 'Incorrect password');
          return;
        }
        Alert.alert('Success', 'Welcome back!');
      }
      
      await login({ id: user.id, username: user.username });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    } catch(e) {
      Alert.alert('Error', 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login / Register</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Submit" onPress={handleLogin} color="#e91e63" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 }
});

import { StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Amplify } from 'aws-amplify';
import amplifyconfig from '../src/amplifyconfiguration.json';
import { getCurrentUser, updatePassword } from 'aws-amplify/auth';

Amplify.configure(amplifyconfig);

export default function PasswordChangeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function currentAuthenticatedUser() {
    try {
      setIsAuthenticated(true);
      const { username } = await getCurrentUser();
      console.log(`The username: ${username}`);
    } catch (err) {
      console.log(err);
      router.replace('/SignIn');
    }
  }

  useEffect(() => {
    currentAuthenticatedUser();
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  function validatePassword(password: string) {
    const requirements = [
      { regex: /.{8,}/, message: 'Must be at least 8 characters long.' },
      { regex: /[A-Z]/, message: 'Must contain at least 1 uppercase letter.' },
      { regex: /\d/, message: 'Must contain at least 1 number.' },
    ];

    for (const req of requirements) {
      if (!req.regex.test(password)) return req.message;
    }
    return '';
  }

  async function handleUpdatePassword() {
    setPasswordError('');

    if (newPassword === oldPassword) {
      setPasswordError('The new password must be different from the old one.');
      return;
    }

    const errorMessage = validatePassword(newPassword);
    if (errorMessage) {
      setPasswordError(errorMessage);
      return;
    }

    try {
      await updatePassword({ oldPassword, newPassword });
      Alert.alert('Success', 'Password updated successfully');
      router.replace('/four'); 
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to update password');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Your Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Old Password"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

      <TouchableOpacity style={styles.submitButton} onPress={handleUpdatePassword}>
        <Text style={styles.submitButtonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

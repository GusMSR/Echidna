import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import { confirmSignUp, type ConfirmSignUpInput } from 'aws-amplify/auth';
import { router } from 'expo-router';

async function handleSignUpConfirmation({
  username,
  confirmationCode
}: ConfirmSignUpInput, setError: (msg: string) => void) {
  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username,
      confirmationCode
    });
    if (isSignUpComplete) {
      console.log('Sign-up confirmed successfully!');
      router.replace('/SignIn');
    }
  } catch (error) {
    console.log('error confirming sign up', error);
    setError('Failed to confirm sign-up. Please check your confirmation code and try again.');
  }
}

export default function ConfirmSignUpScreen() {
  const [username, setUsername] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [authError, setAuthError] = useState(''); // State for error message popup

  return (
    <View style={styles.container}>
      {authError ? (
              <View style={styles.errorPopupContainer}>
                <Text style={styles.errorPopup}>{authError}</Text>
              </View>
            ) : null}
      <Text style={styles.title}>Confirm Your Sign-Up</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmation Code"
        value={confirmationCode}
        onChangeText={(text) => setConfirmationCode(text)}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleSignUpConfirmation({ username, confirmationCode }, setAuthError)}
      >
        <Text style={styles.buttonText}>Confirm Sign-Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0E79B2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#D9D9D9',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorPopupContainer: {
    position: 'absolute', 
    top: 20, 
    left: 0, 
    right: 0, 
    alignItems: 'center', 
    zIndex: 1000,
  },
  errorPopup: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 5,
    zIndex: 1000,
  },
});

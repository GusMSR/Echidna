import { StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import { signIn, type SignInInput } from 'aws-amplify/auth';
import { Link, router } from 'expo-router';

async function handleSignIn({ username, password }: SignInInput, setAuthError: (msg: string) => void) {
  try {
    const { isSignedIn, nextStep } = await signIn({ username, password });
    if (isSignedIn) {
      console.log('Sign-in successful!');
      router.replace('/');
    }
  } catch (error) {
    console.log('Error signing in', error);
    setAuthError('Failed to sign in. Please check your credentials and try again.');
  }
}

export default function SignInScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');  // State for error message popup
  const [showPassword, setShowPassword] = useState(false);  // State to toggle password visibility

  const isFormValid = username && password; // Button is enabled only if both fields are filled

  return (
    <View style={styles.container}>
            {authError ? (
        <View style={styles.errorPopupContainer}>
          <Text style={styles.errorPopup}>{authError}</Text>
        </View>
      ) : null}

      
      {/* Logo Display */}
      <Image source={require('../assets/images/icon.png')} style={styles.logo} />

      <Text style={styles.title}>Sign In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Text style={styles.toggleButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, !isFormValid && styles.disabledButton]}  // Disable button if form is not valid
        onPress={() => isFormValid && handleSignIn({ username, password }, setAuthError)}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      
    <Link href="/SignUp" style={styles.link}>
          Don't have an account? Sign Up!
          </Link>

    <Link href="/PasswordRecovery" style={styles.link}>
          Forgot Password?
          </Link>

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
  passwordContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  toggleButton: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  toggleButtonText: {
    color: '#0E79B2',
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0E79B2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
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
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  link: {
    color: '#0E79B2',
    fontSize: 14,
    marginBottom: 20,
  },
});

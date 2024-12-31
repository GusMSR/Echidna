import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import { confirmResetPassword, type ConfirmResetPasswordInput } from 'aws-amplify/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';

function validatePassword(password : string) {
  const requirements = [
    { regex: /.{8,}/, message: 'Must be at least 8 characters long.' },
    { regex: /[A-Z]/, message: 'Must contain at least 1 uppercase letter.' },
    { regex: /\d/, message: 'Must contain at least 1 number.' },
  ];

  for (const requirement of requirements) {
    if (!requirement.regex.test(password)) {
      return { isValid: false, message: requirement.message };
    }
  }
  return { isValid: true, message: '' };
}

export default function ConfirmPasswordRecoveryScreen() {
  const [username, setUsername] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  async function handleConfirmResetPassword({
    username,
    confirmationCode,
    newPassword
  }: ConfirmResetPasswordInput) {
    try {
      await confirmResetPassword({ username, confirmationCode, newPassword });
      router.replace('/');
    } catch (error) {
      console.log(error);
      setAuthError('Failed to recover password. Check the data you provided.');
    }
  }

  const isFormValid = username && confirmationCode && password && confirmPassword && !passwordError && !confirmPasswordError;

  function validateForm() {
    setPasswordError('');
    setConfirmPasswordError('');

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setPasswordError(validation.message);
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords must match.');
    }
  }

  function handleSubmit() {
    validateForm();

    if (!isFormValid) return;

    handleConfirmResetPassword(
      {
        username,
        confirmationCode,
        newPassword: password,
      }
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Password Recovery</Text>

      {authError ? <Text style={styles.error}>{authError}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmation Code"
        keyboardType="numeric"
        value={confirmationCode}
        onChangeText={(text) => setConfirmationCode(text)}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={(text) => setPassword(text)}
          onBlur={validateForm}
        />
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.iconButton}
        >
          <Icon
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={24}
            color="#0E79B2"
          />
        </TouchableOpacity>
      </View>

      {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry={!isPasswordVisible}
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        onBlur={validateForm}
      />

      {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}

      <TouchableOpacity
        style={[styles.button, !isFormValid && styles.disabledButton]}
        onPress={handleSubmit}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>Confirm Password Recovery</Text>
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
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: '#D9D9D9',
    fontWeight: 'bold',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
  },
  iconButton: {
    marginLeft: 10,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
});

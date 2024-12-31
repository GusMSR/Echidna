import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useState } from 'react';
import { resetPassword, type ResetPasswordOutput } from 'aws-amplify/auth';
import { router } from 'expo-router';

export default function PasswordRecoveryScreen() {
  const [username, setUsername] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  async function handleResetPassword(username: string) {
    try {
      if (!username.trim()) {
        setAuthError('Please provide a valid email.');
        return;
      }
      const output = await resetPassword({username});
      handleResetPasswordNextSteps(output);
    } catch (error: any) {
      console.error('Reset Password Error:', error);

      // Ensure error handling is robust
      const errorMessage =
        error?.message || 'Failed to recover password. Check the email you provided.';
      setAuthError(errorMessage);
    }
  }

  function handleResetPasswordNextSteps(output: ResetPasswordOutput) {
    const { nextStep } = output;
    switch (nextStep.resetPasswordStep) {
      case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
        const codeDeliveryDetails = nextStep.codeDeliveryDetails;
        console.log(
          `Confirmation code was sent to ${codeDeliveryDetails.deliveryMedium}`
        );
        router.replace('/ConfirmPasswordRecovery');
        break;
      case 'DONE':
        console.log('Successfully reset password.');
        break;
    }
  }

  return (
    <View style={styles.container}>
      {/* Error Popup */}
      {authError && (
        <View style={styles.errorPopupContainer}>
          <Text style={styles.errorPopup}>{authError}</Text>
        </View>
      )}

      <Text style={styles.title}>Reset Your Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          if (authError) setAuthError(null); // Clear error when input changes
        }}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleResetPassword(username)}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
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
    padding: 10,
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    borderRadius: 5,
  },
});

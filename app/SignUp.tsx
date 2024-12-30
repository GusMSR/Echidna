import { StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Link, router } from 'expo-router';
import { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'; // Importing icons
import { signUp } from 'aws-amplify/auth';

type SignUpParameters = {
  username: string;
  password: string;
};

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): { isValid: boolean; message: string } {
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

async function handleSignUp({ username, password }: SignUpParameters, setError: (msg: string) => void) {
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username,
      password,
      options: {
        userAttributes: {},
        autoSignIn: true,
      },
    });
    console.log(userId);
    router.replace('/ConfirmSignUp');
  } catch (error) {
    console.log('Error signing up:', error);
    if(error == "UsernameExistsException: User already exists"){
        setError('Signup failed. Email already in use');
    }
    else{
        setError('Signup failed. Please check your info and try again.');
    }
  }
}

export default function SignUpScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [fieldsFilled, setFieldsFilled] = useState(true);
  const [authError, setAuthError] = useState(''); // State for error message

  const handleInputChange = () => {
    const isEmailValid = validateEmail(username);
    const { isValid: isPasswordValid, message: passwordMessage } = validatePassword(password);

    setEmailError(isEmailValid ? '' : 'Invalid email address.');
    setPasswordError(isPasswordValid ? '' : passwordMessage);
    setConfirmPasswordError(
      password === confirmPassword ? '' : 'Passwords do not match.'
    );

    setIsValid(isEmailValid && isPasswordValid && password === confirmPassword);
    setFieldsFilled(username !== '' && password !== '' && confirmPassword !== '');
  };

  useEffect(() => {
    handleInputChange(); // Revalidate when either password or confirm password changes
  }, [password, confirmPassword, username]);

  return (
    <View style={styles.container}>
      {authError ? (
                    <View style={styles.errorPopupContainer}>
                      <Text style={styles.errorPopup}>{authError}</Text>
                    </View>
                  ) : null}
      
      <Image source={require('../assets/images/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Echidna! Please create an account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={username}
        onChangeText={(text) => {
          setEmail(text);
          handleInputChange();
        }}
      />

      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          secureTextEntry={!isPasswordVisible}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            handleInputChange();
          }}
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
        onChangeText={(text) => {
          setConfirmPassword(text);
          handleInputChange();
        }}
      />
      {confirmPasswordError ? <Text style={styles.error}>{confirmPasswordError}</Text> : null}

      {!fieldsFilled && <Text style={styles.error}>Please fill all fields to continue.</Text>}

      <TouchableOpacity
        style={styles.button}
        disabled={!isValid || !fieldsFilled}
        onPress={() => handleSignUp({ username, password }, setAuthError)}
      >
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Link href="/SignIn" style={styles.link}>
        Already have an account?
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D9D9D9',
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
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
  },
  iconButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: 'transparent',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#0E79B2',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#D9D9D9',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#0E79B2',
    fontSize: 14,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
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

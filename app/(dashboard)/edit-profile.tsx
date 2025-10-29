/**
 * Dashboard - Editar Perfil
 * Permite al usuario editar su información personal
 */

import { auth } from '@/config/firebase';
import { useAuth } from '@/hooks/auth';
import { Colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Log inicial para ver qué datos trae el usuario
  useEffect(() => {
    console.log('👤 USUARIO AL CARGAR EDIT-PROFILE:');
    console.log('  - ID:', user?.id);
    console.log('  - Username:', user?.username);
    console.log('  - Email:', user?.email);
    console.log('  - Photo URL:', user?.photoURL);
    console.log('📋 FIREBASE AUTH CURRENT USER:');
    console.log('  - Display Name:', auth.currentUser?.displayName);
    console.log('  - Email:', auth.currentUser?.email);
    console.log('  - Photo URL:', auth.currentUser?.photoURL);
  }, []);
  
  // Estados del formulario
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para mostrar/ocultar contraseñas
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const pickImage = async () => {
    try {
      // Solicitar permisos
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permiso Denegado', 'Necesitas otorgar permisos para acceder a la galería');
        return;
      }

      // Abrir selector de imágenes
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoURL(result.assets[0].uri);
      }
    } catch (error) {
      console.error('❌ Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const validateForm = (): boolean => {
    if (!username.trim()) {
      Alert.alert('Error', 'El nombre de usuario es requerido');
      return false;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'El correo electrónico es requerido');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return false;
    }

    // Si está cambiando contraseña
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        Alert.alert('Error', 'Ingresa tu contraseña actual para cambiarla');
        return false;
      }

      if (newPassword.length < 6) {
        Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
        return false;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return false;
      }
    }

    return true;
  };

  const reauthenticate = async () => {
    if (!auth.currentUser || !user?.email) {
      throw new Error('No hay usuario autenticado');
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await reauthenticateWithCredential(auth.currentUser, credential);
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    if (!auth.currentUser || !user?.id) return;

    setLoading(true);

    try {
      let needsReauth = false;
      const hasEmailChanged = email !== user.email;
      const hasPasswordChange = newPassword.trim() !== '';

      // Si cambia email o contraseña, necesita reautenticación
      if ((hasEmailChanged || hasPasswordChange) && !currentPassword) {
        Alert.alert(
          'Contraseña Requerida',
          'Para cambiar tu email o contraseña, necesitas ingresar tu contraseña actual'
        );
        setLoading(false);
        return;
      }

      // 1. Actualizar nombre de usuario y foto en Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: username,
        photoURL: photoURL || null,
      });

      console.log('✅ Perfil actualizado en Firebase Auth');

      // 2. Actualizar email si cambió
      if (hasEmailChanged) {
        await reauthenticate();
        await updateEmail(auth.currentUser, email);
        console.log('✅ Email actualizado en Firebase Auth');
      }

      // 3. Actualizar contraseña si se ingresó una nueva
      if (hasPasswordChange) {
        if (!hasEmailChanged) {
          await reauthenticate();
        }
        await updatePassword(auth.currentUser, newPassword);
        console.log('✅ Contraseña actualizada en Firebase Auth');
        
        // Limpiar campos de contraseña
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }

      // 4. Actualizar datos en AsyncStorage
      const userData = {
        id: user.id,
        email: email,
        username: username,
        photoURL: photoURL || null,
      };

      await AsyncStorage.setItem('@quizgame_user', JSON.stringify(userData));
      console.log('✅ Datos actualizados en AsyncStorage');

      // 5. Verificar lo que quedó guardado en Firebase Auth
      console.log('📋 DATOS EN FIREBASE AUTH:');
      console.log('  - Display Name:', auth.currentUser?.displayName);
      console.log('  - Email:', auth.currentUser?.email);
      console.log('  - Photo URL:', auth.currentUser?.photoURL);
      console.log('  - UID:', auth.currentUser?.uid);

      Alert.alert(
        'Éxito',
        'Tu perfil ha sido actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error: any) {
      console.error('❌ Error actualizando perfil:', error);
      
      let errorMessage = 'No se pudo actualizar el perfil';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'La contraseña actual es incorrecta';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este correo ya está en uso';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es demasiado débil';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por seguridad, necesitas cerrar sesión y volver a iniciar para hacer este cambio';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Photo Section */}
          <Animatable.View animation="fadeInDown" duration={800} style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {photoURL ? (
                <Image source={{ uri: photoURL }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="person" size={60} color="#FFF" />
                </View>
              )}
              <View style={styles.photoEditBadge}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>Toca para cambiar la foto</Text>
          </Animatable.View>

          {/* Form Section */}
          <Animatable.View animation="fadeInUp" duration={800} delay={200}>
            <Text style={styles.sectionTitle}>Información Personal</Text>

            {/* Username */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre de Usuario</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Ingresa tu nombre de usuario"
                  placeholderTextColor={Colors.textLight}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Correo Electrónico</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Cambiar Contraseña</Text>
            <Text style={styles.sectionHint}>Deja en blanco si no deseas cambiarla</Text>

            {/* Current Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña Actual</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Ingresa tu contraseña actual"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={Colors.textLight} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nueva Contraseña</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="key-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={Colors.textLight} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirmar Nueva Contraseña</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.textLight} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirma tu nueva contraseña"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color={Colors.textLight} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSaveProfile}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  photoHint: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHint: {
    fontSize: 14,
    color: Colors.textLight,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 16,
    marginLeft: 12,
  },
  eyeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
  },
  cancelButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
});

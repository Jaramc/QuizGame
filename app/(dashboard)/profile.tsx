/**
 * Dashboard - Pantalla de Perfil
 * Información del usuario y configuración
 */

import { useAuth } from '@/hooks/auth';
import { Colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getUserStats } from '@/services/game/gameService';
import { UserStats } from '@/types/game/game.types';
import { useState, useCallback } from 'react';
import { getPlayerPosition } from '@/services/ranking/rankingService';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Cargar estadísticas del usuario
      const userStats = await getUserStats(user.id);
      setStats(userStats);

      // Cargar posición en el ranking
      const position = await getPlayerPosition(user.id);
      setPlayerPosition(position);
    } catch (error) {
      console.error('❌ Error cargando datos del perfil:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Recargar datos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [loadUserData])
  );

  const handleComingSoon = () => {
    setShowComingSoonModal(true);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/welcome');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={64} color="#FFF" />
              </View>
            )}
            <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={() => router.push('/(dashboard)/edit-profile')}
            >
              <Ionicons name="camera" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.username}>{user?.username || 'Usuario'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
        </Animatable.View>

        {/* Stats Cards */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          {loading ? (
            <View style={styles.statsRow}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats?.totalGames || 0}</Text>
                <Text style={styles.statLabel}>Partidas</Text>
                {playerPosition && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>#{playerPosition}</Text>
                  </View>
                )}
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats?.totalWins || 0}</Text>
                <Text style={styles.statLabel}>Victorias</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Nv.{stats?.level || 1}</Text>
                </View>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats?.totalPoints || 0}</Text>
                <Text style={styles.statLabel}>Puntos</Text>
                <View style={styles.badge}>
                  <Ionicons name="flame" size={12} color={Colors.warning} />
                  <Text style={styles.badgeText}>{stats?.currentStreak || 0}</Text>
                </View>
              </View>
            </View>
          )}
        </Animatable.View>

        {/* Menu Options */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/(dashboard)/edit-profile')}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.primary }]}>
              <Ionicons name="person-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.menuText}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleComingSoon}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.secondary }]}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.menuText}>Notificaciones</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleComingSoon}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.accent }]}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#2C3E50" />
            </View>
            <Text style={styles.menuText}>Privacidad</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleComingSoon}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.info }]}>
              <Ionicons name="help-circle-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.menuText}>Ayuda y Soporte</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleComingSoon}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.textLight }]}>
              <Ionicons name="information-circle-outline" size={24} color="#FFF" />
            </View>
            <Text style={styles.menuText}>Acerca de</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </Animatable.View>

        {/* Logout Button */}
        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* App Version */}
        <Text style={styles.versionText}>Versión 1.0.0</Text>
      </ScrollView>

      {/* Modal Próximamente */}
      <Modal
        visible={showComingSoonModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowComingSoonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View 
            animation="zoomIn" 
            duration={300}
            style={styles.modalContent}
          >
            <View style={styles.modalIconContainer}>
              <Ionicons name="construct" size={60} color={Colors.warning} />
            </View>
            
            <Text style={styles.modalTitle}>Próximamente</Text>
            <Text style={styles.modalMessage}>
              Esta funcionalidad estará disponible en futuras actualizaciones.
              ¡Mantente atento! 🚀
            </Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowComingSoonModal(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Entendido</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingBottom: 80, // Espacio para la barra de navegación
  },
  scrollContent: {
    paddingBottom: 100, // Padding adicional al final del contenido
  },
  profileHeader: {
    alignItems: 'center',
    padding: 30,
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  editAvatarButton: {
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
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  email: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 20,
    marginHorizontal: 5,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    marginHorizontal: 20,
    marginTop: 30,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginVertical: 30,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

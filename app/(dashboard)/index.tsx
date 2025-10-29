/**
 * Dashboard - Pantalla de Inicio
 * Vista principal del usuario autenticado
 */

import { useAuth } from '@/hooks/auth';
import { getUserStats } from '@/services/game';
import { Colors } from '@/styles/colors';
import type { UserStats } from '@/types/game';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardHome() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Cargar estadísticas cuando la pantalla está en foco
  useFocusEffect(
    useCallback(() => {
      loadUserStats();
    }, [user?.id])
  );

  const loadUserStats = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingStats(true);
      const userStats = await getUserStats(user.id);
      setStats(userStats);
      console.log('📊 Estadísticas del usuario cargadas:', userStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/welcome');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola!</Text>
            <Text style={styles.username}>{user?.username || 'Usuario'}</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={24} color={Colors.error} />
          </TouchableOpacity>
        </Animatable.View>

        {/* Stats Cards */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          {isLoadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Cargando estadísticas...</Text>
            </View>
          ) : (
            <>
              <View style={styles.statsContainer}>
                <TouchableOpacity 
                  style={[styles.statCard, { backgroundColor: Colors.primary }]}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(dashboard)/profile')}
                >
                  <Ionicons name="trophy" size={32} color="#FFF" />
                  <Text style={styles.statNumber}>{stats?.totalWins || 0}</Text>
                  <Text style={styles.statLabel}>Partidas Ganadas</Text>
                  {(stats?.totalGames || 0) > 0 && (
                    <View style={styles.statBadge}>
                      <Text style={styles.statBadgeText}>
                        {stats?.totalGames} jugadas
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statCard, { backgroundColor: Colors.secondary }]}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(dashboard)/ranking')}
                >
                  <Ionicons name="star" size={32} color="#FFF" />
                  <Text style={styles.statNumber}>{stats?.totalPoints || 0}</Text>
                  <Text style={styles.statLabel}>Puntos Totales</Text>
                  {(stats?.level || 0) > 1 && (
                    <View style={styles.statBadge}>
                      <Text style={styles.statBadgeText}>
                        Nivel {stats?.level}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.statsContainer}>
                <TouchableOpacity 
                  style={[styles.statCard, { backgroundColor: Colors.accent }]}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(dashboard)/profile')}
                >
                  <Ionicons name="flame" size={32} color="#2C3E50" />
                  <Text style={[styles.statNumber, { color: '#2C3E50' }]}>
                    {stats?.maxStreak || 0}
                  </Text>
                  <Text style={[styles.statLabel, { color: '#2C3E50' }]}>Racha Máxima</Text>
                  {(stats?.currentStreak || 0) > 0 && (
                    <View style={[styles.statBadge, { backgroundColor: '#2C3E50' }]}>
                      <Text style={styles.statBadgeText}>
                        {stats?.currentStreak} actual
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.statCard, { backgroundColor: Colors.success }]}
                  activeOpacity={0.8}
                  onPress={() => router.push('/(dashboard)/profile')}
                >
                  <Ionicons name="checkmark-circle" size={32} color="#FFF" />
                  <Text style={styles.statNumber}>
                    {stats?.accuracy ? Math.round(stats.accuracy) : 0}%
                  </Text>
                  <Text style={styles.statLabel}>Precisión</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animatable.View>

        {/* Quick Actions */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => router.push('/(dashboard)/play')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.primary }]}>
              <Ionicons name="play" size={28} color="#FFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Jugar Ahora</Text>
              <Text style={styles.actionSubtitle}>Comienza una nueva partida</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => router.push('/(dashboard)/ranking')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.secondary }]}>
              <Ionicons name="trophy" size={28} color="#FFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ver Ranking</Text>
              <Text style={styles.actionSubtitle}>Compite con otros jugadores</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => router.push('/(dashboard)/profile')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.accent }]}>
              <Ionicons name="person" size={28} color="#2C3E50" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Mi Perfil</Text>
              <Text style={styles.actionSubtitle}>Ver y editar tu información</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={Colors.textLight} />
          </TouchableOpacity>
        </Animatable.View>

        {/* Categories Preview */}
        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <View style={[styles.categoryCard, { backgroundColor: Colors.category.art }]}>
              <Ionicons name="color-palette" size={32} color="#FFF" />
              <Text style={styles.categoryName}>Arte</Text>
            </View>
            
            <View style={[styles.categoryCard, { backgroundColor: Colors.category.science }]}>
              <Ionicons name="flask" size={32} color="#FFF" />
              <Text style={styles.categoryName}>Ciencia</Text>
            </View>
            
            <View style={[styles.categoryCard, { backgroundColor: Colors.category.sports }]}>
              <Ionicons name="football" size={32} color="#FFF" />
              <Text style={styles.categoryName}>Deportes</Text>
            </View>
            
            <View style={[styles.categoryCard, { backgroundColor: Colors.category.entertainment }]}>
              <Ionicons name="film" size={32} color="#FFF" />
              <Text style={styles.categoryName}>Entretenimiento</Text>
            </View>
            
            <View style={[styles.categoryCard, { backgroundColor: Colors.category.geography }]}>
              <Ionicons name="earth" size={32} color="#FFF" />
              <Text style={styles.categoryName}>Geografía</Text>
            </View>
            
            <View style={[styles.categoryCard, { backgroundColor: Colors.category.history }]}>
              <Ionicons name="time" size={32} color="#FFF" />
              <Text style={styles.categoryName}>Historia</Text>
            </View>
          </ScrollView>
        </Animatable.View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textLight,
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 4,
  },
  logoutButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
    textAlign: 'center',
  },
  statBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  categoriesScroll: {
    paddingLeft: 20,
    marginBottom: 100, // Más espacio para la barra de navegación
  },
  categoryCard: {
    width: 120,
    height: 140,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
    textAlign: 'center',
  },
});

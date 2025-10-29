/**
 * Dashboard - Pantalla de Ranking
 * Tabla de posiciones de jugadores
 */

import { useAuth } from '@/hooks/auth';
import { getPlayerPosition, getPlayerRankingData, getTopPlayers, type RankingPlayer } from '@/services/ranking';
import { Colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RankingScreen() {
  const { user } = useAuth();
  const [topPlayers, setTopPlayers] = useState<RankingPlayer[]>([]);
  const [playerData, setPlayerData] = useState<RankingPlayer | null>(null);
  const [playerPosition, setPlayerPosition] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar ranking cuando la pantalla está en foco
  useFocusEffect(
    useCallback(() => {
      loadRanking();
    }, [user?.id])
  );

  const loadRanking = async () => {
    try {
      setIsLoading(true);
      
      // Cargar top 10 jugadores
      const top = await getTopPlayers(10);
      setTopPlayers(top);
      
      // Cargar datos del jugador actual
      if (user?.id) {
        const data = await getPlayerRankingData(user.id);
        const position = await getPlayerPosition(user.id);
        setPlayerData(data);
        setPlayerPosition(position);
        
        console.log('📊 Ranking cargado:', {
          topPlayers: top.length,
          playerPosition: position,
          playerPoints: data?.totalPoints,
        });
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMedalIcon = (position: number) => {
    if (position === 1) return <Ionicons name="trophy" size={24} color="#FFD700" />;
    if (position === 2) return <Ionicons name="trophy" size={24} color="#C0C0C0" />;
    if (position === 3) return <Ionicons name="trophy" size={24} color="#CD7F32" />;
    return <Text style={styles.positionNumber}>{position}</Text>;
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
          <Text style={styles.title}>🏆 Ranking Global</Text>
          <Text style={styles.subtitle}>Los mejores jugadores</Text>
        </Animatable.View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando ranking...</Text>
          </View>
        ) : topPlayers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>Ranking Vacío</Text>
            <Text style={styles.emptyText}>
              ¡Sé el primero en aparecer! Juega algunas partidas para subir en el ranking.
            </Text>
          </View>
        ) : (
          <>
            {/* Top 3 Podium - Solo mostrar si hay al menos 3 jugadores */}
            {topPlayers.length >= 3 && (
              <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.podiumContainer}>
                {/* Second Place */}
                <View style={styles.podiumItem}>
                  <View style={[styles.podiumAvatar, styles.secondPlace]}>
                    <Ionicons name="person" size={32} color="#FFF" />
                  </View>
                  <View style={[styles.podiumBar, styles.secondBar]}>
                    <Ionicons name="trophy" size={32} color="#C0C0C0" />
                    <Text style={styles.podiumPosition}>2°</Text>
                  </View>
                  <Text style={styles.podiumName}>{topPlayers[1].username}</Text>
                  <Text style={styles.podiumPoints}>{topPlayers[1].totalPoints.toLocaleString()} pts</Text>
                </View>

                {/* First Place */}
                <View style={[styles.podiumItem, styles.firstPodium]}>
                  <View style={[styles.podiumAvatar, styles.firstPlace]}>
                    <Ionicons name="person" size={40} color="#FFF" />
                  </View>
                  <View style={[styles.podiumBar, styles.firstBar]}>
                    <Ionicons name="trophy" size={40} color="#FFD700" />
                    <Text style={[styles.podiumPosition, { fontSize: 24 }]}>1°</Text>
                  </View>
                  <Text style={[styles.podiumName, { fontSize: 16 }]}>{topPlayers[0].username}</Text>
                  <Text style={styles.podiumPoints}>{topPlayers[0].totalPoints.toLocaleString()} pts</Text>
                </View>

                {/* Third Place */}
                <View style={styles.podiumItem}>
                  <View style={[styles.podiumAvatar, styles.thirdPlace]}>
                    <Ionicons name="person" size={32} color="#FFF" />
                  </View>
                  <View style={[styles.podiumBar, styles.thirdBar]}>
                    <Ionicons name="trophy" size={32} color="#CD7F32" />
                    <Text style={styles.podiumPosition}>3°</Text>
                  </View>
                  <Text style={styles.podiumName}>{topPlayers[2].username}</Text>
                  <Text style={styles.podiumPoints}>{topPlayers[2].totalPoints.toLocaleString()} pts</Text>
                </View>
              </Animatable.View>
            )}

            {/* Rest of Rankings */}
            <Animatable.View animation="fadeInUp" duration={800} delay={400}>
              <Text style={styles.sectionTitle}>Top {topPlayers.length} Jugadores</Text>
              
              {topPlayers.slice(topPlayers.length >= 3 ? 3 : 0).map((player, index) => {
                const position = topPlayers.length >= 3 ? index + 4 : index + 1;
                const isCurrentUser = player.userId === user?.id;
                
                return (
                  <View 
                    key={player.userId} 
                    style={[
                      styles.playerCard,
                      isCurrentUser && styles.currentUserCard
                    ]}
                  >
                    <View style={styles.playerPosition}>
                      {renderMedalIcon(position)}
                    </View>
                    <View style={[
                      styles.playerAvatar,
                      isCurrentUser && { backgroundColor: Colors.primary }
                    ]}>
                      <Ionicons 
                        name="person" 
                        size={24} 
                        color={isCurrentUser ? "#FFF" : Colors.primary} 
                      />
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>
                        {player.username} {isCurrentUser && '(Tú)'}
                      </Text>
                      <Text style={styles.playerPoints}>
                        {player.totalPoints.toLocaleString()} puntos
                      </Text>
                    </View>
                    <View style={styles.playerBadges}>
                      <View style={styles.badge}>
                        <Ionicons name="trophy" size={12} color={Colors.accent} />
                        <Text style={styles.badgeText}>{player.totalWins}</Text>
                      </View>
                      <View style={styles.badge}>
                        <Ionicons name="flame" size={12} color={Colors.error} />
                        <Text style={styles.badgeText}>{player.maxStreak}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </Animatable.View>
          </>
        )}

        {/* Your Position - Solo mostrar si no está en el top 10 */}
        {!isLoading && playerData && (playerPosition === null || playerPosition > 10) && (
          <Animatable.View animation="fadeInUp" duration={800} delay={600} style={styles.yourPositionContainer}>
            <Text style={styles.yourPositionLabel}>Tu Posición</Text>
            <View style={[styles.playerCard, styles.yourPositionCard]}>
              <View style={styles.playerPosition}>
                <Text style={styles.positionNumber}>
                  {playerPosition || '-'}
                </Text>
              </View>
              <View style={[styles.playerAvatar, { backgroundColor: Colors.primary }]}>
                <Ionicons name="person" size={24} color="#FFF" />
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{user?.username || 'Tú'}</Text>
                <Text style={styles.playerPoints}>
                  {playerData.totalPoints.toLocaleString()} puntos
                </Text>
              </View>
            </View>
            <Text style={styles.encouragementText}>
              ¡Sigue jugando para subir en el ranking! 🚀
            </Text>
          </Animatable.View>
        )}
        
        {/* Mensaje si no tienes puntos aún */}
        {!isLoading && !playerData && (
          <Animatable.View animation="fadeInUp" duration={800} delay={600} style={styles.yourPositionContainer}>
            <Text style={styles.yourPositionLabel}>Tu Posición</Text>
            <View style={[styles.playerCard, styles.yourPositionCard]}>
              <View style={styles.playerPosition}>
                <Text style={styles.positionNumber}>-</Text>
              </View>
              <View style={[styles.playerAvatar, { backgroundColor: Colors.primary }]}>
                <Ionicons name="person" size={24} color="#FFF" />
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{user?.username || 'Tú'}</Text>
                <Text style={styles.playerPoints}>0 puntos</Text>
              </View>
            </View>
            <Text style={styles.encouragementText}>
              ¡Juega tu primera partida para aparecer en el ranking! 🚀
            </Text>
          </Animatable.View>
        )}
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
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textLight,
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 40,
  },
  podiumContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  podiumItem: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  firstPodium: {
    marginBottom: 20,
  },
  podiumAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  firstPlace: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
  },
  secondPlace: {
    backgroundColor: Colors.secondary,
  },
  thirdPlace: {
    backgroundColor: Colors.textLight,
  },
  podiumBar: {
    width: 90,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  firstBar: {
    height: 140,
    width: 100,
  },
  secondBar: {
    height: 110,
  },
  thirdBar: {
    height: 90,
  },
  podiumPosition: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
  },
  podiumName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  podiumPoints: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  playerPosition: {
    width: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  positionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  playerPoints: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.background,
  },
  playerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text,
  },
  yourPositionContainer: {
    marginTop: 30,
    marginBottom: 30,
  },
  yourPositionLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  yourPositionCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  encouragementText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 40,
  },
});

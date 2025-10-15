/**
 * Dashboard - Pantalla de Ranking
 * Tabla de posiciones de jugadores
 */

import { Colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data para el ranking
const topPlayers = [
  { id: 1, username: 'ProPlayer123', points: 15420, position: 1 },
  { id: 2, username: 'QuizMaster', points: 14850, position: 2 },
  { id: 3, username: 'BrainStorm', points: 13990, position: 3 },
  { id: 4, username: 'SmartKid', points: 12340, position: 4 },
  { id: 5, username: 'Genius99', points: 11800, position: 5 },
  { id: 6, username: 'QuestionLord', points: 10950, position: 6 },
  { id: 7, username: 'AnswerKing', points: 9870, position: 7 },
  { id: 8, username: 'ThinkFast', points: 8990, position: 8 },
  { id: 9, username: 'MindReader', points: 7650, position: 9 },
  { id: 10, username: 'IQMaster', points: 6540, position: 10 },
];

export default function RankingScreen() {
  const renderMedalIcon = (position: number) => {
    if (position === 1) return <Ionicons name="trophy" size={24} color="#FFD700" />;
    if (position === 2) return <Ionicons name="trophy" size={24} color="#C0C0C0" />;
    if (position === 3) return <Ionicons name="trophy" size={24} color="#CD7F32" />;
    return <Text style={styles.positionNumber}>{position}</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.container}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <Text style={styles.title}>🏆 Ranking Global</Text>
          <Text style={styles.subtitle}>Los mejores jugadores</Text>
        </Animatable.View>

        {/* Top 3 Podium */}
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
            <Text style={styles.podiumPoints}>{topPlayers[1].points.toLocaleString()} pts</Text>
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
            <Text style={styles.podiumPoints}>{topPlayers[0].points.toLocaleString()} pts</Text>
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
            <Text style={styles.podiumPoints}>{topPlayers[2].points.toLocaleString()} pts</Text>
          </View>
        </Animatable.View>

        {/* Rest of Rankings */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <Text style={styles.sectionTitle}>Top 10 Jugadores</Text>
          
          {topPlayers.slice(3).map((player, index) => (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerPosition}>
                {renderMedalIcon(player.position)}
              </View>
              <View style={styles.playerAvatar}>
                <Ionicons name="person" size={24} color={Colors.primary} />
              </View>
              <View style={styles.playerInfo}>
                <Text style={styles.playerName}>{player.username}</Text>
                <Text style={styles.playerPoints}>{player.points.toLocaleString()} puntos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
            </View>
          ))}
        </Animatable.View>

        {/* Your Position */}
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
              <Text style={styles.playerName}>Tú</Text>
              <Text style={styles.playerPoints}>0 puntos</Text>
            </View>
          </View>
          <Text style={styles.encouragementText}>
            ¡Juega más partidas para aparecer en el ranking! 🚀
          </Text>
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

/**
 * Dashboard - Pantalla de Jugar
 * Selección de modo de juego y categorías
 */

import { Colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlayScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.container}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <Text style={styles.title}>¡A Jugar!</Text>
          <Text style={styles.subtitle}>Elige tu modo de juego favorito</Text>
        </Animatable.View>

        {/* Game Modes */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <TouchableOpacity style={[styles.modeCard, styles.classicMode]} activeOpacity={0.8}>
            <View style={styles.modeIcon}>
              <Ionicons name="game-controller" size={48} color="#FFF" />
            </View>
            <View style={styles.modeContent}>
              <Text style={styles.modeTitle}>Modo Clásico</Text>
              <Text style={styles.modeDescription}>
                Responde preguntas de diferentes categorías
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.timeMode]} activeOpacity={0.8}>
            <View style={styles.modeIcon}>
              <Ionicons name="timer" size={48} color="#FFF" />
            </View>
            <View style={styles.modeContent}>
              <Text style={styles.modeTitle}>Contrarreloj</Text>
              <Text style={styles.modeDescription}>
                ¡Responde lo más rápido que puedas!
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={28} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeCard, styles.challengeMode]} activeOpacity={0.8}>
            <View style={styles.modeIcon}>
              <Ionicons name="people" size={48} color="#FFF" />
            </View>
            <View style={styles.modeContent}>
              <Text style={styles.modeTitle}>Multijugador</Text>
              <Text style={styles.modeDescription}>
                Desafía a otros jugadores
              </Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Próximamente</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={28} color="#FFF" />
          </TouchableOpacity>
        </Animatable.View>

        {/* Categories Section */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <Text style={styles.sectionTitle}>Jugar por Categoría</Text>
          
          <View style={styles.categoriesGrid}>
            <TouchableOpacity style={[styles.categoryItem, { backgroundColor: Colors.category.art }]}>
              <Ionicons name="color-palette" size={32} color="#FFF" />
              <Text style={styles.categoryText}>Arte</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.categoryItem, { backgroundColor: Colors.category.science }]}>
              <Ionicons name="flask" size={32} color="#FFF" />
              <Text style={styles.categoryText}>Ciencia</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.categoryItem, { backgroundColor: Colors.category.sports }]}>
              <Ionicons name="football" size={32} color="#FFF" />
              <Text style={styles.categoryText}>Deportes</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.categoryItem, { backgroundColor: Colors.category.entertainment }]}>
              <Ionicons name="film" size={32} color="#FFF" />
              <Text style={styles.categoryText}>Entretenimiento</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.categoryItem, { backgroundColor: Colors.category.geography }]}>
              <Ionicons name="earth" size={32} color="#FFF" />
              <Text style={styles.categoryText}>Geografía</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.categoryItem, { backgroundColor: Colors.category.history }]}>
              <Ionicons name="time" size={32} color="#FFF" />
              <Text style={styles.categoryText}>Historia</Text>
            </TouchableOpacity>
          </View>
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
  },
  header: {
    padding: 20,
    paddingTop: 10,
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
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  classicMode: {
    backgroundColor: Colors.primary,
  },
  timeMode: {
    backgroundColor: Colors.secondary,
  },
  challengeMode: {
    backgroundColor: Colors.accent,
  },
  modeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modeDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  categoryItem: {
    width: '47%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 12,
  },
});

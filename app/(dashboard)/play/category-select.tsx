/**
 * Pantalla de selección de categoría para jugar
 */

import { Colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import type { QuestionCategory, QuestionDifficulty, GameMode } from '@/types/game';

const categories: Array<{
  id: QuestionCategory;
  name: string;
  icon: string;
  color: string;
}> = [
  { id: 'art', name: 'Arte', icon: 'color-palette', color: '#E91E63' },
  { id: 'science', name: 'Ciencia', icon: 'flask', color: '#2196F3' },
  { id: 'sports', name: 'Deportes', icon: 'football', color: '#FF9800' },
  { id: 'entertainment', name: 'Entretenimiento', icon: 'film', color: '#9C27B0' },
  { id: 'geography', name: 'Geografía', icon: 'earth', color: '#4CAF50' },
  { id: 'history', name: 'Historia', icon: 'time', color: '#FF6B35' },
];

const difficulties: Array<{
  id: QuestionDifficulty;
  name: string;
  color: string;
  description: string;
}> = [
  { id: 'easy', name: 'Fácil', color: Colors.success, description: '10 pts' },
  { id: 'medium', name: 'Media', color: Colors.accent, description: '20 pts' },
  { id: 'hard', name: 'Difícil', color: Colors.error, description: '30 pts' },
];

export default function CategorySelectScreen() {
  const params = useLocalSearchParams<{ mode: string }>();
  const mode = (params.mode as GameMode) || 'classic';
  
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('art');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty>('medium');

  const handleStartGame = () => {
    router.push({
      pathname: '/(dashboard)/play/game',
      params: {
        mode,
        category: selectedCategory,
        difficulty: selectedDifficulty,
      },
    });
  };

  const getModeTitle = () => {
    switch (mode) {
      case 'classic':
        return 'Modo Clásico';
      case 'timed':
        return 'Contrarreloj';
      default:
        return 'Jugar';
    }
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{getModeTitle()}</Text>
            <Text style={styles.subtitle}>Elige categoría y dificultad</Text>
          </View>
        </Animatable.View>

        {/* Categorías */}
        <Animatable.View animation="fadeInUp" duration={800} delay={200}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  { backgroundColor: cat.color },
                  selectedCategory === cat.id && styles.selectedCard,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Ionicons name={cat.icon as any} size={32} color="#FFF" />
                <Text style={styles.categoryName}>{cat.name}</Text>
                {selectedCategory === cat.id && (
                  <View style={styles.checkMark}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>

        {/* Dificultad */}
        <Animatable.View animation="fadeInUp" duration={800} delay={400}>
          <Text style={styles.sectionTitle}>Dificultad</Text>
          <View style={styles.difficultyContainer}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff.id}
                style={[
                  styles.difficultyCard,
                  { borderColor: diff.color },
                  selectedDifficulty === diff.id && {
                    backgroundColor: diff.color,
                  },
                ]}
                onPress={() => setSelectedDifficulty(diff.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.difficultyName,
                    {
                      color:
                        selectedDifficulty === diff.id ? '#FFF' : diff.color,
                    },
                  ]}
                >
                  {diff.name}
                </Text>
                <Text
                  style={[
                    styles.difficultyDescription,
                    {
                      color:
                        selectedDifficulty === diff.id
                          ? 'rgba(255,255,255,0.8)'
                          : Colors.textLight,
                    },
                  ]}
                >
                  {diff.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>

        {/* Botón Jugar */}
        <Animatable.View animation="fadeInUp" duration={800} delay={600}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={handleStartGame}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={24} color="#FFF" />
            <Text style={styles.playButtonText}>¡Comenzar!</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
    textAlign: 'center',
  },
  checkMark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  difficultyContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  difficultyCard: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  difficultyDescription: {
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

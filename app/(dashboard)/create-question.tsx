/**
 * Pantalla para crear preguntas personalizadas
 */

import { Colors } from '@/styles/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { createQuestion } from '@/services/questions';
import { useAuth } from '@/hooks/auth';
import type { QuestionCategory, QuestionDifficulty } from '@/types/game';

const categories: Array<{ id: QuestionCategory; name: string; icon: string; color: string }> = [
  { id: 'art', name: 'Arte', icon: 'color-palette', color: '#E91E63' },
  { id: 'science', name: 'Ciencia', icon: 'flask', color: '#2196F3' },
  { id: 'sports', name: 'Deportes', icon: 'football', color: '#FF9800' },
  { id: 'entertainment', name: 'Entretenimiento', icon: 'film', color: '#9C27B0' },
  { id: 'geography', name: 'Geografía', icon: 'earth', color: '#4CAF50' },
  { id: 'history', name: 'Historia', icon: 'time', color: '#FF6B35' },
];

const difficulties: Array<{ id: QuestionDifficulty; name: string; color: string }> = [
  { id: 'easy', name: 'Fácil', color: Colors.success },
  { id: 'medium', name: 'Media', color: Colors.accent },
  { id: 'hard', name: 'Difícil', color: Colors.error },
];

export default function CreateQuestionScreen() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [incorrectAnswer1, setIncorrectAnswer1] = useState('');
  const [incorrectAnswer2, setIncorrectAnswer2] = useState('');
  const [incorrectAnswer3, setIncorrectAnswer3] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory>('art');
  const [selectedDifficulty, setSelectedDifficulty] = useState<QuestionDifficulty>('medium');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    if (!question.trim()) {
      Alert.alert('Error', 'Por favor ingresa la pregunta');
      return false;
    }
    if (!correctAnswer.trim()) {
      Alert.alert('Error', 'Por favor ingresa la respuesta correcta');
      return false;
    }
    if (!incorrectAnswer1.trim() || !incorrectAnswer2.trim() || !incorrectAnswer3.trim()) {
      Alert.alert('Error', 'Por favor ingresa las 3 respuestas incorrectas');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para crear preguntas');
      return;
    }

    setIsLoading(true);
    try {
      const userId = (user as any).uid || user.id;
      await createQuestion(
        {
          category: selectedCategory,
          difficulty: selectedDifficulty,
          type: 'multiple-choice',
          question: question.trim(),
          correctAnswer: correctAnswer.trim(),
          incorrectAnswers: [
            incorrectAnswer1.trim(),
            incorrectAnswer2.trim(),
            incorrectAnswer3.trim(),
          ],
          isPublic,
        },
        userId
      );

      Alert.alert(
        '¡Éxito!',
        'Tu pregunta ha sido creada correctamente',
        [
          {
            text: 'Crear otra',
            onPress: resetForm,
          },
          {
            text: 'Volver',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo crear la pregunta');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setQuestion('');
    setCorrectAnswer('');
    setIncorrectAnswer1('');
    setIncorrectAnswer2('');
    setIncorrectAnswer3('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Crear Pregunta</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Pregunta */}
          <View style={styles.section}>
            <Text style={styles.label}>Pregunta *</Text>
            <TextInput
              style={styles.textArea}
              value={question}
              onChangeText={setQuestion}
              placeholder="Escribe tu pregunta aquí..."
              placeholderTextColor={Colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Categoría */}
          <View style={styles.section}>
            <Text style={styles.label}>Categoría *</Text>
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
                  <Ionicons name={cat.icon as any} size={24} color="#FFF" />
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  {selectedCategory === cat.id && (
                    <View style={styles.checkMark}>
                      <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dificultad */}
          <View style={styles.section}>
            <Text style={styles.label}>Dificultad *</Text>
            <View style={styles.difficultyRow}>
              {difficulties.map((diff) => (
                <TouchableOpacity
                  key={diff.id}
                  style={[
                    styles.difficultyButton,
                    { borderColor: diff.color },
                    selectedDifficulty === diff.id && { backgroundColor: diff.color },
                  ]}
                  onPress={() => setSelectedDifficulty(diff.id)}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: selectedDifficulty === diff.id ? '#FFF' : diff.color },
                    ]}
                  >
                    {diff.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Respuesta Correcta */}
          <View style={styles.section}>
            <Text style={styles.label}>Respuesta Correcta *</Text>
            <View style={styles.answerContainer}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <TextInput
                style={styles.answerInput}
                value={correctAnswer}
                onChangeText={setCorrectAnswer}
                placeholder="Escribe la respuesta correcta"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>

          {/* Respuestas Incorrectas */}
          <View style={styles.section}>
            <Text style={styles.label}>Respuestas Incorrectas *</Text>
            
            <View style={styles.answerContainer}>
              <Ionicons name="close-circle" size={20} color={Colors.error} />
              <TextInput
                style={styles.answerInput}
                value={incorrectAnswer1}
                onChangeText={setIncorrectAnswer1}
                placeholder="Respuesta incorrecta 1"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.answerContainer}>
              <Ionicons name="close-circle" size={20} color={Colors.error} />
              <TextInput
                style={styles.answerInput}
                value={incorrectAnswer2}
                onChangeText={setIncorrectAnswer2}
                placeholder="Respuesta incorrecta 2"
                placeholderTextColor={Colors.textLight}
              />
            </View>

            <View style={styles.answerContainer}>
              <Ionicons name="close-circle" size={20} color={Colors.error} />
              <TextInput
                style={styles.answerInput}
                value={incorrectAnswer3}
                onChangeText={setIncorrectAnswer3}
                placeholder="Respuesta incorrecta 3"
                placeholderTextColor={Colors.textLight}
              />
            </View>
          </View>

          {/* Visibilidad */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsPublic(!isPublic)}
            >
              <View style={[styles.checkbox, isPublic && styles.checkboxChecked]}>
                {isPublic && <Ionicons name="checkmark" size={16} color="#FFF" />}
              </View>
              <View style={styles.checkboxTextContainer}>
                <Text style={styles.checkboxLabel}>Hacer pública</Text>
                <Text style={styles.checkboxHint}>
                  Otros usuarios podrán ver y responder esta pregunta
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Botón Submit */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? 'Creando...' : 'Crear Pregunta'}
            </Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 100,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 12,
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
  difficultyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  answerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  answerInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  checkboxHint: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

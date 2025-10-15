/**
 * Componente de Input personalizado para autenticación
 * Con animaciones y validaciones
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  TextInputProps,
  Animated,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { authStyles } from '@/styles/auth.styles';
import { Colors } from '@/styles/colors';

interface AuthInputProps extends TextInputProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

/**
 * Input personalizado con validación y animaciones
 */
export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  isPassword = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={authStyles.inputContainer}>
      <Text style={authStyles.inputLabel}>{label}</Text>
      
      <Animatable.View
        animation={error ? 'shake' : undefined}
        duration={500}
        style={[
          authStyles.inputWrapper,
          isFocused && authStyles.inputWrapperFocused,
          error && authStyles.inputWrapperError,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? Colors.error : isFocused ? Colors.primary : Colors.textLight}
            style={authStyles.inputIcon}
          />
        )}
        
        <TextInput
          style={authStyles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={Colors.textLight}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.textLight}
            />
          </TouchableOpacity>
        )}
      </Animatable.View>
      
      {error && (
        <Animatable.Text
          animation="fadeInLeft"
          duration={300}
          style={authStyles.errorText}
        >
          {error}
        </Animatable.Text>
      )}
    </View>
  );
};

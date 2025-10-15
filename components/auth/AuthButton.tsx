/**
 * Componente de botón personalizado para autenticación
 * Con animaciones, estados de loading y variantes
 */

import { authStyles } from '@/styles/auth.styles';
import { Colors } from '@/styles/colors';
import React from 'react';
import {
    ActivityIndicator,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

/**
 * Botón personalizado con estados y animaciones
 */
export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  icon,
  disabled,
  style,
  ...props
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity
        style={[
          authStyles.button,
          isPrimary ? authStyles.buttonPrimary : authStyles.buttonSecondary,
          disabled && authStyles.buttonDisabled,
          style as ViewStyle,
        ]}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator color={isPrimary ? '#FFFFFF' : Colors.primary} />
        ) : (
          <>
            {icon}
            <Text
              style={[
                authStyles.buttonText,
                !isPrimary && authStyles.buttonTextSecondary,
              ]}
            >
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animatable.View>
  );
};

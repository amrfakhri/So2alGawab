import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

import { dark, radius, spacing, textStyle } from '../../../shared/theme/tokens';

interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  icon: LucideIcon;
  error?: string;
  secureTextEntry?: boolean;
}

export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  ({ icon: Icon, error, secureTextEntry = false, ...props }, ref) => {
    const [hidden, setHidden] = useState(secureTextEntry);
    const hasError = !!error;

    return (
      <View style={styles.wrapper}>
        <View style={[styles.container, hasError && styles.containerError]}>
          <Icon size={16} color={dark.iconTertiary} strokeWidth={1.8} />
          <TextInput
            ref={ref}
            {...props}
            secureTextEntry={hidden}
            placeholderTextColor={dark.textTertiary}
            style={styles.input}
            underlineColorAndroid="transparent"
          />
          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setHidden((h) => !h)}
              hitSlop={8}
              style={styles.eyeBtn}
            >
              {hidden ? (
                <EyeOff size={16} color={dark.iconTertiary} strokeWidth={1.8} />
              ) : (
                <Eye size={16} color={dark.iconTertiary} strokeWidth={1.8} />
              )}
            </TouchableOpacity>
          )}
        </View>
        {hasError && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);

AuthInput.displayName = 'AuthInput';

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing['3xs'],
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: dark.bgOverlay,
    borderWidth: 1,
    borderColor: dark.borderSubtle,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    gap: spacing['2xs'],
    overflow: 'hidden',
  },
  containerError: {
    borderColor: dark.borderError,
  },
  input: {
    flex: 1,
    color: dark.textPrimary,
    ...textStyle.bodySm,
    paddingVertical: 0,
  },
  eyeBtn: {
    paddingLeft: spacing['3xs'],
  },
  error: {
    color: dark.textError,
    ...textStyle.captionSm,
  },
});

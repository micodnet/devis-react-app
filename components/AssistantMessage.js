import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontSize } from '../lib/theme';

export default function AssistantMessage({ role = 'assistant', text }) {
  if (role === 'system') {
    return (
      <View style={styles.systemWrap}>
        <Text style={styles.systemText}>{text}</Text>
      </View>
    );
  }

  const isUser = role === 'user';
  return (
    <View style={[styles.wrap, isUser ? styles.wrapRight : styles.wrapLeft]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textAssistant]}>
          {text}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  wrapLeft: { alignItems: 'flex-start' },
  wrapRight: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '85%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  bubbleUser: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  textUser: {
    color: '#0b1120',
    fontWeight: '500',
  },
  textAssistant: {
    color: colors.text,
  },
  systemWrap: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  systemText: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
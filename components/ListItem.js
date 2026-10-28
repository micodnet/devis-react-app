import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, fontSize } from '../lib/theme';

export default function ListItem({
  icon,
  title,
  subtitle,
  rightText,
  onPress,
}) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightText ? (
        <Text style={styles.rightText} numberOfLines={1}>
          {rightText}
        </Text>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
    backgroundColor: colors.bg,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 20 },
  body: { flex: 1, minWidth: 0 },
  title: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  rightText: {
    color: colors.accent,
    fontSize: fontSize.sm,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
});
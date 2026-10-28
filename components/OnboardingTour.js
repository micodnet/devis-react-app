// import { useEffect, useRef } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
// } from 'react-native';
// import { colors, spacing, fontSize, radius } from '../lib/theme';

// const { width: SCREEN_W } = Dimensions.get('window');

// export default function OnboardingTour({
//   steps,
//   currentStep,
//   onNext,
//   onPrev,
//   onClose,
// }) {
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 250,
//       useNativeDriver: true,
//     }).start();
//   }, [currentStep]);

//   if (!steps || currentStep >= steps.length) return null;

//   const step = steps[currentStep];
//   const isFirst = currentStep === 0;
//   const isLast = currentStep === steps.length - 1;

//   return (
//     <View style={[styles.overlay, { pointerEvents: 'box-none' }]}>
//       <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
//       <Animated.View style={[styles.tooltip, { opacity: fadeAnim }]}>
//         <View style={styles.stepBadge}>
//           <Text style={styles.stepBadgeText}>
//             Étape {currentStep + 1} / {steps.length}
//           </Text>
//         </View>

//         <Text style={styles.title}>{step.title}</Text>
//         <Text style={styles.body}>{step.body}</Text>

//         {step.tip ? (
//           <View style={styles.tipBox}>
//             <Text style={styles.tipText}>💡 {step.tip}</Text>
//           </View>
//         ) : null}

//         <View style={styles.actions}>
//           <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
//             <Text style={styles.skipText}>Passer la visite</Text>
//           </TouchableOpacity>

//           <View style={styles.navRow}>
//             {!isFirst && (
//               <TouchableOpacity
//                 style={[styles.navBtn, styles.navBtnSecondary]}
//                 onPress={onPrev}
//                 activeOpacity={0.7}
//               >
//                 <Text style={styles.navBtnSecondaryText}>Précédent</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity
//               style={[styles.navBtn, styles.navBtnPrimary]}
//               onPress={isLast ? onClose : onNext}
//               activeOpacity={0.7}
//             >
//               <Text style={styles.navBtnPrimaryText}>
//                 {isLast ? 'Terminer' : 'Suivant'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   overlay: {
//     ...StyleSheet.absoluteFillObject,
//     zIndex: 9999,
//     justifyContent: 'flex-end',
//   },
//   backdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.75)',
//   },
//   tooltip: {
//     backgroundColor: colors.bgCard,
//     borderTopLeftRadius: radius.xl,
//     borderTopRightRadius: radius.xl,
//     paddingHorizontal: spacing.lg,
//     paddingTop: spacing.xl,
//     paddingBottom: spacing.xxl,
//     borderTopWidth: 2,
//     borderTopColor: colors.accent,
//     maxWidth: SCREEN_W,
//   },
//   stepBadge: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: spacing.md,
//     paddingVertical: 3,
//     borderRadius: radius.full,
//     backgroundColor: 'rgba(249,115,22,0.15)',
//     borderWidth: 1,
//     borderColor: 'rgba(249,115,22,0.4)',
//     marginBottom: spacing.md,
//   },
//   stepBadgeText: {
//     color: colors.accent,
//     fontSize: 10,
//     fontWeight: '800',
//     letterSpacing: 0.5,
//     textTransform: 'uppercase',
//   },
//   title: {
//     color: colors.text,
//     fontSize: fontSize.lg,
//     fontWeight: '800',
//     marginBottom: spacing.md,
//   },
//   body: {
//     color: colors.textSecondary,
//     fontSize: fontSize.sm,
//     lineHeight: 20,
//     marginBottom: spacing.md,
//   },
//   tipBox: {
//     backgroundColor: 'rgba(59,130,246,0.1)',
//     borderLeftWidth: 3,
//     borderLeftColor: '#3b82f6',
//     paddingVertical: spacing.md,
//     paddingHorizontal: spacing.md,
//     borderRadius: radius.sm,
//     marginBottom: spacing.lg,
//   },
//   tipText: {
//     color: colors.textSecondary,
//     fontSize: fontSize.xs,
//     lineHeight: 18,
//   },
//   actions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: spacing.md,
//     gap: spacing.md,
//   },
//   skipText: {
//     color: colors.textMuted,
//     fontSize: fontSize.xs,
//     textDecorationLine: 'underline',
//   },
//   navRow: { flexDirection: 'row', gap: spacing.sm },
//   navBtn: {
//     paddingHorizontal: spacing.lg,
//     paddingVertical: 10,
//     borderRadius: radius.full,
//     alignItems: 'center',
//     justifyContent: 'center',
//     minHeight: 40,
//   },
//   navBtnPrimary: { backgroundColor: colors.accent },
//   navBtnPrimaryText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
//   navBtnSecondary: {
//     backgroundColor: colors.bgInput,
//     borderWidth: 1,
//     borderColor: colors.borderLight,
//   },
//   navBtnSecondaryText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
// });

import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { colors, spacing, fontSize, radius } from '../lib/theme';

const { width: SCREEN_W } = Dimensions.get('window');

export default function OnboardingTour({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  if (!steps || currentStep >= steps.length) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      <Animated.View style={[styles.tooltip, { opacity: fadeAnim }]}>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>
            Étape {currentStep + 1} / {steps.length}
          </Text>
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.body}>{step.body}</Text>

        {step.tip ? (
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 {step.tip}</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.skipText}>Passer la visite</Text>
          </TouchableOpacity>

          <View style={styles.navRow}>
            {!isFirst && (
              <TouchableOpacity
                style={[styles.navBtn, styles.navBtnSecondary]}
                onPress={onPrev}
                activeOpacity={0.7}
              >
                <Text style={styles.navBtnSecondaryText}>Précédent</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrimary]}
              onPress={isLast ? onClose : onNext}
              activeOpacity={0.7}
            >
              <Text style={styles.navBtnPrimaryText}>
                {isLast ? 'Terminer' : 'Suivant'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  tooltip: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    borderTopWidth: 2,
    borderTopColor: colors.accent,
    maxWidth: SCREEN_W,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: 'rgba(249,115,22,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.4)',
    marginBottom: spacing.md,
  },
  stepBadgeText: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  body: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tipBox: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.lg,
  },
  tipText: {
    color: colors.textSecondary,
    fontSize: fontSize.xs,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    textDecorationLine: 'underline',
  },
  navRow: { flexDirection: 'row', gap: spacing.sm },
  navBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  navBtnPrimary: { backgroundColor: colors.accent },
  navBtnPrimaryText: { color: '#0b1120', fontSize: fontSize.sm, fontWeight: '700' },
  navBtnSecondary: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  navBtnSecondaryText: { color: colors.textSecondary, fontSize: fontSize.sm, fontWeight: '600' },
});
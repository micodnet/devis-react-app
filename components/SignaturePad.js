import { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, PanResponder, TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius, spacing, fontSize } from '../lib/theme';

export default function SignaturePad({ onSignChange, height = 200 }) {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const currentPathRef = useRef('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        currentPathRef.current = newPath;
        setCurrentPath(newPath);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current += ` L${locationX.toFixed(1)},${locationY.toFixed(1)}`;
        setCurrentPath(currentPathRef.current);
      },
      onPanResponderRelease: () => {
        if (currentPathRef.current) {
          setPaths((prev) => [...prev, currentPathRef.current]);
          currentPathRef.current = '';
          setCurrentPath('');
        }
      },
    })
  ).current;

  const clear = () => {
    setPaths([]);
    setCurrentPath('');
    currentPathRef.current = '';
  };

  // Notifier le parent à chaque changement de paths
  const prevPathsRef = useRef(paths);
  if (prevPathsRef.current !== paths) {
    prevPathsRef.current = paths;
    if (onSignChange) onSignChange(paths.length > 0);
  }

  return (
    <View>
      <View
        style={[styles.canvasWrap, { height }]}
        {...panResponder.panHandlers}
      >
        <Svg width="100%" height={height}>
          {paths.map((p, i) => (
            <Path
              key={i}
              d={p}
              stroke={colors.text}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {currentPath ? (
            <Path
              d={currentPath}
              stroke={colors.text}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </Svg>

        {paths.length === 0 && !currentPath && (
          <View style={styles.placeholder} pointerEvents="none">
            <Text style={styles.placeholderText}>✍️ Signez ici</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.clearBtn} onPress={clear} activeOpacity={0.7}>
        <Text style={styles.clearBtnText}>🗑 Effacer</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Retourne un SVG encodé en data-URI (image/svg+xml) à partir des paths.
 */
export function getSignatureSvgDataUrl(paths, width = 500, height = 200) {
  const pathsSvg = paths
    .map(
      (p) =>
        `<path d="${p}" stroke="#0b1120" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />`
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#ffffff"/>${pathsSvg}</svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const styles = StyleSheet.create({
  canvasWrap: {
    backgroundColor: '#ffffff',
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: fontSize.md,
    fontStyle: 'italic',
  },
  clearBtn: {
    marginTop: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  clearBtnText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
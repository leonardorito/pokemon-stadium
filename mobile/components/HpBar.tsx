import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, fonts, hpColorFor } from "@/constants/theme";

interface Props {
  current: number;
  max: number;
}

export function HpBar({ current, max }: Props) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const barColor = hpColorFor(current, max);
  const isLow = current > 0 && pct <= 25;

  const shake = useSharedValue(0);
  useEffect(() => {
    if (isLow) {
      shake.value = withRepeat(
        withSequence(
          withTiming(-2, { duration: 175 }),
          withTiming(2, { duration: 175 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(shake);
      shake.value = withTiming(0, { duration: 100 });
    }
    return () => cancelAnimation(shake);
  }, [isLow, shake]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));

  return (
    <Animated.View style={[styles.row, animStyle]}>
      <Text style={styles.hpLabel}>HP</Text>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct}%`, backgroundColor: barColor },
          ]}
        />
      </View>
      <Text style={styles.hpValue}>
        {current}/{max}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  hpLabel: {
    fontFamily: fonts.display,
    fontSize: 10,
    color: colors.yellow,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  track: {
    flex: 1,
    height: 14,
    borderWidth: 2,
    borderColor: colors.edge,
    backgroundColor: colors.deep,
  },
  fill: { height: "100%" },
  hpValue: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    minWidth: 56,
    textAlign: "right",
  },
});

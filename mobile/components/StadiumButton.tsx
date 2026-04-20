import type { ReactNode } from "react";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, fonts } from "@/constants/theme";

type Variant = "primary" | "magenta" | "cyan" | "lime" | "ghost";

interface Props {
  variant?: Variant;
  pulse?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  children: ReactNode;
}

const palette: Record<Variant, { bg: string; text: string }> = {
  primary: { bg: colors.yellow, text: colors.base },
  magenta: { bg: colors.magenta, text: colors.textWhite },
  cyan: { bg: colors.cyan, text: colors.base },
  lime: { bg: colors.lime, text: colors.base },
  ghost: { bg: colors.surface, text: colors.textWhite },
};

export function StadiumButton({
  variant = "primary",
  pulse = false,
  disabled,
  onPress,
  children,
}: Props) {
  const tones = palette[variant];
  const scale = useSharedValue(1);

  useEffect(() => {
    if (pulse && !disabled) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 800 }),
          withTiming(1, { duration: 800 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 100 });
    }
    return () => cancelAnimation(scale);
  }, [pulse, disabled, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View style={styles.shadowOffset} />
      <Pressable
        onPress={disabled ? undefined : onPress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: tones.bg,
            transform: [
              { translateX: pressed && !disabled ? 4 : 0 },
              { translateY: pressed && !disabled ? 4 : 0 },
            ],
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        <Text style={[styles.label, { color: tones.text }]}>{children}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shadowOffset: {
    position: "absolute",
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.edge,
  },
  button: {
    borderWidth: 2,
    borderColor: colors.base,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 13,
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
});

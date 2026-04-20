import type { ReactNode } from "react";
import { StyleSheet, Text } from "react-native";
import { colors, fonts } from "@/constants/theme";

interface Props {
  color?: string;
  children: ReactNode;
}

export function StencilLabel({ color = colors.textMuted, children }: Props) {
  return <Text style={[styles.label, { color }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.display,
    fontSize: 10,
    letterSpacing: 3.2,
    textTransform: "uppercase",
  },
});

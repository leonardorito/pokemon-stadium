import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "@/constants/theme";

interface Props {
  color?: string;
  children: ReactNode;
}

export function HudTag({ color = colors.cyan, children }: Props) {
  return (
    <View style={[styles.tag, { borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "rgba(7,9,18,0.7)",
    alignSelf: "flex-start",
  },
  label: {
    fontFamily: fonts.display,
    fontSize: 10,
    letterSpacing: 2.8,
    textTransform: "uppercase",
  },
});

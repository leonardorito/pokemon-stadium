import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/constants/theme";

interface Props {
  children: ReactNode;
}

// Plain dark-navy backdrop. The earlier implementation layered three
// LinearGradients (magenta/cyan/yellow tints) to mimic the web's radial
// atmosphere — on a phone screen those tints read as a "weird gradient all
// over" rather than subtle depth, so we drop them.
export function BattleBackground({ children }: Props) {
  return <View style={styles.root}>{children}</View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.base },
});

import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, shadows } from "@/constants/theme";

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
}

export function Panel({ children, style, borderColor = colors.edge }: Props) {
  return (
    <View style={[styles.panel, { borderColor }, shadows.panel, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    padding: 20,
  },
});

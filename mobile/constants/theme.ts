export const colors = {
  base: "#070912",
  surface: "#11152a",
  deep: "#060818",
  edge: "#1f2547",
  line: "#2a3160",
  coal: "#0a0c1a",

  yellow: "#ffe600",
  magenta: "#ff2e97",
  cyan: "#21d4fd",
  lime: "#b8ff3c",
  purple: "#6c2bd9",

  textWhite: "#ffffff",
  textMuted: "rgba(255,255,255,0.55)",
  textDim: "rgba(255,255,255,0.45)",
  textGhost: "rgba(255,255,255,0.25)",
} as const;

export const fonts = {
  display: "Bungee_400Regular",
  mono: "JetBrainsMono_400Regular",
  monoBold: "JetBrainsMono_700Bold",
  pixel: "PressStart2P_400Regular",
} as const;

export const shadows = {
  panel: {
    shadowColor: "#000",
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 0,
    elevation: 6,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export function hpColorFor(currentHp: number, maxHp: number): string {
  if (currentHp <= 0) return colors.edge;
  const pct = (currentHp / maxHp) * 100;
  if (pct > 50) return colors.lime;
  if (pct > 25) return colors.yellow;
  return colors.magenta;
}

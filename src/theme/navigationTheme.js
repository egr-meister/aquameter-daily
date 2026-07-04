// Extend the built-in DefaultTheme so that theme.fonts (incl. theme.fonts.regular)
// is always present. Never build a navigation theme from scratch.
import { DefaultTheme } from "@react-navigation/native";
import colors from "./colors";

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.divider,
    notification: colors.accent,
  },
  // DefaultTheme.fonts is preserved via the spread above; we do not remove it.
  fonts: {
    ...DefaultTheme.fonts,
  },
};

export default navigationTheme;

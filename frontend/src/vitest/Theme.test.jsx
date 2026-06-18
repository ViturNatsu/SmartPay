import { describe, test, expect } from "vitest";
import { theme, tokens } from "../style/Theme";
import {tokens} from "../style/Theme.jsx";

describe("SmartPay Theme", () => {

  describe("Design Tokens", () => {
    test("brand primary color is defined", () => {
      expect(tokens.color.brand.primary).toBeDefined();
      expect(tokens.color.brand.primary).toBe(tokens.color.brand.primary);
    });

    test("all brand colors are defined", () => {
      expect(tokens.color.brand.primary).toBeDefined();
      expect(tokens.color.brand.primaryHover).toBeDefined();
      expect(tokens.color.brand.primaryLight).toBeDefined();
      expect(tokens.color.brand.navy).toBeDefined();
    });

    test("background colors are defined", () => {
      expect(tokens.color.background.app).toBeDefined();
      expect(tokens.color.background.surface).toBeDefined();
    });

    test("text colors are defined", () => {
      expect(tokens.color.text.primary).toBeDefined();
      expect(tokens.color.text.secondary).toBeDefined();
      expect(tokens.color.text.muted).toBeDefined();
    });

    test("status colors are defined", () => {
      expect(tokens.color.status.success).toBeDefined();
      expect(tokens.color.status.error).toBeDefined();
      expect(tokens.color.status.warning).toBeDefined();
    });

    test("border colors are defined", () => {
      expect(tokens.color.border.light).toBeDefined();
      expect(tokens.color.border.medium).toBeDefined();
    });

    test("border radius values are defined", () => {
      expect(tokens.borderRadius.small).toBeDefined();
      expect(tokens.borderRadius.medium).toBeDefined();
      expect(tokens.borderRadius.large).toBeDefined();
      expect(tokens.borderRadius.xl).toBeDefined();
    });

    test("typography values are defined", () => {
      expect(tokens.typography.fontFamily).toBeDefined();
      expect(tokens.typography.fontWeight.regular).toBe(400);
      expect(tokens.typography.fontWeight.bold).toBe(700);
    });
  });

  describe("Theme Palette", () => {
    test("primary palette is configured", () => {
      expect(theme.palette.primary.main).toBe(tokens.color.brand.primary);
    });

    test("background palette is configured", () => {
      expect(theme.palette.background.default).toBe(tokens.color.background.app);
      expect(theme.palette.background.paper).toBe(tokens.color.background.surface);
    });

    test("text palette is configured", () => {
      expect(theme.palette.text.primary).toBeDefined();
      expect(theme.palette.text.secondary).toBeDefined();
    });

    test("error palette is configured", () => {
      expect(theme.palette.error.main).toBe(tokens.color.status.error);
    });

    test("success palette is configured", () => {
      expect(theme.palette.success.main).toBe(tokens.color.status.success);
    });

    test("warning palette is configured", () => {
      expect(theme.palette.warning.main).toBe(tokens.color.status.warning);
    });
  });

  describe("Theme Typography", () => {
    test("font family contains Inter", () => {
      expect(theme.typography.fontFamily).toContain("Inter");
    });

    test("font weights are configured", () => {
      expect(theme.typography.fontWeightRegular).toBe(400);
      expect(theme.typography.fontWeightMedium).toBe(500);
      expect(theme.typography.fontWeightBold).toBe(700);
    });

    test("heading variants are configured", () => {
      expect(theme.typography.h5.fontWeight).toBeDefined();
      expect(theme.typography.h6.fontWeight).toBeDefined();
    });
  });

  describe("Theme Shape", () => {
    test("border radius is defined", () => {
      expect(theme.shape.borderRadius).toBe(tokens.borderRadius.medium);
    });
  });

  describe("Component Overrides", () => {
    test("Button overrides are defined", () => {
      expect(theme.components.MuiButton).toBeDefined();
      expect(theme.components.MuiButton.defaultProps.disableElevation).toBe(true);
    });

    test("TextField overrides are defined", () => {
      expect(theme.components.MuiTextField).toBeDefined();
    });

    test("Card overrides are defined", () => {
      expect(theme.components.MuiCard).toBeDefined();
    });

    test("Dialog overrides are defined", () => {
      expect(theme.components.MuiDialog).toBeDefined();
    });

    test("AppBar overrides are defined", () => {
      expect(theme.components.MuiAppBar).toBeDefined();
    });

    test("Alert overrides are defined", () => {
      expect(theme.components.MuiAlert).toBeDefined();
    });
  });

  describe("Theme integrity", () => {
    test("theme palette primary matches tokens", () => {
      expect(theme.palette.primary.main).toBe(tokens.color.brand.primary);
    });

    test("theme background matches tokens", () => {
      expect(theme.palette.background.default).toBe(tokens.color.background.app);
      expect(theme.palette.background.paper).toBe(tokens.color.background.surface);
    });

    test("theme is a valid MUI theme object", () => {
      expect(theme).toBeDefined();
      expect(theme.palette).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.shape).toBeDefined();
      expect(theme.components).toBeDefined();
    });
  });
});

import { screen } from "@testing-library/react";

export const loginLinkToForgotPassword = () =>
  screen.getByRole("link", { name: /forgot password/i });

export const forgotPasswordEmailField = () => screen.getByRole("textbox", { name: /email/i });

export const forgotPasswordSubmitButton = () =>
  screen.getByRole("button", { name: /send reset link/i });

export const forgotPasswordConfirmationMessage = () =>
  screen.findByText(
    /if an account exists for that email.* we.*ve sent password reset instructions/i,
  );
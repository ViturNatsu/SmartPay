import { screen } from "@testing-library/react";

export const loginLinkToForgotPassword = () =>
  screen.getByRole("link", { name: /forgot password/i });

export const forgotPasswordEmailField = () =>
  screen.getByRole("textbox", { name: /email/i });

export const forgotPasswordSubmitButton = () =>
  screen.getByRole("button", { name: /send reset link/i });

export const forgotPasswordConfirmationMessage = () =>
  screen.findByText(
    /if an account exists for that email.* we.*ve sent password reset instructions/i,
  );

export const resetPasswordNewPasswordField = () =>
  screen.getByLabelText(/new password/i);

export const resetPasswordConfirmPasswordField = () =>
  screen.getByLabelText(/confirm password/i);

export const resetPasswordSubmitButton = () =>
  screen.getByRole("button", { name: /reset password/i });

export const resetPasswordPasswordsDoNotMatch = () =>
  screen.findByText(/passwords do.*n.*t match/i);

export const resetPasswordInvalidCode = () =>
  screen.findByText(/reset code has expired/i);

export const resetPasswordEmailNotFound = () =>
  screen.findByText(/email address not found/i);

export const resetPasswordTooManyFailures = () =>
  screen.findByText(/too many failed attempts/i);

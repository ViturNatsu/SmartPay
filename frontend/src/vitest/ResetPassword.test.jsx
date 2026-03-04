// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { ResetPassword } from "@/pages/Password/ResetPassword";
import { Login } from "@/pages/Login/Login";
import userEvent from "@testing-library/user-event";
import { resetPassword } from "@/api/authApi";
import {
  resetPasswordConfirmPasswordField,
  resetPasswordEmailNotFound,
  resetPasswordInvalidCode,
  resetPasswordNewPasswordField,
  resetPasswordPasswordsDoNotMatch,
  resetPasswordSubmitButton,
  resetPasswordTooManyFailures,
} from "@/vitest/domqueries";

const MIN_PASSWORD_LENGTH = 8;
const MAX_ALLOWED_PASSWORD_RESETS = 5;

const testAccessCode = "ABC123";
const testEmail = "qa@smartpay.test";
const validPassword = "Valid@123";
const nonMatchingPassword = "Valid@124";
const passwordWithoutSpecialCharacter = "Valid123";
const shortPassword = "V@lid1";

const { resetPasswordMock, resetPasswordMockReset } = vi.hoisted(() => {
  let callCount = 0;

  const isWeakPassword = (password) => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      return true;
    }

    if (!/[A-Z]/.test(password)) {
      return true;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return true;
    }

    return false;
  };

  const resetPasswordMock = vi.fn((payload = {}) => {
    callCount += 1;

    if (callCount >= MAX_ALLOWED_PASSWORD_RESETS) {
      return Promise.reject({ status: 429 });
    }

    const password1 = payload.password1 ?? "";
    const password2 = payload.password2 ?? "";
    const accessCode = payload["access-code"];
    const email = payload.email ?? "";

    if (password1 !== password2) {
      return Promise.reject({ status: 400 });
    }

    if (accessCode !== testAccessCode) {
      return Promise.reject({ status: 401 });
    }

    if (email !== testEmail) {
      return Promise.reject({ status: 404 });
    }

    if (isWeakPassword(password1)) {
      return Promise.reject({ status: 422 });
    }

    return Promise.resolve({});
  });

  const resetPasswordMockReset = () => {
    callCount = 0;
    resetPasswordMock.mockClear();
  };

  return { resetPasswordMock, resetPasswordMockReset };
});

vi.mock("../api/authApi", () => ({
  resetPassword: resetPasswordMock,
}));

const renderComponent = (code = testAccessCode, email = testEmail) => {
  const baseUrl = "/reset-password";
  const params = {
    code: code,
    email: email,
  };
  const searchParams = new URLSearchParams(params);
  const urlString = `${baseUrl}?${searchParams}`;

  return render(
    <MemoryRouter initialEntries={[urlString]}>
      <ResetPassword />
      <Login />
    </MemoryRouter>,
  );
};

describe("ResetPassword", () => {
  beforeEach(() => {
    resetPasswordMockReset();
  });

  it("submits when request is valid", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(resetPasswordNewPasswordField(), validPassword);
    await user.type(resetPasswordConfirmPasswordField(), validPassword);
    await user.click(resetPasswordSubmitButton());

    await waitFor(() => {
      expect(resetPassword).toHaveBeenCalledTimes(1);
    });
    expect(resetPassword).toHaveBeenCalledWith({
      email: testEmail,
      password1: validPassword,
      password2: validPassword,
      "access-code": testAccessCode,
    });
  });

  it("shows error when passwords do not match", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(resetPasswordNewPasswordField(), validPassword);
    await user.type(resetPasswordConfirmPasswordField(), nonMatchingPassword);
    await user.click(resetPasswordSubmitButton());

    expect(await resetPasswordPasswordsDoNotMatch()).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledTimes(1);
  });

  it("shows error when access code is invalid or expired", async () => {
    const user = userEvent.setup();
    renderComponent("invalidCode", testEmail);

    await user.type(resetPasswordNewPasswordField(), validPassword);
    await user.type(resetPasswordConfirmPasswordField(), validPassword);
    await user.click(resetPasswordSubmitButton());

    expect(await resetPasswordInvalidCode()).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledTimes(1);
  });

  it("shows error when email address does not exist", async () => {
    const user = userEvent.setup();
    renderComponent(testAccessCode, "doesntexist@smartpay.test");

    await user.type(resetPasswordNewPasswordField(), validPassword);
    await user.type(resetPasswordConfirmPasswordField(), validPassword);
    await user.click(resetPasswordSubmitButton());

    expect(await resetPasswordEmailNotFound()).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledTimes(1);
  });

  it("shows error when password has no special character", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(
      resetPasswordNewPasswordField(),
      passwordWithoutSpecialCharacter,
    );
    await user.type(
      resetPasswordConfirmPasswordField(),
      passwordWithoutSpecialCharacter,
    );
    await user.click(resetPasswordSubmitButton());

    expect(
      await screen.findByText(/password is too weak/i),
    ).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledTimes(1);
  });

  it("shows error when password is too short", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(resetPasswordNewPasswordField(), shortPassword);
    await user.type(resetPasswordConfirmPasswordField(), shortPassword);
    await user.click(resetPasswordSubmitButton());

    expect(
      await screen.findByText(/password is too weak/i),
    ).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledTimes(1);
  });

  it("shows error after too many requests", async () => {
    const user = userEvent.setup();
    renderComponent();

    for (let i = 0; i < MAX_ALLOWED_PASSWORD_RESETS; i++) {
      await user.type(resetPasswordNewPasswordField(), shortPassword);
      await user.type(resetPasswordConfirmPasswordField(), shortPassword);
      await user.click(resetPasswordSubmitButton());
    }

    expect(await resetPasswordTooManyFailures()).toBeInTheDocument();
    expect(resetPassword).toHaveBeenCalledTimes(MAX_ALLOWED_PASSWORD_RESETS);
  });
});

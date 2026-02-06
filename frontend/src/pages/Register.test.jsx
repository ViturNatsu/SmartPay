// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";
import { Register } from "./Register";
import * as authApi from "../api/authApi";

// mocking backend
vi.mock("../api/authApi", () => ({
  register: vi.fn(),
}));

// mocking navigation router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// render helper
const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>,
  );
};

// DOM Queries
const getFirstNameInput = () =>
  screen.getByRole("textbox", { name: /first name/i });

const getLastNameInput = () =>
  screen.getByRole("textbox", { name: /last name/i });

const getInstitutionInput = () =>
  screen.getByRole("combobox", { name: /institution/i });

const getChaseOption = () => screen.getByRole("option", { name: /chase/i });

const getEmailInput = () => screen.getByRole("textbox", { name: /email/i });

const getPasswordInput = () => screen.getByLabelText(/^password$/i);

const getShowPassword = () =>
  screen.getByRole("button", { name: /^show password$/i });

const getConfirmPasswordInput = () =>
  screen.getByLabelText(/^confirm password$/i);

const getShowConfirmPassword = () =>
  screen.getByRole("button", { name: /^show confirm password$/i });

const getAgreeCheckbox = () => screen.getByRole("checkbox", { name: /agree/i });

const getSubmitButton = () =>
  screen.getByRole("button", {
    name: /creat.* account/i,
  });

const getSignInLink = () => screen.getByRole("button", { name: /sign in/i });

const getResetPasswordLink = () =>
  screen.getByRole("button", {
    name: /reset your password/i,
  });

const getInvalidPasswordMessage = () =>
  screen.findByText(
    /must be at least 8 characters with uppercase, lowercase, numbers, and symbols/i,
  );

const getTooManyRequestsMessage = () =>
  screen.findByText(/We can.*t process your request right now/i);

const getEmailAlreadyExistsMessage = () =>
  screen.findByText(/email already exists/i);

const getServerErrorMessage = () => screen.findByText(/server error/i);

// API mocks
const registerWillReturnSuccess = () =>
  authApi.register.mockResolvedValueOnce({ success: true });

const registerWillReturnTooManyRequests = () =>
  authApi.register.mockRejectedValueOnce({
    status: 429,
    data: { message: "Too many requests" },
  });

const registerWillReturnEmailAlreadyExists = () =>
  authApi.register.mockRejectedValueOnce({
    status: 409,
    data: { message: "Email already exists" },
  });

const registerWillReturnServerError = () =>
  authApi.register.mockRejectedValueOnce({
    status: 500,
    data: { message: "Server error" },
  });

// reusable actions
const fillValidForm = async (user) => {
  await user.type(getFirstNameInput(), "John");
  await user.type(getLastNameInput(), "Doe");
  await user.type(getEmailInput(), "john.doe@example.com");
  await user.click(getInstitutionInput());
  await user.click(getChaseOption());
  await user.type(getPasswordInput(), "ValidPass1!");
  await user.type(getConfirmPasswordInput(), "ValidPass1!");
  await user.click(getAgreeCheckbox());
};

// tests
describe("Register Component", () => {
  describe("Form Validation", () => {
    it("shows error for invalid password format", async () => {
      const user = userEvent.setup();
      renderRegister();

      await user.type(getEmailInput(), "test@test.com");
      await user.type(getPasswordInput(), "badpassword");
      await user.type(getConfirmPasswordInput(), "badpassword");
      await user.click(getSubmitButton());

      expect(await getInvalidPasswordMessage()).toBeInTheDocument();
    });

    it("does not submit form when validation fails", async () => {
      const user = userEvent.setup();
      renderRegister();

      await user.click(getSubmitButton());

      expect(authApi.register).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    it("submits form with valid data", async () => {
      const user = userEvent.setup();
      registerWillReturnSuccess();
      renderRegister();

      await fillValidForm(user);
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith({
          firstName: "John",
          lastName: "Doe",
          institution: "chase",
          email: "john.doe@example.com",
          password: "ValidPass1!",
          confirmPassword: "ValidPass1!",
        });
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      authApi.register.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );
      renderRegister();
      const submitButton = getSubmitButton();

      await fillValidForm(user);
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("shows rate limit error for 429 status", async () => {
      const user = userEvent.setup();
      registerWillReturnTooManyRequests();
      renderRegister();

      await fillValidForm(user);
      await user.click(getSubmitButton());

      expect(await getTooManyRequestsMessage()).toBeInTheDocument();
    });

    it("shows duplicate email error for 409 status", async () => {
      const user = userEvent.setup();
      registerWillReturnEmailAlreadyExists();
      renderRegister();

      await fillValidForm(user);
      await user.click(getSubmitButton());

      expect(await getEmailAlreadyExistsMessage()).toBeInTheDocument();
    });

    it("shows generic error message for other errors", async () => {
      const user = userEvent.setup();
      registerWillReturnServerError();
      renderRegister();

      await fillValidForm(user);
      await user.click(getSubmitButton());

      expect(await getServerErrorMessage()).toBeInTheDocument();
    });

    it("clears duplicate email error when email is changed", async () => {
      const user = userEvent.setup();
      registerWillReturnEmailAlreadyExists();
      renderRegister();

      await fillValidForm(user);
      await user.click(getSubmitButton());

      const errorMessage = await getEmailAlreadyExistsMessage();

      expect(errorMessage).toBeInTheDocument();

      await user.type(getEmailInput(), "new");

      expect(errorMessage).not.toBeInTheDocument();
    });

    it("navigates to login when clicking sign in link in duplicate email error", async () => {
      const user = userEvent.setup();
      registerWillReturnEmailAlreadyExists();
      renderRegister();

      await fillValidForm(user);
      await user.click(getSubmitButton());

      expect(await getEmailAlreadyExistsMessage()).toBeInTheDocument();

      await user.click(getSignInLink());

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("navigates to reset password when clicking reset link in duplicate email error", async () => {
      const user = userEvent.setup();
      registerWillReturnEmailAlreadyExists();
      renderRegister();

      await fillValidForm(user);
      await user.click(getSubmitButton());

      expect(await getEmailAlreadyExistsMessage()).toBeInTheDocument();

      await user.click(await getResetPasswordLink());

      expect(mockNavigate).toHaveBeenCalledWith("/reset-password");
    });
  });

  describe("Password Visibility Toggle", () => {
    it("toggles password visibility when clicking the eye icon", async () => {
      const user = userEvent.setup();
      renderRegister();
      const passwordInput = getPasswordInput();
      const toggleButton = getShowPassword();

      expect(getPasswordInput()).toHaveAttribute("type", "password");

      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute("type", "text");

      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("toggles confirm password visibility independently", async () => {
      const user = userEvent.setup();
      renderRegister();
      const confirmPasswordInput = getConfirmPasswordInput();
      const toggleButton = getShowConfirmPassword();

      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      await user.click(toggleButton);

      expect(confirmPasswordInput).toHaveAttribute("type", "text");
    });
  });
});

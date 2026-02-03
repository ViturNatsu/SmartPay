// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen,  waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import '@testing-library/jest-dom/vitest';
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
    </BrowserRouter>
  );
};

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });




  describe("Form Validation", () => {
    

    it("shows error for invalid password format", async () => {
      const user = userEvent.setup();
      renderRegister();

      const emailInput = document.querySelector('input[type="email"]');
      await user.type(emailInput, "test@test.com");

      const passwordInput = document.querySelectorAll('input[type="password"]')[0];
      await user.type(passwordInput, "badpassword");

      const confirmPasswordInput = document.querySelectorAll('input[type="password"]')[1];
      await user.type(confirmPasswordInput, "badpassword");

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      
      expect(
        screen.getByText(/Must be at least 8 characters with uppercase, lowercase, numbers, and symbols/i)
      ).toBeInTheDocument();
    });

    

    it("does not submit form when validation fails", async () => {
      const user = userEvent.setup();
      renderRegister();

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      expect(authApi.register).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    const fillValidForm = async (user) => {
      const textboxes = screen.getAllByRole("textbox");
      await user.type(textboxes[0], "John");
      await user.type(textboxes[1], "Doe");

      const emailInput = document.querySelector('input[type="email"]');
      await user.type(emailInput, "john.doe@example.com");

      const selectButton = screen.getByRole("combobox");
      await user.click(selectButton);
      await user.click(screen.getByText("Chase"));

      const passwordInputs = document.querySelectorAll('input[type="password"]');
      await user.type(passwordInputs[0], "ValidPass1!");
      await user.type(passwordInputs[1], "ValidPass1!");

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
    };

    it("submits form with valid data", async () => {
      const user = userEvent.setup();
      authApi.register.mockResolvedValueOnce({ success: true });
      renderRegister();

      await fillValidForm(user);

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

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
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      renderRegister();

      await fillValidForm(user);

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      expect(screen.getByRole("button", { name: /creating account/i })).toBeDisabled();
    });

    

    
  });

  describe("Error Handling", () => {
    const fillValidForm = async (user) => {
      const textboxes = screen.getAllByRole("textbox");
      await user.type(textboxes[0], "John");
      await user.type(textboxes[1], "Doe");

      const emailInput = document.querySelector('input[type="email"]');
      await user.type(emailInput, "john.doe@example.com");

      const passwordInputs = document.querySelectorAll('input[type="password"]');
      await user.type(passwordInputs[0], "ValidPass1!");
      await user.type(passwordInputs[1], "ValidPass1!");

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);
    };

    it("shows rate limit error for 429 status", async () => {
      const user = userEvent.setup();
      authApi.register.mockRejectedValueOnce({
        status: 429,
        data: { message: "Too many requests" },
      });
      renderRegister();

      await fillValidForm(user);

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/We can't process your request right now/i)
        ).toBeInTheDocument();
      });
    });

    it("shows duplicate email error for 409 status", async () => {
      const user = userEvent.setup();
      authApi.register.mockRejectedValueOnce({
        status: 409,
        data: { message: "Email already exists" },
      });
      renderRegister();

      await fillValidForm(user);

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

            await waitFor(() => {
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent(/We can’t create an account with that email. Please Sign in or reset your password/);
      });
    });

    it("shows generic error message for other errors", async () => {
      const user = userEvent.setup();
      authApi.register.mockRejectedValueOnce({
        status: 500,
        data: { message: "Server error" },
      });
      renderRegister();

      await fillValidForm(user);

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Server error")).toBeInTheDocument();
      });
    });

    it("clears duplicate email error when email is changed", async () => {
      const user = userEvent.setup();
      authApi.register.mockRejectedValueOnce({
        status: 409,
        data: { message: "Email already exists" },
      });
      renderRegister();

      await fillValidForm(user);

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent(/We can’t create an account with that email. Please Sign in or reset your password/);
      });

      const emailInput = document.querySelector('input[type="email"]');
      await user.type(emailInput, "new");

      expect(
        screen.queryByText(/We can't create an account with that email/i)
      ).not.toBeInTheDocument();
    });

    it("navigates to login when clicking sign in link in duplicate email error", async () => {
      const user = userEvent.setup();
      authApi.register.mockRejectedValueOnce({
        status: 409,
        data: { message: "Email already exists" },
      });
      renderRegister();

      await fillValidForm(user);

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent(/We can’t create an account with that email. Please Sign in or reset your password/);
      });

      const signInLink = screen.getByRole("button", { name: /sign in/i });
      await user.click(signInLink);

      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    it("navigates to reset password when clicking reset link in duplicate email error", async () => {
      const user = userEvent.setup();
      authApi.register.mockRejectedValueOnce({
        status: 409,
        data: { message: "Email already exists" },
      });
      renderRegister();

      await fillValidForm(user);

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent(/We can’t create an account with that email. Please Sign in or reset your password/);
      });

      const resetLink = screen.getByRole("button", { name: /reset your password/i });
      await user.click(resetLink);

      expect(mockNavigate).toHaveBeenCalledWith("/reset-password");
    });
  });

  describe("Password Visibility Toggle", () => {
    it("toggles password visibility when clicking the eye icon", async () => {
      const user = userEvent.setup();
      renderRegister();

      const passwordWrapper = screen.getByTestId("password-input");
      const passwordInput = passwordWrapper.querySelector("input");

      expect(passwordInput).toHaveAttribute("type", "password");

      const toggleButtons = screen.getAllByRole("button", { name: /show password/i });
      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute("type", "text");

      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute("type", "password");
    });

    it("toggles confirm password visibility independently", async () => {
      const user = userEvent.setup();
      renderRegister();

      const confirmPasswordWrapper = screen.getByTestId("confirm-password-input");
      const confirmPasswordInput = confirmPasswordWrapper.querySelector("input");
      
      const toggleButtons = screen.getAllByRole("button", { name: /show password/i });

      expect(confirmPasswordInput).toHaveAttribute("type", "password");

      await user.click(toggleButtons[1]);
      expect(confirmPasswordInput).toHaveAttribute("type", "text");
    });
  });


}
)
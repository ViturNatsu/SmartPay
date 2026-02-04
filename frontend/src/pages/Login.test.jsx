// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Login } from "./Login";
import { ForgotPassword } from "./ForgotPassword";
import userEvent from "@testing-library/user-event";
import {
  forgotPasswordSubmitButton,
  loginLinkToForgotPassword,
} from "../vitest/domqueries";

vi.mock("../api/authApi", () => ({
  login: vi.fn(),
}));

import { login } from "../api/authApi";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});


const renderLogin = () => 
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Login />
    </MemoryRouter>,
  );
const renderLoginWithForgotPassword = () =>
  render(
    <MemoryRouter initialEntries={["/profile"]}>
      <Login />
      <ForgotPassword />
    </MemoryRouter>,
  );

describe("Login", () => {
  it("Forgot Password link navigates to ForgotPassword page", async () => {
    const user = userEvent.setup();
    renderLoginWithForgotPassword();

    await user.click(loginLinkToForgotPassword());
    expect(forgotPasswordSubmitButton()).toBeInTheDocument();
  });

  it("shows error when password is incorrect", async () => {
    const user = userEvent.setup();
  
    login.mockRejectedValueOnce({
      response: { status: 401 },
    });
    renderLogin();
  
    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
  
    const passwordInput = document.querySelector('input[type="password"]');
    await user.type(passwordInput, "wrongpassword");
  
    await user.click(screen.getByRole("button", { name: /sign in/i }));
  
    expect(
      await screen.findByText(
        "Incorrect email or password. Please try again."
      )
    ).toBeInTheDocument();
  });


  it("Throw inline email validation error ", async () => {
      
    const user = userEvent.setup();
    renderLogin();
  
    await user.type(
      screen.getByLabelText(/email address/i),
      "invalid-email-format"
    );
  
    const passwordInput = document.querySelector('input[type="password"]');
    await user.type(passwordInput, "somepassword");
  
    await user.click(screen.getByRole("button", { name: /sign in/i }));
  
    expect(
      await screen.findByText("Enter a valid email address (example: name@domain.com)")
    ).toBeInTheDocument();
  });

  it("Test for non blank email field" , async () => {

    const user = userEvent.setup();
    renderLogin();
  
    const passwordInput = document.querySelector('input[type="password"]');
    await user.type(passwordInput, "somepassword");
  
    await user.click(screen.getByRole("button", { name: /sign in/i }));
  
    expect(
      await screen.findByText("Email is required. Can't be left blank.")
    ).toBeInTheDocument();
  });

  it("Test for non blank password field" , async () => {

    const user = userEvent.setup();
    renderLogin();
  
    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
  
    await user.click(screen.getByRole("button", { name: /sign in/i }));
  
    expect(
      await screen.findByText("Password is required. Can't be left blank.")
    ).toBeInTheDocument();
  });

  it("Shows error when email is not verified", async () => {
    const user = userEvent.setup();
  
    login.mockRejectedValueOnce({
      response: { status: 403 },
    });
    renderLogin();
  
    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
  
    const passwordInput = document.querySelector('input[type="password"]');
    await user.type(passwordInput, "password");
  
    await user.click(screen.getByRole("button", { name: /sign in/i }));
  
    expect(
      await screen.findByText(
        "Your email address is not verified. Please check your inbox and verify your email to continue."
      )
    ).toBeInTheDocument();
  });  

  it("Shows error when account locked", async () => {
    const user = userEvent.setup();
  
    login.mockRejectedValueOnce({
      response: { status: 429 },
    });
    renderLogin();
  
    await user.type(
      screen.getByLabelText(/email address/i),
      "test@example.com"
    );
  
    const passwordInput = document.querySelector('input[type="password"]');
    await user.type(passwordInput, "password");
  
    await user.click(screen.getByRole("button", { name: /sign in/i }));
  
    expect(
      await screen.findByText(
        "Your account is locked due to multiple failed attempts. Please reset password or try later."
      )
    ).toBeInTheDocument();
  });

  it("submits login payload when form is valid", async () => {
    const user = userEvent.setup();
    login.mockResolvedValueOnce({});
  
    renderLogin();
  
    await user.type(screen.getByLabelText(/email address/i), "test@example.com");
    const passwordInput = document.querySelector('input[type="password"]');
    await user.type(passwordInput, "password");
  
    await user.click(screen.getByRole("button", { name: /sign in/i }));
  
    expect(login).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password",
    });
  });

});

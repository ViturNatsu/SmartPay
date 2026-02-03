// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Login } from "./Login";
import { ForgotPassword } from "./ForgotPassword";
import userEvent from "@testing-library/user-event";
import {
  forgotPasswordSubmitButton,
  loginLinkToForgotPassword,
} from "../vitest/domqueries";

const renderComponent = () =>
  render(
    <MemoryRouter initialEntries={["/profile"]}>
      <Login />
      <ForgotPassword />
    </MemoryRouter>,
  );

describe("Login", () => {
  it("Forgot Password link navigates to ForgotPassword page", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(loginLinkToForgotPassword());
    expect(forgotPasswordSubmitButton()).toBeInTheDocument();
  });
});

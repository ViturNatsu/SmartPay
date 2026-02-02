// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ForgotPassword } from "./ForgotPassword";
import {
  forgotPasswordConfirmationMessage,
  forgotPasswordEmailField,
  forgotPasswordSubmitButton,
} from "../vitest/domqueries";

const renderComponent = () =>
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  );

describe("ForgotPassword", () => {
  it('has email field and "send reset link" button', () => {
    renderComponent();

    expect(forgotPasswordEmailField()).toBeInTheDocument();
    expect(forgotPasswordSubmitButton()).toBeInTheDocument();
  });

  it("shows confirmation message after submitting request", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.type(forgotPasswordEmailField(), "jdoe@example.com");
    await user.click(forgotPasswordSubmitButton());

    expect(await forgotPasswordConfirmationMessage()).toBeInTheDocument();
  });
});

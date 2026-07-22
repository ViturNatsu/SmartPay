// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, MemoryRouter, useLocation } from "react-router-dom";
import { ForgotPassword } from "@/pages/Password/ForgotPassword";
import { AuthProvider } from "@/context/AuthContext.jsx";
import {
  forgotPasswordEmailField,
  forgotPasswordSubmitButton,
} from "@/vitest/domQueries";
import { VerifyOtp } from "@/pages/Verify/VerifyOtp";
import { requestOtpCode } from "@/api/authApi";

vi.mock("@/api/authApi", () => ({
  forgotPassword: vi.fn(async () => ({ ok: true })),
  requestResetCode: vi.fn(async () => ({ ok: true })),
  refreshTokens: vi.fn(async () => ({ accessToken: 'a.b.c' })),
  getMyUser: vi.fn(async () => ({ id: 1 })),
  requestOtpCode: vi.fn(async () => ({ ok: true })),
}));

const LocationWatcher = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
};

const renderForgotPasswordFlow = () =>
  render(
    <MemoryRouter initialEntries={["/forgot-password"]}>
      <AuthProvider>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify" element={
            <>
              <LocationWatcher />
              <VerifyOtp />
            </>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>

  );

describe("ForgotPassword", () => {
  it('has email field and "send reset link" button', () => {
    renderForgotPasswordFlow();

    expect(forgotPasswordEmailField()).toBeInTheDocument();
    expect(forgotPasswordSubmitButton()).toBeInTheDocument();
  });

  it("redirects to verify OTP page after submitting request", async () => {
    const user = userEvent.setup();
    renderForgotPasswordFlow();

    await user.type(forgotPasswordEmailField(), "test@example.com");
    await user.click(forgotPasswordSubmitButton());

    const heading = await screen.findByRole('heading', { name: /Verify Code/i }, { timeout: 5000 });
    expect(heading).toBeInTheDocument();

    const locationText = screen.getByTestId("location").textContent;
    expect(locationText).toContain("email=test%40example.com");
    expect(locationText).toContain("type=forgot-password");
  });
});

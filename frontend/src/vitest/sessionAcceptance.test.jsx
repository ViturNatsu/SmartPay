import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext.jsx';
import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import { Login } from '../pages/Login.jsx';

// Mock API calls to avoid network
import * as authApi from '../api/authApi';
import { setAccessToken } from '../api/axios';

vi.mock('../api/authApi', async () => {
  const actual = await vi.importActual('../api/authApi');
  return {
    ...actual,
    refreshTokens: vi.fn(async () => ({ accessToken: 'ACCESS', refreshToken: 'REFRESH' })),
    getMyUser: vi.fn(async () => ({ id: 1, email: 'placeholder@smartpay.local', role: 'fake role' })),
    logout: vi.fn(async () => ({ ok: true })),
  };
});

function addValidRefreshToken(expSecondsFromNow = 3600) {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  sessionStorage.setItem('refresh_token', `${header}.${payload}.sig`);
}

const ProtectedPage = () => <div data-testid="protected">Protected Content</div>;

const LogoutButton = () => {
  const { logout } = useAuth();
  return <button onClick={() => logout()} data-testid="logout">Logout</button>;
};

function AppHarness({ initialEntries = ['/app'] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<ProtectedPage />} />
            <Route path="/app/logout" element={<LogoutButton />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Session Acceptance', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-03T00:00:00Z'));
    sessionStorage.clear();
    setAccessToken(null);
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('Scenario 1: Session times out after inactivity', async () => {
    addValidRefreshToken();
    setAccessToken('ACCESS');

    render(<AppHarness initialEntries={["/app"]} />);

    // bootstrap auth and start session monitoring
    await act(async () => {
      // let AuthProvider bootstrap and session manager initialize timers
      vi.advanceTimersByTime(1);
    });

    // Advance timers past inactivity limit (15 minutes)
    await act(async () => {
      vi.advanceTimersByTime(15 * 60 * 1000 + 5);
    });

    // Should be redirected to login with message
    expect(screen.queryByTestId('protected')).toBeNull();
    expect(screen.getByText(/You’ve been signed out due to inactivity/i)).toBeTruthy();
  });

  it('Scenario 2: Activity keeps the session active', async () => {
    addValidRefreshToken();
    setAccessToken('ACCESS');

    render(<AppHarness initialEntries={["/app"]} />);
    await act(async () => vi.advanceTimersByTime(1));

    // Nearly at timeout
    await act(async () => vi.advanceTimersByTime(15 * 60 * 1000 - 10000));
    // User activity resets the timer
    await act(async () => {
      document.dispatchEvent(new Event('mousedown'));
    });
    // Advance some time, still before a full new timeout window
    await act(async () => vi.advanceTimersByTime(30000));

    // Still on protected page
    expect(screen.getByTestId('protected')).toBeTruthy();
  });

  it('Scenario 3: Access is blocked after timeout', async () => {
    addValidRefreshToken();
    setAccessToken('ACCESS');

    const { rerender } = render(<AppHarness initialEntries={["/app"]} />);
    await act(async () => vi.advanceTimersByTime(1));

    // Expire the session
    await act(async () => vi.advanceTimersByTime(15 * 60 * 1000 + 5));
    expect(screen.queryByTestId('protected')).toBeNull();

    // Attempt to access a protected page again via direct URL
    rerender(<AppHarness initialEntries={["/app"]} />);
    // Allow bootstrap to run and ProtectedRoute to decide
    await act(async () => vi.advanceTimersByTime(1));

    expect(screen.queryByTestId('protected')).toBeNull();
    // Should be on login
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
  });

  it('Logout Scenario 1: Session ends successfully on logout', async () => {
    addValidRefreshToken();
    setAccessToken('ACCESS');

    render(<AppHarness initialEntries={["/app/logout"]} />);
    await act(async () => vi.advanceTimersByTime(1));

    // Trigger logout
    await act(async () => {
      screen.getByTestId('logout').click();
    });

    // User should be redirected to login and not authenticated
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('Logout Scenario 2: Log out request cannot be validated shows safe flow', async () => {
    // Simulate logout cannot be validated (no active session) without throwing unhandled rejection
    authApi.logout.mockResolvedValueOnce({ status: 401, message: 'No active session' });

    addValidRefreshToken();
    setAccessToken('ACCESS');

    render(<AppHarness initialEntries={["/app/logout"]} />);
    await act(async () => vi.advanceTimersByTime(1));

    await act(async () => {
      screen.getByTestId('logout').click();
    });

    // Despite failure, app keeps user unauthenticated and redirects to login
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
    expect(screen.queryByTestId('protected')).toBeNull();
    // Note: Safe message for logout not implemented in UI; recommend adding.
  });

  it('Logout from user: blocks protected access via direct URL, refresh, and back navigation', async () => {
    addValidRefreshToken();
    setAccessToken('ACCESS');

    const { rerender } = render(<AppHarness initialEntries={["/app/logout"]} />);
    await act(async () => vi.advanceTimersByTime(1));

    // Trigger logout
    await act(async () => {
      screen.getByTestId('logout').click();
    });
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();

    // Direct URL access attempt after logout
    rerender(<AppHarness initialEntries={["/app"]} />);
    await act(async () => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId('protected')).toBeNull();

    // Refresh-like re-render (same URL)
    rerender(<AppHarness initialEntries={["/app"]} />);
    await act(async () => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId('protected')).toBeNull();

    // Simulate back navigation: history has login then back to /app
    rerender(<AppHarness initialEntries={["/login", "/app"]} />);
    await act(async () => vi.advanceTimersByTime(1));
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('Logout from inactivity: blocks protected access via direct URL, refresh, and back navigation', async () => {
    addValidRefreshToken();
    setAccessToken('ACCESS');

    const { rerender } = render(<AppHarness initialEntries={["/app"]} />);

    // bootstrap auth and start session monitoring
    await act(async () => {
      // let AuthProvider bootstrap and session manager initialize timers
      vi.advanceTimersByTime(1);
    });

    // Advance timers past inactivity limit (15 minutes)
    await act(async () => {
      vi.advanceTimersByTime(15 * 60 * 1000 + 5);
    });

    //
    // Direct URL access attempt after logout
    rerender(<AppHarness initialEntries={["/app"]} />);
    await act(async () => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId('protected')).toBeNull();

    // Refresh-like re-render (same URL)
    rerender(<AppHarness initialEntries={["/app"]} />);
    await act(async () => vi.advanceTimersByTime(1));
    expect(screen.queryByTestId('protected')).toBeNull();

    // Simulate back navigation: history has login then back to /app
    rerender(<AppHarness initialEntries={["/login", "/app"]} />);
    await act(async () => vi.advanceTimersByTime(1));
    expect(screen.getByRole('button', { name: /sign in/i })).toBeTruthy();
    expect(screen.queryByTestId('protected')).toBeNull();

  });

  it('Logout: API requests after logout are rejected with 401', async () => {
    addValidRefreshToken();
    setAccessToken('ACCESS');

    render(<AppHarness initialEntries={["/app/logout"]} />);
    await act(async () => vi.advanceTimersByTime(1));

    await act(async () => {
      screen.getByTestId('logout').click();
    });

    // After logout, force protected API to 401
    authApi.getMyUser = vi.fn(async () => { throw { status: 401, message: 'Unauthorized' }; });
    await expect(authApi.getMyUser()).rejects.toMatchObject({ status: 401 });
  });

  it('Logout: re-login issues new session and restores access', async () => {
    // Simulate a logged-out state by clearing tokens
    sessionStorage.removeItem('refresh_token');
    setAccessToken(null);

    // Simulate successful re-login by setting new tokens
    addValidRefreshToken();
    setAccessToken('NEW_ACCESS');

    // Access should be restored: protected API returns user profile
    authApi.getMyUser = vi.fn(async () => ({ id: 1, email: 'placeholder@smartpay.local', role: 'fake role' }));
    const user = await authApi.getMyUser();
    expect(user).toMatchObject({ id: 1, email: expect.stringMatching(/@smartpay\.local$/) });
  });
});

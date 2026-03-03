import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { VerifyEmail } from '../pages/VerifyEmail';
import { getVerifyEmailHeading, getResendButton, getBackToSignInButton, getSVGIcons } from '../vitest/domQueries';

vi.mock('../api/authApi', () => ({
    requestResetCode: vi.fn(),
}));

import * as authApi from '../api/authApi';

function VerifyEmailTestHarness({ initialEntries = ['/?email=test@example.com'] } = {}) {
    return (
        <MemoryRouter initialEntries={initialEntries}>
            <VerifyEmail />
        </MemoryRouter>
    );
}

// --------- Tests ---------
describe('VerifyEmail Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // --------- Rendering Tests ---------
    describe('Initial Render', () => {
        it('should render the verify email page with heading', () => {
            render(<VerifyEmailTestHarness />);

            expect(getVerifyEmailHeading().length).toBeGreaterThan(0);
        });

        it('should display the email address passed via search params', () => {
            render(<VerifyEmailTestHarness />);

            expect(screen.getByText('test@example.com')).toBeInTheDocument();
        });

        it('should render resend verification email button', () => {
            render(<VerifyEmailTestHarness />);

            expect(getResendButton()).toBeInTheDocument();
        });

        it('should render back to sign in button with arrow icon', () => {
            render(<VerifyEmailTestHarness />);

            expect(getBackToSignInButton()).toBeInTheDocument();
        });

        it('should render mail icon', () => {
            render(<VerifyEmailTestHarness />);

            expect(getSVGIcons().length).toBeGreaterThan(0);
        });

        it('should render helper text about spam folder', () => {
            render(<VerifyEmailTestHarness />);

            expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument();
        });
    });

    // --------- Form Submission Tests ---------
    describe('Form Submission - Success Cases', () => {
        it('should call requestResetCode on form submit', async () => {
            const user = userEvent.setup();

            authApi.requestResetCode.mockResolvedValueOnce({ status: 200 });

            render(<VerifyEmailTestHarness />);

            const submitButton = getResendButton();
            await user.click(submitButton);

            await waitFor(() => {
                expect(authApi.requestResetCode).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    type: 'register',
                });
            });
        });

        it('should show loading state while resending', async () => {
            const user = userEvent.setup();

            authApi.requestResetCode.mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 100))
            );

            render(<VerifyEmailTestHarness />);

            const submitButton = getResendButton();
            await user.click(submitButton);

            expect(screen.getByText(/resending verification email/i)).toBeInTheDocument();

            await waitFor(() => {
                expect(authApi.requestResetCode).toHaveBeenCalled();
            });
        });

        it('should clear error message on successful resubmit', async () => {
            const user = userEvent.setup();

            authApi.requestResetCode.mockRejectedValueOnce({
                status: 400,
                response: { status: 400 },
            });

            render(<VerifyEmailTestHarness />);

            await user.click(getResendButton());
            await waitFor(() => {
                expect(screen.getByText(/email not sent or in incorrect format/i)).toBeInTheDocument();
            });

            vi.clearAllMocks();
            authApi.requestResetCode.mockResolvedValueOnce({ status: 200 });

            await user.click(getResendButton());

            await waitFor(() => {
                expect(screen.queryByText(/email not sent/i)).not.toBeInTheDocument();
            });
        });
    });

    // --------- Form Submission Tests - Error Cases ---------
    describe('Form Submission - Error Cases', () => {
        it('should display error for 400 status (bad email format)', async () => {
            const user = userEvent.setup();

            authApi.requestResetCode.mockRejectedValueOnce({
                status: 400,
                response: { status: 400 },
            });

            render(<VerifyEmailTestHarness />);

            await user.click(getResendButton());

            await waitFor(() => {
                expect(screen.getByText(/email not sent or in incorrect format/i)).toBeInTheDocument();
            });
        });

        it('should display error for 409 status (email already verified)', async () => {
            const user = userEvent.setup();

            authApi.requestResetCode.mockRejectedValueOnce({
                status: 409,
                response: { status: 409 },
            });

            render(<VerifyEmailTestHarness />);

            await user.click(getResendButton());

            await waitFor(() => {
                expect(screen.getByText(/email is already verified/i)).toBeInTheDocument();
            });
        });

        it('should display error for 429 status (account locked)', async () => {
            const user = userEvent.setup();

            authApi.requestResetCode.mockRejectedValueOnce({
                status: 429,
                response: { status: 429 },
            });

            render(<VerifyEmailTestHarness />);

            await user.click(getResendButton());

            await waitFor(() => {
                expect(screen.getByText(/account locked/i)).toBeInTheDocument();
            });
        });

        it('should display generic error for unknown status', async () => {
            const user = userEvent.setup();

            authApi.requestResetCode.mockRejectedValueOnce({
                status: 500,
                response: { status: 500 },
            });

            render(<VerifyEmailTestHarness />);

            await user.click(getResendButton());

            await waitFor(() => {
                expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
            });
        });

        it('should disable submit button while loading', async () => {
            const user = userEvent.setup();

            authApi.requestResetCode.mockImplementationOnce(
                () => new Promise(resolve => setTimeout(() => resolve({ status: 200 }), 200))
            );

            render(<VerifyEmailTestHarness />);

            const submitButton = getResendButton();
            await user.click(submitButton);

            expect(submitButton).toBeDisabled();

            await waitFor(() => {
                expect(authApi.requestResetCode).toHaveBeenCalled();
            });
        });
    });

    // --------- Navigation Tests ---------
    describe('Navigation', () => {
        it('should have back to sign in button that links to /login', () => {
            render(<VerifyEmailTestHarness />);

            const backButton = getBackToSignInButton();
            expect(backButton.closest('a')).toHaveAttribute('href', '/login');
        });

        it('should display different email in card when passed different search params', () => {
            render(
                <MemoryRouter initialEntries={['/?email=another@example.com']}>
                    <VerifyEmail />
                </MemoryRouter>
            );

            expect(screen.getByText('another@example.com')).toBeInTheDocument();
        });
    });

    // --------- Accessibility Tests ---------
    describe('Accessibility', () => {
        it('should have proper form structure', () => {
            render(<VerifyEmailTestHarness />);

            const form = screen.getByRole('button', { name: /resend verification email/i }).closest('form');
            expect(form).toBeInTheDocument();
        });

        it('should have descriptive text for users', () => {
            render(<VerifyEmailTestHarness />);

            expect(screen.getByText(/your email address isn't verified yet/i)).toBeInTheDocument();
        });
    });
});
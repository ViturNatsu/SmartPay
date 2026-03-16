// Test utilities for creating fake JWTs and other helpers

export const base64UrlEncode = (str) =>
    btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');

export const makeJwt = (payload) => {
    const header = base64UrlEncode(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const body = base64UrlEncode(JSON.stringify(payload));
    return `${header}.${body}.signature`;
};

export const createTestAccessToken = (overrides = {}) => {
    const defaultPayload = {
        sub: '1',
        email: 'placeholder@smartpay.local',
        role: 'USER',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes from now
    };
    return makeJwt({ ...defaultPayload, ...overrides });
};
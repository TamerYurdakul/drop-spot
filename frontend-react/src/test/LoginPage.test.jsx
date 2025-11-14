import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';

const mockLogin = vi.fn();
const mockSignup = vi.fn();

vi.mock('../context/AuthContext', async () => {
    const actual = await vi.importActual('../context/AuthContext');
    return {
        ...actual,
        useAuth: () => ({
            login: mockLogin,
            signup: mockSignup,
            user: null,
            loading: false,
        }),
    };
});

describe('LoginPage Component', () => {
    it('should render login form with all elements', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        expect(screen.getByText('🎯 DropSpot')).toBeInTheDocument();
        expect(screen.getByText('Sınırlı stok ve bekleme listesi platformu')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('ornek@email.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('En az 6 karakter')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
    });

    it('should toggle between login and signup modes', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        const toggleButton = screen.getByRole('button', { name: /Hesap oluştur - Kayıt Ol/i });
        expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();

        fireEvent.click(toggleButton);

        expect(screen.getByRole('button', { name: /Kayıt Ol/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Zaten hesabım var - Giriş Yap/i })).toBeInTheDocument();
    });

    it('should allow users to type in email and password fields', () => {
        render(
            <BrowserRouter>
                <LoginPage />
            </BrowserRouter>
        );

        const emailInput = screen.getByPlaceholderText('ornek@email.com');
        const passwordInput = screen.getByPlaceholderText('En az 6 karakter');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('password123');
    });
});


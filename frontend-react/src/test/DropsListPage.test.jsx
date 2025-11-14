import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DropsListPage from '../pages/DropsListPage';
import { ApiService } from '../services/api';

vi.mock('../services/api', () => ({
    ApiService: {
        getDrops: vi.fn(),
    },
}));

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: { id: 1, email: 'test@example.com' },
        loading: false,
    }),
}));

const mockDrops = [
    {
        id: 1,
        name: 'Test Drop 1',
        description: 'Test açıklama 1',
        total_stock: 100,
        waitlist_window_start: '2025-12-01T10:00:00',
        waitlist_window_end: '2025-12-15T10:00:00',
        image_url: null,
        is_active: true,
    },
    {
        id: 2,
        name: 'Test Drop 2',
        description: 'Test açıklama 2',
        total_stock: 50,
        waitlist_window_start: '2025-12-10T10:00:00',
        waitlist_window_end: '2025-12-20T10:00:00',
        image_url: null,
        is_active: true,
    },
];

describe('DropsListPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render loading state initially', () => {
        ApiService.getDrops.mockImplementation(() => new Promise(() => {}));
        
        render(
            <BrowserRouter>
                <DropsListPage />
            </BrowserRouter>
        );

        expect(screen.getByText(/Yükleniyor/i)).toBeInTheDocument();
    });

    it('should render drops list after loading', async () => {
        ApiService.getDrops.mockResolvedValue({ data: mockDrops });

        render(
            <BrowserRouter>
                <DropsListPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Drop 1')).toBeInTheDocument();
            expect(screen.getByText('Test Drop 2')).toBeInTheDocument();
        });

        expect(screen.getByText('Test açıklama 1')).toBeInTheDocument();
        expect(screen.getByText('Test açıklama 2')).toBeInTheDocument();
        expect(screen.getByText('Stok: 100')).toBeInTheDocument();
        expect(screen.getByText('Stok: 50')).toBeInTheDocument();
    });

    it('should render empty state when no drops available', async () => {
        ApiService.getDrops.mockResolvedValue({ data: [] });

        render(
            <BrowserRouter>
                <DropsListPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Henüz aktif drop yok')).toBeInTheDocument();
        });

        expect(screen.getByText(/Yeni drop'lar yakında yayınlanacak!/i)).toBeInTheDocument();
    });

    it('should display page header correctly', async () => {
        ApiService.getDrops.mockResolvedValue({ data: mockDrops });

        render(
            <BrowserRouter>
                <DropsListPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('🚀 Aktif Drop\'lar')).toBeInTheDocument();
        });

        expect(screen.getByText('Sınırlı stoklu ürünlere hemen katılın!')).toBeInTheDocument();
    });
});


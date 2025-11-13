import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import Loading from '../components/Loading';

const DropsListPage = () => {
    const [drops, setDrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDrops();
        // Auto-refresh every 30 seconds
        const interval = setInterval(loadDrops, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDrops = async () => {
        try {
            const response = await ApiService.getDrops();
            setDrops(response.data);
        } catch (error) {
            console.error('Error loading drops:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDropStatus = (drop) => {
        const now = new Date();
        const wlStart = drop.waitlist_window_start ? new Date(drop.waitlist_window_start) : null;
        const wlEnd = drop.waitlist_window_end ? new Date(drop.waitlist_window_end) : null;

        if (wlStart && wlEnd) {
            if (now < wlStart) {
                return { status: 'upcoming', text: 'Yakında', color: 'gray' };
            } else if (now >= wlStart && now <= wlEnd) {
                return { status: 'active', text: 'Waitlist Açık', color: 'green' };
            } else {
                return { status: 'claim', text: 'Claim Açık', color: 'blue' };
            }
        }
        return { status: 'upcoming', text: 'Yakında', color: 'gray' };
    };

    if (loading) return <Loading />;

    return (
        <div className="container">
            <div className="page-header">
                <h1>🚀 Aktif Drop'lar</h1>
                <p className="subtitle">Sınırlı stoklu ürünlere hemen katılın!</p>
            </div>

            {drops.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>Henüz aktif drop yok</h3>
                    <p>Yeni drop'lar yakında yayınlanacak!</p>
                </div>
            ) : (
                <div className="grid grid-3">
                    {drops.map(drop => {
                        const status = getDropStatus(drop);
                        return (
                            <div key={drop.id} className="card drop-card">
                                <div className="drop-image">
                                    {drop.image_url ? (
                                        <img src={drop.image_url} alt={drop.name} />
                                    ) : (
                                        <div className="drop-placeholder">📦</div>
                                    )}
                                </div>
                                
                                <div className={`drop-status status-${status.status}`}>
                                    {status.text}
                                </div>
                                
                                <div className="card-body">
                                    <h3>{drop.name}</h3>
                                    <p className="drop-description">
                                        {drop.description || 'Açıklama yok'}
                                    </p>
                                    
                                    <div className="drop-info">
                                        <div className="badge badge-info">
                                            Stok: {drop.total_stock}
                                        </div>
                                    </div>
                                    
                                    <div className="drop-dates">
                                        <div>
                                            <strong>Waitlist Başlangıç:</strong>
                                            <br />
                                            <small>
                                                {drop.waitlist_window_start 
                                                    ? new Date(drop.waitlist_window_start).toLocaleString('tr-TR')
                                                    : '-'}
                                            </small>
                                        </div>
                                        <div>
                                            <strong>Waitlist Bitiş:</strong>
                                            <br />
                                            <small>
                                                {drop.waitlist_window_end 
                                                    ? new Date(drop.waitlist_window_end).toLocaleString('tr-TR')
                                                    : '-'}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="card-footer">
                                    <button 
                                        className="btn btn-primary btn-block"
                                        onClick={() => navigate(`/drops/${drop.id}`)}
                                    >
                                        Detayları Gör
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default DropsListPage;


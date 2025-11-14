import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import Loading from '../components/Loading';

const DropDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [drop, setDrop] = useState(null);
    const [waitlistData, setWaitlistData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [claimCode, setClaimCode] = useState(null);

    useEffect(() => {
        loadDropDetail();
        
        const savedWaitlistData = localStorage.getItem(`waitlist_${id}`);
        if (savedWaitlistData) {
            try {
                setWaitlistData(JSON.parse(savedWaitlistData));
            } catch (e) {
                console.error('Error parsing saved waitlist data:', e);
            }
        }
        
        const savedClaimCode = localStorage.getItem(`claim_${id}`);
        if (savedClaimCode) {
            setClaimCode(savedClaimCode);
        }
        
        const interval = setInterval(loadDropDetail, 10000);
        return () => clearInterval(interval);
    }, [id]);

    const loadDropDetail = async () => {
        try {
            const response = await ApiService.getDrops();
            const foundDrop = response.data.find(d => d.id === parseInt(id));
            
            if (!foundDrop) {
                navigate('/drops');
                return;
            }
            
            setDrop(foundDrop);
            
            if (foundDrop.waitlist_data) {
                setWaitlistData(foundDrop.waitlist_data);
            }
            
            if (foundDrop.user_claim) {
                setClaimCode(foundDrop.user_claim.claim_code);
            }
        } catch (error) {
            console.error('Error loading drop:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinWaitlist = async () => {
        setActionLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const response = await ApiService.joinWaitlist(id);
            setWaitlistData(response.data);
            
            localStorage.setItem(`waitlist_${id}`, JSON.stringify(response.data));
            
            const positionText = response.data.current_position ? `Sıranız: ${response.data.current_position}` : '';
            setMessage({ 
                text: `Waitlist'e başarıyla katıldınız!${positionText ? ' ' + positionText : ''}`, 
                type: 'success' 
            });
            await loadDropDetail();
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.detail || 'Waitlist\'e katılırken hata oluştu', 
                type: 'error' 
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeaveWaitlist = async () => {
        if (!confirm('Waitlist\'ten ayrılmak istediğinize emin misiniz?')) return;
        
        setActionLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            await ApiService.leaveWaitlist(id);
            setWaitlistData(null);
            
            localStorage.removeItem(`waitlist_${id}`);
            
            setMessage({ 
                text: 'Waitlist\'ten başarıyla ayrıldınız', 
                type: 'success' 
            });
            await loadDropDetail();
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.detail || 'Waitlist\'ten ayrılırken hata oluştu', 
                type: 'error' 
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleClaim = async () => {
        setActionLoading(true);
        setMessage({ text: '', type: '' });
        
        try {
            const response = await ApiService.claimDrop(id);
            setClaimCode(response.data.claim_code);
            
            localStorage.setItem(`claim_${id}`, response.data.claim_code);
            
            setMessage({ 
                text: 'Claim başarılı! İşte kodunuz:', 
                type: 'success' 
            });
            await loadDropDetail();
            
            // Scroll to claim code
            setTimeout(() => {
                document.getElementById('claim-code-section')?.scrollIntoView({ 
                    behavior: 'smooth' 
                });
            }, 100);
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.detail || 'Claim işlemi başarısız', 
                type: 'error' 
            });
        } finally {
            setActionLoading(false);
        }
    };

    const copyClaimCode = () => {
        if (claimCode) {
            navigator.clipboard.writeText(claimCode);
            alert('Claim kodu kopyalandı!');
        }
    };

    const getDropStatus = () => {
        if (!drop) return null;
        
        const now = new Date();
        const wlStart = drop.waitlist_window_start ? new Date(drop.waitlist_window_start) : null;
        const wlEnd = drop.waitlist_window_end ? new Date(drop.waitlist_window_end) : null;

        if (wlStart && wlEnd) {
            if (now < wlStart) {
                return { status: 'upcoming', text: 'Waitlist Henüz Açılmadı' };
            } else if (now >= wlStart && now <= wlEnd) {
                return { status: 'waitlist', text: 'Waitlist Açık' };
            } else {
                return { status: 'claim', text: 'Claim Penceresi Açık' };
            }
        }
        return { status: 'upcoming', text: 'Yakında' };
    };

    const canJoinWaitlist = () => {
        const status = getDropStatus();
        return status?.status === 'waitlist' && !waitlistData?.is_active;
    };

    const canLeaveWaitlist = () => {
        return waitlistData?.is_active;
    };

    const canClaim = () => {
        const status = getDropStatus();
        return status?.status === 'claim' && waitlistData?.is_active && !claimCode;
    };

    if (loading) return <Loading />;
    if (!drop) return <div className="container"><p>Drop bulunamadı</p></div>;

    const status = getDropStatus();

    return (
        <div className="container">
            <button className="btn btn-back mb-3" onClick={() => navigate('/drops')}>
                ← Geri Dön
            </button>

            <div className="drop-detail-container">
                <div className="drop-detail-image">
                    {drop.image_url ? (
                        <img src={drop.image_url} alt={drop.name} />
                    ) : (
                        <div className="drop-placeholder-large">📦</div>
                    )}
                </div>

                <div className="drop-detail-info">
                    <div className={`badge badge-${status.status} mb-2`}>
                        {status.text}
                    </div>
                    
                    <h1>{drop.name}</h1>
                    <p className="drop-detail-description">{drop.description || 'Açıklama yok'}</p>

                    <div className="info-cards">
                        <div className="info-card">
                            <div className="info-card-label">Toplam Stok</div>
                            <div className="info-card-value">{drop.total_stock}</div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Waitlist Başlangıç</div>
                            <div className="info-card-value-small">
                                {drop.waitlist_window_start 
                                    ? new Date(drop.waitlist_window_start).toLocaleString('tr-TR')
                                    : '-'}
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-label">Waitlist Bitiş</div>
                            <div className="info-card-value-small">
                                {drop.waitlist_window_end 
                                    ? new Date(drop.waitlist_window_end).toLocaleString('tr-TR')
                                    : '-'}
                            </div>
                        </div>
                    </div>

                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    {/* Waitlist Info */}
                    {waitlistData?.is_active && (
                        <div className="alert alert-info">
                            <strong>Waitlist Durumunuz:</strong>
                            {waitlistData.current_position && (
                                <>
                                    <br />Mevcut Sıranız: <strong>{waitlistData.current_position}</strong>
                                </>
                            )}
                            {waitlistData.priority_score && (
                                <>
                                    <br />Priority Score: <strong>{waitlistData.priority_score.toFixed(2)}</strong>
                                </>
                            )}
                            {waitlistData.joined_at && !isNaN(new Date(waitlistData.joined_at).getTime()) && (
                                <>
                                    <br />Katılım: {new Date(waitlistData.joined_at).toLocaleString('tr-TR')}
                                </>
                            )}
                        </div>
                    )}

                    <div className="action-buttons">
                        {canJoinWaitlist() && (
                            <button 
                                className="btn btn-primary btn-lg btn-block"
                                onClick={handleJoinWaitlist}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'İşleniyor...' : '✨ Waitlist\'e Katıl'}
                            </button>
                        )}

                        {waitlistData?.is_active && !claimCode && (
                            <button 
                                className="btn btn-danger btn-lg btn-block"
                                onClick={handleLeaveWaitlist}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'İşleniyor...' : '❌ Waitlist\'ten Ayrıl'}
                            </button>
                        )}

                        {canClaim() && (
                            <button 
                                className="btn btn-success btn-lg btn-block claim-button"
                                onClick={handleClaim}
                                disabled={actionLoading}
                            >
                                {actionLoading ? 'İşleniyor...' : '🎁 Claim Yap'}
                            </button>
                        )}
                    </div>

                    {/* Claim Code Display */}
                    {claimCode && (
                        <div id="claim-code-section" className="claim-code-section">
                            <h3>🎉 Claim Başarılı!</h3>
                            <p>İşte sizin için özel claim kodunuz:</p>
                            <div className="claim-code-box">
                                <code>{claimCode}</code>
                                <button 
                                    className="btn btn-sm btn-secondary"
                                    onClick={copyClaimCode}
                                >
                                    📋 Kopyala
                                </button>
                            </div>
                            <p className="claim-note">
                                Bu kodu güvenli bir yerde saklayın. Sadece size özel ve tek kullanımlıktır.
                            </p>
                        </div>
                    )}

                    {/* Guide for new users */}
                    {!waitlistData?.is_active && status?.status !== 'upcoming' && (
                        <div className="guide-section">
                            <h3>📝 Nasıl Çalışır?</h3>
                            <ol>
                                <li>
                                    <strong>Waitlist'e Katıl:</strong> Önce waitlist penceresinde waitlist'e katılmalısınız
                                </li>
                                <li>
                                    <strong>Bekle:</strong> Waitlist penceresi kapanana kadar bekleyin
                                </li>
                                <li>
                                    <strong>Claim Yap:</strong> Claim penceresi açıldığında hak kazandıysanız claim yapabilirsiniz
                                </li>
                                <li>
                                    <strong>Kodunu Al:</strong> Başarılı claim sonrası özel kodunuzu alacaksınız
                                </li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DropDetailPage;


import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignup, setIsSignup] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        setLoading(true);

        try {
            if (isSignup) {
                await signup(email, password);
                setMessage({ 
                    text: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.', 
                    type: 'success' 
                });
                setIsSignup(false);
                setPassword('');
            } else {
                await login(email, password);
            }
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.detail || 'İşlem başarısız oldu', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <div className="auth-header">
                    <h1>🎯 DropSpot</h1>
                    <p>Sınırlı stok ve bekleme listesi platformu</p>
                </div>
                
                <div className="card-body">
                    {message.text && (
                        <div className={`alert alert-${message.type}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">E-posta</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="ornek@email.com"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Şifre</label>
                            <input
                                type="password"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                placeholder="En az 6 karakter"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-block"
                            disabled={loading}
                        >
                            {loading ? 'İşleniyor...' : (isSignup ? 'Kayıt Ol' : 'Giriş Yap')}
                        </button>
                        
                        <button
                            type="button"
                            className="btn btn-outline btn-block mt-2"
                            onClick={() => {
                                setIsSignup(!isSignup);
                                setMessage({ text: '', type: '' });
                            }}
                            disabled={loading}
                        >
                            {isSignup ? 'Zaten hesabım var - Giriş Yap' : 'Hesap oluştur - Kayıt Ol'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;


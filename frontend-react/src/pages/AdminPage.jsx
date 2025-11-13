import { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import Loading from '../components/Loading';

const AdminPage = () => {
    const [drops, setDrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDrop, setEditingDrop] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: '',
        total_stock: 10,
        waitlist_window_start: '',
        waitlist_window_end: '',
        is_active: true
    });

    useEffect(() => {
        loadDrops();
    }, []);

    const loadDrops = async () => {
        try {
            const response = await ApiService.getAllDrops();
            setDrops(response.data);
        } catch (error) {
            console.error('Error loading drops:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            image_url: '',
            total_stock: 10,
            waitlist_window_start: '',
            waitlist_window_end: '',
            is_active: true
        });
        setEditingDrop(null);
    };

    const handleOpenModal = (drop = null) => {
        if (drop) {
            setEditingDrop(drop);
            setFormData({
                name: drop.name,
                description: drop.description || '',
                image_url: drop.image_url || '',
                total_stock: drop.total_stock,
                waitlist_window_start: drop.waitlist_window_start 
                    ? new Date(drop.waitlist_window_start).toISOString().slice(0, 16) 
                    : '',
                waitlist_window_end: drop.waitlist_window_end 
                    ? new Date(drop.waitlist_window_end).toISOString().slice(0, 16) 
                    : '',
                is_active: drop.is_active
            });
        } else {
            resetForm();
        }
        setShowModal(true);
        setMessage({ text: '', type: '' });
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const submitData = {
            ...formData,
            waitlist_window_start: formData.waitlist_window_start 
                ? new Date(formData.waitlist_window_start).toISOString() 
                : null,
            waitlist_window_end: formData.waitlist_window_end 
                ? new Date(formData.waitlist_window_end).toISOString() 
                : null,
        };

        try {
            if (editingDrop) {
                await ApiService.updateDrop(editingDrop.id, submitData);
                setMessage({ text: 'Drop başarıyla güncellendi', type: 'success' });
            } else {
                await ApiService.createDrop(submitData);
                setMessage({ text: 'Drop başarıyla oluşturuldu', type: 'success' });
            }
            
            await loadDrops();
            handleCloseModal();
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.detail || 'İşlem başarısız', 
                type: 'error' 
            });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bu drop\'u silmek istediğinize emin misiniz?')) return;
        
        try {
            await ApiService.deleteDrop(id);
            setMessage({ text: 'Drop başarıyla silindi', type: 'success' });
            await loadDrops();
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.detail || 'Silme işlemi başarısız', 
                type: 'error' 
            });
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="container">
            <div className="admin-header">
                <h1>🛠️ Admin Panel</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => handleOpenModal()}
                >
                    ➕ Yeni Drop Ekle
                </button>
            </div>

            {message.text && (
                <div className={`alert alert-${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>İsim</th>
                            <th>Stok</th>
                            <th>Waitlist Başlangıç</th>
                            <th>Waitlist Bitiş</th>
                            <th>Aktif</th>
                            <th>İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drops.length === 0 ? (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    Henüz drop yok
                                </td>
                            </tr>
                        ) : (
                            drops.map(drop => (
                                <tr key={drop.id}>
                                    <td>{drop.id}</td>
                                    <td>{drop.name}</td>
                                    <td>{drop.total_stock}</td>
                                    <td>
                                        {drop.waitlist_window_start 
                                            ? new Date(drop.waitlist_window_start).toLocaleString('tr-TR')
                                            : '-'}
                                    </td>
                                    <td>
                                        {drop.waitlist_window_end 
                                            ? new Date(drop.waitlist_window_end).toLocaleString('tr-TR')
                                            : '-'}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${drop.is_active ? 'success' : 'secondary'}`}>
                                            {drop.is_active ? 'Evet' : 'Hayır'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleOpenModal(drop)}
                                        >
                                            Düzenle
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(drop.id)}
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{editingDrop ? 'Drop Düzenle' : 'Yeni Drop Ekle'}</h2>
                            <button className="modal-close" onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">İsim *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Açıklama</label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Görsel URL</label>
                                <input
                                    type="url"
                                    className="form-control"
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Toplam Stok *</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="1"
                                    value={formData.total_stock}
                                    onChange={(e) => setFormData({...formData, total_stock: parseInt(e.target.value)})}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Waitlist Başlangıç</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={formData.waitlist_window_start}
                                    onChange={(e) => setFormData({...formData, waitlist_window_start: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Waitlist Bitiş</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    value={formData.waitlist_window_end}
                                    onChange={(e) => setFormData({...formData, waitlist_window_end: e.target.value})}
                                />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    />
                                    Aktif
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>
                                    İptal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingDrop ? 'Güncelle' : 'Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;


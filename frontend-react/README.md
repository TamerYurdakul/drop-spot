# 🎯 DropSpot - React Frontend

Modern ve responsive React frontend uygulaması, DropSpot backend API'si ile entegre.

## 🚀 Teknolojiler

- **React 18** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool & dev server
- **Context API** - State management

## 📂 Proje Yapısı

```
frontend-react/
├── src/
│   ├── pages/              # Sayfa bileşenleri
│   │   ├── LoginPage.jsx          # Giriş/Kayıt
│   │   ├── DropsListPage.jsx      # Drop listesi
│   │   ├── DropDetailPage.jsx     # Drop detayı & claim
│   │   └── AdminPage.jsx          # Admin CRUD paneli
│   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   ├── Navbar.jsx             # Navigasyon bar
│   │   └── Loading.jsx            # Yükleme göstergesi
│   ├── context/            # Context API
│   │   └── AuthContext.jsx        # Authentication state
│   ├── services/           # API servisleri
│   │   └── api.js                 # API client & endpoints
│   ├── styles/             # CSS
│   │   └── main.css               # Ana stil dosyası
│   ├── App.jsx             # Ana uygulama & routing
│   └── main.jsx            # React entry point
├── index.html              # HTML template
└── package.json            # Dependencies
```

## 🎨 Özellikler

### Kullanıcı Özellikleri
- ✅ E-posta ile kayıt olma ve giriş yapma
- ✅ Aktif drop'ları listeleme
- ✅ Drop detaylarını görüntüleme
- ✅ Waitlist'e katılma/ayrılma
- ✅ Priority score bazlı sıralama
- ✅ Claim yapma ve kod alma
- ✅ Real-time durum güncellemeleri

### Admin Özellikleri
- ✅ Drop CRUD işlemleri (Create, Read, Update, Delete)
- ✅ Waitlist penceresi yönetimi
- ✅ Stok kontrolü
- ✅ Aktif/Pasif drop yönetimi

### UX İyileştirmeleri
- ✅ Responsive tasarım (mobil uyumlu)
- ✅ Loading states
- ✅ Error handling
- ✅ Success/Error mesajları
- ✅ Kolay navigasyon
- ✅ Modern ve minimal tasarım

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+
- npm 9+

### Adımlar

1. **Bağımlılıkları yükle:**
```bash
cd frontend-react
npm install
```

2. **Development sunucusunu başlat:**
```bash
npm run dev
```

3. **Tarayıcıda aç:**
```
http://localhost:5173
```

## 🔗 Backend Entegrasyonu

Frontend, `http://localhost:8000` adresinde çalışan backend API'yi kullanır.

**Backend'i başlatmak için:**
```bash
cd backend
python -m uvicorn app.main:app --reload
```

## 📝 API Endpoint'leri

Frontend aşağıdaki endpoint'leri kullanır:

### Auth
- `POST /auth/signup` - Kullanıcı kaydı
- `POST /auth/login` - Giriş
- `GET /auth/me` - Mevcut kullanıcı bilgisi

### Drops
- `GET /drops` - Aktif drop listesi
- `POST /drops/:id/join` - Waitlist'e katıl
- `POST /drops/:id/leave` - Waitlist'ten ayrıl
- `POST /drops/:id/claim` - Claim yap

### Admin
- `GET /admin/drops` - Tüm drop'lar
- `POST /admin/drops` - Yeni drop oluştur
- `PUT /admin/drops/:id` - Drop güncelle
- `DELETE /admin/drops/:id` - Drop sil

## 🔒 Authentication

- JWT token bazlı authentication
- Token `localStorage`'da saklanır
- Her API isteğinde otomatik olarak header'a eklenir
- 401 hatalarında otomatik logout

## 🎯 Kullanıcı Akışı

1. **Kayıt/Giriş** - Kullanıcı e-posta ile kayıt olur veya giriş yapar
2. **Drop Listesi** - Aktif drop'lar gösterilir
3. **Drop Detayı** - Kullanıcı ilgilendiği drop'a tıklar
4. **Waitlist'e Katıl** - Waitlist penceresi açıksa katılır
5. **Bekle** - Waitlist penceresi kapanana kadar bekler
6. **Claim Yap** - Claim penceresi açıldığında ve sırada ise claim yapar
7. **Kod Al** - Başarılı claim sonrası özel kodu alır

## 🎨 Tasarım Özellikleri

- **Renk Paleti:**
  - Primary: #6366f1 (Indigo)
  - Success: #10b981 (Emerald)
  - Danger: #ef4444 (Red)
  - Warning: #f59e0b (Amber)

- **Animasyonlar:**
  - Button hover effects
  - Card transitions
  - Pulse effect on claim button
  - Slide down animation for success messages

- **Responsive:**
  - Desktop: 3-column grid
  - Tablet: 2-column grid
  - Mobile: Single column

## 🔧 Build & Deployment

### Production Build
```bash
npm run build
```

Build dosyaları `dist/` klasörüne oluşturulur.

### Preview Build
```bash
npm run preview
```

## 📱 Tarayıcı Desteği

- Chrome (son 2 versiyon)
- Firefox (son 2 versiyon)
- Safari (son 2 versiyon)
- Edge (son 2 versiyon)

## 🐛 Bilinen Sorunlar

- Henüz bilinen bir sorun yok

## 📄 Lisans

Bu proje Alpaco Full Stack Developer Case Study için geliştirilmiştir.

## 👨‍💻 Geliştirici Notları

### State Management
- Authentication state → `AuthContext`
- Loading states → Local component state
- Form data → Local component state

### API Calls
- Axios interceptors ile token management
- Automatic 401 redirect
- Error handling her component'te

### Routing
- Protected routes (login gerektirir)
- Admin-only routes (admin rolü gerektirir)
- Public routes (login varsa redirect)

### Best Practices
- Component-based architecture
- Reusable components
- Clean code structure
- Error boundaries (eklenebilir)
- Loading states everywhere
- User feedback (alerts, messages)

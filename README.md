# MoneyShop

Modern finansal yönetim paneli - para transferi, kart yönetimi, yatırım takibi ve daha fazlası.

## Özellikler

- **Hesap Yönetimi**: Çoklu hesap (vadesiz, vadeli, kredi kartı, yatırım, nakit, kredi)
- **İşlem Takibi**: Gelir/Gider/Transfer işlemleri, filtreleme ve sayfalama
- **MoneyShop Card**: 3 kart tipi (Standart, Silver, Gold) ile harcama takibi
- **Transfer Sistemleri**: Hızlı transfer, EFT, uluslararası transfer, QR kod
- **Yatırım Portföyü**: Kripto, hisse senedi, emtia takibi
- **Bütçe Yönetimi**: Kategori bazlı bütçe limitleri ve uyarıları
- **Tekrarlanan İşlemler**: Otomatik ödeme talimatları
- **Taksitli Ödemeler**: Taksit takibi ve hatırlatma
- **Destek Sistemi**: Ticket tabanlı müşteri desteği
- **Ortak Hesap**: Split bills özelliği
- **Bildirimler**: E-posta, SMS ve push bildirimleri
- **Admin Paneli**: Kullanıcı yönetimi, audit loglar, duyuru yönetimi
- **Çoklu Dil**: Türkçe, İngilizce, Arapça, Kürtçe, Fronkça, Rusça (RTL desteği)
- **Guvenlik**: 2FA, WebAuthn, rate limiting, audit logging, fraud detection

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Dil | TypeScript 5 |
| Veritabanı | PostgreSQL + Prisma ORM 7 |
| Auth | NextAuth v5 (JWT) |
| State | Zustand 5 |
| Real-time | Socket.io (WebSocket) |
| Deploy | Docker, Vercel |

## Kurulum

### Ön Gereksinimler

- Node.js 20+
- PostgreSQL (veya Neon)
- Redis (opsiyonel, rate limiting için)

### 1. Depoyu Klonlayın

```bash
git clone https://github.com/your-org/money-shop.git
cd money-shop
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Ortam Değişkenlerini Yapılandırın

```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenleyin:

```env
# Veritabanı
DATABASE_URL="postgresql://user:password@host:5432/moneyshop"

# Auth
NEXTAUTH_SECRET="random-64-char-hex-string"
NEXTAUTH_URL="http://localhost:3000"

# Card Encryption (ilk deploy'dan sonra DEĞİŞTİRMEYİN!)
CARD_ENCRYPTION_KEY="ms-enc-v1-change-this-to-a-secure-key-32chars"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="noreply@moneyshop.iq"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="your-sid"
TWILIO_AUTH_TOKEN="your-token"
TWILIO_PHONE_NUMBER="+1xxxxxxxxxx"

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"
VAPID_SUBJECT="mailto:admin@moneyshop.iq"
```

### 4. Veritabanını Hazırlayın

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışır.

### Varsayılan Kullanıcılar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Admin | admin@moneyshop.iq | admin123 |
| Kullanıcı | test@test.com | 123456789 |

## Komutlar

```bash
# Geliştirme
npm run dev              # Next.js dev sunucusu
npm run dev:ws           # WebSocket sunucusu
npm run dev:all          # Her ikisi birden

# Production
npm run build            # Production derleme
npm start                # Production sunucusu

# Test
npm test                 # Unit testler
npm run test:watch       # Watch modu
npm run test:coverage    # Coverage raporu
npm run test:e2e         # E2E testler (Playwright)

# Lint
npm run lint             # ESLint kontrolü

# Veritabanı
npx prisma generate      # Prisma client oluştur
npx prisma db push       # Şemayı veritabanına uygula
npx prisma migrate dev   # Migration oluştur
npx tsx prisma/seed.ts   # Seed verileri yükle
```

## Docker ile Deploy

### Hızlı Başlangıç

```bash
# .env dosyasını oluşturun
cp .env.example .env

# Servisleri başlatın
docker compose up -d

# Logları izleyin
docker compose logs -f
```

### Production Deploy

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Servisler

| Servis | Port | Açıklama |
|--------|------|----------|
| app | 3000 | Next.js uygulaması |
| ws | 3001 | WebSocket sunucusu |
| redis | 6379 | Rate limiting (opsiyonel) |

## Proje Yapısı

```
money-shop/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth sayfaları (login, register, vb.)
│   │   ├── (dashboard)/        # Dashboard sayfaları
│   │   ├── api/                # API route'ları
│   │   ├── about/              # Hakkında sayfası
│   │   ├── blog/               # Blog sayfası
│   │   └── ...
│   ├── components/             # React bileşenleri
│   │   ├── dashboard/          # Dashboard bileşenleri
│   │   ├── landing/            # Landing sayfası bileşenleri
│   │   ├── layout/             # Layout bileşenleri (sidebar, header)
│   │   ├── ui/                 # Temel UI bileşenleri
│   │   └── ...
│   ├── hooks/                  # Custom React hook'ları
│   ├── lib/                    # Yardımcı modüller
│   │   ├── auth.ts             # NextAuth yapılandırması
│   │   ├── prisma.ts           # Prisma istemcisi
│   │   ├── validations.ts      # Zod validasyonları
│   │   └── ...
│   ├── stores/                 # Zustand store'ları
│   └── types/                  # TypeScript tipleri
├── prisma/
│   ├── schema.prisma           # Veritabanı şeması
│   └── seed.ts                 # Seed verileri
├── e2e/                        # Playwright E2E testleri
├── scripts/                    # Deployment ve yardımcı scriptler
├── public/                     # Statik dosyalar
├── docker-compose.yml          # Docker compose yapılandırması
├── Dockerfile                  # Multi-stage Docker build
└── vercel.json                 # Vercel cron job'ları
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/[...nextauth]` - NextAuth handler
- `POST /api/auth/forgot-password` - Şifre sıfırlama talebi
- `POST /api/auth/reset-password` - Şifre sıfırlama
- `POST /api/auth/verify-sms` - SMS doğrulama
- `POST /api/auth/2fa/*` - İki faktörlü kimlik doğrulama

### Finansal
- `GET/POST /api/accounts` - Hesaplar
- `GET/POST /api/transactions` - İşlemler
- `GET/POST /api/transfers` - Transferler
- `GET/POST /api/budgets` - Bütçeler
- `GET/POST /api/investments` - Yatırımlar
- `GET/POST /api/deposits` - Para yatırma
- `GET/POST /api/withdrawals` - Para çekme

### Admin
- `GET /api/admin/users` - Kullanıcı listesi
- `GET /api/admin/transactions` - Tüm işlemler
- `GET /api/admin/audit-logs` - Audit loglar
- `POST /api/admin/announcements` - Duyuru oluşturma
- `POST /api/admin/sms-send` - SMS gönderme

### Diğer
- `GET /api/dashboard` - Dashboard verileri
- `GET /api/exchange-rates` - Döviz kurları
- `GET /api/cbi-rates` - CBI kurları
- `GET /api/search` - Evrensel arama

## Güvenlik

- **Auth**: NextAuth v5 JWT tabanlı oturum yönetimi
- **2FA**: Authenticator (TOTP) ve SMS desteği
- **WebAuthn**: Fiziksel anahtar/parmak izi desteği
- **Rate Limiting**: Redis + in-memory fallback ile API koruması
- **Encryption**: AES-256 ile kart numarası/CVV şifreleme
- **Audit Log**: Tüm kritik işlemler loglanıyor
- **Fraud Detection**: Şüpheli işlem tespiti
- **Güvenlik Header'ları**: HSTS, XSS protection, CSP

## Lisans

Bu proje özel mülkiyettir. İzinsiz kopyalanamaz veya dağıtılamaz.

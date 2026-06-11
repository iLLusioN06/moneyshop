// =============================================
// MoneyShop - Landing Page Static Data
// =============================================

export interface SlideItem {
  icon: string;
  label: string;
}

export interface SlidePage {
  panelTitle: string;
  panelDescription: string;
  phoneTitle: string;
  phoneDescription: string;
  items: SlideItem[];
}

export const fastSlidePages: SlidePage[] = [
  {
    panelTitle: "FAST Para Transferi",
    panelDescription: "7/24 anında para transferi. Saniyeler içinde gönderin, hemen ulaşsın. Tüm bankalar arası kesintisiz ve ücretsiz transfer.",
    phoneTitle: "FAST Para Transferi",
    phoneDescription: "Fast ile yapmak istediğiniz işlemi seçiniz.",
    items: [
      { icon: "fas fa-qrcode", label: "Fast QR Kod ile Öde" },
      { icon: "fas fa-paper-plane", label: "Para Gönder" },
      { icon: "fas fa-qrcode", label: "Fast QR Kod Oluştur" },
      { icon: "fas fa-address-card", label: "Kolay Adres Yönetimi" },
      { icon: "fas fa-shield-alt", label: "Güvenli Ödeme İşlemi" },
    ],
  },
  {
    panelTitle: "En hızlı şekilde para transferi!",
    panelDescription: "MoneyShop hesabından tüm banka ve MoneyShop hesaplarına FAST limiti olan 400.000 TL'ye kadar transfer yap, tutar saniyeler içinde alıcı hesabına geçsin.",
    phoneTitle: "Hızlı İşlemler",
    phoneDescription: "Favori transferlerinize hızlıca erişin.",
    items: [
      { icon: "fas fa-star", label: "Favori Kişiler" },
      { icon: "fas fa-clock", label: "Son İşlemler" },
      { icon: "fas fa-wallet", label: "Bakiye Kontrolü" },
      { icon: "fas fa-user-friends", label: "Kişiler" },
      { icon: "fas fa-credit-card", label: "Kart Bilgileri" },
    ],
  },
  {
    panelTitle: "FAST ile 7/24 para gönder",
    panelDescription: "Para göndereceğin hesabın hangi bankada olduğu fark etmez. FAST ile para gönderme işlemlerini mesai saatlerine takılmadan haftanın her günü yap.",
    phoneTitle: "Hesap Takibi",
    phoneDescription: "Hesabınızın durumunu anlık takip edin.",
    items: [
      { icon: "fas fa-chart-line", label: "Bakiye Grafiği" },
      { icon: "fas fa-file-invoice-dollar", label: "Fatura Ödemeleri" },
      { icon: "fas fa-exchange-alt", label: "Ayarlar" },
      { icon: "fas fa-bell", label: "Bildirimler" },
      { icon: "fas fa-user-shield", label: "Güvenlik Ayarları" },
    ],
  },
  {
    panelTitle: "Detaylarda kaybolma",
    panelDescription: "Bir ödeme son anda aklına geldiğinde veya arkadaşının acil nakit ihtiyacı olduğunda, saniyeler içinde para gönder. MoneyShop kullanıcılarına rehberinde kayıtlı telefon numaraları veya MoneyShop numaralarıyla; MoneyShop'lu olmayan kişilere Kolay Adres'e tanımlı bilgileri veya IBAN numaraları üzerinden FAST ile para transferi yap.",
    phoneTitle: "Güvenlik",
    phoneDescription: "Hesabınızı daha güvenli hale getirin.",
    items: [
      { icon: "fas fa-lock", label: "2FA Ayarları" },
      { icon: "fas fa-shield-alt", label: "Kara Liste" },
      { icon: "fas fa-id-card", label: "Kimlik Doğrulama" },
      { icon: "fas fa-key", label: "Şifre Değiştir" },
      { icon: "fas fa-user-secret", label: "Gizlilik" },
    ],
  },
  {
    panelTitle: "Tamamen kolay ve masrafsız",
    panelDescription: "MoneyShop ile hızlı ve keyifli bir deneyim FAST için de geçerli. FAST ile para gönderme limiti dahilindeki para transferlerinde FAST ücreti yok!",
    phoneTitle: "Destek",
    phoneDescription: "Yardım ve destek seçeneklerine ulaşın.",
    items: [
      { icon: "fas fa-headset", label: "Canlı Destek" },
      { icon: "fas fa-question-circle", label: "SSS" },
      { icon: "fas fa-phone", label: "Çağrı Merkezi" },
      { icon: "fas fa-envelope", label: "Mesaj Gönder" },
      { icon: "fas fa-file-alt", label: "Kullanım Kılavuzu" },
    ],
  },
];

export const eftSlidePages: SlidePage[] = [
  {
    panelTitle: "Havale & EFT",
    panelDescription: "Geleneksel bankacılık işlemlerinizi tek platformdan yönetin. Dakikalar içinde güvenli havale ve EFT gönderimi.",
    phoneTitle: "Havale & EFT İşlemleri",
    phoneDescription: "Tüm banka ve MoneyShop transferlerinizi tek yerden hızlıca yönetin.",
    items: [
      { icon: "fas fa-qrcode", label: "Fast QR Kod ile Öde" },
      { icon: "fas fa-paper-plane", label: "Para Gönder" },
      { icon: "fas fa-qrcode", label: "Fast QR Kod Oluştur" },
      { icon: "fas fa-address-card", label: "Kolay Adres Yönetimi" },
      { icon: "fas fa-shield-alt", label: "Güvenli Ödeme İşlemi" },
    ],
  },
  {
    panelTitle: "7/24 ücretsiz EFT yap",
    panelDescription: "MoneyShop ile tüm banka hesaplarına mesai gözetmeden ücretsiz EFT gönder. İşlemleriniz güvenli, hızlı ve hemen tamamlanır.",
    phoneTitle: "Ücretsiz EFT",
    phoneDescription: "Banka hesabından 7/24 ücretsiz EFT gönderimi yapın.",
    items: [
      { icon: "fas fa-star", label: "Favori Kişiler" },
      { icon: "fas fa-clock", label: "Son İşlemler" },
      { icon: "fas fa-wallet", label: "Bakiye Kontrolü" },
      { icon: "fas fa-user-friends", label: "Kişiler" },
      { icon: "fas fa-credit-card", label: "Kart Bilgileri" },
    ],
  },
  {
    panelTitle: "MoneyShop hesabına dilediğin zaman para yatır.",
    panelDescription: "Diğer banka hesaplarından MoneyShop hesabına 7/24 kolayca para gönder. İster MoneyShop hesabını Kolay Adres'lerine ekleyerek ister MoneyShop IBAN'ını kullanarak hesabına para yatır.",
    phoneTitle: "Hesabına Para Yatır",
    phoneDescription: "MoneyShop hesabına kolayca para aktarın, dilerseniz IBAN ile dilerseniz Kolay Adres üzerinden.",
    items: [
      { icon: "fas fa-chart-line", label: "Bakiye Grafiği" },
      { icon: "fas fa-file-invoice-dollar", label: "Fatura Ödemeleri" },
      { icon: "fas fa-exchange-alt", label: "Ayarlar" },
      { icon: "fas fa-bell", label: "Bildirimler" },
      { icon: "fas fa-user-shield", label: "Güvenlik Ayarları" },
    ],
  },
];

export const internationalSlidePages: SlidePage[] = [
  {
    panelTitle: "Yurt dışından para almanın en kolay yolu",
    panelDescription: "Dünyanın her yerinden MoneyShop hesabınıza hızlı, güvenli ve şeffaf şekilde para alın.",
    phoneTitle: "Uluslararası Para Al",
    phoneDescription: "Yabancı para transferlerinizi tek ekrandan takip edin.",
    items: [
      { icon: "fas fa-globe", label: "170+ Ülke" },
      { icon: "fas fa-hand-holding-dollar", label: "Hızlı Tahsilat" },
      { icon: "fas fa-lock", label: "Güvenli Transfer" },
      { icon: "fas fa-chart-line", label: "Anlık Takip" },
      { icon: "fas fa-wallet", label: "Hesaba Hemen Yansısın" },
    ],
  },
  {
    panelTitle: "Sevdiklerinizle kolayca paylaşın",
    panelDescription: "Uluslararası hesap bilgilerinizi paylaşarak hızlı para almaya başlayın.",
    phoneTitle: "Banka Bilgileri Paylaş",
    phoneDescription: "Size özel hesap bilgilerini tek dokunuşla gönderin.",
    items: [
      { icon: "fas fa-share-alt", label: "Kolay Paylaşım" },
      { icon: "fas fa-file-invoice-dollar", label: "IBAN ve Swift" },
      { icon: "fas fa-user-friends", label: "Aileye Gönder" },
      { icon: "fas fa-clock", label: "Hızlı Onay" },
      { icon: "fas fa-id-card", label: "Güvenli Kimlik" },
    ],
  },
  {
    panelTitle: "Döviz işlemlerini kontrol edin",
    panelDescription: "Gelen parayı ve döviz dönüşümünü anında görün, transferlerinizi kolayca yönetin.",
    phoneTitle: "Döviz & Takip",
    phoneDescription: "Para girişlerinizi ve döviz kurlarını takip edin.",
    items: [
      { icon: "fas fa-money-bill-wave", label: "Döviz Desteği" },
      { icon: "fas fa-eye", label: "Anlık İzleme" },
      { icon: "fas fa-exchange-alt", label: "Hesap Dönüşümü" },
      { icon: "fas fa-bell", label: "Bildirimler" },
      { icon: "fas fa-list", label: "Transfer Geçmişi" },
    ],
  },
  {
    panelTitle: "Ücretleri ve süreleri kontrol edin",
    panelDescription: "Transfer ücretlerini, döviz kurlarını ve işlem sürelerini anında takip ederek rahat edin.",
    phoneTitle: "Ücret & Süre",
    phoneDescription: "Transfer maliyetlerini ve işlem zamanını tek ekranda görün.",
    items: [
      { icon: "fas fa-percentage", label: "Şeffaf Ücretler" },
      { icon: "fas fa-stopwatch", label: "Hızlı Onay" },
      { icon: "fas fa-handshake", label: "Güvenli İşlem" },
      { icon: "fas fa-globe", label: "Çoklu Para Birimi" },
      { icon: "fas fa-file-contract", label: "Kolay Belgeler" },
    ],
  },
];

export const ibanSlidePages: SlidePage[] = [
  {
    panelTitle: "MoneyShop IBAN ile para alın",
    panelDescription: "Kendi adınıza tanımlı özel IBAN sayesinde yurtiçi ve yurtdışı transferleri hızlıca alın.",
    phoneTitle: "Özel IBAN",
    phoneDescription: "Size özel IBAN ile para almak artık daha kolay.",
    items: [
      { icon: "fas fa-building-columns", label: "Özel Hesap" },
      { icon: "fas fa-file-invoice-dollar", label: "Hızlı Tahsilat" },
      { icon: "fas fa-globe", label: "Uluslararası Destek" },
      { icon: "fas fa-lock", label: "Güvenli Hesap" },
      { icon: "fas fa-wallet", label: "Anında Yatır" },
    ],
  },
  {
    panelTitle: "Kolay Adres ile hızlı ödeme alın",
    panelDescription: "Para almak için sadece kolay adresinizi (@kullaniciadi) paylaşın, IBAN girmekle uğraşmayın.",
    phoneTitle: "Kolay Adres",
    phoneDescription: "Adresinizle para almak çok daha hızlı.",
    items: [
      { icon: "fas fa-address-card", label: "Basit Paylaşım" },
      { icon: "fas fa-user-friends", label: "Kişi Bazlı" },
      { icon: "fas fa-qrcode", label: "QR Kod" },
      { icon: "fas fa-clock", label: "Anında Gönderim" },
      { icon: "fas fa-check-circle", label: "Hatalar Az" },
    ],
  },
  {
    panelTitle: "QR kodla para alın",
    panelDescription: "Kolay Adres veya IBAN QR kodunuzu paylaşarak hızlıca ödeme alın.",
    phoneTitle: "QR ile Paylaş",
    phoneDescription: "QR kod sayesinde hatasız para gönderimi sağlayın.",
    items: [
      { icon: "fas fa-qrcode", label: "Kolay Tarama" },
      { icon: "fas fa-share-alt", label: "Hızlı Paylaş" },
      { icon: "fas fa-phone", label: "Mobil Uyumluluk" },
      { icon: "fas fa-shield-alt", label: "Güvenli Ödeme" },
      { icon: "fas fa-clock", label: "Anında Onay" },
    ],
  },
  {
    panelTitle: "Para alma süreçlerini takip edin",
    panelDescription: "Gelen parayı, bankayı ve işlem durumunu anlık olarak görüntüleyin.",
    phoneTitle: "Transfer Takibi",
    phoneDescription: "Para girişlerinizi her adımda izleyin.",
    items: [
      { icon: "fas fa-eye", label: "Anlık Durum" },
      { icon: "fas fa-chart-line", label: "İşlem Raporu" },
      { icon: "fas fa-bell", label: "Bildirimler" },
      { icon: "fas fa-user-check", label: "Kabul Onay" },
      { icon: "fas fa-calendar-check", label: "Hızlı Zamanlama" },
    ],
  },
  {
    panelTitle: "Ödemelerinizi kolayca yönetin",
    panelDescription: "IBAN ve Kolay Adres hesabınızı tek panelde kontrol edin, gelen ödemeleri kolayca organize edin.",
    phoneTitle: "Ödeme Yönetimi",
    phoneDescription: "Tüm alacaklarınızı tek yerden yönetin.",
    items: [
      { icon: "fas fa-wallet", label: "Bakiye Görünümü" },
      { icon: "fas fa-list", label: "Ödeme Geçmişi" },
      { icon: "fas fa-tag", label: "Kategori" },
      { icon: "fas fa-user-friends", label: "Müşteri Takibi" },
      { icon: "fas fa-file-invoice", label: "Fatura Bilgisi" },
    ],
  },
];

export const requestSlidePages: SlidePage[] = [
  {
    panelTitle: "Ödeme isteğini tek tıkla gönderin",
    panelDescription: "Müşterinize veya iş ortağınıza hızlıca ödeme talebi gönderin, tahsilat sürecini hızlandırın.",
    phoneTitle: "Ödeme İsteği Gönder",
    phoneDescription: "Kolayca ödeme talebi oluşturun ve paylaşın.",
    items: [
      { icon: "fas fa-hand-pointer", label: "Tek Tıkla İstek" },
      { icon: "fas fa-link", label: "Paylaşılabilir Link" },
      { icon: "fas fa-envelope", label: "E-posta veya WhatsApp" },
      { icon: "fas fa-calendar-check", label: "Ödeme Tarihi" },
      { icon: "fas fa-comment-dots", label: "Not Ekle" },
    ],
  },
  {
    panelTitle: "Ödemeyi takip edin",
    panelDescription: "Gönderdiğiniz ödeme taleplerinin durumunu anlık olarak takip edin.",
    phoneTitle: "Talep Takibi",
    phoneDescription: "Kimin ödediğini ve hangi taleplerin açık olduğunu görün.",
    items: [
      { icon: "fas fa-eye", label: "Durum Görüntüle" },
      { icon: "fas fa-check-circle", label: "Onaylanan Ödemeler" },
      { icon: "fas fa-clock", label: "Bekleyen Talepler" },
      { icon: "fas fa-bell", label: "Hatırlatıcılar" },
      { icon: "fas fa-file-invoice", label: "Fatura Bağlantısı" },
    ],
  },
  {
    panelTitle: "Fatura ve link gönderimi",
    panelDescription: "Fatura veya ödeme linki ile alıcıya profesyonel talep gönderin.",
    phoneTitle: "Link ile Tahsilat",
    phoneDescription: "Dilediğiniz platformda paylaşılabilir ödeme linki oluşturun.",
    items: [
      { icon: "fas fa-file-invoice-dollar", label: "Fatura Oluştur" },
      { icon: "fas fa-link", label: "Link Üret" },
      { icon: "fas fa-share-alt", label: "Kolay Paylaşım" },
      { icon: "fas fa-mobile-alt", label: "Mobil Uyumlu" },
      { icon: "fas fa-lock", label: "Güvenli Tahsilat" },
    ],
  },
  {
    panelTitle: "Otomatik hatırlatıcılar ile tahsilat",
    panelDescription: "Geciken ödemeler için otomatik hatırlatıcı gönderin, tahsilatı daha etkin yönetin.",
    phoneTitle: "Hatırlatıcı Gönder",
    phoneDescription: "Geciken ödemeleri otomatik olarak takip edin.",
    items: [
      { icon: "fas fa-bell", label: "Otomatik Hatırlat" },
      { icon: "fas fa-sync-alt", label: "Tekrar Gönder" },
      { icon: "fas fa-clock", label: "Zamanlama" },
      { icon: "fas fa-user-check", label: "Alıcı Hatırlatması" },
      { icon: "fas fa-thumbs-up", label: "Tahsilat Kolaylığı" },
    ],
  },
  {
    panelTitle: "Ödeme isteği raporları",
    panelDescription: "Taleplerinizin performansını raporlarla analiz edin, etkin tahsilat stratejileri geliştirin.",
    phoneTitle: "İstek Raporları",
    phoneDescription: "Ödeme taleplerinizin sonuçlarını ve istatistiklerini görün.",
    items: [
      { icon: "fas fa-chart-bar", label: "Performans" },
      { icon: "fas fa-file-alt", label: "Detaylı Rapor" },
      { icon: "fas fa-users", label: "Alıcı Segmenti" },
      { icon: "fas fa-wallet", label: "Toplam Tahsilat" },
      { icon: "fas fa-cogs", label: "Ayarlar" },
    ],
  },
];

export const secureSlidePages: SlidePage[] = [
  {
    panelTitle: "Güvenli Ödeme ile korunun",
    panelDescription: "Gelişmiş güvenlik önlemleri sayesinde her ödemede koruma sağlanır.",
    phoneTitle: "Güvenli Ödeme",
    phoneDescription: "3D Secure ve ek doğrulamalarla güvenli ödeme yapın.",
    items: [
      { icon: "fas fa-shield-alt", label: "3D Secure" },
      { icon: "fas fa-lock", label: "Tokenizasyon" },
      { icon: "fas fa-fingerprint", label: "Biyometrik Doğrulama" },
      { icon: "fas fa-user-shield", label: "Fraud Koruması" },
      { icon: "fas fa-shield-virus", label: "Risk İzleme" },
    ],
  },
  {
    panelTitle: "Kart bilgileri güvende",
    panelDescription: "Kart verileri tokenize edilip güvenli depolanır; tekrar kullanım güvenli şekilde yapılır.",
    phoneTitle: "Kart Güvenliği",
    phoneDescription: "Kart bilgileri saklanır, tekrar giriş gerekmez.",
    items: [
      { icon: "fas fa-credit-card", label: "Tokenizasyon" },
      { icon: "fas fa-key", label: "Güvenli Anahtar" },
      { icon: "fas fa-database", label: "Şifrelenmiş Depolama" },
      { icon: "fas fa-user-check", label: "Yetkilendirme" },
      { icon: "fas fa-file-contract", label: "Uyumluluk" },
    ],
  },
  {
    panelTitle: "Dolandırıcılığa karşı koruma",
    panelDescription: "Anormallik algılama ve gerçek zamanlı risk değerlendirmesi ile dolandırıcılık önlenir.",
    phoneTitle: "Fraud Önleme",
    phoneDescription: "Şüpheli aktiviteler otomatik olarak işaretlenir ve önlenir.",
    items: [
      { icon: "fas fa-search", label: "Anormallik Tespiti" },
      { icon: "fas fa-bell", label: "Gerçek Zamanlı Uyarı" },
      { icon: "fas fa-user-secret", label: "İnceleme" },
      { icon: "fas fa-shield-alt", label: "Koruma Katmanları" },
      { icon: "fas fa-chart-line", label: "Risk Raporu" },
    ],
  },
];

export const INVESTMENT_DATA = {
  title: "MoneyShop",
  highlight: "Yatırım",
  description: "Geleceğine yatırım yap. Fon, hisse senedi ve kripto para ile portföyünü büyüt.",
  visualCards: [
    { icon: "fas fa-chart-line", title: "Yatırım\nFonları", subtitle: "Uzman yönetimli", gradient: "linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)", shadow: "0 8px 30px rgba(0,82,255,0.25)" },
    { icon: "fas fa-chart-bar", title: "Hisse\nSenedi", subtitle: "Borsa yatırımı", gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", shadow: "0 8px 30px rgba(0,0,0,0.25)" },
    { icon: "fas fa-coins", title: "Kripto\nPara", subtitle: "Dijital varlıklar", gradient: "linear-gradient(135deg, #1a1a2e 0%, #3d0c11 50%, #6b2020 100%)", shadow: "0 8px 30px rgba(107,32,32,0.3)" },
  ],
  features: [
    { icon: "fas fa-chart-pie", title: "Çeşitlendirilmiş Portföy", desc: "Farklı varlık sınıflarına yatırım yap, riskini dağıt." },
    { icon: "fas fa-chart-simple", title: "Anlık Piyasa Takibi", desc: "Canlı verilerle piyasaları anlık olarak izle." },
    { icon: "fas fa-shield-alt", title: "Güvenli Platform", desc: "Yatırımların lisanslı ve güvenli altyapımızda korunur." },
  ],
  tabs: [
    { key: "fund", label: "Yatırım Fonları" },
    { key: "stock", label: "Hisse Senedi" },
    { key: "crypto", label: "Kripto Para" },
  ],
  tabBenefits: {
    fund: [
      { icon: "fas fa-shield-alt", title: "Uzman Yönetimi", desc: "Profesyonel fon yöneticileri tarafından yönetilen portföyler." },
      { icon: "fas fa-chart-pie", title: "Çeşitlendirme", desc: "Farklı sektör ve varlık sınıflarına yayılmış yatırım." },
      { icon: "fas fa-percent", title: "Düşük Maliyet", desc: "Düşük yönetim ücretleri ile avantajlı yatırım." },
      { icon: "fas fa-clock", title: "Esnek Vade", desc: "İstediğiniz zaman giriş ve çıkış imkanı." },
      { icon: "fas fa-file-alt", title: "Şeffaf Raporlama", desc: "Düzenli portföy raporları ile tam şeffaflık." },
      { icon: "fas fa-hand-holding-usd", title: "Temettü Geliri", desc: "Düzenli temettü ödemeleri ile ek gelir." },
    ],
    stock: [
      { icon: "fas fa-bolt", title: "Anlık İşlem", desc: "BİST ve diğer borsalarda anlık alım satım." },
      { icon: "fas fa-chart-simple", title: "Teknik Analiz", desc: "Gelişmiş grafik ve analiz araçları." },
      { icon: "fas fa-bell", title: "Fiyat Alarmı", desc: "Belirlediğiniz fiyat seviyelerinde anında bildirim." },
      { icon: "fas fa-newspaper", title: "Anlık Haberler", desc: "Şirket haberleri ve piyasa gelişmeleri." },
      { icon: "fas fa-calculator", title: "Kâr/Zarar Takibi", desc: "Gerçek zamanlı portföy performans takibi." },
      { icon: "fas fa-flag", title: "Limit Emir", desc: "Otomatik alım satım için limit emir desteği." },
    ],
    crypto: [
      { icon: "fas fa-lock", title: "Güvenli Saklama", desc: "Soğuk cüzdan ve çok katmanlı güvenlik." },
      { icon: "fas fa-bolt", title: "Hızlı İşlem", desc: "Saniyeler içinde kripto para alım satım." },
      { icon: "fas fa-exchange-alt", title: "Düşük Spread", desc: "Rekabetçi alım satım farkları." },
      { icon: "fas fa-coins", title: "Geniş Portföy", desc: "100+ farklı kripto para desteği." },
      { icon: "fas fa-mobile-alt", title: "Mobil Erişim", desc: "7/24 mobil uygulama üzerinden erişim." },
      { icon: "fas fa-chart-simple", title: "Piyasa Takibi", desc: "Anlık fiyat ve piyasa verileri." },
    ],
  },
};

export const PAYMENT_DATA = {
  title: "Ödeme",
  highlight: "İşlemleri",
  description: "Hızlı, güvenli ve pratik ödeme çözümleri. İster kartla, ister havale ile dilediğin gibi öde.",
  visualCards: [
    { icon: "fas fa-bolt", title: "Hızlı\nÖdeme", subtitle: "Tek tıkla öde", gradient: "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)", shadow: "0 8px 30px rgba(13,148,136,0.25)" },
    { icon: "fas fa-sync-alt", title: "Düzenli\nÖdeme", subtitle: "Otomatik tekrarla", gradient: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 50%, #a78bfa 100%)", shadow: "0 8px 30px rgba(109,40,217,0.25)" },
    { icon: "fas fa-qrcode", title: "QR ile\nÖdeme", subtitle: "Karekodla öde", gradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)", shadow: "0 8px 30px rgba(3,105,161,0.25)" },
  ],
  features: [
    { icon: "fas fa-shield-alt", title: "Güvenli İşlem", desc: "3D Secure ve uçtan uca şifreleme ile korunur." },
    { icon: "fas fa-clock", title: "Anlık Onay", desc: "Ödemelerin saniyeler içinde onaylanır." },
    { icon: "fas fa-mobile-alt", title: "Mobil Uyumlu", desc: "Her yerden, her cihazdan ödeme yap." },
  ],
  tabs: [
    { key: "fast", label: "Hızlı Ödeme" },
    { key: "recurring", label: "Düzenli Ödeme" },
    { key: "qr", label: "QR ile Ödeme" },
  ],
  tabBenefits: {
    fast: [
      { icon: "fas fa-bolt", title: "Saniyede İşlem", desc: "Ödemelerin anında gerçekleşir, bekleme yok." },
      { icon: "fas fa-credit-card", title: "Kart ile Ödeme", desc: "Tüm banka kartları ve kredi kartları ile ödeme." },
      { icon: "fas fa-mobile-alt", title: "Cep Telefonu ile Ödeme", desc: "Telefon numaranla kolayca ödeme yap." },
      { icon: "fas fa-exchange-alt", title: "Havale/EFT", desc: "Banka havalesi ve EFT ile ödeme imkanı." },
      { icon: "fas fa-receipt", title: "Dijital Makbuz", desc: "Her işlem sonrası dijital makbuz e-posta ile gönderilir." },
      { icon: "fas fa-history", title: "İşlem Geçmişi", desc: "Tüm ödeme geçmişine tek ekrandan eriş." },
    ],
    recurring: [
      { icon: "fas fa-sync-alt", title: "Otomatik Tekrarlama", desc: "Belirlediğin aralıklarla otomatik ödeme talimatı." },
      { icon: "fas fa-calendar-alt", title: "Esnek Zamanlama", desc: "Günlük, haftalık, aylık tekrarlama seçenekleri." },
      { icon: "fas fa-bell", title: "Hatırlatma Bildirimi", desc: "Ödeme öncesi ve sonrası anında bildirim." },
      { icon: "fas fa-pause-circle", title: "Duraklat/Durdur", desc: "İstediğin zaman ödemeyi duraklat veya iptal et." },
      { icon: "fas fa-chart-line", title: "Bütçe Yönetimi", desc: "Düzenli ödemelerini bütçene göre planla." },
      { icon: "fas fa-file-invoice", title: "Fatura Yönetimi", desc: "Faturalarını otomatik öde, gecikme yaşama." },
    ],
    qr: [
      { icon: "fas fa-qrcode", title: "Karekod ile Ödeme", desc: "QR kodu okut, saniyeler içinde öde." },
      { icon: "fas fa-store", title: "Mağazada Ödeme", desc: "Fiziksel mağazalarda temassız QR ödeme." },
      { icon: "fas fa-hand-holding-usd", title: "Kişiden Kişiye Ödeme", desc: "QR kodla arkadaşlarına hızlı para gönder." },
      { icon: "fas fa-wifi", title: "Çevrimdışı Çalışma", desc: "İnternet olmadan bile QR ödeme al." },
      { icon: "fas fa-coins", title: "Bakiye Görüntüleme", desc: "Ödeme öncesi bakiye kontrolü ve onay." },
      { icon: "fas fa-print", title: "Fiş Üretimi", desc: "QR ödeme sonrası dijital fiş oluşturma." },
    ],
  },
};

export const PHYSICAL_PAYMENT_DATA = {
  title: "Fiziki",
  highlight: "Ödeme Al",
  description: "Mağazanda yüz yüze ödemeleri POS terminali ile güvenle al. Tüm kartları destekler, anında onay.",
  visualCards: [
    { icon: "fas fa-credit-card", title: "Kartlı\nPOS", subtitle: "Tüm kartları kabul et", gradient: "linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f87171 100%)", shadow: "0 8px 30px rgba(220,38,38,0.25)" },
    { icon: "fas fa-wifi", title: "Temassız\nPOS", subtitle: "Temassız ödeme al", gradient: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)", shadow: "0 8px 30px rgba(194,65,12,0.25)" },
    { icon: "fas fa-mobile-alt", title: "Mobil\nPOS", subtitle: "Cep telefonunla ödeme al", gradient: "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)", shadow: "0 8px 30px rgba(30,64,175,0.25)" },
  ],
  features: [
    { icon: "fas fa-bolt", title: "Anında Onay", desc: "Ödemeler saniyeler içinde onaylanır." },
    { icon: "fas fa-shield-alt", title: "Güvenli İşlem", desc: "PCI DSS sertifikalı güvenlik altyapısı." },
    { icon: "fas fa-chart-line", title: "Raporlama", desc: "Detaylı satış ve işlem raporları." },
  ],
  tabs: [
    { key: "pos", label: "Kartlı POS" },
    { key: "contactless", label: "Temassız POS" },
    { key: "mpos", label: "Mobil POS" },
  ],
  tabBenefits: {
    pos: [
      { icon: "fas fa-credit-card", title: "Tüm Kartları Destekler", desc: "Visa, Mastercard, Troy ve yerel kartlar." },
      { icon: "fas fa-bolt", title: "Hızlı İşlem", desc: "Saniyeler içinde ödeme onayı." },
      { icon: "fas fa-print", title: "Fiş Çıktısı", desc: "Otomatik fiş yazdırma desteği." },
      { icon: "fas fa-wifi", title: "Wi-Fi & Kablolu", desc: "Hem kablolu hem kablosuz bağlantı." },
      { icon: "fas fa-battery-full", title: "Uzun Pil Ömrü", desc: "Tüm gün kesintisiz kullanım." },
      { icon: "fas fa-history", title: "İşlem Geçmişi", desc: "Tüm işlemlerinizi dashboard'dan takip edin." },
    ],
    contactless: [
      { icon: "fas fa-wifi", title: "Temassız Teknoloji", desc: "Kartı okut, temassız ödeme al." },
      { icon: "fas fa-mobile-alt", title: "Mobil Cüzdan", desc: "Apple Pay, Google Pay desteği." },
      { icon: "fas fa-bolt", title: "Hızlı Ödeme", desc: "Saniyeden kısa sürede ödeme tamamlanır." },
      { icon: "fas fa-shield-alt", title: "Güvenli", desc: "Tokenizasyon ile güvenli ödeme." },
      { icon: "fas fa-hand-holding-usd", title: "Düşük Limit", desc: "Temassız ödemelerde düşük işlem limiti." },
      { icon: "fas fa-check-circle", title: "Kolay İade", desc: "Temassız işlemlerde kolay iade yönetimi." },
    ],
    mpos: [
      { icon: "fas fa-mobile-alt", title: "Cep Telefonuna POS", desc: "Kendi telefonunu POS cihazına dönüştür." },
      { icon: "fas fa-download", title: "Hızlı Kurulum", desc: "Uygulamayı indir, hemen kullanmaya başla." },
      { icon: "fas fa-coins", title: "Düşük Maliyet", desc: "Ek donanım gerektirmez, düşük komisyon." },
      { icon: "fas fa-bluetooth", title: "Bluetooth Kart Okuyucu", desc: "Mini kart okuyucu ile fiziksel kart kabulü." },
      { icon: "fas fa-chart-simple", title: "Anlık Rapor", desc: "Tüm satışları anlık görüntüle." },
      { icon: "fas fa-qrcode", title: "QR ile Ödeme", desc: "QR kod ile de ödeme kabul et." },
    ],
  },
};

export const ONLINE_PAYMENT_DATA = {
  title: "Online",
  highlight: "Ödeme Al",
  description: "E-ticaret sitende veya link ile online ödeme almaya hemen başla. API entegrasyonu ile dakikalar içinde aktif.",
  visualCards: [
    { icon: "fas fa-globe", title: "Sanal\nPOS", subtitle: "Web sitende ödeme al", gradient: "linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)", shadow: "0 8px 30px rgba(5,150,105,0.25)" },
    { icon: "fas fa-link", title: "Linkle\nÖdeme", subtitle: "Link gönder, ödeme al", gradient: "linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)", shadow: "0 8px 30px rgba(190,24,93,0.25)" },
    { icon: "fas fa-code", title: "API\nEntegrasyon", subtitle: "Kendi yazılımına entegre et", gradient: "linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #6366f1 100%)", shadow: "0 8px 30px rgba(55,48,163,0.25)" },
  ],
  features: [
    { icon: "fas fa-lock", title: "Güvenli Altyapı", desc: "3D Secure ile korunan ödemeler." },
    { icon: "fas fa-bolt", title: "Hızlı Entegrasyon", desc: "Dakikalar içinde entegrasyon." },
    { icon: "fas fa-chart-simple", title: "Gerçek Zamanlı Takip", desc: "Tüm işlemleri anlık izle." },
  ],
  tabs: [
    { key: "virtual", label: "Sanal POS" },
    { key: "link", label: "Linkle Ödeme" },
    { key: "api", label: "API Entegrasyon" },
  ],
  tabBenefits: {
    virtual: [
      { icon: "fas fa-globe", title: "Web Sitesi Entegrasyonu", desc: "E-ticaret sitene kolayca entegre et." },
      { icon: "fas fa-credit-card", title: "Çoklu Kart Desteği", desc: "Tüm kredi ve banka kartları ile ödeme." },
      { icon: "fas fa-shield-alt", title: "3D Secure", desc: "Güvenli ödeme için 3D Secure desteği." },
      { icon: "fas fa-mobile-alt", title: "Mobil Uyumlu", desc: "Responsive ödeme sayfası ile mobil uyumlu." },
      { icon: "fas fa-language", title: "Çoklu Dil/Para Birimi", desc: "Farklı dil ve para birimlerinde ödeme." },
      { icon: "fas fa-undo", title: "İade Yönetimi", desc: "Kolay iade ve geri ödeme işlemleri." },
    ],
    link: [
      { icon: "fas fa-link", title: "Ödeme Linki Oluştur", desc: "Bir tıkla ödeme linki oluştur ve gönder." },
      { icon: "fas fa-whatsapp", title: "WhatsApp ile Paylaş", desc: "WhatsApp, e-posta veya SMS ile link gönder." },
      { icon: "fas fa-clock", title: "Zaman Aşımı", desc: "Linklere süre sınırı koy, güvenliği artır." },
      { icon: "fas fa-check-circle", title: "Anında Bildirim", desc: "Ödeme alındığında anında bildirim." },
      { icon: "fas fa-repeat", title: "Tekrarlanabilir Link", desc: "Aynı linki birden çok kez kullan." },
      { icon: "fas fa-chart-simple", title: "Link Takibi", desc: "Gönderilen linklerin durumunu takip et." },
    ],
    api: [
      { icon: "fas fa-code", title: "REST API", desc: "Modern REST API ile kolay entegrasyon." },
      { icon: "fas fa-book", title: "Detaylı Dökümantasyon", desc: "Kapsamlı API dökümantasyonu ve örnek kodlar." },
      { icon: "fas fa-flask", title: "Test Ortamı", desc: "Canlıya geçmeden önce test ortamında dene." },
      { icon: "fas fa-headset", title: "Teknik Destek", desc: "Uzman ekibimizle 7/24 teknik destek." },
      { icon: "fas fa-plug", title: "Eklenti Desteği", desc: "WooCommerce, Shopier ve diğer platformlar için hazır eklenti." },
      { icon: "fas fa-shield-alt", title: "Uyumlu ve Güvenli", desc: "PCI DSS uyumlu API altyapısı." },
    ],
  },
};

export const PAYMENT_DISTRIBUTION_DATA = {
  title: "Ödeme",
  highlight: "Dağıt",
  description: "Toplu ödemelerini tek seferde yap. Tedarikçilerine, çalışanlarına ve iş ortaklarına anında ödeme dağıt.",
  visualCards: [
    { icon: "fas fa-users", title: "Toplu\nÖdeme", subtitle: "Kişilere toplu ödeme yap", gradient: "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)", shadow: "0 8px 30px rgba(22,163,74,0.25)" },
    { icon: "fas fa-truck", title: "Tedarikçi\nÖdemesi", subtitle: "Tedarikçilerine öde", gradient: "linear-gradient(135deg, #422006 0%, #92400e 50%, #d97706 100%)", shadow: "0 8px 30px rgba(146,64,14,0.25)" },
    { icon: "fas fa-percent", title: "Komisyon\nDağıtımı", subtitle: "Komisyonları otomatik dağıt", gradient: "linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)", shadow: "0 8px 30px rgba(109,40,217,0.25)" },
  ],
  features: [
    { icon: "fas fa-bolt", title: "Anında Dağıtım", desc: "Ödemeler saniyeler içinde hesaplara ulaşır." },
    { icon: "fas fa-file-export", title: "Toplu İşlem", desc: "Yüzlerce kişiye tek seferde ödeme." },
    { icon: "fas fa-history", title: "İşlem Geçmişi", desc: "Detaylı raporlama ve işlem takibi." },
  ],
  tabs: [
    { key: "bulk", label: "Toplu Ödeme" },
    { key: "supplier", label: "Tedarikçi Ödemesi" },
    { key: "commission", label: "Komisyon Dağıtımı" },
  ],
  tabBenefits: {
    bulk: [
      { icon: "fas fa-users", title: "Toplu Ödeme Gönderimi", desc: "CSV yükle veya manuel ekle, tek seferde gönder." },
      { icon: "fas fa-file-csv", title: "CSV/Excel Desteği", desc: "Dosyadan toplu ödeme listesi yükle." },
      { icon: "fas fa-clock", title: "Zamanlanmış Gönderim", desc: "Ödemeleri istediğin tarihte gönderilmek üzere planla." },
      { icon: "fas fa-check-double", title: "Onay Süreci", desc: "Çoklu onay ile güvenli gönderim." },
      { icon: "fas fa-bell", title: "Bildirim", desc: "Alıcılara SMS/e-posta ile ödeme bildirimi." },
      { icon: "fas fa-file-invoice", title: "Raporlama", desc: "Detaylı dağıtım raporları ve dökümler." },
    ],
    supplier: [
      { icon: "fas fa-truck", title: "Tedarikçi Yönetimi", desc: "Tedarikçilerini ekle, grupla ve yönet." },
      { icon: "fas fa-file-invoice", title: "Fatura Eşleştirme", desc: "Faturalarla otomatik ödeme eşleştirme." },
      { icon: "fas fa-calendar-alt", title: "Düzenli Ödeme", desc: "Tedarikçi ödemelerini otomatikleştir." },
      { icon: "fas fa-history", title: "Ödeme Geçmişi", desc: "Tüm tedarikçi ödemelerinin geçmişi." },
      { icon: "fas fa-coins", title: "Çoklu Para Birimi", desc: "Farklı para birimlerinde tedarikçi ödemesi." },
      { icon: "fas fa-chart-line", title: "Harcama Analizi", desc: "Tedarikçi bazında harcama analizi." },
    ],
    commission: [
      { icon: "fas fa-percent", title: "Otomatik Hesaplama", desc: "Belirlenen oranlarda otomatik komisyon hesaplama." },
      { icon: "fas fa-users", title: "Bayi/Üye Komisyonu", desc: "Bayi ve üyelerine otomatik komisyon dağıt." },
      { icon: "fas fa-clock", title: "Periyodik Dağıtım", desc: "Günlük, haftalık, aylık otomatik komisyon dağıtımı." },
      { icon: "fas fa-file-invoice", title: "Raporlama", desc: "Detaylı komisyon raporları ve vergi dökümleri." },
      { icon: "fas fa-chart-simple", title: "Performans Takibi", desc: "Bayi/üye bazında performans ve komisyon takibi." },
      { icon: "fas fa-arrow-right", title: "Hesaba Aktarım", desc: "Komisyonları doğrudan banka hesaplarına aktar." },
    ],
  },
};

export const CARD_SOLUTIONS_DATA = {
  title: "Kart",
  highlight: "Çözümleri",
  description: "İşletmen için fiziki, sanal veya ön ödemeli kart çözümleri. Tüm kartların yönetimi tek dashboard'da.",
  visualCards: [
    { icon: "fas fa-credit-card", title: "Fiziki\nKart", subtitle: "Fiziksel kurumsal kart", gradient: "linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)", shadow: "0 8px 30px rgba(0,82,255,0.25)" },
    { icon: "fas fa-qrcode", title: "Sanal\nKart", subtitle: "Dijital kurumsal kart", gradient: "linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)", shadow: "0 8px 30px rgba(109,40,217,0.25)" },
    { icon: "fas fa-gift", title: "Ön Ödemeli\nKart", subtitle: "Bütçe dostu kart", gradient: "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)", shadow: "0 8px 30px rgba(194,65,12,0.25)" },
  ],
  features: [
    { icon: "fas fa-shield-alt", title: "Güvenli", desc: "EMV çip teknolojisi ile güvenli kartlar." },
    { icon: "fas fa-sliders-h", title: "Limit Kontrolü", desc: "Kart bazında harcama limiti belirle." },
    { icon: "fas fa-chart-simple", title: "Anlık Yönetim", desc: "Tüm kartları dashboard'dan yönet." },
  ],
  tabs: [
    { key: "physical", label: "Fiziki Kart" },
    { key: "virtual", label: "Sanal Kart" },
    { key: "prepaid", label: "Ön Ödemeli Kart" },
  ],
  tabBenefits: {
    physical: [
      { icon: "fas fa-credit-card", title: "EMV Çipli Kart", desc: "Güvenli EMV çip teknolojisi ile donatılmış kart." },
      { icon: "fas fa-wifi", title: "Temassız Ödeme", desc: "Temassız ödeme teknolojisi ile hızlı işlem." },
      { icon: "fas fa-user-tie", title: "Çalışan Kartı", desc: "Çalışanların için bireysel kart çıkar." },
      { icon: "fas fa-sliders-h", title: "Harcama Limiti", desc: "Kart bazında harcama limiti belirleme." },
      { icon: "fas fa-globe", title: "Yurt Dışı Kullanım", desc: "Yurt dışı harcamalarına izin ver/kısıtla." },
      { icon: "fas fa-ban", title: "Anında Dondurma", desc: "Kaybolan kartı anında dondur." },
    ],
    virtual: [
      { icon: "fas fa-bolt", title: "Anında Üretim", desc: "Sanal kartın saniyeler içinde oluştur." },
      { icon: "fas fa-globe", title: "Online Alışveriş", desc: "İnternet alışverişlerinde güvenle kullan." },
      { icon: "fas fa-sync", title: "Tek Kullanımlık", desc: "Tek kullanımlık sanal kart numarası." },
      { icon: "fas fa-wallet", title: "Dijital Cüzdan", desc: "Apple Pay ve Google Wallet ile uyumlu." },
      { icon: "fas fa-coins", title: "Bütçe Kontrolü", desc: "Sanal kart bazında harcama sınırı koy." },
      { icon: "fas fa-trash-alt", title: "Kolay İptal", desc: "Kullanmadığın kartı tek tıkla iptal et." },
    ],
    prepaid: [
      { icon: "fas fa-gift", title: "Hediye Kartı", desc: "Müşterilerine hediye kartı çıkar." },
      { icon: "fas fa-coins", title: "Ön Yükleme", desc: "Karta önceden bakiye yükle, harcama kontrolü sende." },
      { icon: "fas fa-chart-simple", title: "Harcama Takibi", desc: "Ön ödemeli kart harcamalarını anlık takip et." },
      { icon: "fas fa-shield-alt", title: "Bütçe Dostu", desc: "Yüklediğin kadar harca, borçlanma riski yok." },
      { icon: "fas fa-repeat", title: "Tekrar Yükleme", desc: "Kartı dilediğin zaman tekrar yükleyebilirsin." },
      { icon: "fas fa-users", title: "Toplu Kart Çıkarma", desc: "Toplu ön ödemeli kart siparişi." },
    ],
  },
};

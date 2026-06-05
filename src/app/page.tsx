"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { type Language, LANGUAGES, t, tArray, getLangDir } from "@/lib/landing-i18n";
import "./landing.css";

function getInitialLang(): Language {
  if (typeof window === "undefined") return "tr";
  const saved = localStorage.getItem("moneyshop-lang") as Language | null;
  if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  return "tr";
}

const fastSlidePages = [
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
    panelDescription: "MoneyShop hesabından tüm banka ve MoneyShop hesaplarına FAST limiti olan 400.000 TL’ye kadar transfer yap, tutar saniyeler içinde alıcı hesabına geçsin.",
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
    panelDescription: "Bir ödeme son anda aklına geldiğinde veya arkadaşının acil nakit ihtiyacı olduğunda, saniyeler içinde para gönder. MoneyShop kullanıcılarına rehberinde kayıtlı telefon numaraları veya MoneyShop numaralarıyla; MoneyShop'lu olmayan kişilere Kolay Adres’e tanımlı bilgileri veya IBAN numaraları üzerinden FAST ile para transferi yap.",
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

const eftSlidePages = [
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
    panelDescription: "Diğer banka hesaplarından MoneyShop hesabına 7/24 kolayca para gönder. İster MoneyShop hesabını Kolay Adres’lerine ekleyerek ister MoneyShop IBAN’ını kullanarak hesabına para yatır.",
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

const internationalSlidePages = [
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

const ibanSlidePages = [
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

const requestSlidePages = [
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

const secureSlidePages = [
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

export default function LandingPage() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollTopVisible, setScrollTopVisible] = useState(false);
  const [lang, setLang] = useState<Language>(getInitialLang);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [activeType, setActiveType] = useState<"default" | "individual" | "corporate">("default");
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [fastSlideIndex, setFastSlideIndex] = useState(0);
  const [eftSlideIndex, setEftSlideIndex] = useState(0);
  const [internationalSlideIndex, setInternationalSlideIndex] = useState(0);
  const [ibanSlideIndex, setIbanSlideIndex] = useState(0);
  const [requestSlideIndex, setRequestSlideIndex] = useState(0);
  const [secureSlideIndex, setSecureSlideIndex] = useState(0);
const [selectedCard, setSelectedCard] = useState<"standart" | "silver" | "gold">("standart");
const [selectedInvest, setSelectedInvest] = useState<"fund" | "stock" | "crypto">("fund");
const [selectedPayment, setSelectedPayment] = useState<"fast" | "recurring" | "qr">("fast");
const [selectedPhysicalPayment, setSelectedPhysicalPayment] = useState<"pos" | "contactless" | "mpos">("pos");
const [selectedOnlinePayment, setSelectedOnlinePayment] = useState<"virtual" | "link" | "api">("virtual");
const [selectedPaymentDist, setSelectedPaymentDist] = useState<"bulk" | "supplier" | "commission">("bulk");
const [selectedCardSolution, setSelectedCardSolution] = useState<"physical" | "virtual" | "prepaid">("physical");
  const currentFastSlide = fastSlidePages[fastSlideIndex];
  const currentEftSlide = eftSlidePages[eftSlideIndex];
  const currentInternationalSlide = internationalSlidePages[internationalSlideIndex];
  const currentIbanSlide = ibanSlidePages[ibanSlideIndex];
  const currentRequestSlide = requestSlidePages[requestSlideIndex];
  const currentSecureSlide = secureSlidePages[secureSlideIndex];
  const navbarRef = useRef<HTMLElement>(null);
  const navLinksRef = useRef<HTMLUListElement | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const dir = getLangDir(lang);

  // Persist language
  useEffect(() => {
    localStorage.setItem("moneyshop-lang", lang);
  }, [lang]);

  // Close lang menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const changeLang = (newLang: Language) => {
    setLang(newLang);
    setLangMenuOpen(false);
  };

  // Scroll lock when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (activeService !== "fast") return;

    const interval = window.setInterval(() => {
      setFastSlideIndex((prev) => (prev + 1) % 5);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "eft") return;

    const interval = window.setInterval(() => {
      setEftSlideIndex((prev) => (prev + 1) % eftSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "international") return;

    const interval = window.setInterval(() => {
      setInternationalSlideIndex((prev) => (prev + 1) % internationalSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "iban") return;

    const interval = window.setInterval(() => {
      setIbanSlideIndex((prev) => (prev + 1) % ibanSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "request") return;

    const interval = window.setInterval(() => {
      setRequestSlideIndex((prev) => (prev + 1) % requestSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService !== "secure") return;

    const interval = window.setInterval(() => {
      setSecureSlideIndex((prev) => (prev + 1) % secureSlidePages.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [activeService]);

  useEffect(() => {
    if (activeService === "fast") {
      setFastSlideIndex(0);
    }
    if (activeService === "eft") {
      setEftSlideIndex(0);
    }
    if (activeService === "international") {
      setInternationalSlideIndex(0);
    }
    if (activeService === "iban") {
      setIbanSlideIndex(0);
    }
    if (activeService === "request") {
      setRequestSlideIndex(0);
    }
    if (activeService === "secure") {
      setSecureSlideIndex(0);
    }
  }, [activeService]);

  // Scroll effects: navbar shadow, active nav link, scroll-to-top
  useEffect(() => {
    const sectionsRef: Element[] = [];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 50);
      setScrollTopVisible(scrollY > 500);

      if (navLinksRef.current) {
        const links = navLinksRef.current.querySelectorAll("a");
        sectionsRef.forEach((section) => {
          if (!section) return;
          const el = section as HTMLElement;
          const sectionTop = el.offsetTop;
          const sectionHeight = el.offsetHeight;
          const sectionId = section.getAttribute("id");
          links.forEach((link) => {
            if (link.getAttribute("href") === `#${sectionId}`) {
              if (scrollY + 100 >= sectionTop && scrollY + 100 < sectionTop + sectionHeight) {
                link.classList.add("active");
              } else {
                link.classList.remove("active");
              }
            }
          });
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Collect sections for active nav link tracking
    document.querySelectorAll("section[id]").forEach((s) => sectionsRef.push(s));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for scroll animations + counter animation
  useEffect(() => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("animated");
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll(".animate-on-scroll").forEach((el) => observer.observe(el));

    // Counter animation
    const counters = document.querySelectorAll(".counter");
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target as HTMLElement;
            const target = parseFloat(counter.getAttribute("data-target") || "0");
            const isDecimal = target % 1 !== 0;
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime: number) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const current = target * easeOut;
              counter.textContent = isDecimal ? current.toFixed(1) : Math.floor(current).toString();
              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                counter.textContent = isDecimal ? target.toFixed(1) : target.toString();
              }
            }

            requestAnimationFrame(updateCounter);
            counterObserver.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 },
    );

    counters.forEach((counter) => counterObserver.observe(counter));

    return () => {
      observer.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeMenu = () => setMenuOpen(false);

  const handleTypeNav = (e: React.MouseEvent<HTMLAnchorElement>, section: string) => {
    e.preventDefault();
    closeMenu();
    setActiveSection(section);
    setActiveSubmenu(section);
    setActiveService(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleServiceClick = (e: React.MouseEvent, service: string) => {
    e.preventDefault();
    setActiveService(service);
    // push a history state so browser back / custom back button can return to previous view
    try {
      window.history.pushState({ openService: service }, "");
    } catch (err) {
      /* ignore */
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleServiceBack = () => {
    // If we have a pushed history state for an open service, go back in history
    try {
      const state = window.history.state as any;
      if (state && state.openService) {
        window.history.back();
        return;
      }
    } catch (err) {
      /* ignore */
    }

    // fallback: close the service view
    setActiveService(null);
  };

  // When browser popstate occurs (back button), ensure activeService is cleared
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      setActiveService(null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div className="landing-page" dir={dir}>
      {/* ========== NAVBAR ========== */}
      <nav ref={navbarRef} className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
        <div className="nav-container">
          {/* TOP ROW: Logo + Type Menu + Actions + Hamburger */}
          <div className="nav-row-top">
            <a href="/" className="logo" onClick={(e) => { e.preventDefault(); scrollToTop(); setActiveType("default"); setActiveSection(null); setActiveSubmenu(null); setActiveService(null); }}>
              <div className="logo-icon">
                <i className="fas fa-wallet" />
              </div>
              <span className="logo-text">
                Money<span>Shop</span>
              </span>
            </a>

            <div className="nav-type-menu">
              <button
                className={`nav-type-link${activeType === "individual" ? " active" : ""}`}
                onClick={() => setActiveType("individual")}
              >
                {t(lang, "nav.individual")}
              </button>
              <span className="nav-type-sep">|</span>
              <button
                className={`nav-type-link${activeType === "corporate" ? " active" : ""}`}
                onClick={() => setActiveType("corporate")}
              >
                {t(lang, "nav.corporate")}
              </button>
            </div>

            <div className="nav-actions">
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="btn-nav-login">
                    <div className="nav-user-avatar">
                      {(session.user.name || "K")[0]}
                    </div>
                    <span>{session.user.name || "Kullanıcı"}</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="btn-nav-cta"
                    style={{ cursor: "pointer", border: "none" }}
                  >
                    <i className="fas fa-sign-out-alt" />
                    {" "}
                    {t(lang, "nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-nav-login">
                    {t(lang, "nav.login")}
                  </Link>
                  <Link href="/register" className="btn-nav-cta">
                    {t(lang, "nav.getStarted")}
                  </Link>
                </>
              )}

              {/* Language Switcher */}
              <div className="lang-dropdown" ref={langMenuRef}>
                <button className="nav-lang" onClick={() => setLangMenuOpen(!langMenuOpen)} aria-label="Dil seç">
                  <i className="fas fa-globe" />
                  <span>{currentLang.flag}</span>
                  <span className="lang-code">{currentLang.code.toUpperCase()}</span>
                  <i className={`fas fa-chevron-${dir === "rtl" ? "left" : "down"} lang-arrow`} />
                </button>
                {langMenuOpen && (
                  <div className="lang-dropdown-menu">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        className={`lang-dropdown-item${l.code === lang ? " active" : ""}`}
                        onClick={() => changeLang(l.code)}
                      >
                        <span className="lang-flag">{l.flag}</span>
                        <span className="lang-label">{l.label}</span>
                        {l.code === lang && <i className="fas fa-check lang-check" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              className={`menu-toggle${menuOpen ? " active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          {/* BOTTOM ROW: Nav Links */}
          <ul className={`nav-links${activeType !== "default" ? " type-menu-active" : ""}`} ref={navLinksRef}>
            {activeType === "individual" ? (
              <>
                <li>
                  <a href="#transfer" className={activeSubmenu === "transfer" ? "active" : ""} onClick={(e) => handleTypeNav(e, "transfer")}>{t(lang, "nav.moneyTransfer")}</a>
                </li>
                <li>
                  <a href="#card" className={activeSubmenu === "card" ? "active" : ""} onClick={(e) => handleTypeNav(e, "card")}>{t(lang, "nav.card")}</a>
                </li>
                <li>
                  <a href="#investment" className={activeSubmenu === "investment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "investment")}>{t(lang, "nav.investment")}</a>
                </li>
                <li>
                  <a href="#payments" className={activeSubmenu === "payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "payment")}>{t(lang, "nav.paymentOperations")}</a>
                </li>
              </>
            ) : activeType === "corporate" ? (
              <>
                <li>
                  <a href="#physical-payment" className={activeSubmenu === "physical-payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "physical-payment")}>{t(lang, "nav.physicalPayment")}</a>
                </li>
                <li>
                  <a href="#online-payment" className={activeSubmenu === "online-payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "online-payment")}>{t(lang, "nav.onlinePayment")}</a>
                </li>
                <li>
                  <a href="#payment-distribution" className={activeSubmenu === "payment-distribution" ? "active" : ""} onClick={(e) => handleTypeNav(e, "payment-distribution")}>{t(lang, "nav.paymentDistribution")}</a>
                </li>
                <li>
                  <a href="#card-solutions" className={activeSubmenu === "card-solutions" ? "active" : ""} onClick={(e) => handleTypeNav(e, "card-solutions")}>{t(lang, "nav.cardSolutions")}</a>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="#services" className="active">
                    {t(lang, "nav.services")}
                  </a>
                </li>
                <li>
                  <a href="#how-it-works">{t(lang, "nav.howItWorks")}</a>
                </li>
                <li>
                  <a href="#card">{t(lang, "nav.card")}</a>
                </li>
                <li>
                  <a href="#features">{t(lang, "nav.features")}</a>
                </li>
                <li>
                  <a href="#compliance">{t(lang, "nav.compliance")}</a>
                </li>
                <li>
                  <a href="#roadmap">{t(lang, "nav.roadmap")}</a>
                </li>
                <li>
                  <a href="/pricing">{t(lang, "nav.pricing")}</a>
                </li>
                <li>
                  <a href="/faq">{t(lang, "nav.faq")}</a>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      {/* ========== MOBILE MENU ========== */}
      <div className={`mobile-menu${menuOpen ? " active" : ""}`} id="mobileMenu">
        <div className="mobile-type-menu">
          <button
            className={`nav-type-link${activeType === "individual" ? " active" : ""}`}
            onClick={() => setActiveType("individual")}
          >
            {t(lang, "nav.individual")}
          </button>
          <span className="nav-type-sep">|</span>
          <button
            className={`nav-type-link${activeType === "corporate" ? " active" : ""}`}
            onClick={() => setActiveType("corporate")}
          >
            {t(lang, "nav.corporate")}
          </button>
        </div>
        {activeType === "individual" ? (
          <>
            <a href="#transfer" className={activeSubmenu === "transfer" ? "active" : ""} onClick={(e) => handleTypeNav(e, "transfer")}>
              {t(lang, "nav.moneyTransfer")}
            </a>
            <a href="#card" className={activeSubmenu === "card" ? "active" : ""} onClick={(e) => handleTypeNav(e, "card")}>
              {t(lang, "nav.card")}
            </a>
            <a href="#investment" className={activeSubmenu === "investment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "investment")}>
              {t(lang, "nav.investment")}
            </a>
            <a href="#payments" className={activeSubmenu === "payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "payment")}>
              {t(lang, "nav.paymentOperations")}
            </a>
          </>
        ) : activeType === "corporate" ? (
          <>
            <a href="#physical-payment" className={activeSubmenu === "physical-payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "physical-payment")}>
              {t(lang, "nav.physicalPayment")}
            </a>
            <a href="#online-payment" className={activeSubmenu === "online-payment" ? "active" : ""} onClick={(e) => handleTypeNav(e, "online-payment")}>
              {t(lang, "nav.onlinePayment")}
            </a>
            <a href="#payment-distribution" className={activeSubmenu === "payment-distribution" ? "active" : ""} onClick={(e) => handleTypeNav(e, "payment-distribution")}>
              {t(lang, "nav.paymentDistribution")}
            </a>
            <a href="#card-solutions" className={activeSubmenu === "card-solutions" ? "active" : ""} onClick={(e) => handleTypeNav(e, "card-solutions")}>
              {t(lang, "nav.cardSolutions")}
            </a>
          </>
        ) : (
          <>
            <a href="#services" onClick={closeMenu}>
              {t(lang, "nav.services")}
            </a>
            <a href="#how-it-works" onClick={closeMenu}>
              {t(lang, "nav.howItWorks")}
            </a>
            <a href="#card" onClick={closeMenu}>
              {t(lang, "nav.card")}
            </a>
            <a href="#features" onClick={closeMenu}>
              {t(lang, "nav.features")}
            </a>
            <a href="#compliance" onClick={closeMenu}>
              {t(lang, "nav.compliance")}
            </a>
            <a href="#roadmap" onClick={closeMenu}>
              {t(lang, "nav.roadmap")}
            </a>
            <a href="/pricing" onClick={closeMenu}>
              {t(lang, "nav.pricing")}
            </a>
            <a href="/faq" onClick={closeMenu}>
              {t(lang, "nav.faq")}
            </a>
          </>
        )}
        {session?.user ? (
          <>
            <Link href="/dashboard" onClick={closeMenu} style={{ color: "var(--secondary)" }}>
              <i className="fas fa-tachometer-alt" /> Dashboard
            </Link>
            <button
              onClick={() => { closeMenu(); signOut({ callbackUrl: "/" }); }}
              style={{ color: "var(--loss)", cursor: "pointer", border: "none", background: "none", padding: 0 }}
            >
              <i className="fas fa-sign-out-alt" /> Çıkış Yap
            </button>
          </>
        ) : (
          <Link href="/register" onClick={closeMenu} style={{ color: "var(--secondary)" }}>
            {t(lang, "nav.getStarted")}
          </Link>
        )}
      </div>

      {/* ========== HERO ========== */}
      <section className={`hero${activeSection ? " hidden" : ""}`}>
        <div className="hero-bg-elements">
          <div className="circle circle-1" />
          <div className="circle circle-2" />
          <div className="circle circle-3" />
        </div>
        <div className="hero-grid" />
        <div className="hero-particles">
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
          <div className="particle" />
        </div>

        <div className="hero-wrapper">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-badge">
                <span className="dot" />
                {t(lang, "hero.badge")}
              </div>
              <h1>
                {t(lang, "hero.titleStart")}{" "}
                <span className="gradient-text">{t(lang, "hero.titleHighlight")}</span>{" "}
                {t(lang, "hero.titleEnd")}
              </h1>
              <p className="hero-description">{t(lang, "hero.description")}</p>
              <div className="hero-buttons">
                <Link href="/register" className="btn-primary">
                  {t(lang, "hero.cta")}
                  <i className="fas fa-arrow-right" />
                </Link>
              </div>
              <div className="hero-stats">
                <div className="hero-stat">
                  <h3>2.4 Milyon+</h3>
                  <p>{t(lang, "hero.merchants")}</p>
                </div>
                <div className="hero-stat">
                  <h3>
                    <span className="counter" data-target={99.9}>
                      0
                    </span>
                    %
                  </h3>
                  <p>{t(lang, "hero.uptime")}</p>
                </div>
                <div className="hero-stat">
                  <h3>
                    <span className="counter" data-target={7}>
                      0
                    </span>
                    /24
                  </h3>
                  <p>{t(lang, "hero.support")}</p>
              </div> 
            </div>
          </div>

          <div className="hero-visual">
              <div className="hero-visual-inner">
                <div className="features-phone phone-16pro">
                  <div className="phone-side-buttons">
                    <div className="phone-btn phone-btn-vol-up" />
                    <div className="phone-btn phone-btn-vol-down" />
                    <div className="phone-btn phone-btn-action" />
                    <div className="phone-btn phone-btn-power" />
                  </div>
                <div className="phone-screen">
                  <div className="phone-dynamic-island" />
                  <div className="phone-content">
                    <div className="phone-topbar">
                      <div className="phone-topbar-logo">
                        <i className="fas fa-wallet" />
                        <span>MoneyShop</span>
                      </div>
                      <div className="phone-topbar-greeting">
                        {t(lang, "features.phoneGreeting")} 👋
                      </div>
                    </div>
                    <div className="phone-balance-card">
                      <div className="phone-balance-label">Hesabım</div>
                      <div className="phone-balance-amount">250.000 TL</div>
                      <div className="phone-iban-row">
                        <span className="phone-iban-label">İBAN</span>
                        <span className="phone-iban-value">IQ12 0001 2345 6789 0123</span>
                      </div>
                    </div>
                    <div className="phone-actions">
                      <div className="phone-action">
                        <div className="phone-action-icon">
                          <i className="fas fa-qrcode" />
                        </div>
                        <div className="phone-action-label">{t(lang, "features.phoneScan")}</div>
                      </div>
                      <div className="phone-action">
                        <div className="phone-action-icon">
                          <i className="fas fa-paper-plane" />
                        </div>
                        <div className="phone-action-label">{t(lang, "features.phoneTransfer")}</div>
                      </div>
                      <div className="phone-action">
                        <div className="phone-action-icon">
                          <i className="fas fa-chart-bar" />
                        </div>
                        <div className="phone-action-label">{t(lang, "features.phoneReports")}</div>
                      </div>
                      <div className="phone-action">
                        <div className="phone-action-icon">
                          <i className="fas fa-ellipsis-h" />
                        </div>
                        <div className="phone-action-label">{""}</div>
                      </div>
                    </div>
                    <div className="phone-recent">{t(lang, "features.phoneRecent")}</div>
                    <div className="phone-transaction">
                      <div className="phone-transaction-left">
                        <div className="phone-tx-icon">
                          <i className="fas fa-arrow-down" />
                        </div>
                        <div>
                          <div className="phone-tx-name">Gelen Transfer</div>
                          <div className="phone-tx-date">Ahmet Yılmaz</div>
                        </div>
                      </div>
                      <div className="phone-tx-right">
                        <div className="phone-tx-amount">+120.000 TL</div>
                        <div className="phone-tx-time">Bugün 10:00</div>
                      </div>
                    </div>
                    <div className="phone-transaction">
                      <div className="phone-transaction-left">
                        <div className="phone-tx-icon">
                          <i className="fas fa-arrow-up" />
                        </div>
                        <div>
                          <div className="phone-tx-name">Giden Transfer</div>
                          <div className="phone-tx-date">Zeynep Kaya</div>
                        </div>
                      </div>
                      <div className="phone-tx-right">
                        <div className="phone-tx-amount outgoing">-50.000 TL</div>
                        <div className="phone-tx-time">01.06.2026</div>
                      </div>
                    </div>
                    <div className="phone-transaction">
                      <div className="phone-transaction-left">
                        <div className="phone-tx-icon">
                          <i className="fas fa-shopping-cart" />
                        </div>
                        <div>
                          <div className="phone-tx-name">Alışveriş - Amazon</div>
                          <div className="phone-tx-date">Online</div>
                        </div>
                      </div>
                      <div className="phone-tx-right">
                        <div className="phone-tx-amount outgoing">-5.000 TL</div>
                        <div className="phone-tx-time">31.05.2026</div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              </div>

              <div className="hero-visual-right">
              <div className="hero-cards-stack">
                <div className="hero-stack-card card-standart">
                  <div className="card-bg-shine" />
                  <div className="hero-card-top">
                    <div className="hero-card-brand">
                      <i className="fas fa-wallet" />
                      <span>MoneyShop</span>
                    </div>
                    <div className="hero-card-chip">
                      <div className="chip-lines">
                        <div /><div /><div /><div />
                      </div>
                    </div>
                  </div>
                  <div className="hero-card-type">{t(lang, "card.standart.name")}</div>
                  <div className="hero-card-contactless">
                    <svg viewBox="0 0 32 38">
                      <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="hero-card-network">
                    <i className="fab fa-cc-visa" />
                  </div>
                </div>

                <div className="hero-stack-card card-silver">
                  <div className="card-bg-shine" />
                  <div className="hero-card-top">
                    <div className="hero-card-brand">
                      <i className="fas fa-wallet" />
                      <span>MoneyShop</span>
                    </div>
                    <div className="hero-card-chip">
                      <div className="chip-lines">
                        <div /><div /><div /><div />
                      </div>
                    </div>
                  </div>
                  <div className="hero-card-type">{t(lang, "card.silver.name")}</div>
                  <div className="hero-card-contactless">
                    <svg viewBox="0 0 32 38">
                      <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="hero-card-network">
                    <i className="fab fa-cc-visa" />
                  </div>
                </div>

                <div className="hero-stack-card card-gold">
                  <div className="card-bg-shine" />
                  <div className="hero-card-top">
                    <div className="hero-card-brand">
                      <i className="fas fa-crown" />
                      <span>MoneyShop</span>
                    </div>
                    <div className="hero-card-chip">
                      <div className="chip-lines">
                        <div /><div /><div /><div />
                      </div>
                    </div>
                  </div>
                  <div className="hero-card-type">{t(lang, "card.gold.name")}</div>
                  <div className="hero-card-contactless">
                    <svg viewBox="0 0 32 38">
                      <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="hero-card-network">
                    <i className="fab fa-cc-visa" />
                  </div>
                </div>
              </div>

              <div className="hero-store-buttons">
                <a href="#" className="store-btn store-apple">
                  <svg className="store-icon" viewBox="0 0 384 512" width="24" height="24">
                    <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-111.9-57.2-139.8zM231.2 59c0-25.6-9.5-47.7-28.5-66.2C185.2 6.8 164.7 0 141.8 0c0 28.9 8.1 52.4 24.3 70.6 16.7 18.6 38.8 29.4 63.3 28.5 0-26.2 1.1-43.5 1.8-59.5z" />
                  </svg>
                  <div className="store-btn-text">
                    <span className="store-btn-big">App Store</span>
                  </div>
                </a>
                <a href="#" className="store-btn store-googleplay">
                  <svg className="store-icon" viewBox="0 0 512 512" width="24" height="24">
                    <path fill="#EA4335" d="M127.4 432.8c-2.1 1.2-4.4 1.7-6.7 1.7-3.3 0-6.5-1.2-9-3.5-3.7-3.4-5.5-8.5-5-13.7L117 341.8l47.3-49.1 63.1 63.1-100 77zM58.8 65.3C53.7 70.5 51 78.2 51 87.1v337.8c0 8.9 2.7 16.5 7.6 21.8l248-214.4L58.8 65.3zM347.5 213.7l-55.6-55.5-70.3 70.3 63.1 63.1 62.8-76.9c.2-.2.3-.3.3-.5 1.2-1.4 1.9-3.1 2.1-4.9.1-.4.1-.8.1-1.2 0-1.2-.3-2.4-.8-3.5-.7-1.5-1.8-2.8-3.1-3.6z"/>
                    <path fill="#FBBC04" d="M347.5 213.7 278 278.4l-55.6 55.5 63.1 63.1 62-76.8c.3-.4.6-.8.9-1.3 1.5-2.2 2.4-4.8 2.4-7.6v-87.2c0-1.6-.3-3.1-.8-4.5-.1-.1-.1-.2-.1-.3-.7-1.6-1.7-3-3-4.1z"/>
                    <path fill="#34A853" d="M116.7 347.3 102 472.6c-.1.3-.1.6-.1 1 0 2 .8 3.8 2.1 5.2 1.4 1.5 3.4 2.3 5.5 2.3.8 0 1.5-.1 2.2-.3 1.7-.5 3.2-1.5 4.3-2.8l144.9-119.1-62.6-62.6-78.6 83.8z"/>
                    <path fill="#4285F4" d="M138.3 61.5 380.9 225c2.3 1.6 3.8 4 4.4 6.6.2.7.3 1.4.3 2.2 0 4.5-2.7 8.5-6.8 10.1L145.2 448.1c-2.1 1.2-4.4 1.7-6.7 1.7-3.3 0-6.5-1.2-9-3.5-1.4-1.3-2.4-2.9-3.1-4.6-.7-1.7-1.1-3.6-1-5.5V76.5c0-4.5 2.1-8.6 5.6-11.2 2.4-1.8 5.4-2.9 8.9-3.3 1-.1 2-.1 2.9-.1 2.2 0 4.4.5 6.5 1.6z"/>
                  </svg>
                  <div className="store-btn-text">
                    <span className="store-btn-big">Google Play</span>
                  </div>
                </a>
              </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeSection ? (
        <section className="section-content">
          <div className="section-container">
            {activeSection === "transfer" && (
              <div className="transfer-page">
                {!activeService ? (
                  <>
                    <div className="services-subsection">
                      <h3 className="services-subsection-title">
                        <i className="fas fa-bolt" />
                        {t(lang, "services.transfersTitle")}
                      </h3>
                    </div>

                    <div className="services-grid">
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "fast")}>
                        <div className="service-icon teal">
                          <i className="fas fa-bolt" />
                        </div>
                        <h3>{t(lang, "services.fastTitle")}</h3>
                        <p>{t(lang, "services.fastDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "fast")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "eft")}>
                        <div className="service-icon cyan">
                          <i className="fas fa-right-left" />
                        </div>
                        <h3>{t(lang, "services.eftTitle")}</h3>
                        <p>{t(lang, "services.eftDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "eft")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "international")}>
                        <div className="service-icon sky">
                          <i className="fas fa-globe" />
                        </div>
                        <h3>{t(lang, "services.internationalTitle")}</h3>
                        <p>{t(lang, "services.internationalDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "international")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "iban")}>
                        <div className="service-icon indigo">
                          <i className="fas fa-qrcode" />
                        </div>
                        <h3>{t(lang, "services.ibanTitle")}</h3>
                        <p>{t(lang, "services.ibanDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "iban")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "request")}>
                        <div className="service-icon emerald">
                          <i className="fas fa-hand-holding-dollar" />
                        </div>
                        <h3>{t(lang, "services.requestTitle")}</h3>
                        <p>{t(lang, "services.requestDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "request")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                      <div className="service-card" onClick={(e) => handleServiceClick(e, "secure")}>
                        <div className="service-icon pink">
                          <i className="fas fa-shield-alt" />
                        </div>
                        <h3>{t(lang, "services.secureTitle")}</h3>
                        <p>{t(lang, "services.secureDesc")}</p>
                                                <button type="button" className="service-link" onClick={(e) => handleServiceClick(e, "secure")}>
                                                  <i className="fas fa-arrow-right" />
                                                </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Service Detail */}
                    <div className="service-detail">

                      {activeService === "fast" && (
                        <div className="service-detail-content">
                          <div className="service-detail-fast-layout">
                            <div className="service-detail-fast-info">
                              <div className="service-detail-header">
                                <div className="service-icon teal large-icon">
                                  <i className="fas fa-bolt" />
                                </div>
                                <h2>{currentFastSlide.panelTitle}</h2>
                              </div>
                              <p className="service-detail-desc">{currentFastSlide.panelDescription}</p>
                              {fastSlideIndex === 0 && (
                                <Link href="/register" className="btn-primary service-fast-cta">
                                  {t(lang, "hero.cta")} <i className="fas fa-arrow-right" />
                                </Link>
                              )}
                            </div>
                            <div className="service-detail-fast-phone">
                              <div className="features-phone phone-16pro">
                                <div className="phone-side-buttons">
                                  <div className="phone-btn phone-btn-vol-up" />
                                  <div className="phone-btn phone-btn-vol-down" />
                                  <div className="phone-btn phone-btn-action" />
                                  <div className="phone-btn phone-btn-power" />
                                </div>
                                <div className="phone-screen">
                                  <div className="phone-dynamic-island" />
                                  <div className="phone-fast-topbar">
                                    <div className="phone-fast-logo">
                                      <i className="fas fa-wallet" />
                                      <span>MoneyShop</span>
                                    </div>
                                    <div className="phone-fast-avatar">
                                      <i className="fas fa-user-circle" />
                                      <div className="phone-fast-account text-right text-[10px]">
                                        <div className="phone-fast-account-label text-[9px]">MoneyShop No:</div>
                                        <div className="phone-fast-account-value font-mono text-[10px]">12345678</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="phone-fast-header">
                                    <i className="fas fa-bolt" />
                                    FAST Para Transferi
                                  </div>
                                  <div className="phone-fast-sub">
                                    Fast ile yapmak istediğiniz işlemi seçiniz.
                                  </div>
                                  <div className="phone-fast-menu">
                                    {currentFastSlide.items.map((item, idx) => (
                                      <div key={idx} className="phone-fast-menu-item">
                                        <i className={item.icon} />
                                        <span>{item.label}</span>
                                        <i className="fas fa-chevron-right" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="phone-fast-slider phone-fast-slider-dots-only">
                            <div className="phone-fast-slider-dots">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <span
                                  key={index}
                                  className={index === fastSlideIndex ? "active" : ""}
                                  onClick={() => setFastSlideIndex(index)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeService === "eft" && (
                        <div className="service-detail-content">
                          <div className="service-detail-fast-layout">
                            <div className="service-detail-fast-info">
                              <div className="service-detail-header">
                                <div className="service-icon cyan large-icon">
                                  <i className="fas fa-right-left" />
                                </div>
                                <h2>{currentEftSlide.panelTitle}</h2>
                              </div>
                              <p className="service-detail-desc">{currentEftSlide.panelDescription}</p>
                              {eftSlideIndex === 0 && (
                                <Link href="/register" className="btn-primary service-fast-cta">
                                  Hemen Başvur <i className="fas fa-arrow-right" />
                                </Link>
                              )}
                            </div>
                            <div className="service-detail-fast-phone">
                              <div className="features-phone phone-16pro">
                                <div className="phone-side-buttons">
                                  <div className="phone-btn phone-btn-vol-up" />
                                  <div className="phone-btn phone-btn-vol-down" />
                                  <div className="phone-btn phone-btn-action" />
                                  <div className="phone-btn phone-btn-power" />
                                </div>
                                <div className="phone-screen">
                                  <div className="phone-dynamic-island" />
                                  <div className="phone-fast-topbar">
                                    <div className="phone-fast-logo">
                                      <i className="fas fa-wallet" />
                                      <span>MoneyShop</span>
                                    </div>
                                    <div className="phone-fast-avatar">
                                      <i className="fas fa-user-circle" />
                                      <div className="phone-fast-account text-right text-[10px]">
                                        <div className="phone-fast-account-label text-[9px]">MoneyShop No:</div>
                                        <div className="phone-fast-account-value font-mono text-[10px]">12345678</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="phone-fast-header">
                                    {currentEftSlide.phoneTitle}
                                  </div>
                                  <div className="phone-fast-sub">
                                    {currentEftSlide.phoneDescription}
                                  </div>
                                  <div className="phone-fast-menu">
                                    {currentEftSlide.items.map((item, idx) => (
                                      <div key={idx} className="phone-fast-menu-item">
                                        <i className={item.icon} />
                                        <span>{item.label}</span>
                                        <i className="fas fa-chevron-right" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="phone-fast-slider phone-fast-slider-dots-only">
                            <div className="phone-fast-slider-dots">
                              {Array.from({ length: eftSlidePages.length }).map((_, index) => (
                                <span
                                  key={index}
                                  className={index === eftSlideIndex ? "active" : ""}
                                  onClick={() => setEftSlideIndex(index)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeService === "international" && (
                        <div className="service-detail-content">
                          <div className="service-detail-fast-layout">
                            <div className="service-detail-fast-info">
                              <div className="service-detail-header">
                                <div className="service-icon sky large-icon">
                                  <i className="fas fa-globe" />
                                </div>
                                <h2>{currentInternationalSlide.panelTitle}</h2>
                              </div>
                              <p className="service-detail-desc">{currentInternationalSlide.panelDescription}</p>
                              {internationalSlideIndex === 0 && (
                                <Link href="/register" className="btn-primary service-fast-cta">
                                  Hemen Başvur <i className="fas fa-arrow-right" />
                                </Link>
                              )}
                            </div>
                            <div className="service-detail-fast-phone">
                              <div className="features-phone phone-16pro">
                                <div className="phone-side-buttons">
                                  <div className="phone-btn phone-btn-vol-up" />
                                  <div className="phone-btn phone-btn-vol-down" />
                                  <div className="phone-btn phone-btn-action" />
                                  <div className="phone-btn phone-btn-power" />
                                </div>
                                <div className="phone-screen">
                                  <div className="phone-dynamic-island" />
                                  <div className="phone-fast-topbar">
                                    <div className="phone-fast-logo">
                                      <i className="fas fa-wallet" />
                                      <span>MoneyShop</span>
                                    </div>
                                    <div className="phone-fast-avatar">
                                      <i className="fas fa-user-circle" />
                                      <div className="phone-fast-account text-right text-[10px]">
                                        <div className="phone-fast-account-label text-[9px]">MoneyShop No:</div>
                                        <div className="phone-fast-account-value font-mono text-[10px]">12345678</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="phone-fast-header">
                                    {currentInternationalSlide.phoneTitle}
                                  </div>
                                  <div className="phone-fast-sub">
                                    {currentInternationalSlide.phoneDescription}
                                  </div>
                                  <div className="phone-fast-menu">
                                    {currentInternationalSlide.items.map((item, idx) => (
                                      <div key={idx} className="phone-fast-menu-item">
                                        <i className={item.icon} />
                                        <span>{item.label}</span>
                                        <i className="fas fa-chevron-right" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="phone-fast-slider phone-fast-slider-dots-only">
                            <div className="phone-fast-slider-dots">
                              {Array.from({ length: internationalSlidePages.length }).map((_, index) => (
                                <span
                                  key={index}
                                  className={index === internationalSlideIndex ? "active" : ""}
                                  onClick={() => setInternationalSlideIndex(index)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeService === "iban" && (
                        <div className="service-detail-content">
                          <div className="service-detail-fast-layout">
                            <div className="service-detail-fast-info">
                              <div className="service-detail-header">
                                <div className="service-icon indigo large-icon">
                                  <i className="fas fa-qrcode" />
                                </div>
                                <h2>{currentIbanSlide.panelTitle}</h2>
                              </div>
                              <p className="service-detail-desc">{currentIbanSlide.panelDescription}</p>
                              {ibanSlideIndex === 0 && (
                                <Link href="/register" className="btn-primary service-fast-cta">
                                  Hemen Başvur <i className="fas fa-arrow-right" />
                                </Link>
                              )}
                            </div>
                            <div className="service-detail-fast-phone">
                              <div className="features-phone phone-16pro">
                                <div className="phone-side-buttons">
                                  <div className="phone-btn phone-btn-vol-up" />
                                  <div className="phone-btn phone-btn-vol-down" />
                                  <div className="phone-btn phone-btn-action" />
                                  <div className="phone-btn phone-btn-power" />
                                </div>
                                <div className="phone-screen">
                                  <div className="phone-dynamic-island" />
                                  <div className="phone-fast-topbar">
                                    <div className="phone-fast-logo">
                                      <i className="fas fa-wallet" />
                                      <span>MoneyShop</span>
                                    </div>
                                    <div className="phone-fast-avatar">
                                      <i className="fas fa-user-circle" />
                                      <div className="phone-fast-account text-right text-[10px]">
                                        <div className="phone-fast-account-label text-[9px]">MoneyShop No:</div>
                                        <div className="phone-fast-account-value font-mono text-[10px]">12345678</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="phone-fast-header">
                                    {currentIbanSlide.phoneTitle}
                                  </div>
                                  <div className="phone-fast-sub">
                                    {currentIbanSlide.phoneDescription}
                                  </div>
                                  <div className="phone-fast-menu">
                                    {currentIbanSlide.items.map((item, idx) => (
                                      <div key={idx} className="phone-fast-menu-item">
                                        <i className={item.icon} />
                                        <span>{item.label}</span>
                                        <i className="fas fa-chevron-right" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="phone-fast-slider phone-fast-slider-dots-only">
                            <div className="phone-fast-slider-dots">
                              {Array.from({ length: ibanSlidePages.length }).map((_, index) => (
                                <span
                                  key={index}
                                  className={index === ibanSlideIndex ? "active" : ""}
                                  onClick={() => setIbanSlideIndex(index)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeService === "request" && (
                        <div className="service-detail-content">
                          <div className="service-detail-fast-layout">
                            <div className="service-detail-fast-info">
                              <div className="service-detail-header">
                                <div className="service-icon emerald large-icon">
                                  <i className="fas fa-hand-holding-dollar" />
                                </div>
                                <h2>{currentRequestSlide.panelTitle}</h2>
                              </div>
                              <p className="service-detail-desc">{currentRequestSlide.panelDescription}</p>
                              {requestSlideIndex === 0 && (
                                <Link href="/register" className="btn-primary service-fast-cta">
                                  Hemen Başvur <i className="fas fa-arrow-right" />
                                </Link>
                              )}
                            </div>
                            <div className="service-detail-fast-phone">
                              <div className="features-phone phone-16pro">
                                <div className="phone-side-buttons">
                                  <div className="phone-btn phone-btn-vol-up" />
                                  <div className="phone-btn phone-btn-vol-down" />
                                  <div className="phone-btn phone-btn-action" />
                                  <div className="phone-btn phone-btn-power" />
                                </div>
                                <div className="phone-screen">
                                  <div className="phone-dynamic-island" />
                                  <div className="phone-fast-topbar">
                                    <div className="phone-fast-logo">
                                      <i className="fas fa-wallet" />
                                      <span>MoneyShop</span>
                                    </div>
                                    <div className="phone-fast-avatar">
                                      <i className="fas fa-user-circle" />
                                      <div className="phone-fast-account text-right text-[10px]">
                                        <div className="phone-fast-account-label text-[9px]">MoneyShop No:</div>
                                        <div className="phone-fast-account-value font-mono text-[10px]">12345678</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="phone-fast-header">
                                    {currentRequestSlide.phoneTitle}
                                  </div>
                                  <div className="phone-fast-sub">
                                    {currentRequestSlide.phoneDescription}
                                  </div>
                                  <div className="phone-fast-menu">
                                    {currentRequestSlide.items.map((item, idx) => (
                                      <div key={idx} className="phone-fast-menu-item">
                                        <i className={item.icon} />
                                        <span>{item.label}</span>
                                        <i className="fas fa-chevron-right" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="phone-fast-slider phone-fast-slider-dots-only">
                            <div className="phone-fast-slider-dots">
                              {Array.from({ length: requestSlidePages.length }).map((_, index) => (
                                <span
                                  key={index}
                                  className={index === requestSlideIndex ? "active" : ""}
                                  onClick={() => setRequestSlideIndex(index)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeService === "secure" && (
                        <div className="service-detail-content">
                          <div className="service-detail-fast-layout">
                            <div className="service-detail-fast-info">
                              <div className="service-detail-header">
                                <div className="service-icon pink large-icon">
                                  <i className="fas fa-shield-alt" />
                                </div>
                                <h2>{currentSecureSlide.panelTitle}</h2>
                              </div>
                              <p className="service-detail-desc">{currentSecureSlide.panelDescription}</p>
                              {secureSlideIndex === 0 && (
                                <Link href="/register" className="btn-primary service-fast-cta">
                                  Hemen Başvur <i className="fas fa-arrow-right" />
                                </Link>
                              )}
                            </div>
                            <div className="service-detail-fast-phone">
                              <div className="features-phone phone-16pro">
                                <div className="phone-side-buttons">
                                  <div className="phone-btn phone-btn-vol-up" />
                                  <div className="phone-btn phone-btn-vol-down" />
                                  <div className="phone-btn phone-btn-action" />
                                  <div className="phone-btn phone-btn-power" />
                                </div>
                                <div className="phone-screen">
                                  <div className="phone-dynamic-island" />
                                  <div className="phone-fast-topbar">
                                    <div className="phone-fast-logo">
                                      <i className="fas fa-wallet" />
                                      <span>MoneyShop</span>
                                    </div>
                                    <div className="phone-fast-avatar">
                                      <i className="fas fa-user-circle" />
                                      <div className="phone-fast-account text-right text-[10px]">
                                        <div className="phone-fast-account-label text-[9px]">MoneyShop No:</div>
                                        <div className="phone-fast-account-value font-mono text-[10px]">12345678</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="phone-fast-header">
                                    {currentSecureSlide.phoneTitle}
                                  </div>
                                  <div className="phone-fast-sub">
                                    {currentSecureSlide.phoneDescription}
                                  </div>
                                  <div className="phone-fast-menu">
                                    {currentSecureSlide.items.map((item, idx) => (
                                      <div key={idx} className="phone-fast-menu-item">
                                        <i className={item.icon} />
                                        <span>{item.label}</span>
                                        <i className="fas fa-chevron-right" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="phone-fast-slider phone-fast-slider-dots-only">
                            <div className="phone-fast-slider-dots">
                              {Array.from({ length: secureSlidePages.length }).map((_, index) => (
                                <span
                                  key={index}
                                  className={index === secureSlideIndex ? "active" : ""}
                                  onClick={() => setSecureSlideIndex(index)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            {activeSection === "card" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">{t(lang, "card.title")}</span>{" "}
                      <span className="gradient-text">{t(lang, "card.highlight")}</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      {t(lang, "card.subtitle")}
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başvur
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Standart Card */}
                    <div className="hero-stack-card card-standart" style={{position:"relative", top:0, left:0, transform:"none", width:190, height:280, flexShrink:0}}>
                      <div className="card-bg-shine" />
                      <div className="hero-card-top">
                        <div className="hero-card-brand">
                          <i className="fas fa-wallet" />
                          <span>MoneyShop</span>
                        </div>
                        <div className="hero-card-chip">
                          <div className="chip-lines"><div /><div /><div /><div /></div>
                        </div>
                      </div>
                      <div className="hero-card-type">{t(lang, "card.standart.name")}</div>
                      <div className="hero-card-contactless">
                        <svg viewBox="0 0 32 38">
                          <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="hero-card-network"><i className="fab fa-cc-visa" /></div>
                    </div>

                    {/* Silver Card */}
                    <div className="hero-stack-card card-silver" style={{position:"relative", top:0, left:0, transform:"none", width:190, height:280, flexShrink:0}}>
                      <div className="card-bg-shine" />
                      <div className="hero-card-top">
                        <div className="hero-card-brand">
                          <i className="fas fa-wallet" />
                          <span>MoneyShop</span>
                        </div>
                        <div className="hero-card-chip">
                          <div className="chip-lines"><div /><div /><div /><div /></div>
                        </div>
                      </div>
                      <div className="hero-card-type">{t(lang, "card.silver.name")}</div>
                      <div className="hero-card-contactless">
                        <svg viewBox="0 0 32 38">
                          <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="hero-card-network"><i className="fab fa-cc-visa" /></div>
                    </div>

                    {/* Gold Card */}
                    <div className="hero-stack-card card-gold" style={{position:"relative", top:0, left:0, transform:"none", width:190, height:280, flexShrink:0}}>
                      <div className="card-bg-shine" />
                      <div className="hero-card-top">
                        <div className="hero-card-brand">
                          <i className="fas fa-crown" />
                          <span>MoneyShop</span>
                        </div>
                        <div className="hero-card-chip">
                          <div className="chip-lines"><div /><div /><div /><div /></div>
                        </div>
                      </div>
                      <div className="hero-card-type">{t(lang, "card.gold.name")}</div>
                      <div className="hero-card-contactless">
                        <svg viewBox="0 0 32 38">
                          <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div className="hero-card-network"><i className="fab fa-cc-visa" /></div>
                    </div>
                  </div>
                </div>

                {/* Feature boxes */}
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-mobile-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>MoneyShop Mobil'i İndir</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Uygulamayı ücretsiz indir, hemen hesabını oluştur.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-gem" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Harca &amp; Kazan</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Onlarca üye işyerinde harca, harcadıkça kazan!</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-pie" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Paranı Yönet</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Ödemelerin ve para transferlerin tek bir yerde, güvende.</span>
                  </div>
                </div>

                {/* Card comparison section */}
                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Senin MoneyShop Card'ın Hangisi?
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["standart","silver","gold"] as const).map((card) => (
                      <button key={card} onClick={() => setSelectedCard(card)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedCard === card ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedCard === card ? "var(--primary)" : "transparent",
                        color: selectedCard === card ? "#fff" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {card === "standart" ? "Standart" : card === "silver" ? "Silver" : "Gold"} Card
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"center", justifyContent:"center"}}>
                    {/* Card Visual */}
                    <div style={{display:"flex", flexDirection:"column", alignItems:"center", gap:16}}>
                      <div className={`hero-stack-card card-${selectedCard}`} style={{position:"relative", top:0, left:0, transform:"none", width:200, height:290, flexShrink:0}}>
                        <div className="card-bg-shine" />
                        <div className="hero-card-top">
                          <div className="hero-card-brand">
                            <i className={selectedCard === "gold" ? "fas fa-crown" : "fas fa-wallet"} />
                            <span>MoneyShop</span>
                          </div>
                          <div className="hero-card-chip">
                            <div className="chip-lines"><div /><div /><div /><div /></div>
                          </div>
                        </div>
                        <div className="hero-card-type">{t(lang, `card.${selectedCard}.name`)}</div>
                        <div className="hero-card-contactless">
                          <svg viewBox="0 0 32 38">
                            <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                            <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                            <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                            <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <div className="hero-card-network"><i className="fab fa-cc-visa" /></div>
                      </div>

                      {session?.user ? (
                        selectedCard === "standart" ? (
                          <div style={{padding:"10px 24px", borderRadius:12, background:"rgba(34,197,94,0.1)", color:"#16a34a", fontWeight:600, fontSize:14, fontFamily:"inherit"}}>
                            <i className="fas fa-check-circle" style={{marginRight:8, color:"#16a34a"}} />Bu karta sahipsin
                          </div>
                        ) : (
                          <Link href="/card" className="btn-primary" style={{padding:"12px 28px", fontSize:14}}>
                            <i className="fas fa-plus-circle" /> Bu karta sahip ol
                          </Link>
                        )
                      ) : (
                        <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14}}>
                          <i className="fas fa-plus-circle" /> Bu karta sahip ol
                        </Link>
                      )}
                    </div>

                    {/* Benefits */}
                    <div style={{display:"flex", flexDirection:"column", gap:10}}>
                      {selectedCard === "standart" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ücretsiz Başvuru</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Hiçbir ücret ödemeden başvurunu tamamla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-infinity" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>7/24 Harcama Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Harcamalarını anlık olarak mobil uygulamadan takip et.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız teknoloji ile hızlı ve pratik ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her işlemden sonra anında mobil bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>3D Secure ile korunan alışveriş deneyimi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Özel İndirimler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Anlaşmalı üye işyerlerinde özel indirim fırsatları.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Sanal Kart</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Online alışverişler için ücretsiz sanal kart.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedCard === "silver" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ücretsiz Başvuru</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Hiçbir ücret ödemeden başvurunu tamamla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-gift" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>2× Puan</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her harcamada 2 kat puan kazanma fırsatı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-plane" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Seyahat Sigortası</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Yurt içi ve yurt dışı seyahatlerinde ücretsiz sigorta.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız teknoloji ile hızlı ve pratik ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her işlemden sonra anında mobil bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>3D Secure ile korunan alışveriş deneyimi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Özel İndirimler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Premium üye işyerlerinde özel indirim fırsatları.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Sanal Kart</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Online alışverişler için ücretsiz sanal kart.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Yüksek Nakit Avans</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Avantajlı faiz oranlarıyla nakit avans imkanı.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedCard === "gold" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ücretsiz Başvuru</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Hiçbir ücret ödemeden başvurunu tamamla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-crown" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Premium Lounge Erişimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Havalimanlarında premium lounge ücretsiz giriş.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-gem" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>3× Puan</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her harcamada 3 kat puan kazanma ayrıcalığı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız teknoloji ile hızlı ve pratik ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her işlemden sonra anında mobil bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>3D Secure ile korunan alışveriş deneyimi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Özel İndirimler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Elite üye işyerlerinde ayrıcalıklı indirimler.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Sanal Kart</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Online alışverişler için ücretsiz sanal kart.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Yüksek Nakit Avans</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>En avantajlı faiz oranlarıyla yüksek nakit avans.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-headset" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>7/24 Öncelikli Destek</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Öncelikli müşteri hattı ile 7/24 destek.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-user-tie" style={{fontSize:16, color:"var(--accent)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Özel Müşteri Temsilcisi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Size özel atanmış müşteri temsilcisi desteği.</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "investment" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">MoneyShop</span>{" "}
                      <span className="gradient-text">Yatırım</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      Geleceğine yatırım yap. Fon, hisse senedi ve kripto para ile portföyünü büyüt.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Fund Card */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(0,82,255,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-chart-line" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Yatırım<br />Fonları</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Uzman yönetimli</div>
                    </div>
                    {/* Stock Card */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(0,0,0,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-chart-bar" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Hisse<br />Senedi</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Borsa yatırımı</div>
                    </div>
                    {/* Crypto Card */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #1a1a2e 0%, #3d0c11 50%, #6b2020 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(107,32,32,0.3)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-coins" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Kripto<br />Para</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Dijital varlıklar</div>
                    </div>
                  </div>
                </div>

                {/* Feature boxes */}
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-pie" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Çeşitlendirilmiş Portföy</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Farklı varlık sınıflarına yatırım yap, riskini dağıt.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-simple" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anlık Piyasa Takibi</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Canlı verilerle piyasaları anlık olarak izle.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-shield-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli Platform</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Yatırımların lisanslı ve güvenli altyapımızda korunur.</span>
                  </div>
                </div>

                {/* Investment comparison section */}
                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Yatırım Şeklini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["fund","stock","crypto"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedInvest(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedInvest === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedInvest === type ? "var(--primary)" : "transparent",
                        color: selectedInvest === type ? "#fff" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "fund" ? "Yatırım Fonları" : type === "stock" ? "Hisse Senedi" : "Kripto Para"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    {/* Invest Visual */}
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedInvest === "fund" ? "linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)" : selectedInvest === "stock" ? "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" : "linear-gradient(135deg, #1a1a2e 0%, #3d0c11 50%, #6b2020 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedInvest === "fund" ? "0 12px 40px rgba(0,82,255,0.3)" : selectedInvest === "stock" ? "0 12px 40px rgba(0,0,0,0.3)" : "0 12px 40px rgba(107,32,32,0.3)",
                    }}>
                      <i className={selectedInvest === "fund" ? "fas fa-chart-line" : selectedInvest === "stock" ? "fas fa-chart-bar" : "fas fa-coins"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>

                    {/* Benefits */}
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedInvest === "fund" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Uzman Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Profesyonel fon yöneticileri tarafından yönetilen portföyler.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-pie" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çeşitlendirme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Farklı sektör ve varlık sınıflarına yayılmış yatırım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düşük Maliyet</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Düşük yönetim ücretleri ile avantajlı yatırım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-clock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Esnek Vade</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>İstediğiniz zaman giriş ve çıkış imkanı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Şeffaf Raporlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Düzenli portföy raporları ile tam şeffaflık.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-hand-holding-usd" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temettü Geliri</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Düzenli temettü ödemeleri ile ek gelir.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedInvest === "stock" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anlık İşlem</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>BİST ve diğer borsalarda anlık alım satım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Teknik Analiz</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Gelişmiş grafik ve analiz araçları.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fiyat Alarmı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Belirlediğiniz fiyat seviyelerinde anında bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-newspaper" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anlık Haberler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Şirket haberleri ve piyasa gelişmeleri.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-calculator" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kâr/Zarar Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Gerçek zamanlı portföy performans takibi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-flag" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Limit Emir</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Otomatik alım satım için limit emir desteği.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedInvest === "crypto" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-lock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli Saklama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Soğuk cüzdan ve çok katmanlı güvenlik.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hızlı İşlem</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Saniyeler içinde kripto para alım satım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-exchange-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düşük Spread</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Rekabetçi alım satım farkları.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Geniş Portföy</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>100+ farklı kripto para desteği.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Mobil Erişim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>7/24 mobil uygulama üzerinden erişim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Piyasa Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Anlık fiyat ve piyasa verileri.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "payment" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Ödeme</span>{" "}
                      <span className="gradient-text">İşlemleri</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      Hızlı, güvenli ve pratik ödeme çözümleri. İster kartla, ister havale ile dilediğin gibi öde.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Fast Payment */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(13,148,136,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-bolt" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Hızlı<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Tek tıkla öde</div>
                    </div>
                    {/* Recurring Payment */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #6d28d9 0%, #8b5cf6 50%, #a78bfa 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(109,40,217,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-sync-alt" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Düzenli<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Otomatik tekrarla</div>
                    </div>
                    {/* QR Payment */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(3,105,161,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-qrcode" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>QR ile<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Karekodla öde</div>
                    </div>
                  </div>
                </div>

                {/* Feature boxes */}
                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-shield-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli İşlem</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>3D Secure ve uçtan uca şifreleme ile korunur.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-clock" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anlık Onay</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Ödemelerin saniyeler içinde onaylanır.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-mobile-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Mobil Uyumlu</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Her yerden, her cihazdan ödeme yap.</span>
                  </div>
                </div>

                {/* Payment method detail */}
                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Ödeme Yöntemini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["fast","recurring","qr"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedPayment(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedPayment === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedPayment === type ? "var(--primary)" : "transparent",
                        color: selectedPayment === type ? "#fff" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "fast" ? "Hızlı Ödeme" : type === "recurring" ? "Düzenli Ödeme" : "QR ile Ödeme"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    {/* Payment Visual */}
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedPayment === "fast" ? "linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)" : selectedPayment === "recurring" ? "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 50%, #a78bfa 100%)" : "linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #38bdf8 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedPayment === "fast" ? "0 12px 40px rgba(13,148,136,0.3)" : selectedPayment === "recurring" ? "0 12px 40px rgba(109,40,217,0.3)" : "0 12px 40px rgba(3,105,161,0.3)",
                    }}>
                      <i className={selectedPayment === "fast" ? "fas fa-bolt" : selectedPayment === "recurring" ? "fas fa-sync-alt" : "fas fa-qrcode"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>

                    {/* Benefits */}
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedPayment === "fast" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Saniyede İşlem</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödemelerin anında gerçekleşir, bekleme yok.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kart ile Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm banka kartları ve kredi kartları ile ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Cep Telefonu ile Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Telefon numaranla kolayca ödeme yap.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-exchange-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Havale/EFT</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Banka havalesi ve EFT ile ödeme imkanı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-receipt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Dijital Makbuz</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Her işlem sonrası dijital makbuz e-posta ile gönderilir.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-history" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>İşlem Geçmişi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm ödeme geçmişine tek ekrandan eriş.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPayment === "recurring" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-sync-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Otomatik Tekrarlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Belirlediğin aralıklarla otomatik ödeme talimatı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-calendar-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Esnek Zamanlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Günlük, haftalık, aylık tekrarlama seçenekleri.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hatırlatma Bildirimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödeme öncesi ve sonrası anında bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-pause-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Duraklat/Durdur</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>İstediğin zaman ödemeyi duraklat veya iptal et.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-line" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bütçe Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Düzenli ödemelerini bütçene göre planla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-invoice" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fatura Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Faturalarını otomatik öde, gecikme yaşama.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPayment === "qr" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-qrcode" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Karekod ile Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>QR kodu okut, saniyeler içinde öde.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-store" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Mağazada Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Fiziksel mağazalarda temassız QR ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-hand-holding-usd" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kişiden Kişiye Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>QR kodla arkadaşlarına hızlı para gönder.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çevrimdışı Çalışma</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>İnternet olmadan bile QR ödeme al.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bakiye Görüntüleme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödeme öncesi bakiye kontrolü ve onay.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-print" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fiş Üretimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>QR ödeme sonrası dijital fiş oluşturma.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "physical-payment" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Fiziki</span>{" "}
                      <span className="gradient-text">Ödeme Al</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      Mağazanda yüz yüze ödemeleri POS terminali ile güvenle al. Tüm kartları destekler, anında onay.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Kartlı POS */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f87171 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(220,38,38,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-credit-card" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Kartlı<br />POS</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Tüm kartları kabul et</div>
                    </div>
                    {/* Temassız POS */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(194,65,12,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-wifi" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Temassız<br />POS</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Temassız ödeme al</div>
                    </div>
                    {/* Mobil POS */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(30,64,175,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-mobile-alt" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Mobil<br />POS</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Cep telefonunla ödeme al</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-bolt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anında Onay</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Ödemeler saniyeler içinde onaylanır.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-shield-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli İşlem</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>PCI DSS sertifikalı güvenlik altyapısı.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-line" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Raporlama</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Detaylı satış ve işlem raporları.</span>
                  </div>
                </div>

                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    POS Çözümünü Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["pos","contactless","mpos"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedPhysicalPayment(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedPhysicalPayment === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedPhysicalPayment === type ? "var(--primary)" : "transparent",
                        color: selectedPhysicalPayment === type ? "#fff" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "pos" ? "Kartlı POS" : type === "contactless" ? "Temassız POS" : "Mobil POS"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedPhysicalPayment === "pos" ? "linear-gradient(135deg, #b91c1c 0%, #dc2626 50%, #f87171 100%)" : selectedPhysicalPayment === "contactless" ? "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)" : "linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #2563eb 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedPhysicalPayment === "pos" ? "0 12px 40px rgba(220,38,38,0.3)" : selectedPhysicalPayment === "contactless" ? "0 12px 40px rgba(194,65,12,0.3)" : "0 12px 40px rgba(30,64,175,0.3)",
                    }}>
                      <i className={selectedPhysicalPayment === "pos" ? "fas fa-credit-card" : selectedPhysicalPayment === "contactless" ? "fas fa-wifi" : "fas fa-mobile-alt"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedPhysicalPayment === "pos" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tüm Kartları Destekler</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Visa, Mastercard, Troy ve yerel kartlar.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hızlı İşlem</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Saniyeler içinde ödeme onayı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-print" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fiş Çıktısı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Otomatik fiş yazdırma desteği.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Wi-Fi & Kablolu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Hem kablolu hem kablosuz bağlantı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-battery-full" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Uzun Pil Ömrü</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm gün kesintisiz kullanım.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-history" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>İşlem Geçmişi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm işlemlerinizi dashboard'dan takip edin.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPhysicalPayment === "contactless" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Teknoloji</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kartı okut, temassız ödeme al.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Mobil Cüzdan</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Apple Pay, Google Pay desteği.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hızlı Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Saniyeden kısa sürede ödeme tamamlanır.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Güvenli</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tokenizasyon ile güvenli ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-hand-holding-usd" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düşük Limit</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız ödemelerde düşük işlem limiti.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kolay İade</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız işlemlerde kolay iade yönetimi.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPhysicalPayment === "mpos" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Cep Telefonuna POS</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kendi telefonunu POS cihazına dönüştür.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-download" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hızlı Kurulum</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Uygulamayı indir, hemen kullanmaya başla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düşük Maliyet</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ek donanım gerektirmez, düşük komisyon.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bluetooth" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bluetooth Kart Okuyucu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Mini kart okuyucu ile fiziksel kart kabulü.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anlık Rapor</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm satışları anlık görüntüle.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-qrcode" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>QR ile Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>QR kod ile de ödeme kabul et.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "online-payment" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Online</span>{" "}
                      <span className="gradient-text">Ödeme Al</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      E-ticaret sitende veya link ile online ödeme almaya hemen başla. API entegrasyonu ile dakikalar içinde aktif.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Sanal POS */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(5,150,105,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-globe" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Sanal<br />POS</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Web sitende ödeme al</div>
                    </div>
                    {/* Linkle Ödeme */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(190,24,93,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-link" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Linkle<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Link gönder, ödeme al</div>
                    </div>
                    {/* API Entegrasyonu */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #6366f1 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(55,48,163,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-code" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>API<br />Entegrasyon</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Kendi yazılımına entegre et</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-lock" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli Altyapı</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>3D Secure ile korunan ödemeler.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-bolt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Hızlı Entegrasyon</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Dakikalar içinde entegrasyon.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-simple" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Gerçek Zamanlı Takip</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Tüm işlemleri anlık izle.</span>
                  </div>
                </div>

                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Online Ödeme Yöntemini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["virtual","link","api"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedOnlinePayment(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedOnlinePayment === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedOnlinePayment === type ? "var(--primary)" : "transparent",
                        color: selectedOnlinePayment === type ? "#fff" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "virtual" ? "Sanal POS" : type === "link" ? "Linkle Ödeme" : "API Entegrasyon"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedOnlinePayment === "virtual" ? "linear-gradient(135deg, #065f46 0%, #059669 50%, #34d399 100%)" : selectedOnlinePayment === "link" ? "linear-gradient(135deg, #831843 0%, #be185d 50%, #ec4899 100%)" : "linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #6366f1 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedOnlinePayment === "virtual" ? "0 12px 40px rgba(5,150,105,0.3)" : selectedOnlinePayment === "link" ? "0 12px 40px rgba(190,24,93,0.3)" : "0 12px 40px rgba(55,48,163,0.3)",
                    }}>
                      <i className={selectedOnlinePayment === "virtual" ? "fas fa-globe" : selectedOnlinePayment === "link" ? "fas fa-link" : "fas fa-code"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedOnlinePayment === "virtual" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-globe" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Web Sitesi Entegrasyonu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>E-ticaret sitene kolayca entegre et.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çoklu Kart Desteği</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm kredi ve banka kartları ile ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>3D Secure</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Güvenli ödeme için 3D Secure desteği.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-mobile-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Mobil Uyumlu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Responsive ödeme sayfası ile mobil uyumlu.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-language" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çoklu Dil/Para Birimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Farklı dil ve para birimlerinde ödeme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-undo" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>İade Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kolay iade ve geri ödeme işlemleri.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedOnlinePayment === "link" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-link" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ödeme Linki Oluştur</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Bir tıkla ödeme linki oluştur ve gönder.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-whatsapp" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>WhatsApp ile Paylaş</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>WhatsApp, e-posta veya SMS ile link gönder.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-clock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Zaman Aşımı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Linklere süre sınırı koy, güvenliği artır.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-circle" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödeme alındığında anında bildirim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-repeat" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tekrarlanabilir Link</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Aynı linki birden çok kez kullan.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Link Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Gönderilen linklerin durumunu takip et.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedOnlinePayment === "api" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-code" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>REST API</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Modern REST API ile kolay entegrasyon.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-book" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Detaylı Dökümantasyon</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kapsamlı API dökümantasyonu ve örnek kodlar.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-flask" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Test Ortamı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Canlıya geçmeden önce test ortamında dene.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-headset" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Teknik Destek</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Uzman ekibimizle 7/24 teknik destek.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-plug" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Eklenti Desteği</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>WooCommerce, Shopier ve diğer platformlar için hazır eklenti.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Uyumlu ve Güvenli</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>PCI DSS uyumlu API altyapısı.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "payment-distribution" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Ödeme</span>{" "}
                      <span className="gradient-text">Dağıt</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      Toplu ödemelerini tek seferde yap. Tedarikçilerine, çalışanlarına ve iş ortaklarına anında ödeme dağıt.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Toplu Ödeme */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(22,163,74,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-users" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Toplu<br />Ödeme</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Kişilere toplu ödeme yap</div>
                    </div>
                    {/* Tedarikçi Ödemesi */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #422006 0%, #92400e 50%, #d97706 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(146,64,14,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-truck" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Tedarikçi<br />Ödemesi</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Tedarikçilerine öde</div>
                    </div>
                    {/* Komisyon Dağıtımı */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(109,40,217,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-percent" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Komisyon<br />Dağıtımı</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Komisyonları otomatik dağıt</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-bolt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anında Dağıtım</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Ödemeler saniyeler içinde hesaplara ulaşır.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-file-export" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Toplu İşlem</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Yüzlerce kişiye tek seferde ödeme.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-history" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>İşlem Geçmişi</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Detaylı raporlama ve işlem takibi.</span>
                  </div>
                </div>

                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Dağıtım Yöntemini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["bulk","supplier","commission"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedPaymentDist(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedPaymentDist === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedPaymentDist === type ? "var(--primary)" : "transparent",
                        color: selectedPaymentDist === type ? "#fff" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "bulk" ? "Toplu Ödeme" : type === "supplier" ? "Tedarikçi Ödemesi" : "Komisyon Dağıtımı"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedPaymentDist === "bulk" ? "linear-gradient(135deg, #14532d 0%, #16a34a 50%, #4ade80 100%)" : selectedPaymentDist === "supplier" ? "linear-gradient(135deg, #422006 0%, #92400e 50%, #d97706 100%)" : "linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedPaymentDist === "bulk" ? "0 12px 40px rgba(22,163,74,0.3)" : selectedPaymentDist === "supplier" ? "0 12px 40px rgba(146,64,14,0.3)" : "0 12px 40px rgba(109,40,217,0.3)",
                    }}>
                      <i className={selectedPaymentDist === "bulk" ? "fas fa-users" : selectedPaymentDist === "supplier" ? "fas fa-truck" : "fas fa-percent"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedPaymentDist === "bulk" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-users" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Toplu Ödeme Gönderimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>CSV yükle veya manuel ekle, tek seferde gönder.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-csv" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>CSV/Excel Desteği</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Dosyadan toplu ödeme listesi yükle.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-clock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Zamanlanmış Gönderim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ödemeleri istediğin tarihte gönderilmek üzere planla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-check-double" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Onay Süreci</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Çoklu onay ile güvenli gönderim.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bell" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bildirim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Alıcılara SMS/e-posta ile ödeme bildirimi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-invoice" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Raporlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Detaylı dağıtım raporları ve dökümler.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPaymentDist === "supplier" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-truck" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tedarikçi Yönetimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tedarikçilerini ekle, grupla ve yönet.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-invoice" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Fatura Eşleştirme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Faturalarla otomatik ödeme eşleştirme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-calendar-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Düzenli Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tedarikçi ödemelerini otomatikleştir.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-history" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ödeme Geçmişi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tüm tedarikçi ödemelerinin geçmişi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çoklu Para Birimi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Farklı para birimlerinde tedarikçi ödemesi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-line" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Harcama Analizi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tedarikçi bazında harcama analizi.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedPaymentDist === "commission" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-percent" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Otomatik Hesaplama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Belirlenen oranlarda otomatik komisyon hesaplama.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-users" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bayi/Üye Komisyonu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Bayi ve üyelerine otomatik komisyon dağıt.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-clock" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Periyodik Dağıtım</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Günlük, haftalık, aylık otomatik komisyon dağıtımı.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-file-invoice" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Raporlama</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Detaylı komisyon raporları ve vergi dökümleri.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Performans Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Bayi/üye bazında performans ve komisyon takibi.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-arrow-right" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hesaba Aktarım</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Komisyonları doğrudan banka hesaplarına aktar.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeSection === "card-solutions" && (
              <div className="service-detail">
                <div style={{display:"flex", gap:60, alignItems:"center"}}>
                  <div style={{flex:1}}>
                    <h2 style={{fontSize:50, fontWeight:800, lineHeight:1.15, marginBottom:20}}>
                      <span className="gradient-text">Kart</span>{" "}
                      <span className="gradient-text">Çözümleri</span>
                    </h2>
                    <p style={{fontSize:16, lineHeight:1.7, color:"var(--gray-5)", maxWidth:540, marginBottom:28}}>
                      İşletmen için fiziki, sanal veya ön ödemeli kart çözümleri. Tüm kartların yönetimi tek dashboard'da.
                    </p>
                    <Link href="/register" className="btn-primary">
                      <i className="fas fa-paper-plane" /> Hemen Başla
                    </Link>
                  </div>
                  <div style={{display:"flex", gap:24, padding:"20px 0"}}>
                    {/* Fiziki Kart */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(0,82,255,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-credit-card" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Fiziki<br />Kart</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Fiziksel kurumsal kart</div>
                    </div>
                    {/* Sanal Kart */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(109,40,217,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-qrcode" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Sanal<br />Kart</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Dijital kurumsal kart</div>
                    </div>
                    {/* Ön Ödemeli Kart */}
                    <div style={{
                      width:170, height:240, borderRadius:16, flexShrink:0,
                      background:"linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
                      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12,
                      boxShadow:"0 8px 30px rgba(194,65,12,0.25)", color:"#fff", padding:20
                    }}>
                      <i className="fas fa-gift" style={{fontSize:36}} />
                      <div style={{fontWeight:700, fontSize:14, textAlign:"center"}}>Ön Ödemeli<br />Kart</div>
                      <div style={{fontSize:11, opacity:0.8, textAlign:"center"}}>Bütçe dostu kart</div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display:"grid",
                  gridTemplateColumns:"repeat(3, 1fr)",
                  gap:20,
                  marginTop:40
                }}>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-shield-alt" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Güvenli</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>EMV çip teknolojisi ile güvenli kartlar.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-sliders-h" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Limit Kontrolü</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Kart bazında harcama limiti belirle.</span>
                  </div>
                  <div className="service-feature" style={{flexDirection:"column", alignItems:"center", textAlign:"center", padding:"28px 24px", background:"#fff", border:"1px solid var(--gray-3)"}}>
                    <i className="fas fa-chart-simple" style={{fontSize:32, marginBottom:12}} />
                    <strong style={{fontSize:16}}>Anlık Yönetim</strong>
                    <span style={{fontSize:13, lineHeight:1.6}}>Tüm kartları dashboard'dan yönet.</span>
                  </div>
                </div>

                <div style={{marginTop:60}}>
                  <h3 style={{fontSize:32, fontWeight:800, textAlign:"center", marginBottom:30}}>
                    Kart Tipini Seç
                  </h3>
                  <div style={{display:"flex", justifyContent:"center", gap:12, marginBottom:36}}>
                    {(["physical","virtual","prepaid"] as const).map((type) => (
                      <button key={type} onClick={() => setSelectedCardSolution(type)} style={{
                        padding:"12px 28px", borderRadius:12,
                        border: selectedCardSolution === type ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                        background: selectedCardSolution === type ? "var(--primary)" : "transparent",
                        color: selectedCardSolution === type ? "#fff" : "var(--gray-5)",
                        fontWeight:600, fontSize:15, cursor:"pointer", fontFamily:"inherit", transition:"all 0.3s ease"
                      }}>
                        {type === "physical" ? "Fiziki Kart" : type === "virtual" ? "Sanal Kart" : "Ön Ödemeli Kart"}
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex", gap:50, alignItems:"flex-start", justifyContent:"center"}}>
                    <div style={{
                      width:200, height:200, borderRadius:24, flexShrink:0,
                      background: selectedCardSolution === "physical" ? "linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)" : selectedCardSolution === "virtual" ? "linear-gradient(135deg, #2d1b69 0%, #6d28d9 50%, #a78bfa 100%)" : "linear-gradient(135deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
                      display:"flex", alignItems:"center", justifyContent:"center", marginTop:10,
                      boxShadow: selectedCardSolution === "physical" ? "0 12px 40px rgba(0,82,255,0.3)" : selectedCardSolution === "virtual" ? "0 12px 40px rgba(109,40,217,0.3)" : "0 12px 40px rgba(194,65,12,0.3)",
                    }}>
                      <i className={selectedCardSolution === "physical" ? "fas fa-credit-card" : selectedCardSolution === "virtual" ? "fas fa-qrcode" : "fas fa-gift"} style={{fontSize:64, color:"rgba(255,255,255,0.9)"}} />
                    </div>
                    <div style={{display:"flex", flexDirection:"column", gap:10, maxWidth:480}}>
                      {selectedCardSolution === "physical" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-credit-card" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>EMV Çipli Kart</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Güvenli EMV çip teknolojisi ile donatılmış kart.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wifi" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Temassız Ödeme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Temassız ödeme teknolojisi ile hızlı işlem.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-user-tie" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Çalışan Kartı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Çalışanların için bireysel kart çıkar.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-sliders-h" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Harcama Limiti</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kart bazında harcama limiti belirleme.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-globe" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Yurt Dışı Kullanım</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Yurt dışı harcamalarına izin ver/kısıtla.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-ban" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Dondurma</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kaybolan kartı anında dondur.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedCardSolution === "virtual" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-bolt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Anında Üretim</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Sanal kartın saniyeler içinde oluştur.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-globe" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Online Alışveriş</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>İnternet alışverişlerinde güvenle kullan.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-sync" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tek Kullanımlık</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Tek kullanımlık sanal kart numarası.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-wallet" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Dijital Cüzdan</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Apple Pay ve Google Wallet ile uyumlu.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bütçe Kontrolü</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Sanal kart bazında harcama sınırı koy.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-trash-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Kolay İptal</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kullanmadığın kartı tek tıkla iptal et.</span>
                            </div>
                          </div>
                        </>
                      )}
                      {selectedCardSolution === "prepaid" && (
                        <>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-gift" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Hediye Kartı</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Müşterilerine hediye kartı çıkar.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-coins" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Ön Yükleme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Karta önceden bakiye yükle, harcama kontrolü sende.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-chart-simple" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Harcama Takibi</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Ön ödemeli kart harcamalarını anlık takip et.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-shield-alt" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Bütçe Dostu</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Yüklediğin kadar harca, borçlanma riski yok.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-repeat" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Tekrar Yükleme</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Kartı dilediğin zaman tekrar yükleyebilirsin.</span>
                            </div>
                          </div>
                          <div className="service-feature" style={{gap:12, padding:"12px 16px", background:"#fff", border:"1px solid var(--gray-3)", borderRadius:14}}>
                            <i className="fas fa-users" style={{fontSize:16, color:"var(--primary)"}} />
                            <div>
                              <strong style={{fontSize:13}}>Toplu Kart Çıkarma</strong>
                              <span style={{fontSize:12, color:"var(--gray-5)", marginTop:2, display:"block"}}>Toplu ön ödemeli kart siparişi.</span>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href="/register" className="btn-primary" style={{padding:"12px 28px", fontSize:14, textAlign:"center"}}>
                        <i className="fas fa-plus-circle" /> Hemen Başla
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
      <>
      {/* ========== TRUSTED BY ========== */}
      <section className="trusted-section">
        <div className="trusted-container">
          <p className="trusted-title">{t(lang, "trusted.title")}</p>
          <div className="trusted-logos">
            <div className="trusted-logo">
              <i className="fas fa-university" />
              {t(lang, "trusted.centralBank")}
            </div>
            <div className="trusted-logo">
              <i className="fas fa-landmark" />
              {t(lang, "trusted.krg")}
            </div>
            <div className="trusted-logo">
              <i className="fas fa-building" />
              {t(lang, "trusted.iqBanks")}
            </div>
            <div className="trusted-logo">
              <i className="fas fa-store" />
              {t(lang, "trusted.merchants")}
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES ========== */}
      <section className="section" id="services">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">
              <i className="fas fa-cogs" />
              {t(lang, "services.title")}
            </div>
            <h2 className="section-title">
              {t(lang, "services.title")} <span className="highlight">{t(lang, "services.highlight")}</span>
            </h2>
            <p className="section-subtitle">{t(lang, "services.subtitle")}</p>
          </div>

          <div className="services-grid">
            <div className="service-card animate-on-scroll">
              <div className="service-icon blue">
                <i className="fas fa-cash-register" />
              </div>
              <h3>{t(lang, "services.posTitle")}</h3>
              <p>{t(lang, "services.posDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon green">
                <i className="fas fa-globe" />
              </div>
              <h3>{t(lang, "services.gatewayTitle")}</h3>
              <p>{t(lang, "services.gatewayDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon orange">
                <i className="fas fa-store" />
              </div>
              <h3>{t(lang, "services.merchantTitle")}</h3>
              <p>{t(lang, "services.merchantDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon purple">
                <i className="fas fa-sync-alt" />
              </div>
              <h3>{t(lang, "services.settlementTitle")}</h3>
              <p>{t(lang, "services.settlementDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon red">
                <i className="fas fa-university" />
              </div>
              <h3>{t(lang, "services.bankTitle")}</h3>
              <p>{t(lang, "services.bankDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon yellow">
                <i className="fas fa-link" />
              </div>
              <h3>{t(lang, "services.linksTitle")}</h3>
              <p>{t(lang, "services.linksDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
          </div>

          <div className="services-subsection">
            <h3 className="services-subsection-title">
              <i className="fas fa-bolt" />
              {t(lang, "services.transfersTitle")}
            </h3>
          </div>

          <div className="services-grid">
            <div className="service-card animate-on-scroll">
              <div className="service-icon teal">
                <i className="fas fa-bolt" />
              </div>
              <h3>{t(lang, "services.fastTitle")}</h3>
              <p>{t(lang, "services.fastDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon cyan">
                <i className="fas fa-right-left" />
              </div>
              <h3>{t(lang, "services.eftTitle")}</h3>
              <p>{t(lang, "services.eftDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon sky">
                <i className="fas fa-globe" />
              </div>
              <h3>{t(lang, "services.internationalTitle")}</h3>
              <p>{t(lang, "services.internationalDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon indigo">
                <i className="fas fa-qrcode" />
              </div>
              <h3>{t(lang, "services.ibanTitle")}</h3>
              <p>{t(lang, "services.ibanDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon emerald">
                <i className="fas fa-hand-holding-dollar" />
              </div>
              <h3>{t(lang, "services.requestTitle")}</h3>
              <p>{t(lang, "services.requestDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
            <div className="service-card animate-on-scroll">
              <div className="service-icon pink">
                <i className="fas fa-shield-alt" />
              </div>
              <h3>{t(lang, "services.secureTitle")}</h3>
              <p>{t(lang, "services.secureDesc")}</p>
              <a href="#" className="service-link">
                <i className="fas fa-arrow-right" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== MONEYSHOP CARD ========== */}
      <section className="section card-section" id="card">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">
              <i className="fas fa-credit-card" />
              {t(lang, "card.title")}
            </div>
            <h2 className="section-title">
              {t(lang, "card.title")} <span className="highlight">{t(lang, "card.highlight")}</span>
            </h2>
            <p className="section-subtitle">{t(lang, "card.subtitle")}</p>
          </div>

          <div className="cards-grid">
            {/* Standart */}
            <div className="card-tier animate-on-scroll">
              <div className="hero-card-flipper">
                <div className="hero-card-inner">
                  <div className="hero-card-front card-standart">
                    <div className="card-bg-shine" />
                    <div className="hero-card-top">
                      <div className="hero-card-brand">
                        <i className="fas fa-wallet" />
                        <span>MoneyShop</span>
                      </div>
                      <div className="hero-card-chip">
                        <div className="chip-lines">
                          <div /><div /><div /><div />
                        </div>
                      </div>
                    </div>
                    <div className="hero-card-type">{t(lang, "card.standart.name")}</div>
                    <div className="hero-card-contactless">
                      <svg viewBox="0 0 32 38">
                        <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="hero-card-network">
                      <i className="fab fa-cc-mastercard" />
                    </div>
                  </div>
                  <div className="hero-card-back card-standart">
                    <div className="card-magnetic-strip" />
                    <div className="card-back-content">
                      <div className="card-cvv-row">
                        <span className="hero-card-label">CVV</span>
                        <span className="hero-card-value">***</span>
                      </div>
                      <div className="card-number-full">**** **** **** 4582</div>
                      <div className="card-back-row">
                        <div className="card-back-field">
                          <span className="hero-card-label">KART SAHİBİ</span>
                          <span className="hero-card-value">MUSTAFA K.</span>
                        </div>
                        <div className="card-back-field">
                          <span className="hero-card-label">SON KULLANMA</span>
                          <span className="hero-card-value">12/28</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="card-tier-name">{t(lang, "card.standart.name")}</h3>
              <div className="card-tier-price">
                <span className="price">{t(lang, "card.standart.price")}</span>
                <span className="period">{t(lang, "card.standart.period")}</span>
              </div>
              <ul className="card-tier-features">
                {tArray(lang, "card.standart.features").map((f, i) => (
                  <li key={i}>
                    <i className="fas fa-check" /> {f}
                  </li>
                ))}
              </ul>
              <a href="/register" className="card-tier-btn">
                {t(lang, "card.standart.cta")}
              </a>
            </div>

            {/* Silver */}
            <div className="card-tier animate-on-scroll popular">
              <div className="card-tier-badge">{t(lang, "card.popular")}</div>
              <div className="hero-card-flipper">
                <div className="hero-card-inner">
                  <div className="hero-card-front card-silver">
                    <div className="card-bg-shine" />
                    <div className="hero-card-top">
                      <div className="hero-card-brand">
                        <i className="fas fa-wallet" />
                        <span>MoneyShop</span>
                      </div>
                      <div className="hero-card-chip">
                        <div className="chip-lines">
                          <div /><div /><div /><div />
                        </div>
                      </div>
                    </div>
                    <div className="hero-card-type">{t(lang, "card.silver.name")}</div>
                    <div className="hero-card-contactless">
                      <svg viewBox="0 0 32 38">
                        <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="hero-card-network">
                      <i className="fab fa-cc-visa" />
                    </div>
                  </div>
                  <div className="hero-card-back card-silver">
                    <div className="card-magnetic-strip" />
                    <div className="card-back-content">
                      <div className="card-cvv-row">
                        <span className="hero-card-label">CVV</span>
                        <span className="hero-card-value">***</span>
                      </div>
                      <div className="card-number-full">**** **** **** 6731</div>
                      <div className="card-back-row">
                        <div className="card-back-field">
                          <span className="hero-card-label">KART SAHİBİ</span>
                          <span className="hero-card-value">MUSTAFA K.</span>
                        </div>
                        <div className="card-back-field">
                          <span className="hero-card-label">SON KULLANMA</span>
                          <span className="hero-card-value">12/28</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="card-tier-name">{t(lang, "card.silver.name")}</h3>
              <div className="card-tier-price">
                <span className="price">{t(lang, "card.silver.price")}</span>
                <span className="period">{t(lang, "card.silver.period")}</span>
              </div>
              <ul className="card-tier-features">
                {tArray(lang, "card.silver.features").map((f, i) => (
                  <li key={i}>
                    <i className="fas fa-check" /> {f}
                  </li>
                ))}
              </ul>
              <a href="/register" className="card-tier-btn silver-btn">
                {t(lang, "card.silver.cta")}
              </a>
            </div>

            {/* Gold */}
            <div className="card-tier animate-on-scroll">
              <div className="hero-card-flipper">
                <div className="hero-card-inner">
                  <div className="hero-card-front card-gold">
                    <div className="card-bg-shine" />
                    <div className="hero-card-top">
                      <div className="hero-card-brand">
                        <i className="fas fa-crown" />
                        <span>MoneyShop</span>
                      </div>
                      <div className="hero-card-chip">
                        <div className="chip-lines">
                          <div /><div /><div /><div />
                        </div>
                      </div>
                    </div>
                    <div className="hero-card-type">{t(lang, "card.gold.name")}</div>
                    <div className="hero-card-contactless">
                      <svg viewBox="0 0 32 38">
                        <path d="M 4 17 A 2 3 0 0 1 4 23" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M 8 14 A 4 6 0 0 1 8 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M 13 11 A 6 9 0 0 1 13 29" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M 19 8 A 8 12 0 0 1 19 32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="hero-card-network">
                      <i className="fab fa-cc-visa" />
                    </div>
                  </div>
                  <div className="hero-card-back card-gold">
                    <div className="card-magnetic-strip" />
                    <div className="card-back-content">
                      <div className="card-cvv-row">
                        <span className="hero-card-label">CVV</span>
                        <span className="hero-card-value">***</span>
                      </div>
                      <div className="card-number-full">**** **** **** 8904</div>
                      <div className="card-back-row">
                        <div className="card-back-field">
                          <span className="hero-card-label">KART SAHİBİ</span>
                          <span className="hero-card-value">MUSTAFA K.</span>
                        </div>
                        <div className="card-back-field">
                          <span className="hero-card-label">SON KULLANMA</span>
                          <span className="hero-card-value">12/30</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="card-tier-name">{t(lang, "card.gold.name")}</h3>
              <div className="card-tier-price">
                <span className="price">{t(lang, "card.gold.price")}</span>
                <span className="period">{t(lang, "card.gold.period")}</span>
              </div>
              <ul className="card-tier-features">
                {tArray(lang, "card.gold.features").map((f, i) => (
                  <li key={i}>
                    <i className="fas fa-check" /> {f}
                  </li>
                ))}
              </ul>
              <a href="/register" className="card-tier-btn gold-btn">
                {t(lang, "card.gold.cta")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="section how-it-works" id="how-it-works">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">
              <i className="fas fa-route" />
              {t(lang, "how.title")}
            </div>
            <h2 className="section-title">
              {t(lang, "how.title")} <span className="highlight">{t(lang, "how.highlight")}</span>
            </h2>
            <p className="section-subtitle">{t(lang, "how.subtitle")}</p>
          </div>

          <div className="steps-container">
            <div className="step-card animate-on-scroll">
              <div className="step-number">1</div>
              <h3>{t(lang, "how.step1Title")}</h3>
              <p>{t(lang, "how.step1Desc")}</p>
            </div>
            <div className="step-card animate-on-scroll">
              <div className="step-number">2</div>
              <h3>{t(lang, "how.step2Title")}</h3>
              <p>{t(lang, "how.step2Desc")}</p>
            </div>
            <div className="step-card animate-on-scroll">
              <div className="step-number">3</div>
              <h3>{t(lang, "how.step3Title")}</h3>
              <p>{t(lang, "how.step3Desc")}</p>
            </div>
            <div className="step-card animate-on-scroll">
              <div className="step-number">4</div>
              <h3>{t(lang, "how.step4Title")}</h3>
              <p>{t(lang, "how.step4Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="section" id="features">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">
              <i className="fas fa-star" />
              {t(lang, "features.title")}
            </div>
            <h2 className="section-title">
              {t(lang, "features.title")} <span className="highlight">{t(lang, "features.highlight")}</span>
            </h2>
            <p className="section-subtitle">{t(lang, "features.subtitle")}</p>
          </div>

          <div className="features-grid">
            <div className="features-visual animate-on-scroll">
              <div className="hero-visual-inner">
              <div className="features-phone phone-16pro">
                <div className="phone-side-buttons">
                  <div className="phone-btn phone-btn-vol-up" />
                  <div className="phone-btn phone-btn-vol-down" />
                  <div className="phone-btn phone-btn-action" />
                  <div className="phone-btn phone-btn-power" />
                </div>
                <div className="phone-screen">
                  <div className="phone-dynamic-island" />
                  <div className="phone-content">
                    <div className="phone-topbar">
                      <div className="phone-topbar-logo">
                        <i className="fas fa-wallet" />
                        <span>MoneyShop</span>
                      </div>
                      <div className="phone-topbar-greeting">
                        {t(lang, "features.phoneGreeting")} 👋
                      </div>
                    </div>
                    <div className="phone-balance-card">
                      <div className="phone-balance-label">Hesabım</div>
                      <div className="phone-balance-amount">250.000 TL</div>
                      <div className="phone-iban-row">
                        <span className="phone-iban-label">İBAN</span>
                        <span className="phone-iban-value">IQ12 0001 2345 6789 0123</span>
                      </div>
                    </div>
                    <div className="phone-actions">
                      <div className="phone-action">
                        <div className="phone-action-icon">
                          <i className="fas fa-qrcode" />
                        </div>
                        <div className="phone-action-label">{t(lang, "features.phoneScan")}</div>
                      </div>
                      <div className="phone-action">
                        <div className="phone-action-icon">
                          <i className="fas fa-paper-plane" />
                        </div>
                        <div className="phone-action-label">{t(lang, "features.phoneTransfer")}</div>
                      </div>
                      <div className="phone-action">
                        <div className="phone-action-icon">
                          <i className="fas fa-chart-bar" />
                        </div>
                        <div className="phone-action-label">{t(lang, "features.phoneReports")}</div>
                      </div>
                      <div className="phone-action">
                        <div className="phone-action-icon">
                          <i className="fas fa-ellipsis-h" />
                        </div>
                        <div className="phone-action-label">{""}</div>
                      </div>
                    </div>
                    <div className="phone-recent">{t(lang, "features.phoneRecent")}</div>
                    <div className="phone-transaction">
                      <div className="phone-transaction-left">
                        <div className="phone-tx-icon">
                          <i className="fas fa-arrow-down" />
                        </div>
                        <div>
                          <div className="phone-tx-name">Gelen Transfer</div>
                          <div className="phone-tx-date">Ahmet Yılmaz</div>
                        </div>
                      </div>
                      <div className="phone-tx-right">
                        <div className="phone-tx-amount">+120.000 TL</div>
                        <div className="phone-tx-time">Bugün 10:00</div>
                      </div>
                    </div>
                    <div className="phone-transaction">
                      <div className="phone-transaction-left">
                        <div className="phone-tx-icon">
                          <i className="fas fa-arrow-up" />
                        </div>
                        <div>
                          <div className="phone-tx-name">Giden Transfer</div>
                          <div className="phone-tx-date">Zeynep Kaya</div>
                        </div>
                      </div>
                      <div className="phone-tx-right">
                        <div className="phone-tx-amount outgoing">-50.000 TL</div>
                        <div className="phone-tx-time">01.06.2026</div>
                      </div>
                    </div>
                    <div className="phone-transaction">
                      <div className="phone-transaction-left">
                        <div className="phone-tx-icon">
                          <i className="fas fa-shopping-cart" />
                        </div>
                        <div>
                          <div className="phone-tx-name">Alışveriş - Amazon</div>
                          <div className="phone-tx-date">Online</div>
                        </div>
                      </div>
                      <div className="phone-tx-right">
                        <div className="phone-tx-amount outgoing">-5.000 TL</div>
                        <div className="phone-tx-time">31.05.2026</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
            <div className="features-list animate-on-scroll">
              <div className="feature-item">
                <div className="feature-item-icon blue">
                  <i className="fas fa-tachometer-alt" />
                </div>
                <div>
                  <h4>{t(lang, "features.dashboardTitle")}</h4>
                  <p>{t(lang, "features.dashboardDesc")}</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-item-icon green">
                  <i className="fas fa-shield-alt" />
                </div>
                <div>
                  <h4>{t(lang, "features.securityTitle")}</h4>
                  <p>{t(lang, "features.securityDesc")}</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-item-icon orange">
                  <i className="fas fa-coins" />
                </div>
                <div>
                  <h4>{t(lang, "features.iqdTitle")}</h4>
                  <p>{t(lang, "features.iqdDesc")}</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-item-icon purple">
                  <i className="fas fa-code" />
                </div>
                <div>
                  <h4>{t(lang, "features.apiTitle")}</h4>
                  <p>{t(lang, "features.apiDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== COMPLIANCE ========== */}
      <section className="section compliance-section" id="compliance">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">
              <i className="fas fa-shield-alt" />
              {t(lang, "compliance.title")}
            </div>
            <h2 className="section-title">
              {t(lang, "compliance.title")} <span className="highlight">{t(lang, "compliance.highlight")}</span>
            </h2>
            <p className="section-subtitle">{t(lang, "compliance.subtitle")}</p>
          </div>

          <div className="compliance-grid">
            <div className="compliance-card animate-on-scroll">
              <div className="compliance-icon shield">
                <i className="fas fa-user-shield" />
              </div>
              <h3>{t(lang, "compliance.kycTitle")}</h3>
              <p>{t(lang, "compliance.kycDesc")}</p>
            </div>
            <div className="compliance-card animate-on-scroll">
              <div className="compliance-icon lock">
                <i className="fas fa-lock" />
              </div>
              <h3>{t(lang, "compliance.dataTitle")}</h3>
              <p>{t(lang, "compliance.dataDesc")}</p>
            </div>
            <div className="compliance-card animate-on-scroll">
              <div className="compliance-icon eye">
                <i className="fas fa-search" />
              </div>
              <h3>{t(lang, "compliance.monitoringTitle")}</h3>
              <p>{t(lang, "compliance.monitoringDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ROADMAP ========== */}
      <section className="section" id="roadmap">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">
              <i className="fas fa-road" />
              {t(lang, "roadmap.title")}
            </div>
            <h2 className="section-title">
              {t(lang, "roadmap.title")} <span className="highlight">{t(lang, "roadmap.highlight")}</span>
            </h2>
            <p className="section-subtitle">{t(lang, "roadmap.subtitle")}</p>
          </div>

          <div className="roadmap-container">
            <div className="roadmap-line" />
            <div className="roadmap-item animate-on-scroll">
              <div className="roadmap-content">
                <span className="roadmap-phase phase-1">{t(lang, "roadmap.phase1")}</span>
                <h3>{t(lang, "roadmap.phase1Title")}</h3>
                <ul className="roadmap-list">
                  {tArray(lang, "roadmap.phase1Items").map((item, i) => (
                    <li key={i}>
                      <i className="fas fa-check-circle" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="roadmap-dot" />
            </div>
            <div className="roadmap-item animate-on-scroll">
              <div className="roadmap-content">
                <span className="roadmap-phase phase-2">{t(lang, "roadmap.phase2")}</span>
                <h3>{t(lang, "roadmap.phase2Title")}</h3>
                <ul className="roadmap-list">
                  {tArray(lang, "roadmap.phase2Items").map((item, i) => (
                    <li key={i}>
                      <i className="fas fa-check-circle" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="roadmap-dot" />
            </div>
            <div className="roadmap-item animate-on-scroll">
              <div className="roadmap-content">
                <span className="roadmap-phase phase-3">{t(lang, "roadmap.phase3")}</span>
                <h3>{t(lang, "roadmap.phase3Title")}</h3>
                <ul className="roadmap-list">
                  {tArray(lang, "roadmap.phase3Items").map((item, i) => (
                    <li key={i}>
                      <i className="fas fa-check-circle" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="roadmap-dot" />
            </div>
          </div>
        </div>
      </section>

      {/* ========== IMPACT ========== */}
      <section className="section impact-section" id="impact">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">
              <i className="fas fa-chart-line" />
              {t(lang, "impact.title")}
            </div>
            <h2 className="section-title">
              {t(lang, "impact.title")} <span className="highlight">{t(lang, "impact.highlight")}</span>
            </h2>
            <p className="section-subtitle">{t(lang, "impact.subtitle")}</p>
          </div>

          <div className="impact-grid">
            <div className="impact-card animate-on-scroll">
              <div className="impact-icon">
                <i className="fas fa-mobile-alt" />
              </div>
              <h3>{t(lang, "impact.digitalTitle")}</h3>
              <p>{t(lang, "impact.digitalDesc")}</p>
            </div>
            <div className="impact-card animate-on-scroll">
              <div className="impact-icon">
                <i className="fas fa-file-invoice-dollar" />
              </div>
              <h3>{t(lang, "impact.formalTitle")}</h3>
              <p>{t(lang, "impact.formalDesc")}</p>
            </div>
            <div className="impact-card animate-on-scroll">
              <div className="impact-icon">
                <i className="fas fa-bolt" />
              </div>
              <h3>{t(lang, "impact.fastTitle")}</h3>
              <p>{t(lang, "impact.fastDesc")}</p>
            </div>
            <div className="impact-card animate-on-scroll">
              <div className="impact-icon">
                <i className="fas fa-hand-holding-usd" />
              </div>
              <h3>{t(lang, "impact.regionalTitle")}</h3>
              <p>{t(lang, "impact.regionalDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== TECH STACK ========== */}
      <section className="section" id="tech">
        <div className="section-container">
          <div className="section-header animate-on-scroll">
            <div className="section-label">
              <i className="fas fa-microchip" />
              {t(lang, "tech.title")}
            </div>
            <h2 className="section-title">
              {t(lang, "tech.title")} <span className="highlight">{t(lang, "tech.highlight")}</span>
            </h2>
            <p className="section-subtitle">{t(lang, "tech.subtitle")}</p>
          </div>

          <div className="tech-grid">
            <div className="tech-card animate-on-scroll">
              <div className="tech-card-icon">
                <i className="fas fa-desktop" />
              </div>
              <h4>Frontend</h4>
              <div className="tech-tags">
                <span className="tech-tag">React</span>
                <span className="tech-tag">Next.js</span>
                <span className="tech-tag">TypeScript</span>
              </div>
            </div>
            <div className="tech-card animate-on-scroll">
              <div className="tech-card-icon">
                <i className="fas fa-server" />
              </div>
              <h4>Backend</h4>
              <div className="tech-tags">
                <span className="tech-tag">.NET Core</span>
                <span className="tech-tag">Node.js</span>
                <span className="tech-tag">Java Spring</span>
              </div>
            </div>
            <div className="tech-card animate-on-scroll">
              <div className="tech-card-icon">
                <i className="fas fa-database" />
              </div>
              <h4>Database</h4>
              <div className="tech-tags">
                <span className="tech-tag">PostgreSQL</span>
                <span className="tech-tag">SQL Server</span>
                <span className="tech-tag">Redis</span>
              </div>
            </div>
            <div className="tech-card animate-on-scroll">
              <div className="tech-card-icon">
                <i className="fas fa-mobile-alt" />
              </div>
              <h4>Mobile</h4>
              <div className="tech-tags">
                <span className="tech-tag">Flutter</span>
                <span className="tech-tag">Dart</span>
                <span className="tech-tag">Firebase</span>
              </div>
            </div>
            <div className="tech-card animate-on-scroll">
              <div className="tech-card-icon">
                <i className="fas fa-shield-alt" />
              </div>
              <h4>Security</h4>
              <div className="tech-tags">
                <span className="tech-tag">OAuth 2.0</span>
                <span className="tech-tag">JWT</span>
                <span className="tech-tag">2FA</span>
              </div>
            </div>
            <div className="tech-card animate-on-scroll">
              <div className="tech-card-icon">
                <i className="fas fa-cloud" />
              </div>
              <h4>Infrastructure</h4>
              <div className="tech-tags">
                <span className="tech-tag">AWS</span>
                <span className="tech-tag">Docker</span>
                <span className="tech-tag">Kubernetes</span>
              </div>
            </div>
            <div className="tech-card animate-on-scroll">
              <div className="tech-card-icon">
                <i className="fas fa-plug" />
              </div>
              <h4>Integration</h4>
              <div className="tech-tags">
                <span className="tech-tag">REST API</span>
                <span className="tech-tag">Webhooks</span>
                <span className="tech-tag">SDK</span>
              </div>
            </div>
            <div className="tech-card animate-on-scroll">
              <div className="tech-card-icon">
                <i className="fas fa-chart-pie" />
              </div>
              <h4>Analytics</h4>
              <div className="tech-tags">
                <span className="tech-tag">Grafana</span>
                <span className="tech-tag">ELK Stack</span>
                <span className="tech-tag">Prometheus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="cta-section" id="contact">
        <div className="hero-grid" />
        <div className="cta-container animate-on-scroll">
          <h2 dangerouslySetInnerHTML={{ __html: t(lang, "cta.title") }} />
          <p>{t(lang, "cta.description")}</p>
          <div className="cta-buttons">
            <Link href="/register" className="btn-cta-primary">
              <i className="fas fa-rocket" />
              {t(lang, "cta.primary")}
            </Link>
            <a href="#contact" className="btn-cta-secondary">
              <i className="fas fa-phone" />
              {t(lang, "cta.secondary")}
            </a>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
            <a href="/" className="logo" onClick={(e) => { e.preventDefault(); scrollToTop(); setActiveType("default"); }}>
                <div className="logo-icon">
                  <i className="fas fa-wallet" />
                </div>
                <span className="logo-text">
                  Money<span>Shop</span>
                </span>
              </a>
              <p>{t(lang, "footer.description")}</p>
              <div className="footer-social">
                <a href="#">
                  <i className="fab fa-linkedin-in" />
                </a>
                <a href="#">
                  <i className="fab fa-twitter" />
                </a>
                <a href="#">
                  <i className="fab fa-instagram" />
                </a>
                <a href="#">
                  <i className="fab fa-facebook-f" />
                </a>
                <a href="#">
                  <i className="fab fa-telegram-plane" />
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h4>{t(lang, "footer.services")}</h4>
              <ul>
                {tArray(lang, "footer.servicesList").map((item, i) => (
                  <li key={i}>
                    <a href="#">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t(lang, "footer.company")}</h4>
              <ul>
                {tArray(lang, "footer.companyList").map((item, i) => (
                  <li key={i}>
                    <a href="#">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t(lang, "footer.legal")}</h4>
              <ul>
                {tArray(lang, "footer.legalList").map((item, i) => (
                  <li key={i}>
                    <a href="#">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="footer-column">
              <h4>{t(lang, "footer.contact")}</h4>
              <ul>
                <li>
                  <a href="#">
                    <i className="fas fa-map-marker-alt" /> {t(lang, "footer.address")}
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fas fa-phone" /> {t(lang, "footer.phone")}
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fas fa-envelope" /> {t(lang, "footer.email")}
                  </a>
                </li>
                <li>
                  <a href="#">
                    <i className="fas fa-clock" /> {t(lang, "footer.hours")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t(lang, "footer.copyright")}</p>
            <div className="footer-bottom-links">
              <a href="#">{t(lang, "footer.privacy")}</a>
              <a href="#">{t(lang, "footer.terms")}</a>
              <a href="#">{t(lang, "footer.sitemap")}</a>
            </div>
          </div>
        </div>
      </footer>
      </>
      )}

      {/* ========== SCROLL TO TOP ========== */}
      <button
        className={`scroll-top${scrollTopVisible ? " visible" : ""}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <i className="fas fa-chevron-up" />
      </button>
    </div>
  );
}

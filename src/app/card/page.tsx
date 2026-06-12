"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LANGUAGES, type Language, t, getLangDir } from "@/lib/landing-i18n";
import "../landing.css";

type CardTier = "standart" | "silver" | "gold";

const cardGradients: Record<CardTier, string> = {
  standart: "linear-gradient(135deg, #0c3483 0%, #1a5fc7 50%, #3489e8 100%)",
  silver: "linear-gradient(135deg, #4a4a5a 0%, #6e6e82 50%, #8e8ea8 100%)",
  gold: "linear-gradient(135deg, #8a6d1f 0%, #c9a84c 50%, #f7e08a 100%)",
};

const cardData: Record<CardTier, { icon: string; benefits: { icon: string; title: string; desc: string }[] }> = {
  standart: {
    icon: "fa-wallet",
    benefits: [
      { icon: "fa-check-circle", title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
      { icon: "fa-infinity", title: "7/24 Harcama Takibi", desc: "Harcamalarını anlık olarak mobil uygulamadan takip et." },
      { icon: "fa-wifi", title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
      { icon: "fa-bell", title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
      { icon: "fa-shield-alt", title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
      { icon: "fa-percent", title: "Özel İndirimler", desc: "Anlaşmalı üye işyerlerinde özel indirim fırsatları." },
      { icon: "fa-credit-card", title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
    ],
  },
  silver: {
    icon: "fa-wallet",
    benefits: [
      { icon: "fa-check-circle", title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
      { icon: "fa-gift", title: "2× Puan", desc: "Her harcamada 2 kat puan kazanma fırsatı." },
      { icon: "fa-plane", title: "Seyahat Sigortası", desc: "Yurt içi ve yurt dışı seyahatlerinde ücretsiz sigorta." },
      { icon: "fa-wifi", title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
      { icon: "fa-bell", title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
      { icon: "fa-shield-alt", title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
      { icon: "fa-percent", title: "Özel İndirimler", desc: "Premium üye işyerlerinde özel indirim fırsatları." },
      { icon: "fa-credit-card", title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
      { icon: "fa-coins", title: "Yüksek Nakit Avans", desc: "Avantajlı faiz oranlarıyla nakit avans imkanı." },
    ],
  },
  gold: {
    icon: "fa-crown",
    benefits: [
      { icon: "fa-check-circle", title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
      { icon: "fa-crown", title: "Premium Lounge Erişimi", desc: "Havalimanlarında premium lounge ücretsiz giriş." },
      { icon: "fa-gem", title: "3× Puan", desc: "Her harcamada 3 kat puan kazanma ayrıcalığı." },
      { icon: "fa-wifi", title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
      { icon: "fa-bell", title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
      { icon: "fa-shield-alt", title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
      { icon: "fa-percent", title: "Özel İndirimler", desc: "Elite üye işyerlerinde ayrıcalıklı indirimler." },
      { icon: "fa-credit-card", title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
      { icon: "fa-coins", title: "Yüksek Nakit Avans", desc: "En avantajlı faiz oranlarıyla yüksek nakit avans." },
      { icon: "fa-headset", title: "7/24 Öncelikli Destek", desc: "Öncelikli müşteri hattı ile 7/24 destek." },
      { icon: "fa-user-tie", title: "Özel Müşteri Temsilcisi", desc: "Size özel atanmış müşteri temsilcisi desteği." },
    ],
  },
};

type CardCopy = {
  pageTitle: string; pageSubtitle: string;
  tierLabels: Record<CardTier, string>;
  tierDescs: Record<CardTier, string>;
  tierPrices: Record<CardTier, string>;
  benefits: Record<CardTier, { title: string; desc: string }[]>;
  ctaRegister: string; ctaApply: string; note: string; alert: string;
  individual: string; corporate: string;
};

const cardCopy: Record<string, CardCopy> = {
  tr: {
    pageTitle: "MoneyShop Card Başvurusu",
    pageSubtitle: "Size en uygun kartı seçin, avantajlarla dolu dünyaya adım atın.",
    tierLabels: { standart: "Standart Card", silver: "Silver Card", gold: "Gold Card" },
    tierDescs: { standart: "Temel kart ihtiyaçları", silver: "Avantajlı kart deneyimi", gold: "Premium ayrıcalıklar" },
    tierPrices: { standart: "Ücretsiz", silver: "₺49/yıl", gold: "₺149/yıl" },
    benefits: {
      standart: [
        { title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
        { title: "7/24 Harcama Takibi", desc: "Harcamalarını anlık olarak mobil uygulamadan takip et." },
        { title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
        { title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
        { title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
        { title: "Özel İndirimler", desc: "Anlaşmalı üye işyerlerinde özel indirim fırsatları." },
        { title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
      ],
      silver: [
        { title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
        { title: "2× Puan", desc: "Her harcamada 2 kat puan kazanma fırsatı." },
        { title: "Seyahat Sigortası", desc: "Yurt içi ve yurt dışı seyahatlerinde ücretsiz sigorta." },
        { title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
        { title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
        { title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
        { title: "Özel İndirimler", desc: "Premium üye işyerlerinde özel indirim fırsatları." },
        { title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
        { title: "Yüksek Nakit Avans", desc: "Avantajlı faiz oranlarıyla nakit avans imkanı." },
      ],
      gold: [
        { title: "Ücretsiz Başvuru", desc: "Hiçbir ücret ödemeden başvurunu tamamla." },
        { title: "Premium Lounge Erişimi", desc: "Havalimanlarında premium lounge ücretsiz giriş." },
        { title: "3× Puan", desc: "Her harcamada 3 kat puan kazanma ayrıcalığı." },
        { title: "Temassız Ödeme", desc: "Temassız teknoloji ile hızlı ve pratik ödeme." },
        { title: "Anında Bildirim", desc: "Her işlemden sonra anında mobil bildirim." },
        { title: "Güvenli Ödeme", desc: "3D Secure ile korunan alışveriş deneyimi." },
        { title: "Özel İndirimler", desc: "Elite üye işyerlerinde ayrıcalıklı indirimler." },
        { title: "Sanal Kart", desc: "Online alışverişler için ücretsiz sanal kart." },
        { title: "Yüksek Nakit Avans", desc: "En avantajlı faiz oranlarıyla yüksek nakit avans." },
        { title: "7/24 Öncelikli Destek", desc: "Öncelikli müşteri hattı ile 7/24 destek." },
        { title: "Özel Müşteri Temsilcisi", desc: "Size özel atanmış müşteri temsilcisi desteği." },
      ],
    },
    ctaRegister: "Kayıt Ol ve Başvur",
    ctaApply: "Başvurusunu Tamamla",
    note: "Başvurunuz 24 saat içinde değerlendirmeye alınacaktır.",
    alert: "Başvurunuz alınmıştır. En kısa sürede sizinle iletişime geçeceğiz.",
    individual: "Bireysel",
    corporate: "Kurumsal",
  },
  en: {
    pageTitle: "MoneyShop Card Application",
    pageSubtitle: "Choose the card that suits you best, step into a world full of advantages.",
    tierLabels: { standart: "Standard Card", silver: "Silver Card", gold: "Gold Card" },
    tierDescs: { standart: "Basic card needs", silver: "Advanced card experience", gold: "Premium privileges" },
    tierPrices: { standart: "Free", silver: "₺49/yr", gold: "₺149/yr" },
    benefits: {
      standart: [
        { title: "Free Application", desc: "Complete your application without paying any fees." },
        { title: "24/7 Spending Tracking", desc: "Track your spending instantly via mobile app." },
        { title: "Contactless Payment", desc: "Fast and practical payment with contactless technology." },
        { title: "Instant Notification", desc: "Instant mobile notifications after every transaction." },
        { title: "Secure Payment", desc: "Shopping experience protected with 3D Secure." },
        { title: "Special Discounts", desc: "Special discount opportunities at partner merchants." },
        { title: "Virtual Card", desc: "Free virtual card for online shopping." },
      ],
      silver: [
        { title: "Free Application", desc: "Complete your application without paying any fees." },
        { title: "2× Points", desc: "Earn double points on every purchase." },
        { title: "Travel Insurance", desc: "Free insurance for domestic and international travel." },
        { title: "Contactless Payment", desc: "Fast and practical payment with contactless technology." },
        { title: "Instant Notification", desc: "Instant mobile notifications after every transaction." },
        { title: "Secure Payment", desc: "Shopping experience protected with 3D Secure." },
        { title: "Special Discounts", desc: "Special discounts at premium partner merchants." },
        { title: "Virtual Card", desc: "Free virtual card for online shopping." },
        { title: "High Cash Advance", desc: "Cash advance with advantageous interest rates." },
      ],
      gold: [
        { title: "Free Application", desc: "Complete your application without paying any fees." },
        { title: "Premium Lounge Access", desc: "Free premium lounge access at airports." },
        { title: "3× Points", desc: "Earn triple points on every purchase." },
        { title: "Contactless Payment", desc: "Fast and practical payment with contactless technology." },
        { title: "Instant Notification", desc: "Instant mobile notifications after every transaction." },
        { title: "Secure Payment", desc: "Shopping experience protected with 3D Secure." },
        { title: "Special Discounts", desc: "Exclusive discounts at elite partner merchants." },
        { title: "Virtual Card", desc: "Free virtual card for online shopping." },
        { title: "High Cash Advance", desc: "High cash advance with the best interest rates." },
        { title: "24/7 Priority Support", desc: "24/7 support with priority customer line." },
        { title: "Personal Account Manager", desc: "Dedicated account manager support assigned to you." },
      ],
    },
    ctaRegister: "Register & Apply",
    ctaApply: "Complete Application",
    note: "Your application will be processed within 24 hours.",
    alert: "your application has been received. We will contact you shortly.",
    individual: "Individual",
    corporate: "Corporate",
  },
  ar: {
    pageTitle: "التقديم على بطاقة MoneyShop",
    pageSubtitle: "اختر البطاقة الأنسب لك، وانطلق إلى عالم مليء بالمزايا.",
    tierLabels: { standart: "البطاقة القياسية", silver: "البطاقة الفضية", gold: "البطاقة الذهبية" },
    tierDescs: { standart: "احتياجات البطاقة الأساسية", silver: "تجربة بطاقة متقدمة", gold: "امتيازات حصرية" },
    tierPrices: { standart: "مجاني", silver: "₺49/سنة", gold: "₺149/سنة" },
    benefits: {
      standart: [
        { title: "تقديم مجاني", desc: "أكمل طلبك دون دفع أي رسوم." },
        { title: "تتبع المصروفات 24/7", desc: "تتبع مصروفاتك فورًا عبر التطبيق." },
        { title: "دفع لاتلامسي", desc: "دفع سريع وعملي بتقنية الاتصال اللاتلامسي." },
        { title: "إشعارات فورية", desc: "إشعارات جوال فورية بعد كل معاملة." },
        { title: "دفع آمن", desc: "تجربة تسوق محمية بتقنية 3D Secure." },
        { title: "خصومات خاصة", desc: "فرص خصم خاصة في المتاجر المتعاقدة." },
        { title: "بطاقة افتراضية", desc: "بطاقة افتراضية مجانية للتسوق عبر الإنترنت." },
      ],
      silver: [
        { title: "تقديم مجاني", desc: "أكمل طلبك دون دفع أي رسوم." },
        { title: "2× نقاط", desc: "احصل على ضعف النقاط مع كل عملية شراء." },
        { title: "تأمين سفر", desc: "تأمين مجاني للسفر المحلي والدولي." },
        { title: "دفع لاتلامسي", desc: "دفع سريع وعملي بتقنية الاتصال اللاتلامسي." },
        { title: "إشعارات فورية", desc: "إشعارات جوال فورية بعد كل معاملة." },
        { title: "دفع آمن", desc: "تسوق محمي بتقنية 3D Secure." },
        { title: "خصومات خاصة", desc: "خصومات خاصة في المتاجر الشريكة الممتازة." },
        { title: "بطاقة افتراضية", desc: "بطاقة افتراضية مجانية للتسوق عبر الإنترنت." },
        { title: "سلفة نقدية عالية", desc: "سلفة نقدية بأسعار فائدة مغرية." },
      ],
      gold: [
        { title: "تقديم مجاني", desc: "أكمل طلبك دون دفع أي رسوم." },
        { title: "دخول صالات الانتظار", desc: "دخول مجاني لصالات كبار الشخصيات في المطارات." },
        { title: "3× نقاط", desc: "احصل على ثلاثة أضعاف النقاط مع كل عملية شراء." },
        { title: "دفع لاتلامسي", desc: "دفع سريع وعملي بتقنية الاتصال اللاتلامسي." },
        { title: "إشعارات فورية", desc: "إشعارات جوال فورية بعد كل معاملة." },
        { title: "دفع آمن", desc: "تسوق محمي بتقنية 3D Secure." },
        { title: "خصومات خاصة", desc: "خصومات حصرية في المتاجر الشريكة elite." },
        { title: "بطاقة افتراضية", desc: "بطاقة افتراضية مجانية للتسوق عبر الإنترنت." },
        { title: "سلفة نقدية عالية", desc: "سلفة نقدية عالية بأفضل أسعار الفائدة." },
        { title: "دعم ذو أولوية 24/7", desc: "دعم على مدار الساعة بخط عملاء ذو أولوية." },
        { title: "مدير حساب خاص", desc: "مدير حساب مخصص لدعمك." },
      ],
    },
    ctaRegister: "سجل وقدم",
    ctaApply: "أكمل التقديم",
    note: "سيتم معالجة طلبك خلال 24 ساعة.",
    alert: "تم استلام طلبك. سنتواصل معك قريبًا.",
    individual: "فردي",
    corporate: "شركات",
  },
  ku: {
    pageTitle: "Serlêdana Karta MoneyShop",
    pageSubtitle: "Karta herî guncav hilbijêre, bikeve cîhanek bi avantajan tijî.",
    tierLabels: { standart: "Karta Standard", silver: "Karta Zîv", gold: "Karta Zêr" },
    tierDescs: { standart: "Pêdiviyên bingehîn ên kartê", silver: "Tecrûbeya kartê ya pêşkeftî", gold: "Taybetmendiyên premium" },
    tierPrices: { standart: "Belaş", silver: "₺49/sal", gold: "₺149/sal" },
    benefits: {
      standart: [
        { title: "Serlêdana Belaş", desc: "Bêyî dayîna tu berdêlê serlêdana xwe biqedîne." },
        { title: "Şopandina Lêçûnê 24/7", desc: "Bi sepanê mobîl lêçûnên xwe bişopîne." },
        { title: "Dayîna Bêtêkilî", desc: "Bi teknolojiya bêtêkilî dayîna bilez û pratîk." },
        { title: "Agahdariya Tavilê", desc: "Piştî her danûstandinê agahdariya mobîl a tavilê." },
        { title: "Dayîna Ewledar", desc: "Tecrûbeya kirînê ya bi 3D Secure hatî parastin." },
        { title: "Daxistinên Taybet", desc: "Li firotgehên hevkar de firsendên daxistinê." },
        { title: "Karta Serhêl", desc: "Ji bo kirîna serhêl karta serhêl a belaş." },
      ],
      silver: [
        { title: "Serlêdana Belaş", desc: "Bêyî dayîna tu berdêlê serlêdana xwe biqedîne." },
        { title: "2× Xal", desc: "Bi her kirînê 2 caran xalan bi dest bixe." },
        { title: "Bîmeya Rêwîtiyê", desc: "Bîmeya belaş ji bo rêwîtiyên navxweyî û navneteweyî." },
        { title: "Dayîna Bêtêkilî", desc: "Bi teknolojiya bêtêkilî dayîna bilez û pratîk." },
        { title: "Agahdariya Tavilê", desc: "Piştî her danûstandinê agahdariya mobîl a tavilê." },
        { title: "Dayîna Ewledar", desc: "Tecrûbeya kirînê ya bi 3D Secure hatî parastin." },
        { title: "Daxistinên Taybet", desc: "Li firotgehên hevkar ên premium daxistinên taybet." },
        { title: "Karta Serhêl", desc: "Ji bo kirîna serhêl karta serhêl a belaş." },
        { title: "Pêşiya Dirav a Bilind", desc: "Pêşiya drav bi rêjeyên faîzê yên bikêr." },
      ],
      gold: [
        { title: "Serlêdana Belaş", desc: "Bêyî dayîna tu berdêlê serlêdana xwe biqedîne." },
        { title: "Ketina Loungeya Premium", desc: "Li balafirgehan ketina belaş a loungeya premium." },
        { title: "3× Xal", desc: "Bi her kirînê 3 caran xalan bi dest bixe." },
        { title: "Dayîna Bêtêkilî", desc: "Bi teknolojiya bêtêkilî dayîna bilez û pratîk." },
        { title: "Agahdariya Tavilê", desc: "Piştî her danûstandinê agahdariya mobîl a tavilê." },
        { title: "Dayîna Ewledar", desc: "Tecrûbeya kirînê ya bi 3D Secure hatî parastin." },
        { title: "Daxistinên Taybet", desc: "Li firotgehên hevkar ên elite daxistinên taybet." },
        { title: "Karta Serhêl", desc: "Ji bo kirîna serhêl karta serhêl a belaş." },
        { title: "Pêşiya Dirav a Bilind", desc: "Pêşiya drav a bilind bi rêjeyên faîzê yên herî bikêr." },
        { title: "Piştgiriya Pêşîn 24/7", desc: "Piştgiriya 24/7 bi xeta xerîdar a pêşîn." },
        { title: "Berpirsiyarê Hesabê Taybet", desc: "Piştgiriya berpirsiyarê hesabê ku ji we re hatî tayîn kirin." },
      ],
    },
    ctaRegister: "Tomar Bike û Serlêdan Bike",
    ctaApply: "Serlêdanê Biqedîne",
    note: "Serlêdana we dê di nav 24 saetan de were pêvajo kirin.",
    alert: "serlêdana we hatî wergirtin. Em ê di nêzîk de bi we re têkilî daynin.",
    individual: "Kesane",
    corporate: "Pargînî",
  },
  fr: {
    pageTitle: "Demande de Carte MoneyShop",
    pageSubtitle: "Choisissez la carte qui vous convient, entrez dans un monde d'avantages.",
    tierLabels: { standart: "Carte Standard", silver: "Carte Argent", gold: "Carte Or" },
    tierDescs: { standart: "Besoins de base", silver: "Expérience avancée", gold: "Privilèges premium" },
    tierPrices: { standart: "Gratuit", silver: "₺49/an", gold: "₺149/an" },
    benefits: {
      standart: [
        { title: "Demande Gratuite", desc: "Finalisez votre demande sans payer de frais." },
        { title: "Suivi des dépenses 24/7", desc: "Suivez vos dépenses en temps réel via l'application." },
        { title: "Paiement sans contact", desc: "Paiement rapide et pratique avec la technologie sans contact." },
        { title: "Notification instantanée", desc: "Notifications mobiles instantanées après chaque transaction." },
        { title: "Paiement sécurisé", desc: "Expérience d'achat protégée par 3D Secure." },
        { title: "Remises spéciales", desc: "Offres de remises spéciales chez les commerçants partenaires." },
        { title: "Carte virtuelle", desc: "Carte virtuelle gratuite pour les achats en ligne." },
      ],
      silver: [
        { title: "Demande Gratuite", desc: "Finalisez votre demande sans payer de frais." },
        { title: "2× Points", desc: "Gagnez le double de points sur chaque achat." },
        { title: "Assurance voyage", desc: "Assurance gratuite pour les voyages nationaux et internationaux." },
        { title: "Paiement sans contact", desc: "Paiement rapide avec la technologie sans contact." },
        { title: "Notification instantanée", desc: "Notifications mobiles après chaque transaction." },
        { title: "Paiement sécurisé", desc: "Achats protégés par 3D Secure." },
        { title: "Remises spéciales", desc: "Remises spéciales chez les commerçants premium partenaires." },
        { title: "Carte virtuelle", desc: "Carte virtuelle gratuite pour les achats en ligne." },
        { title: "Avance de fonds élevée", desc: "Avance de fonds à des taux d'intérêt avantageux." },
      ],
      gold: [
        { title: "Demande Gratuite", desc: "Finalisez votre demande sans payer de frais." },
        { title: "Accès Salon Premium", desc: "Accès gratuit aux salons premium dans les aéroports." },
        { title: "3× Points", desc: "Gagnez le triple de points sur chaque achat." },
        { title: "Paiement sans contact", desc: "Paiement rapide avec la technologie sans contact." },
        { title: "Notification instantanée", desc: "Notifications mobiles après chaque transaction." },
        { title: "Paiement sécurisé", desc: "Achats protégés par 3D Secure." },
        { title: "Remises spéciales", desc: "Remises exclusives chez les commerçants elite partenaires." },
        { title: "Carte virtuelle", desc: "Carte virtuelle gratuite pour les achats en ligne." },
        { title: "Avance de fonds élevée", desc: "Avance de fonds élevée aux meilleurs taux." },
        { title: "Support prioritaire 24/7", desc: "Support 24/7 avec ligne client prioritaire." },
        { title: "Conseiller dédié", desc: "Un conseiller client dédié spécialement pour vous." },
      ],
    },
    ctaRegister: "Inscrivez-vous",
    ctaApply: "Finaliser la demande",
    note: "Votre demande sera traitée sous 24 heures.",
    alert: "votre demande a été reçue. Nous vous contacterons prochainement.",
    individual: "Particulier",
    corporate: "Professionnel",
  },
  ru: {
    pageTitle: "Заявка на карту MoneyShop",
    pageSubtitle: "Выберите подходящую карту и войдите в мир преимуществ.",
    tierLabels: { standart: "Стандартная", silver: "Серебряная", gold: "Золотая" },
    tierDescs: { standart: "Базовые потребности", silver: "Расширенный опыт", gold: "Премиум-привилегии" },
    tierPrices: { standart: "Бесплатно", silver: "₺49/год", gold: "₺149/год" },
    benefits: {
      standart: [
        { title: "Бесплатная заявка", desc: "Подайте заявку без оплаты." },
        { title: "Отслеживание расходов 24/7", desc: "Отслеживайте расходы в приложении." },
        { title: "Бесконтактная оплата", desc: "Быстрая оплата бесконтактной технологией." },
        { title: "Мгновенные уведомления", desc: "Мгновенные уведомления после каждой операции." },
        { title: "Безопасная оплата", desc: "Покупки, защищенные 3D Secure." },
        { title: "Специальные скидки", desc: "Скидки в магазинах-партнерах." },
        { title: "Виртуальная карта", desc: "Бесплатная виртуальная карта для онлайн-покупок." },
      ],
      silver: [
        { title: "Бесплатная заявка", desc: "Подайте заявку без оплаты." },
        { title: "2× Баллы", desc: "Получайте двойные баллы за каждую покупку." },
        { title: "Страхование путешествий", desc: "Бесплатная страховка для поездок." },
        { title: "Бесконтактная оплата", desc: "Быстрая оплата бесконтактной технологией." },
        { title: "Мгновенные уведомления", desc: "Уведомления после каждой операции." },
        { title: "Безопасная оплата", desc: "Покупки, защищенные 3D Secure." },
        { title: "Специальные скидки", desc: "Скидки у премиум-партнеров." },
        { title: "Виртуальная карта", desc: "Бесплатная виртуальная карта." },
        { title: "Высокий кэш-аванс", desc: "Кэш-аванс по выгодным ставкам." },
      ],
      gold: [
        { title: "Бесплатная заявка", desc: "Подайте заявку без оплаты." },
        { title: "Доступ в Premium Lounge", desc: "Бесплатный вход в лаунжи в аэропортах." },
        { title: "3× Баллы", desc: "Получайте тройные баллы за каждую покупку." },
        { title: "Бесконтактная оплата", desc: "Быстрая оплата бесконтактной технологией." },
        { title: "Мгновенные уведомления", desc: "Уведомления после каждой операции." },
        { title: "Безопасная оплата", desc: "Покупки, защищенные 3D Secure." },
        { title: "Специальные скидки", desc: "Эксклюзивные скидки у партнеров elite." },
        { title: "Виртуальная карта", desc: "Бесплатная виртуальная карта." },
        { title: "Высокий кэш-аванс", desc: "Высокий кэш-аванс по лучшим ставкам." },
        { title: "Приоритетная поддержка 24/7", desc: "Круглосуточная поддержка по приоритетной линии." },
        { title: "Персональный менеджер", desc: "Закрепленный персональный менеджер." },
      ],
    },
    ctaRegister: "Зарегистрироваться",
    ctaApply: "Завершить заявку",
    note: "Ваша заявка будет обработана в течение 24 часов.",
    alert: "ваша заявка получена. Мы свяжемся с вами в ближайшее время.",
    individual: "Частное лицо",
    corporate: "Корпоративный",
  },
};

export default function CardApplicationPage() {
  const { data: session } = useSession();
  const [selectedTier, setSelectedTier] = useState<CardTier>("standart");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeType, setActiveType] = useState<"default" | "individual" | "corporate">("default");
  const [lang, setLang] = useState<Language>("tr");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const dir = getLangDir(lang);
  const c = cardCopy[lang] ?? cardCopy.en;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLang = (code: string) => {
    setLang(code as Language);
    setLangMenuOpen(false);
  };

  return (
    <div className="landing-page">
      {/* ========== NAVBAR ========== */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
        <div className="nav-container">
          <div className="nav-row-top">
            <Link href="/" className="logo">
              <div className="logo-icon">
                <i className="fas fa-wallet" />
              </div>
              <span className="logo-text">
                Money<span>Shop</span>
              </span>
            </Link>

            <div className="nav-type-menu">
              <button
                className={`nav-type-link${activeType === "individual" ? " active" : ""}`}
                onClick={() => setActiveType("individual")}
              >
                {c.individual}
              </button>
              <span className="nav-type-sep">|</span>
              <button
                className={`nav-type-link${activeType === "corporate" ? " active" : ""}`}
                onClick={() => setActiveType("corporate")}
              >
                {c.corporate}
              </button>
            </div>

            <div className="nav-actions">
              {session?.user ? (
                <>
                  <Link href="/dashboard" className="btn-nav-login">
                    <div className="nav-user-avatar">{(session.user.name || "K")[0]}</div>
                    <span>{session.user.name || "User"}</span>
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-nav-cta" style={{ cursor: "pointer", border: "none" }}>
                    <i className="fas fa-sign-out-alt" /> {t(lang, "nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-nav-login">{t(lang, "nav.login")}</Link>
                  <Link href="/register" className="btn-nav-cta">{t(lang, "nav.getStarted")}</Link>
                </>
              )}

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

            <button className={`menu-toggle${menuOpen ? " active" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>

          <ul className={`nav-links${activeType !== "default" ? " type-menu-active" : ""}`}>
            {activeType === "individual" ? (
              <>
                <li><a href="/#transfer">{t(lang, "nav.moneyTransfer")}</a></li>
                <li><a href="/#card" className="active">{t(lang, "nav.card")}</a></li>
                <li><a href="/#investment">{t(lang, "nav.investment")}</a></li>
                <li><a href="/#payments">{t(lang, "nav.paymentOperations")}</a></li>
              </>
            ) : activeType === "corporate" ? (
              <>
                <li><a href="/#physical-payment">{t(lang, "nav.physicalPayment")}</a></li>
                <li><a href="/#online-payment">{t(lang, "nav.onlinePayment")}</a></li>
                <li><a href="/#payment-distribution">{t(lang, "nav.paymentDistribution")}</a></li>
                <li><a href="/#card-solutions">{t(lang, "nav.cardSolutions")}</a></li>
              </>
            ) : (
              <>
                <li><a href="/#services">{t(lang, "nav.services")}</a></li>
                <li><a href="/#how-it-works">{t(lang, "nav.howItWorks")}</a></li>
                <li><a href="/#card" className="active">{t(lang, "nav.card")}</a></li>
                <li><a href="/#features">{t(lang, "nav.features")}</a></li>
                <li><a href="/#compliance">{t(lang, "nav.compliance")}</a></li>
                <li><a href="/#roadmap">{t(lang, "nav.roadmap")}</a></li>
                <li><a href="/pricing">{t(lang, "nav.pricing")}</a></li>
                <li><a href="/faq">{t(lang, "nav.faq")}</a></li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="hero" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="hero-container" style={{ gridTemplateColumns: "1fr", maxWidth: 900, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            {c.pageTitle}
          </h1>
          <p style={{ fontSize: 16, color: "var(--gray-5)", maxWidth: 500, margin: "0 auto 44px" }}>
            {c.pageSubtitle}
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 48 }}>
            {(["standart", "silver", "gold"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                style={{
                  flex: 1, maxWidth: 260, padding: "20px 24px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  border: selectedTier === tier ? "2px solid var(--primary)" : "2px solid var(--gray-3)",
                  background: "var(--white)",
                  transition: "all 0.3s ease", boxShadow: selectedTier === tier ? "0 8px 30px rgba(0,82,255,0.15)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <i className={`fas ${tier === "gold" ? "fa-crown" : "fa-credit-card"}`} style={{ fontSize: 20, color: tier === "standart" ? "#1a5fc7" : tier === "silver" ? "#6e6e82" : "#c9a84c" }} />
                    <span style={{ fontWeight: 700, fontSize: 16, color: selectedTier === tier ? "var(--dark)" : "var(--gray-5)" }}>
                      {c.tierLabels[tier]}
                    </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--gray-5)", margin: 0 }}>
                  {c.tierDescs[tier]}
                </p>
                <p style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 0", color: selectedTier === tier ? "var(--primary)" : "var(--gray-5)" }}>
                  {c.tierPrices[tier]}
                </p>
              </button>
            ))}
          </div>

          <div className="service-detail" style={{ border: "none", padding: 0, textAlign: "left" }}>
            <div style={{ display: "flex", gap: 50, alignItems: "flex-start", justifyContent: "center" }}>
              <div style={{ flexShrink: 0, paddingTop: 10 }}>
                <div className={`hero-stack-card card-${selectedTier}`} style={{ position: "relative", top: 0, left: 0, transform: "none", width: 200, height: 290 }}>
                  <div className="card-bg-shine" />
                  <div className="hero-card-top">
                    <div className="hero-card-brand">
                      <i className={`fas ${cardData[selectedTier].icon}`} />
                      <span>MoneyShop</span>
                    </div>
                    <div className="hero-card-chip">
                      <div className="chip-lines"><div /><div /><div /><div /></div>
                    </div>
                  </div>
                  <div className="hero-card-type">{c.tierLabels[selectedTier]}</div>
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

              <div style={{ maxWidth: 480 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {cardData[selectedTier].benefits.map((b, i) => {
                    const benefit = c.benefits[selectedTier]?.[i];
                    return (
                      <div key={i} className="service-feature" style={{ gap: 14, padding: "12px 16px", background: "#fff", border: "1px solid var(--gray-3)", borderRadius: 14 }}>
                        <i className={`fas ${b.icon}`} style={{ fontSize: 16, color: "var(--primary)", marginTop: 2 }} />
                        <div>
                          <strong style={{ fontSize: 13 }}>{benefit?.title || b.title}</strong>
                          <span style={{ fontSize: 12, color: "var(--gray-5)", marginTop: 2, display: "block" }}>{benefit?.desc || b.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href={session?.user ? "#" : "/register"}
                  className="btn-primary"
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 36px", textDecoration: "none" }}
                  onClick={session?.user ? (e) => { e.preventDefault(); alert(c.alert); } : undefined}
                >
                  <i className="fas fa-paper-plane" />
                  {session?.user
                    ? `${c.tierLabels[selectedTier]} ${c.ctaApply}`
                    : c.ctaRegister}
                </Link>
                <p style={{ fontSize: 12, color: "var(--gray-5)", marginTop: 12 }}>
                  {c.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

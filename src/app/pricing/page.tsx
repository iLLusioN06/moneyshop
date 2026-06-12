"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LANGUAGES, type Language, t } from "@/lib/landing-i18n";
import { getLangDir } from "@/lib/landing-i18n";
import "../landing.css";

type PricingTab = "fees" | "limits";

interface PricingFeeItem {
  name: string;
  fee: string;
  note: string;
}

interface PricingLimitItem {
  name: string;
  limit: string;
  note: string;
}

type PricingItem = PricingFeeItem | PricingLimitItem;

type CopyContent = {
  title: string; titleTail: string; subtitle: string;
  individual: string; corporate: string;
  fees: string; limits: string;
  service: string; fee: string; limitType: string; limit: string; description: string; note: string;
};

const copy: Record<string, CopyContent> = {
  tr: {
    title: "Ücretler", titleTail: "ve Limitler",
    subtitle: "Şeffaf ücretlendirme ve limit politikamızla herhangi bir sürprizle karşılaşmazsınız.",
    individual: "Bireysel", corporate: "Kurumsal",
    fees: "Ücretler", limits: "Limitler",
    service: "Hizmet / İşlem", fee: "Ücret", limitType: "Limit Türü", limit: "Limit", description: "Açıklama",
    note: "* Tüm ücret ve limitler başvuru anında geçerli olan güncel oranlardır. Değişiklik hakkı saklıdır.",
  },
  en: {
    title: "Fees", titleTail: "and Limits",
    subtitle: "With our transparent pricing and limit policies, you will not encounter any surprises.",
    individual: "Individual", corporate: "Corporate",
    fees: "Fees", limits: "Limits",
    service: "Service / Transaction", fee: "Fee", limitType: "Limit Type", limit: "Limit", description: "Description",
    note: "* All fees and limits are current rates valid at the time of application. Subject to change.",
  },
  ar: {
    title: "الرسوم", titleTail: "والحدود",
    subtitle: "مع سياسات الرسوم والحدود الشفافة لدينا، لن تواجه أي مفاجآت.",
    individual: "فردي", corporate: "شركات",
    fees: "الرسوم", limits: "الحدود",
    service: "الخدمة / المعاملة", fee: "الرسوم", limitType: "نوع الحد", limit: "الحد", description: "الوصف",
    note: "* جميع الرسوم والحدود هي الأسعار الحالية السارية وقت التقديم. تخضع للتغيير.",
  },
  ku: {
    title: "Biha", titleTail: "û Sînor",
    subtitle: "Bi polîtîkayên me yên zelal ên biha û sînoran, hûn ê rastî ti surprîzan neyên.",
    individual: "Kesxî", corporate: "Pargînî",
    fees: "Biha", limits: "Sînor",
    service: "Xizmet / Danûstandin", fee: "Biha", limitType: "Cureyê Sînor", limit: "Sînor", description: "Danasîn",
    note: "* Hemî biha û sînor li gorî dema serlêdanê ne. Mafê guhertinê parastî ye.",
  },
  fr: {
    title: "Tarifs", titleTail: "et Plafonds",
    subtitle: "Avec notre politique de tarification et de limites transparente, vous n'aurez aucune surprise.",
    individual: "Particulier", corporate: "Professionnel",
    fees: "Tarifs", limits: "Plafonds",
    service: "Service / Transaction", fee: "Tarif", limitType: "Type de plafond", limit: "Plafond", description: "Description",
    note: "* Tous les tarifs et plafonds sont en vigueur au moment de la demande. Sous réserve de modifications.",
  },
  ru: {
    title: "Тарифы", titleTail: "и лимиты",
    subtitle: "Благодаря нашей прозрачной политике тарифов и лимитов вы не столкнетесь с сюрпризами.",
    individual: "Частное лицо", corporate: "Корпоративный",
    fees: "Тарифы", limits: "Лимиты",
    service: "Услуга / Операция", fee: "Тариф", limitType: "Тип лимита", limit: "Лимит", description: "Описание",
    note: "* Все тарифы и лимиты действуют на момент подачи заявки. Возможны изменения.",
  },
};

type PricingItemBase = { name: string; note: string } & ({ fee: string } | { limit: string });
type LangData = { individual: PricingItemBase[]; corporate: PricingItemBase[] };
type PricingDataSet = Record<string, LangData>;

const feesData: PricingDataSet = {
  tr: {
    individual: [
      { name: "Hesap Açılış Ücreti", fee: "Ücretsiz", note: "Hiçbir ücret ödemeden hesap açın." },
      { name: "Aylık Hesap İşletim Ücreti", fee: "0 TL", note: "Aylık hesap işletim ücreti yoktur." },
      { name: "Kart Başvuru Ücreti (Standart)", fee: "Ücretsiz", note: "Standart kart başvurusu ücretsizdir." },
      { name: "Kart Başvuru Ücreti (Silver)", fee: "50 TL", note: "Tek seferlik Silver kart başvuru ücreti." },
      { name: "Kart Başvuru Ücreti (Gold)", fee: "150 TL", note: "Tek seferlik Gold kart başvuru ücreti." },
      { name: "Yıllık Kart Ücreti (Standart)", fee: "0 TL", note: "Standart kart yıllık ücretsiz." },
      { name: "Yıllık Kart Ücreti (Silver)", fee: "120 TL", note: "Silver kart yıllık kullanım ücreti." },
      { name: "Yıllık Kart Ücreti (Gold)", fee: "360 TL", note: "Gold kart yıllık kullanım ücreti." },
      { name: "Kart Yenileme Ücreti", fee: "15 TL", note: "Kayıp/çalıntı durumunda kart yenileme." },
      { name: "Para Yatırma (ATM/Şube)", fee: "Ücretsiz", note: "Tüm para yatırma işlemleri ücretsiz." },
      { name: "Para Çekme (Kendi ATM)", fee: "Ücretsiz", note: "Kendi ATM'lerimizden para çekme ücretsiz." },
      { name: "Para Çekme (Farklı ATM)", fee: "5 TL + BSMV", note: "Farklı banka ATM'lerinden para çekme." },
      { name: "EFT/Havale (Diğer Bankalara)", fee: "1,50 TL", note: "Diğer bankalara EFT/havale işlem ücreti." },
      { name: "FAST Transfer", fee: "0,75 TL", note: "FAST sistemi ile anlık para transferi." },
      { name: "MoneyShop Transfer", fee: "Ücretsiz", note: "MoneyShop kullanıcıları arası transfer ücretsiz." },
      { name: "Yatırım Hesabı Açılış", fee: "Ücretsiz", note: "Yatırım hesabı açılışı ücretsiz." },
      { name: "Hisse Senedi Alım/Satım", fee: "%0,1", note: "İşlem hacmi üzerinden komisyon." },
      { name: "Fon Alım/Satım", fee: "%0,05", note: "Fon işlemlerinde düşük komisyon oranı." },
      { name: "Kripto Para Alım/Satım", fee: "%0,2", note: "Kripto para işlem komisyonu." },
      { name: "QR Ödeme (Satıcı)", fee: "%1,5", note: "QR ile ödeme alım komisyonu." },
      { name: "Sanal POS (İşlem Başına)", fee: "%2,0 + 0,25 TL", note: "Online ödeme işlem komisyonu." },
      { name: "POS Cihazı Kiralama", fee: "49 TL/ay", note: "Fiziki POS cihazı aylık kira ücreti." },
      { name: "Mobil POS Kullanım", fee: "19 TL/ay", note: "Mobil POS yazılım kullanım ücreti." },
      { name: "Toplu Ödeme İşlem", fee: "0,50 TL/işlem", note: "Toplu ödeme başına işlem ücreti." },
      { name: "Komisyon Dağıtımı", fee: "%1", note: "Otomatik komisyon dağıtım hizmet bedeli." },
      { name: "Hesap Özeti (Basılı)", fee: "5 TL", note: "Basılı hesap özeti talep ücreti." },
      { name: "İptal/İade İşlemi", fee: "2 TL", note: "İptal ve iade işlem ücreti." },
      { name: "SMS Bildirim Ücreti", fee: "0,20 TL", note: "Her işlem sonrası SMS bildirim ücreti." },
    ],
    corporate: [
      { name: "Kurumsal Hesap Açılış", fee: "Ücretsiz", note: "Kurumsal hesap açılışı ücretsizdir." },
      { name: "Aylık Hesap İşletim Ücreti", fee: "99 TL", note: "Kurumsal hesap aylık işletim ücreti." },
      { name: "POS Cihazı Kiralama", fee: "99 TL/ay", note: "Premium POS cihazı aylık kira." },
      { name: "Sanal POS Komisyon", fee: "%1,8", note: "Online ödeme işlem komisyonu (kurumsal)." },
      { name: "Toplu Ödeme (Kurumsal)", fee: "0,35 TL/işlem", note: "Kurumsal toplu ödeme işlem ücreti." },
      { name: "Kurumsal Kart (Yıllık)", fee: "250 TL", note: "Kurumsal kart yıllık ücret." },
      { name: "API Kullanım", fee: "Ücretsiz", note: "API entegrasyonu ve kullanımı ücretsiz." },
      { name: "Premium Teknik Destek", fee: "500 TL/ay", note: "7/24 öncelikli teknik destek paketi." },
      { name: "Fiziki POS Kurulum", fee: "250 TL", note: "POS cihazı kurulum ve aktivasyon ücreti." },
      { name: "Ödeme Linki (Kurumsal)", fee: "%1,5", note: "Link ile ödeme komisyonu." },
    ],
  },
  en: {
    individual: [
      { name: "Account Opening Fee", fee: "Free", note: "Open an account without paying any fee." },
      { name: "Monthly Account Maintenance", fee: "0 TL", note: "No monthly account maintenance fee." },
      { name: "Card Application Fee (Standard)", fee: "Free", note: "Standard card application is free." },
      { name: "Card Application Fee (Silver)", fee: "50 TL", note: "One-time Silver card application fee." },
      { name: "Card Application Fee (Gold)", fee: "150 TL", note: "One-time Gold card application fee." },
      { name: "Annual Card Fee (Standard)", fee: "0 TL", note: "Standard card is free annually." },
      { name: "Annual Card Fee (Silver)", fee: "120 TL", note: "Silver card annual usage fee." },
      { name: "Annual Card Fee (Gold)", fee: "360 TL", note: "Gold card annual usage fee." },
      { name: "Card Replacement Fee", fee: "15 TL", note: "Card replacement in case of loss or theft." },
      { name: "Cash Deposit (ATM/Branch)", fee: "Free", note: "All cash deposits are free." },
      { name: "Cash Withdrawal (Own ATM)", fee: "Free", note: "Cash withdrawals from our own ATMs are free." },
      { name: "Cash Withdrawal (Other ATM)", fee: "5 TL + BSMV", note: "Cash withdrawal from other bank ATMs." },
      { name: "EFT / Bank Transfer", fee: "1.50 TL", note: "Transfer fee to other banks." },
      { name: "FAST Transfer", fee: "0.75 TL", note: "Instant money transfer via FAST system." },
      { name: "MoneyShop Transfer", fee: "Free", note: "Transfers between MoneyShop users are free." },
      { name: "Investment Account Opening", fee: "Free", note: "Investment account opening is free." },
      { name: "Stock Trading", fee: "0.1%", note: "Commission based on trade volume." },
      { name: "Fund Trading", fee: "0.05%", note: "Low commission rate for fund transactions." },
      { name: "Crypto Trading", fee: "0.2%", note: "Cryptocurrency transaction commission." },
      { name: "QR Payment (Merchant)", fee: "1.5%", note: "Commission for accepting QR payments." },
      { name: "Virtual POS (Per Transaction)", fee: "2.0% + 0.25 TL", note: "Online payment processing commission." },
      { name: "POS Device Rental", fee: "49 TL/mo", note: "Monthly rental fee for physical POS device." },
      { name: "Mobile POS Usage", fee: "19 TL/mo", note: "Mobile POS software usage fee." },
      { name: "Bulk Payment Processing", fee: "0.50 TL/txn", note: "Processing fee per bulk payment." },
      { name: "Commission Distribution", fee: "1%", note: "Automatic commission distribution service fee." },
      { name: "Statement (Printed)", fee: "5 TL", note: "Printed account statement request fee." },
      { name: "Cancellation / Refund", fee: "2 TL", note: "Cancellation and refund transaction fee." },
      { name: "SMS Fee Notification", fee: "0.20 TL", note: "SMS notification fee after each transaction." },
    ],
    corporate: [
      { name: "Corporate Account Opening", fee: "Free", note: "Corporate account opening is free." },
      { name: "Monthly Account Maintenance", fee: "99 TL", note: "Monthly corporate account maintenance fee." },
      { name: "POS Device Rental", fee: "99 TL/mo", note: "Monthly premium POS device rental." },
      { name: "Virtual POS Commission", fee: "1.8%", note: "Online payment processing commission (corporate)." },
      { name: "Bulk Payment (Corporate)", fee: "0.35 TL/txn", note: "Corporate bulk payment processing fee." },
      { name: "Corporate Card (Annual)", fee: "250 TL", note: "Annual fee for corporate card." },
      { name: "API Usage", fee: "Free", note: "API integration and usage are free." },
      { name: "Premium Technical Support", fee: "500 TL/mo", note: "24/7 priority technical support package." },
      { name: "Physical POS Setup", fee: "250 TL", note: "POS device setup and activation fee." },
      { name: "Payment Link (Corporate)", fee: "1.5%", note: "Payment link commission." },
    ],
  },
  ar: {
    individual: [
      { name: "رسوم فتح الحساب", fee: "مجاني", note: "افتح حسابًا دون دفع أي رسوم." },
      { name: "رسوم الصيانة الشهرية", fee: "0 TL", note: "لا توجد رسوم صيانة شهرية." },
      { name: "رسوم طلب البطاقة (قياسي)", fee: "مجاني", note: "طلب البطاقة القياسية مجاني." },
      { name: "رسوم طلب البطاقة (فضي)", fee: "50 TL", note: "رسوم طلب البطاقة الفضية لمرة واحدة." },
      { name: "رسوم طلب البطاقة (ذهبي)", fee: "150 TL", note: "رسوم طلب البطاقة الذهبية لمرة واحدة." },
      { name: "الرسوم السنوية (قياسي)", fee: "0 TL", note: "البطاقة القياسية مجانية سنويًا." },
      { name: "الرسوم السنوية (فضي)", fee: "120 TL", note: "رسوم البطاقة الفضية السنوية." },
      { name: "الرسوم السنوية (ذهبي)", fee: "360 TL", note: "رسوم البطاقة الذهبية السنوية." },
      { name: "رسوم استبدال البطاقة", fee: "15 TL", note: "استبدال البطاقة في حالة الفقد أو السرقة." },
      { name: "إيداع نقدي (صراف آلي/فرع)", fee: "مجاني", note: "جميع عمليات الإيداع النقدي مجانية." },
      { name: "سحب نقدي (صرافنا)", fee: "مجاني", note: "السحب النقدي من صرافاتنا مجاني." },
      { name: "سحب نقدي (صراف آخر)", fee: "5 TL + BSMV", note: "السحب النقدي من صرافات بنوك أخرى." },
      { name: "تحويل بنكي", fee: "1.50 TL", note: "رسوم التحويل إلى بنوك أخرى." },
      { name: "تحويل FAST", fee: "0.75 TL", note: "تحويل فوري عبر نظام FAST." },
      { name: "تحويل MoneyShop", fee: "مجاني", note: "التحويل بين مستخدمي MoneyShop مجاني." },
      { name: "فتح حساب استثماري", fee: "مجاني", note: "فتح حساب استثماري مجاني." },
      { name: "تداول الأسهم", fee: "0.1%", note: "عمولة على حجم التداول." },
      { name: "تداول الصناديق", fee: "0.05%", note: "عمولة منخفضة لمعاملات الصناديق." },
      { name: "تداول العملات الرقمية", fee: "0.2%", note: "عمولة معاملات العملات الرقمية." },
      { name: "الدفع بـ QR (تاجر)", fee: "1.5%", note: "عمولة قبول مدفوعات QR." },
      { name: "POS افتراضي (لكل معاملة)", fee: "2.0% + 0.25 TL", note: "عمولة معالجة الدفع عبر الإنترنت." },
      { name: "إيجار جهاز POS", fee: "49 TL/شهر", note: "رسوم إيجار جهاز POS الفعلي الشهرية." },
      { name: "استخدام POS المحمول", fee: "19 TL/شهر", note: "رسوم استخدام برنامج POS المحمول." },
      { name: "معالجة الدفع الجماعي", fee: "0.50 TL/معاملة", note: "رسوم معالجة لكل دفعة جماعية." },
      { name: "توزيع العمولات", fee: "1%", note: "رسوم خدمة توزيع العمولات التلقائية." },
      { name: "كشف حساب (مطبوع)", fee: "5 TL", note: "رسوم طلب كشف حساب مطبوع." },
      { name: "إلغاء / استرداد", fee: "2 TL", note: "رسوم معاملة الإلغاء والاسترداد." },
      { name: "رسوم إشعار SMS", fee: "0.20 TL", note: "رسوم إشعار SMS بعد كل معاملة." },
    ],
    corporate: [
      { name: "فتح حساب شركات", fee: "مجاني", note: "فتح حساب الشركات مجاني." },
      { name: "رسوم الصيانة الشهرية", fee: "99 TL", note: "رسوم الصيانة الشهرية لحساب الشركات." },
      { name: "إيجار جهاز POS", fee: "99 TL/شهر", note: "إيجار جهاز POS المتميز الشهري." },
      { name: "عمولة POS الافتراضي", fee: "1.8%", note: "عمولة معالجة الدفع عبر الإنترنت (شركات)." },
      { name: "الدفع الجماعي (شركات)", fee: "0.35 TL/معاملة", note: "رسوم معالجة الدفع الجماعي للشركات." },
      { name: "البطاقة المؤسسية (سنوي)", fee: "250 TL", note: "الرسوم السنوية للبطاقة المؤسسية." },
      { name: "استخدام API", fee: "مجاني", note: "تكامل API واستخدامه مجاني." },
      { name: "الدعم الفني المتميز", fee: "500 TL/شهر", note: "حزمة دعم فني ذو أولوية 24/7." },
      { name: "إعداد POS الفعلي", fee: "250 TL", note: "رسوم إعداد وتفعيل جهاز POS." },
      { name: "رابط الدفع (شركات)", fee: "1.5%", note: "عمولة رابط الدفع." },
    ],
  },
  ku: {
    individual: [
      { name: "Berdêla Vekirina Hesab", fee: "Belaş", note: "Bêyî dayîna tu berdêlê hesabek veke." },
      { name: "Berdêla Birêvebirina Mehane", fee: "0 TL", note: "Berdêla birêvebirina mehane tune." },
      { name: "Berdêla Serlêdana Kartê (Standard)", fee: "Belaş", note: "Serlêdana karta standard belaş e." },
      { name: "Berdêla Serlêdana Kartê (Zîv)", fee: "50 TL", note: "Berdêla serlêdana karta zîv a yekcar." },
      { name: "Berdêla Serlêdana Kartê (Zêr)", fee: "150 TL", note: "Berdêla serlêdana karta zêr a yekcar." },
      { name: "Berdêla Salane (Standard)", fee: "0 TL", note: "Karta standard salane belaş e." },
      { name: "Berdêla Salane (Zîv)", fee: "120 TL", note: "Berdêla karta zîv a salane." },
      { name: "Berdêla Salane (Zêr)", fee: "360 TL", note: "Berdêla karta zêr a salane." },
      { name: "Berdêla Nûkirina Kartê", fee: "15 TL", note: "Nûkirina kartê di rewşa windabûn/diziyê de." },
      { name: "Danîna Pereyan (ATM/Şube)", fee: "Belaş", note: "Hemî danînên pereyan belaş in." },
      { name: "Derxistina Pereyan (ATMa Me)", fee: "Belaş", note: "Derxistina pereyan ji ATMên me belaş e." },
      { name: "Derxistina Pereyan (ATMa Din)", fee: "5 TL + BSMV", note: "Derxistina pereyan ji ATMên bankayên din." },
      { name: "EFT / Havale (Bankayên Din)", fee: "1.50 TL", note: "Berdêla veguhestinê ji bankayên din." },
      { name: "Veguhestina FAST", fee: "0.75 TL", note: "Veguhestina tavilê bi pergala FAST." },
      { name: "Veguhestina MoneyShop", fee: "Belaş", note: "Veguhestina di navbera bikarhênerên MoneyShop de belaş e." },
      { name: "Vekirina Hesabê Veberhênanê", fee: "Belaş", note: "Vekirina hesabê veberhênanê belaş e." },
      { name: "Kirîn/Firotina Hîseyan", fee: "%0,1", note: "Komîsyona li ser qebareya danûstandinê." },
      { name: "Kirîn/Firotina Fonê", fee: "%0,05", note: "Komîsyona kêm ji bo danûstandinên fonê." },
      { name: "Kirîn/Firotina Kripto", fee: "%0,2", note: "Komîsyona danûstandina kripto." },
      { name: "Dravdana QR (Bazirgan)", fee: "%1,5", note: "Komîsyona qebulkirina dravdanên QR." },
      { name: "POS-ya Serhêl (Her Danûstandin)", fee: "%2,0 + 0,25 TL", note: "Komîsyona pêvajokirina dravdana serhêl." },
      { name: "Kirêkirina Cîhaza POS", fee: "49 TL/meh", note: "Berdêla kirêkirina cîhaza POS-ya fîzîkî." },
      { name: "Bikaranîna POS-ya Mobîl", fee: "19 TL/meh", note: "Berdêla bikaranîna nermalava POS-ya mobîl." },
      { name: "Pêvajokirina Dravdana Komî", fee: "0.50 TL/danûstandin", note: "Berdêla pêvajokirinê ji bo her dravdana komî." },
      { name: "Belavkirina Komîsyonê", fee: "%1", note: "Berdêla karûbarê belavkirina komîsyonê ya otomatîkî." },
      { name: "Kurteya Hesab (Çapkirî)", fee: "5 TL", note: "Berdêla daxwaza kurteya hesab a çapkirî." },
      { name: "Betal/Rûbirûkirin", fee: "2 TL", note: "Berdêla danûstandina betal û vegerê." },
      { name: "Berdêla Agahdariya SMS", fee: "0.20 TL", note: "Berdêla agahdariya SMS piştî her danûstandinê." },
    ],
    corporate: [
      { name: "Vekirina Hesabê Pargînî", fee: "Belaş", note: "Vekirina hesabê pargînî belaş e." },
      { name: "Berdêla Birêvebirina Mehane", fee: "99 TL", note: "Berdêla birêvebirina mehane ya pargînî." },
      { name: "Kirêkirina Cîhaza POS", fee: "99 TL/meh", note: "Kirêkirina cîhaza POS-ya premium a mehane." },
      { name: "Komîsyona POS-ya Serhêl", fee: "%1,8", note: "Komîsyona pêvajokirina dravdana serhêl (pargînî)." },
      { name: "Dravdana Komî (Pargînî)", fee: "0.35 TL/danûstandin", note: "Berdêla pêvajokirina dravdana komî ya pargînî." },
      { name: "Karta Pargînî (Salane)", fee: "250 TL", note: "Berdêla salane ya karta pargînî." },
      { name: "Bikaranîna API", fee: "Belaş", note: "Entegrasyon û bikaranîna API-yê belaş e." },
      { name: "Piştgiriya Teknîkî ya Premium", fee: "500 TL/meh", note: "Pakêta piştgiriya teknîkî ya pêşîn 24/7." },
      { name: "Sazkirina POS-ya Fîzîkî", fee: "250 TL", note: "Berdêla sazkirin û aktîvkirina cîhaza POS." },
      { name: "Girêdana Dravdanê (Pargînî)", fee: "%1,5", note: "Komîsyona girêdana dravdanê." },
    ],
  },
  fr: {
    individual: [
      { name: "Frais d'ouverture de compte", fee: "Gratuit", note: "Ouvrez un compte sans payer de frais." },
      { name: "Frais de tenue de compte mensuels", fee: "0 TL", note: "Pas de frais de tenue de compte mensuels." },
      { name: "Frais de demande de carte (Standard)", fee: "Gratuit", note: "La demande de carte Standard est gratuite." },
      { name: "Frais de demande de carte (Argent)", fee: "50 TL", note: "Frais uniques de demande de carte Argent." },
      { name: "Frais de demande de carte (Or)", fee: "150 TL", note: "Frais uniques de demande de carte Or." },
      { name: "Frais annuels de carte (Standard)", fee: "0 TL", note: "La carte Standard est gratuite par an." },
      { name: "Frais annuels de carte (Argent)", fee: "120 TL", note: "Frais annuels de la carte Argent." },
      { name: "Frais annuels de carte (Or)", fee: "360 TL", note: "Frais annuels de la carte Or." },
      { name: "Frais de remplacement de carte", fee: "15 TL", note: "Remplacement de carte en cas de perte ou vol." },
      { name: "Dépôt d'espèces (DAB/Succursale)", fee: "Gratuit", note: "Tous les dépôts d'espèces sont gratuits." },
      { name: "Retrait d'espèces (notre DAB)", fee: "Gratuit", note: "Les retraits à nos DAB sont gratuits." },
      { name: "Retrait d'espèces (autre DAB)", fee: "5 TL + BSMV", note: "Retrait aux DAB d'autres banques." },
      { name: "Virement bancaire / EFT", fee: "1,50 TL", note: "Frais de virement vers d'autres banques." },
      { name: "Transfert FAST", fee: "0,75 TL", note: "Transfert instantané via le système FAST." },
      { name: "Transfert MoneyShop", fee: "Gratuit", note: "Les transferts entre utilisateurs MoneyShop sont gratuits." },
      { name: "Ouverture de compte d'investissement", fee: "Gratuit", note: "L'ouverture d'un compte d'investissement est gratuite." },
      { name: "Achat/Vente d'actions", fee: "0,1%", note: "Commission basée sur le volume de transaction." },
      { name: "Achat/Vente de fonds", fee: "0,05%", note: "Commission réduite pour les transactions de fonds." },
      { name: "Achat/Vente de crypto", fee: "0,2%", note: "Commission sur transactions crypto." },
      { name: "Paiement QR (Commerçant)", fee: "1,5%", note: "Commission pour l'acceptation des paiements QR." },
      { name: "POS Virtuel (par transaction)", fee: "2,0% + 0,25 TL", note: "Commission de traitement des paiements en ligne." },
      { name: "Location de terminal POS", fee: "49 TL/mois", note: "Frais de location mensuels du terminal POS physique." },
      { name: "Utilisation du POS Mobile", fee: "19 TL/mois", note: "Frais d'utilisation du logiciel POS mobile." },
      { name: "Traitement des paiements groupés", fee: "0,50 TL/transaction", note: "Frais de traitement par paiement groupé." },
      { name: "Distribution de commissions", fee: "1%", note: "Frais de service de distribution automatique des commissions." },
      { name: "Relevé (imprimé)", fee: "5 TL", note: "Frais de demande de relevé de compte imprimé." },
      { name: "Annulation / Remboursement", fee: "2 TL", note: "Frais de transaction d'annulation et de remboursement." },
      { name: "Frais de notification SMS", fee: "0,20 TL", note: "Frais de notification SMS après chaque transaction." },
    ],
    corporate: [
      { name: "Ouverture de compte professionnel", fee: "Gratuit", note: "L'ouverture d'un compte professionnel est gratuite." },
      { name: "Frais de tenue de compte mensuels", fee: "99 TL", note: "Frais mensuels de tenue de compte professionnel." },
      { name: "Location de terminal POS", fee: "99 TL/mois", note: "Location mensuelle du terminal POS premium." },
      { name: "Commission POS Virtuel", fee: "1,8%", note: "Commission de traitement des paiements en ligne (pro)." },
      { name: "Paiement groupé (Professionnel)", fee: "0,35 TL/transaction", note: "Frais de traitement des paiements groupés pro." },
      { name: "Carte professionnelle (annuelle)", fee: "250 TL", note: "Frais annuels de la carte professionnelle." },
      { name: "Utilisation de l'API", fee: "Gratuit", note: "L'intégration et l'utilisation de l'API sont gratuites." },
      { name: "Support technique Premium", fee: "500 TL/mois", note: "Pack de support technique prioritaire 24/7." },
      { name: "Installation POS physique", fee: "250 TL", note: "Frais d'installation et d'activation du terminal POS." },
      { name: "Lien de paiement (Professionnel)", fee: "1,5%", note: "Commission sur lien de paiement." },
    ],
  },
  ru: {
    individual: [
      { name: "Плата за открытие счета", fee: "Бесплатно", note: "Откройте счет без оплаты." },
      { name: "Ежемесячное обслуживание счета", fee: "0 TL", note: "Нет ежемесячной платы за обслуживание." },
      { name: "Плата за выпуск карты (Стандарт)", fee: "Бесплатно", note: "Выпуск стандартной карты бесплатен." },
      { name: "Плата за выпуск карты (Серебро)", fee: "50 TL", note: "Единоразовая плата за карту Серебро." },
      { name: "Плата за выпуск карты (Золото)", fee: "150 TL", note: "Единоразовая плата за карту Золото." },
      { name: "Годовая плата за карту (Стандарт)", fee: "0 TL", note: "Стандартная карта бесплатна ежегодно." },
      { name: "Годовая плата за карту (Серебро)", fee: "120 TL", note: "Годовая плата за карту Серебро." },
      { name: "Годовая плата за карту (Золото)", fee: "360 TL", note: "Годовая плата за карту Золото." },
      { name: "Замена карты", fee: "15 TL", note: "Замена карты при утере или краже." },
      { name: "Пополнение наличными (банкомат/отделение)", fee: "Бесплатно", note: "Все пополнения наличными бесплатны." },
      { name: "Снятие наличных (свой банкомат)", fee: "Бесплатно", note: "Снятие в наших банкоматах бесплатно." },
      { name: "Снятие наличных (чужой банкомат)", fee: "5 TL + BSMV", note: "Снятие в банкоматах других банков." },
      { name: "Банковский перевод / EFT", fee: "1,50 TL", note: "Комиссия за перевод в другие банки." },
      { name: "Перевод FAST", fee: "0,75 TL", note: "Мгновенный перевод через систему FAST." },
      { name: "Перевод MoneyShop", fee: "Бесплатно", note: "Переводы между пользователями MoneyShop бесплатны." },
      { name: "Открытие инвестиционного счета", fee: "Бесплатно", note: "Открытие инвестиционного счета бесплатно." },
      { name: "Торговля акциями", fee: "0,1%", note: "Комиссия с объема торгов." },
      { name: "Торговля фондами", fee: "0,05%", note: "Низкая комиссия за операции с фондами." },
      { name: "Торговля криптовалютой", fee: "0,2%", note: "Комиссия за операции с криптовалютой." },
      { name: "QR-платеж (продавец)", fee: "1,5%", note: "Комиссия за прием QR-платежей." },
      { name: "Виртуальный POS (за операцию)", fee: "2,0% + 0,25 TL", note: "Комиссия за обработку онлайн-платежей." },
      { name: "Аренда POS-терминала", fee: "49 TL/мес", note: "Ежемесячная аренда физического POS-терминала." },
      { name: "Использование мобильного POS", fee: "19 TL/мес", note: "Плата за использование мобильного ПО POS." },
      { name: "Массовые платежи", fee: "0,50 TL/операция", note: "Комиссия за каждый массовый платеж." },
      { name: "Распределение комиссий", fee: "1%", note: "Плата за автоматическое распределение комиссий." },
      { name: "Выписка по счету (печатная)", fee: "5 TL", note: "Плата за запрос печатной выписки." },
      { name: "Отмена / Возврат", fee: "2 TL", note: "Комиссия за отмену и возврат операции." },
      { name: "SMS-уведомление", fee: "0,20 TL", note: "Плата за SMS-уведомление после каждой операции." },
    ],
    corporate: [
      { name: "Открытие корпоративного счета", fee: "Бесплатно", note: "Открытие корпоративного счета бесплатно." },
      { name: "Ежемесячное обслуживание", fee: "99 TL", note: "Ежемесячная плата за корпоративный счет." },
      { name: "Аренда POS-терминала", fee: "99 TL/мес", note: "Ежемесячная аренда премиум POS-терминала." },
      { name: "Комиссия виртуального POS", fee: "1,8%", note: "Комиссия за обработку онлайн-платежей (корп.)." },
      { name: "Массовые платежи (Корп.)", fee: "0,35 TL/операция", note: "Комиссия за массовые платежи для корп. счетов." },
      { name: "Корпоративная карта (годовая)", fee: "250 TL", note: "Годовая плата за корпоративную карту." },
      { name: "Использование API", fee: "Бесплатно", note: "Интеграция и использование API бесплатны." },
      { name: "Премиум техническая поддержка", fee: "500 TL/мес", note: "Пакет приоритетной техподдержки 24/7." },
      { name: "Установка физического POS", fee: "250 TL", note: "Плата за установку и активацию POS-терминала." },
      { name: "Платежная ссылка (Корп.)", fee: "1,5%", note: "Комиссия за платежную ссылку." },
    ],
  },
};

const limitsData = {
  tr: {
    individual: [
      { name: "Günlük Para Çekme Limiti", limit: "10.000 TL", note: "ATM ve şubelerden günlük para çekme limiti." },
      { name: "Tek Seferlik Para Çekme", limit: "5.000 TL", note: "ATM'den tek seferde çekilebilecek maksimum tutar." },
      { name: "Günlük Harcama Limiti", limit: "25.000 TL", note: "Kart ile günlük toplam harcama limiti." },
      { name: "Tek İşlem Harcama Limiti", limit: "10.000 TL", note: "Tek seferde yapılabilecek maksimum kart harcaması." },
      { name: "Günlük EFT/Havale Limiti", limit: "50.000 TL", note: "Günlük toplam EFT/havale gönderme limiti." },
      { name: "Tek İşlem EFT Limiti", limit: "25.000 TL", note: "Tek EFT/havale işleminde gönderilebilecek maksimum tutar." },
      { name: "Günlük FAST Limiti", limit: "25.000 TL", note: "FAST sistemi ile günlük toplam transfer limiti." },
      { name: "Tek İşlem FAST Limiti", limit: "10.000 TL", note: "Tek FAST işleminde gönderilebilecek maksimum tutar." },
      { name: "Günlük Para Yatırma Limiti", limit: "50.000 TL", note: "ATM/şubeden günlük para yatırma limiti." },
      { name: "Mobil Transfer Limiti", limit: "10.000 TL", note: "Mobil uygulamadan günlük transfer limiti." },
      { name: "Temassız Ödeme Limiti", limit: "1.500 TL", note: "Tek temassız ödeme işlem limiti." },
      { name: "QR Ödeme Limiti", limit: "5.000 TL", note: "Tek QR ödeme işlem limiti." },
      { name: "Günlük QR Ödeme Limiti", limit: "15.000 TL", note: "Günlük toplam QR ödeme limiti." },
      { name: "POS İşlem Limiti", limit: "25.000 TL", note: "Tek POS işleminde maksimum ödeme tutarı." },
      { name: "Minimum Bakiye", limit: "0 TL", note: "Hesapta bulunması gereken minimum bakiye yoktur." },
      { name: "Maksimum Bakiye", limit: "500.000 TL", note: "Bireysel hesaplarda bulunabilecek maksimum bakiye." },
      { name: "Günlük Yatırım İşlem Limiti", limit: "100.000 TL", note: "Günlük toplam alım/satım işlem limiti." },
      { name: "Kripto Para İşlem Limiti", limit: "25.000 TL", note: "Tek kripto para işlem limiti." },
      { name: "Toplu Ödeme Limiti", limit: "100.000 TL/gün", note: "Günlük toplu ödeme gönderme limiti." },
      { name: "Alıcı Sayısı (Toplu Ödeme)", limit: "500 kişi", note: "Tek toplu ödemede maksimum alıcı sayısı." },
      { name: "Kart İşlem Sıklığı", limit: "50 işlem/gün", note: "Kart ile günlük maksimum işlem sayısı." },
    ],
    corporate: [
      { name: "Günlük Para Çekme", limit: "100.000 TL", note: "Kurumsal hesaplar için günlük para çekme limiti." },
      { name: "Günlük EFT/Havale Limiti", limit: "500.000 TL", note: "Kurumsal günlük toplam EFT/havale limiti." },
      { name: "Tek İşlem EFT Limiti", limit: "250.000 TL", note: "Kurumsal tek EFT işlem limiti." },
      { name: "Günlük Harcama Limiti", limit: "250.000 TL", note: "Kurumsal kart günlük harcama limiti." },
      { name: "POS İşlem Limiti", limit: "100.000 TL", note: "Kurumsal POS işlem limiti." },
      { name: "Toplu Ödeme Limiti", limit: "1.000.000 TL/gün", note: "Kurumsal günlük toplu ödeme limiti." },
      { name: "Alıcı Sayısı (Toplu Ödeme)", limit: "2.000 kişi", note: "Kurumsal toplu ödemede maksimum alıcı." },
      { name: "Minimum Bakiye", limit: "10.000 TL", note: "Kurumsal hesaplarda bulunması gereken minimum bakiye." },
      { name: "Maksimum Bakiye", limit: "5.000.000 TL", note: "Kurumsal hesaplarda bulunabilecek maksimum bakiye." },
      { name: "Günlük İşlem Sayısı", limit: "1.000 işlem/gün", note: "Kurumsal günlük maksimum işlem sayısı." },
      { name: "Kart İşlem Sıklığı", limit: "200 işlem/gün", note: "Kurumsal kart ile günlük maksimum işlem." },
      { name: "API İstek Limiti", limit: "10.000 istek/saat", note: "API saatlik maksimum istek limiti." },
    ],
  },
  en: {
    individual: [
      { name: "Daily Cash Withdrawal Limit", limit: "10,000 TL", note: "Daily withdrawal limit from ATMs and branches." },
      { name: "Single Withdrawal Limit", limit: "5,000 TL", note: "Maximum amount withdrawable per ATM transaction." },
      { name: "Daily Spending Limit", limit: "25,000 TL", note: "Total daily card spending limit." },
      { name: "Single Transaction Spending Limit", limit: "10,000 TL", note: "Maximum card spending per transaction." },
      { name: "Daily EFT / Transfer Limit", limit: "50,000 TL", note: "Daily total transfer limit to other banks." },
      { name: "Single EFT Limit", limit: "25,000 TL", note: "Maximum amount per EFT / bank transfer." },
      { name: "Daily FAST Limit", limit: "25,000 TL", note: "Daily total transfer limit via FAST." },
      { name: "Single FAST Limit", limit: "10,000 TL", note: "Maximum amount per FAST transfer." },
      { name: "Daily Cash Deposit Limit", limit: "50,000 TL", note: "Daily cash deposit limit at ATM/branch." },
      { name: "Mobile Transfer Limit", limit: "10,000 TL", note: "Daily transfer limit from mobile app." },
      { name: "Contactless Payment Limit", limit: "1,500 TL", note: "Single contactless payment limit." },
      { name: "QR Payment Limit", limit: "5,000 TL", note: "Single QR payment limit." },
      { name: "Daily QR Payment Limit", limit: "15,000 TL", note: "Daily total QR payment limit." },
      { name: "POS Transaction Limit", limit: "25,000 TL", note: "Maximum amount per POS transaction." },
      { name: "Minimum Balance", limit: "0 TL", note: "There is no minimum balance requirement." },
      { name: "Maximum Balance", limit: "500,000 TL", note: "Maximum balance allowed for individual accounts." },
      { name: "Daily Investment Transaction Limit", limit: "100,000 TL", note: "Daily total buy/sell transaction limit." },
      { name: "Crypto Transaction Limit", limit: "25,000 TL", note: "Single crypto transaction limit." },
      { name: "Bulk Payment Limit", limit: "100,000 TL/day", note: "Daily bulk payment sending limit." },
      { name: "Recipient Count (Bulk Payment)", limit: "500 people", note: "Maximum recipient count per bulk payment." },
      { name: "Card Transaction Frequency", limit: "50 tx/day", note: "Maximum number of card transactions per day." },
    ],
    corporate: [
      { name: "Daily Cash Withdrawal", limit: "100,000 TL", note: "Daily withdrawal limit for corporate accounts." },
      { name: "Daily EFT / Transfer Limit", limit: "500,000 TL", note: "Total daily EFT / transfer limit for corporate accounts." },
      { name: "Single EFT Limit", limit: "250,000 TL", note: "Single EFT transaction limit for corporate accounts." },
      { name: "Daily Spending Limit", limit: "250,000 TL", note: "Daily card spending limit for corporate accounts." },
      { name: "POS Transaction Limit", limit: "100,000 TL", note: "Corporate POS transaction limit." },
      { name: "Bulk Payment Limit", limit: "1,000,000 TL/day", note: "Daily bulk payment limit for corporate accounts." },
      { name: "Recipient Count (Bulk Payment)", limit: "2,000 people", note: "Maximum recipients per corporate bulk payment." },
      { name: "Minimum Balance", limit: "10,000 TL", note: "Minimum balance required for corporate accounts." },
      { name: "Maximum Balance", limit: "5,000,000 TL", note: "Maximum balance allowed for corporate accounts." },
      { name: "Daily Transaction Count", limit: "1,000 tx/day", note: "Maximum daily transaction count for corporate accounts." },
      { name: "Card Transaction Frequency", limit: "200 tx/day", note: "Maximum daily card transaction count for corporate accounts." },
      { name: "API Request Limit", limit: "10,000 req/hr", note: "Maximum hourly API request limit." },
    ],
  },
  ar: {
    individual: [
      { name: "حد السحب النقدي اليومي", limit: "10.000 TL", note: "حد السحب النقدي اليومي من أجهزة الصراف الآلي والفروع." },
      { name: "حد السحب لمرة واحدة", limit: "5.000 TL", note: "الحد الأقصى للسحب لكل معاملة صراف آلي." },
      { name: "حد الإنفاق اليومي", limit: "25.000 TL", note: "إجمالي حد الإنفاق اليومي للبطاقة." },
      { name: "حد الإنفاق لكل معاملة", limit: "10.000 TL", note: "الحد الأقصى للإنفاق لكل معاملة." },
      { name: "حد التحويل الإلكتروني اليومي", limit: "50.000 TL", note: "إجمالي حد التحويل اليومي للبنوك الأخرى." },
      { name: "حد التحويل الإلكتروني للمعاملة", limit: "25.000 TL", note: "الحد الأقصى لكل تحويل إلكتروني." },
      { name: "حد FAST اليومي", limit: "25.000 TL", note: "إجمالي حد التحويل اليومي عبر FAST." },
      { name: "حد FAST للمعاملة", limit: "10.000 TL", note: "الحد الأقصى لكل تحويل FAST." },
      { name: "حد الإيداع النقدي اليومي", limit: "50.000 TL", note: "حد الإيداع النقدي اليومي في الصراف الآلي/الفرع." },
      { name: "حد التحويل عبر الجوال", limit: "10.000 TL", note: "حد التحويل اليومي من تطبيق الجوال." },
      { name: "حد الدفع اللاتلامسي", limit: "1.500 TL", note: "حد الدفع اللاتلامسي للمعاملة الواحدة." },
      { name: "حد دفع QR", limit: "5.000 TL", note: "حد معاملة دفع QR الواحدة." },
      { name: "حد دفع QR اليومي", limit: "15.000 TL", note: "إجمالي حد دفع QR اليومي." },
      { name: "حد معاملة POS", limit: "25.000 TL", note: "الحد الأقصى للمبلغ لكل معاملة POS." },
      { name: "الحد الأدنى للرصيد", limit: "0 TL", note: "لا يوجد حد أدنى للرصيد المطلوب." },
      { name: "الحد الأقصى للرصيد", limit: "500.000 TL", note: "الحد الأقصى للرصيد المسموح به للحسابات الفردية." },
      { name: "حد معاملات الاستثمار اليومي", limit: "100.000 TL", note: "إجمالي حد معاملات الشراء/البيع اليومي." },
      { name: "حد معاملة العملات الرقمية", limit: "25.000 TL", note: "حد معاملة العملات الرقمية الواحدة." },
      { name: "حد الدفع الجماعي", limit: "100.000 TL/يوم", note: "حد إرسال الدفع الجماعي اليومي." },
      { name: "عدد المستلمين (الدفع الجماعي)", limit: "500 شخص", note: "الحد الأقصى لعدد المستلمين لكل دفعة جماعية." },
      { name: "تكرار معاملات البطاقة", limit: "50 معاملة/يوم", note: "الحد الأقصى لعدد معاملات البطاقة يوميًا." },
    ],
    corporate: [
      { name: "السحب النقدي اليومي", limit: "100.000 TL", note: "حد السحب النقدي اليومي للحسابات المؤسسية." },
      { name: "حد التحويل الإلكتروني اليومي", limit: "500.000 TL", note: "إجمالي حد التحويل اليومي للحسابات المؤسسية." },
      { name: "حد التحويل للمعاملة", limit: "250.000 TL", note: "حد معاملة التحويل الواحدة للمؤسسات." },
      { name: "حد الإنفاق اليومي", limit: "250.000 TL", note: "حد الإنفاق اليومي للبطاقة المؤسسية." },
      { name: "حد معاملة POS", limit: "100.000 TL", note: "حد معاملة POS للمؤسسات." },
      { name: "حد الدفع الجماعي", limit: "1.000.000 TL/يوم", note: "حد الدفع الجماعي اليومي للمؤسسات." },
      { name: "عدد المستلمين (الدفع الجماعي)", limit: "2.000 شخص", note: "الحد الأقصى للمستلمين لكل دفعة جماعية مؤسسية." },
      { name: "الحد الأدنى للرصيد", limit: "10.000 TL", note: "الحد الأدنى للرصيد المطلوب للحسابات المؤسسية." },
      { name: "الحد الأقصى للرصيد", limit: "5.000.000 TL", note: "الحد الأقصى للرصيد المسموح به للحسابات المؤسسية." },
      { name: "عدد المعاملات اليومي", limit: "1.000 معاملة/يوم", note: "الحد الأقصى لعدد المعاملات اليومي للمؤسسات." },
      { name: "تكرار معاملات البطاقة", limit: "200 معاملة/يوم", note: "الحد الأقصى لمعاملات البطاقة اليومية للمؤسسات." },
      { name: "حد طلبات API", limit: "10.000 طلب/ساعة", note: "الحد الأقصى لطلبات API في الساعة." },
    ],
  },
  ku: {
    individual: [
      { name: "Sînorê Derxistina Pereyê Rojane", limit: "10.000 TL", note: "Sînorê derxistina pereyê rojane ji ATM û şaxan." },
      { name: "Sînorê Derxistina Yekcar", limit: "5.000 TL", note: "Mîqdara herî zêde ya ku dikare di her danûstandina ATM-ê de were derxistin." },
      { name: "Sînorê Lêçûna Rojane", limit: "25.000 TL", note: "Sînorê tevahî yê lêçûna rojane ya kartê." },
      { name: "Sînorê Lêçûna Danûstandinê", limit: "10.000 TL", note: "Mîqdara herî zêde ya lêçûna kartê ji bo her danûstandinê." },
      { name: "Sînorê Rojane yê EFT/Havale", limit: "50.000 TL", note: "Sînorê tevahî yê rojane yê veguhestinê ji bankayên din." },
      { name: "Sînorê EFT yê Danûstandinê", limit: "25.000 TL", note: "Mîqdara herî zêde ji bo her EFT/havaleyê." },
      { name: "Sînorê Rojane yê FAST", limit: "25.000 TL", note: "Sînorê tevahî yê veguhestina rojane bi FAST." },
      { name: "Sînorê FAST yê Danûstandinê", limit: "10.000 TL", note: "Mîqdara herî zêde ji bo her veguhestina FAST." },
      { name: "Sînorê Danîna Pereyê Rojane", limit: "50.000 TL", note: "Sînorê danîna pereyê rojane li ATM/şaxê." },
      { name: "Sînorê Veguhestina Mobîl", limit: "10.000 TL", note: "Sînorê veguhestina rojane ji sepanê mobîl." },
      { name: "Sînorê Dayîna Bêtêkilî", limit: "1.500 TL", note: "Sînorê dayîna bêtêkilî ya yek danûstandinê." },
      { name: "Sînorê Dayîna QR", limit: "5.000 TL", note: "Sînorê dayîna QR ya yek danûstandinê." },
      { name: "Sînorê Rojane yê Dayîna QR", limit: "15.000 TL", note: "Sînorê tevahî yê dayîna QR ya rojane." },
      { name: "Sînorê Danûstandina POS", limit: "25.000 TL", note: "Mîqdara herî zêde ji bo her danûstandina POS-ê." },
      { name: "Bakiya Hindiktirîn", limit: "0 TL", note: "Tu bakiya hindiktirîn a pêwîst tune." },
      { name: "Bakiya Zêdetirîn", limit: "500.000 TL", note: "Bakiya herî zêde ya destûr ji bo hesabên kesane." },
      { name: "Sînorê Danûstandina Veberhênanê ya Rojane", limit: "100.000 TL", note: "Sînorê tevahî yê danûstandina kirîn/firotina rojane." },
      { name: "Sînorê Danûstandina Kripto", limit: "25.000 TL", note: "Sînorê danûstandina kripto ya yekcar." },
      { name: "Sînorê Dayîna Komî", limit: "100.000 TL/roj", note: "Sînorê şandina dayîna komî ya rojane." },
      { name: "Hejmara Wergiran (Dayîna Komî)", limit: "500 kes", note: "Hejmara herî zêde ya wergiran ji bo her dayîna komî." },
      { name: "Frekansa Danûstandina Kartê", limit: "50 danûstandin/roj", note: "Hejmara herî zêde ya danûstandinên kartê di rojê de." },
    ],
    corporate: [
      { name: "Derxistina Pereyê Rojane", limit: "100.000 TL", note: "Sînorê derxistina pereyê rojane ji bo hesabên pargînî." },
      { name: "Sînorê Rojane yê EFT/Havale", limit: "500.000 TL", note: "Sînorê tevahî yê EFT/havaleyê rojane ji bo hesabên pargînî." },
      { name: "Sînorê Danûstandina EFT", limit: "250.000 TL", note: "Sînorê danûstandina EFT ya yekcar ji bo hesabên pargînî." },
      { name: "Sînorê Lêçûna Rojane", limit: "250.000 TL", note: "Sînorê lêçûna rojane ya karta pargînî." },
      { name: "Sînorê Danûstandina POS", limit: "100.000 TL", note: "Sînorê danûstandina POS ya pargînî." },
      { name: "Sînorê Dayîna Komî", limit: "1.000.000 TL/roj", note: "Sînorê rojane yê dayîna komî ji bo hesabên pargînî." },
      { name: "Hejmara Wergiran (Dayîna Komî)", limit: "2.000 kes", note: "Herî zêde wergirên ji bo dayîna komî ya pargînî." },
      { name: "Bakiya Hindiktirîn", limit: "10.000 TL", note: "Bakiya hindiktirîn a pêwîst ji bo hesabên pargînî." },
      { name: "Bakiya Zêdetirîn", limit: "5.000.000 TL", note: "Bakiya herî zêde ya destûr ji bo hesabên pargînî." },
      { name: "Hejmara Danûstandinên Rojane", limit: "1.000 danûstandin/roj", note: "Hejmara herî zêde ya danûstandinên rojane ji bo hesabên pargînî." },
      { name: "Frekansa Danûstandina Kartê", limit: "200 danûstandin/roj", note: "Hejmara herî zêde ya danûstandinên karta pargînî di rojê de." },
      { name: "Sînorê Daxwaza API", limit: "10.000 daxwaz/saet", note: "Sînorê herî zêde yê daxwazên API di saetê de." },
    ],
  },
  fr: {
    individual: [
      { name: "Plafond de retrait quotidien", limit: "10 000 TL", note: "Plafond de retrait quotidien aux DAB et agences." },
      { name: "Plafond de retrait unitaire", limit: "5 000 TL", note: "Montant maximum retirable par opération au DAB." },
      { name: "Plafond de dépenses quotidien", limit: "25 000 TL", note: "Plafond de dépenses total quotidien par carte." },
      { name: "Plafond de dépense par opération", limit: "10 000 TL", note: "Montant maximum de dépense par opération." },
      { name: "Plafond de virement EFT quotidien", limit: "50 000 TL", note: "Plafond total de virement quotidien vers d'autres banques." },
      { name: "Plafond EFT par opération", limit: "25 000 TL", note: "Montant maximum par virement EFT." },
      { name: "Plafond FAST quotidien", limit: "25 000 TL", note: "Plafond total de transfert quotidien via FAST." },
      { name: "Plafond FAST par opération", limit: "10 000 TL", note: "Montant maximum par transfert FAST." },
      { name: "Plafond de dépôt en espèces quotidien", limit: "50 000 TL", note: "Plafond de dépôt en espèces quotidien au DAB/agence." },
      { name: "Plafond de transfert mobile", limit: "10 000 TL", note: "Plafond de transfert quotidien depuis l'application mobile." },
      { name: "Plafond de paiement sans contact", limit: "1 500 TL", note: "Plafond d'un paiement sans contact." },
      { name: "Plafond de paiement QR", limit: "5 000 TL", note: "Plafond d'un paiement QR unique." },
      { name: "Plafond de paiement QR quotidien", limit: "15 000 TL", note: "Plafond total de paiement QR quotidien." },
      { name: "Plafond d'opération POS", limit: "25 000 TL", note: "Montant maximum par transaction POS." },
      { name: "Solde minimum", limit: "0 TL", note: "Aucun solde minimum requis." },
      { name: "Solde maximum", limit: "500 000 TL", note: "Solde maximum autorisé pour les comptes particuliers." },
      { name: "Plafond d'opérations d'investissement quotidien", limit: "100 000 TL", note: "Plafond total d'achat/vente quotidien." },
      { name: "Plafond d'opération crypto", limit: "25 000 TL", note: "Plafond d'une opération crypto unique." },
      { name: "Plafond de paiement groupé", limit: "100 000 TL/jour", note: "Plafond d'envoi de paiement groupé quotidien." },
      { name: "Nombre de bénéficiaires (Paiement groupé)", limit: "500 personnes", note: "Nombre maximum de bénéficiaires par paiement groupé." },
      { name: "Fréquence d'opérations carte", limit: "50 opérations/jour", note: "Nombre maximum d'opérations carte par jour." },
    ],
    corporate: [
      { name: "Retrait en espèces quotidien", limit: "100 000 TL", note: "Plafond de retrait quotidien pour comptes professionnels." },
      { name: "Plafond de virement EFT quotidien", limit: "500 000 TL", note: "Plafond total de virement quotidien pour comptes professionnels." },
      { name: "Plafond EFT par opération", limit: "250 000 TL", note: "Plafond d'une opération EFT pour comptes professionnels." },
      { name: "Plafond de dépenses quotidien", limit: "250 000 TL", note: "Plafond de dépenses quotidien de la carte professionnelle." },
      { name: "Plafond d'opération POS", limit: "100 000 TL", note: "Plafond d'opération POS professionnel." },
      { name: "Plafond de paiement groupé", limit: "1 000 000 TL/jour", note: "Plafond de paiement groupé quotidien pour comptes professionnels." },
      { name: "Nombre de bénéficiaires (Paiement groupé)", limit: "2 000 personnes", note: "Nombre maximum de bénéficiaires par paiement groupé professionnel." },
      { name: "Solde minimum", limit: "10 000 TL", note: "Solde minimum requis pour les comptes professionnels." },
      { name: "Solde maximum", limit: "5 000 000 TL", note: "Solde maximum autorisé pour les comptes professionnels." },
      { name: "Nombre d'opérations quotidien", limit: "1 000 opérations/jour", note: "Nombre maximum d'opérations quotidiennes pour comptes professionnels." },
      { name: "Fréquence d'opérations carte", limit: "200 opérations/jour", note: "Nombre maximum d'opérations carte par jour pour comptes pros." },
      { name: "Limite de requêtes API", limit: "10 000 requêtes/heure", note: "Nombre maximum de requêtes API par heure." },
    ],
  },
  ru: {
    individual: [
      { name: "Ежедневный лимит снятия наличных", limit: "10.000 TL", note: "Ежедневный лимит снятия наличных в банкоматах и отделениях." },
      { name: "Лимит одноразового снятия", limit: "5.000 TL", note: "Максимальная сумма снятия за одну операцию в банкомате." },
      { name: "Ежедневный лимит расходов", limit: "25.000 TL", note: "Общий ежедневный лимит расходов по карте." },
      { name: "Лимит расходов на одну операцию", limit: "10.000 TL", note: "Максимальная сумма расхода по карте за одну операцию." },
      { name: "Ежедневный лимит EFT/переводов", limit: "50.000 TL", note: "Общий ежедневный лимит переводов в другие банки." },
      { name: "Лимит одной операции EFT", limit: "25.000 TL", note: "Максимальная сумма одного EFT/банковского перевода." },
      { name: "Ежедневный лимит FAST", limit: "25.000 TL", note: "Общий ежедневный лимит переводов через FAST." },
      { name: "Лимит одной операции FAST", limit: "10.000 TL", note: "Максимальная сумма одного перевода FAST." },
      { name: "Ежедневный лимит пополнения", limit: "50.000 TL", note: "Ежедневный лимит пополнения в банкомате/отделении." },
      { name: "Лимит мобильного перевода", limit: "10.000 TL", note: "Ежедневный лимит переводов из мобильного приложения." },
      { name: "Лимит бесконтактного платежа", limit: "1.500 TL", note: "Лимит одного бесконтактного платежа." },
      { name: "Лимит QR-платежа", limit: "5.000 TL", note: "Лимит одного QR-платежа." },
      { name: "Ежедневный лимит QR-платежей", limit: "15.000 TL", note: "Общий ежедневный лимит QR-платежей." },
      { name: "Лимит операции POS", limit: "25.000 TL", note: "Максимальная сумма одной операции POS." },
      { name: "Минимальный баланс", limit: "0 TL", note: "Минимальный баланс не требуется." },
      { name: "Максимальный баланс", limit: "500.000 TL", note: "Максимальный баланс для индивидуальных счетов." },
      { name: "Ежедневный лимит инвестиционных операций", limit: "100.000 TL", note: "Общий ежедневный лимит операций покупки/продажи." },
      { name: "Лимит операций с криптовалютой", limit: "25.000 TL", note: "Лимит одной операции с криптовалютой." },
      { name: "Лимит массовых платежей", limit: "100.000 TL/день", note: "Ежедневный лимит отправки массовых платежей." },
      { name: "Количество получателей (Массовый платеж)", limit: "500 чел.", note: "Максимальное количество получателей одного массового платежа." },
      { name: "Частота операций по карте", limit: "50 опер./день", note: "Максимальное количество операций по карте в день." },
    ],
    corporate: [
      { name: "Ежедневное снятие наличных", limit: "100.000 TL", note: "Ежедневный лимит снятия для корпоративных счетов." },
      { name: "Ежедневный лимит EFT/переводов", limit: "500.000 TL", note: "Общий ежедневный лимит EFT/переводов для корпоративных счетов." },
      { name: "Лимит одной операции EFT", limit: "250.000 TL", note: "Лимит одной операции EFT для корпоративных счетов." },
      { name: "Ежедневный лимит расходов", limit: "250.000 TL", note: "Ежедневный лимит расходов по корпоративной карте." },
      { name: "Лимит операции POS", limit: "100.000 TL", note: "Лимит операций POS для корпоративных счетов." },
      { name: "Лимит массовых платежей", limit: "1.000.000 TL/день", note: "Ежедневный лимит массовых платежей для корпоративных счетов." },
      { name: "Количество получателей (Массовый платеж)", limit: "2.000 чел.", note: "Максимум получателей на один корпоративный массовый платеж." },
      { name: "Минимальный баланс", limit: "10.000 TL", note: "Минимальный баланс для корпоративных счетов." },
      { name: "Максимальный баланс", limit: "5.000.000 TL", note: "Максимальный баланс для корпоративных счетов." },
      { name: "Ежедневное количество операций", limit: "1.000 опер./день", note: "Максимальное ежедневное количество операций для корпоративных счетов." },
      { name: "Частота операций по карте", limit: "200 опер./день", note: "Максимальное количество операций по корпоративной карте в день." },
      { name: "Лимит запросов API", limit: "10.000 запр./час", note: "Максимальное количество запросов API в час." },
    ],
  },
};

export default function PricingPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<PricingTab>("fees");
  const [activeType, setActiveType] = useState<"default" | "individual" | "corporate">("individual");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<Language>("tr");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const dir = getLangDir(lang);

  const currentFee = (item: PricingItem): string =>
    "fee" in item ? (item as PricingFeeItem).fee : (item as PricingLimitItem).limit;

  const c = copy[lang] ?? copy.en;

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

  const supportedLangs = ["tr", "en", "ar", "ku", "fr", "ru"];
  const langKey = supportedLangs.includes(lang) ? lang : "en";
  const typeKey = activeType === "corporate" ? "corporate" : "individual";
  const dataSource: PricingItem[] = activeTab === "fees" ? feesData[langKey][typeKey] : limitsData[langKey][typeKey];

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
                    <span>{session.user.name || "Kullanıcı"}</span>
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-nav-cta" style={{ cursor: "pointer", border: "none" }}>
                    <i className="fas fa-sign-out-alt" /> {lang === "tr" ? "Çıkış" : "Logout"}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="btn-nav-login">{lang === "tr" ? "Giriş Yap" : "Login"}</Link>
                  <Link href="/register" className="btn-nav-cta">{lang === "tr" ? "Kayıt Ol" : "Get Started"}</Link>
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

          <ul className="nav-links">
            <li><a href="/#services">{lang === "tr" ? "Hizmetler" : "Services"}</a></li>
            <li><a href="/#how-it-works">{lang === "tr" ? "Nasıl Çalışır" : "How It Works"}</a></li>
            <li><a href="/card">{lang === "tr" ? "MoneyShop Card" : "MoneyShop Card"}</a></li>
            <li><a href="/#features">{lang === "tr" ? "Özellikler" : "Features"}</a></li>
            <li><a href="/#compliance">{lang === "tr" ? "Uyumluluk" : "Compliance"}</a></li>
            <li><a href="/#roadmap">{lang === "tr" ? "Yol Haritası" : "Roadmap"}</a></li>
            <li><a href="/pricing" className="active">{lang === "tr" ? "Ücretler" : "Pricing"}</a></li>
            <li><a href="/faq">{lang === "tr" ? "SSS" : "FAQ"}</a></li>
          </ul>
        </div>
      </nav>

      <main className="hero" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="hero-container" style={{ gridTemplateColumns: "1fr", maxWidth: 900, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            <span className="gradient-text">{c.title}</span> {c.titleTail}
          </h1>
          <p style={{ fontSize: 16, color: "var(--gray-5)", maxWidth: 500, margin: "0 auto 44px" }}>
            {c.subtitle}
          </p>

          {/* Account Type + Tabs */}
          <div style={{ marginBottom: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            {/* Bireysel/Kurumsal tabs */}
            <div style={{ display: "flex", gap: 8, background: "var(--gray-2)", padding: 4, borderRadius: 12 }}>
              <button
                onClick={() => setActiveType("individual")}
                style={{
                  padding: "8px 24px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", border: "none", transition: "all 0.3s",
                  background: activeType === "individual" ? "#fff" : "transparent",
                  color: activeType === "individual" ? "var(--dark)" : "var(--gray-5)",
                  boxShadow: activeType === "individual" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {c.individual}
              </button>
              <button
                onClick={() => setActiveType("corporate")}
                style={{
                  padding: "8px 24px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", border: "none", transition: "all 0.3s",
                  background: activeType === "corporate" ? "#fff" : "transparent",
                  color: activeType === "corporate" ? "var(--dark)" : "var(--gray-5)",
                  boxShadow: activeType === "corporate" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {c.corporate}
              </button>
            </div>

            {/* Ücretler / Limitler tabs */}
            <div style={{ display: "flex", gap: 0, border: "1px solid var(--gray-3)", borderRadius: 12, overflow: "hidden" }}>
              <button
                onClick={() => setActiveTab("fees")}
                style={{
                  padding: "14px 36px", fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                  cursor: "pointer", border: "none", transition: "all 0.3s",
                  background: activeTab === "fees" ? "var(--primary)" : "#fff",
                  color: activeTab === "fees" ? "#fff" : "var(--gray-5)",
                }}
              >
                <i className="fas fa-tag" style={{ marginRight: 10 }} />
                {c.fees}
              </button>
              <button
                onClick={() => setActiveTab("limits")}
                style={{
                  padding: "14px 36px", fontFamily: "inherit", fontSize: 16, fontWeight: 700,
                  cursor: "pointer", border: "none", transition: "all 0.3s",
                  background: activeTab === "limits" ? "var(--primary)" : "#fff",
                  color: activeTab === "limits" ? "#fff" : "var(--gray-5)",
                }}
              >
                <i className="fas fa-sliders-h" style={{ marginRight: 10 }} />
                {c.limits}
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ textAlign: "left", overflow: "hidden", borderRadius: 16, border: "1px solid var(--gray-3)", background: "#fff" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "var(--gradient-1)", borderBottom: "1px solid var(--gray-3)" }}>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: 700, color: "#fff" }}>
                    {activeTab === "fees" ? c.service : c.limitType}
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: 700, color: "#fff", width: 180 }}>
                    {activeTab === "fees" ? c.fee : c.limit}
                  </th>
                  <th style={{ padding: "16px 20px", textAlign: "left", fontWeight: 700, color: "#fff" }}>
                    {c.description}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dataSource.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--gray-2)" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 500, color: "var(--dark)" }}>
                      <><i className="fas fa-circle" style={{ fontSize: 6, color: "var(--primary)", marginRight: 12, verticalAlign: "middle" }} />{item.name}</>
                    </td>
                    <td style={{ padding: "14px 20px", fontWeight: 700, color: "var(--primary)" }}>
                      {currentFee(item)}
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--gray-5)", fontSize: 13 }}>
                      {item.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: 12, color: "var(--gray-5)", marginTop: 20, textAlign: "center" }}>
            {c.note}
          </p>
        </div>
      </main>
    </div>
  );
}

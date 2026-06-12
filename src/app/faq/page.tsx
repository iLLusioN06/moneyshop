"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LANGUAGES, type Language, t } from "@/lib/landing-i18n";
import { getLangDir } from "@/lib/landing-i18n";
import "../landing.css";

type FaqItem = { q: string; a: string };

const copy = {
  tr: {
    title: "SSS",
    subtitle: "Sıkça Sorulan Sorular — aradığınız cevabı bulamazsanız bizimle iletişime geçmekten çekinmeyin.",
    notFoundTitle: "Cevabınızı bulamadınız mı?",
    notFoundDesc: "Müşteri hizmetleri ekibimiz 7/24 size yardımcı olmaya hazır.",
    categories: {
      account: "Hesap ve Başvuru",
      transfer: "Para Transferi ve Ödemeler",
      card: "Kart İşlemleri",
      security: "Güvenlik ve Gizlilik",
      support: "Teknik Destek",
    },
    items: {
      accountOpen: {
        q: "MoneyShop hesabı nasıl açarım?",
        a: "Ana sayfadaki 'Kayıt Ol' butonuna tıklayarak veya doğrudan /register sayfasına giderek birkaç adımda ücretsiz hesap açabilirsiniz. Kimlik bilgilerinizi girip SMS ile doğrulama yaptıktan sonra hesabınız anında aktif olur.",
      },
      feeOpen: {
        q: "Hesap açmak için herhangi bir ücret ödemem gerekiyor mu?",
        a: "Hayır, bireysel hesap açılışı tamamen ücretsizdir. Herhangi bir başvuru veya aktivasyon ücreti alınmaz.",
      },
      close: {
        q: "Hesabımı nasıl kapatabilirim?",
        a: "Hesabınızı kapatmak için müşteri hizmetlerimizi arayabilir veya destek talebi oluşturabilirsiniz. Kapatma işlemi öncesinde hesabınızda kalan bakiyeyi başka bir hesaba aktarmanız gerekmektedir.",
      },
      multi: {
        q: "Birden fazla hesabım olabilir mi?",
        a: "Evet, hem bireysel hem de kurumsal hesap açabilirsiniz. Aynı türden birden fazla hesap açmak için müşteri hizmetlerimizle iletişime geçebilirsiniz.",
      },
      docs: {
        q: "Kurumsal hesap için hangi belgeler gerekli?",
        a: "Kurumsal hesap için şirket tescil belgesi, imza sirküleri, vergi levhası ve yetkili kişilerin kimlik belgeleri gereklidir. Başvurunuz 1-2 iş günü içerisinde değerlendirilir.",
      },
      transferTime: {
        q: "Para transferi ne kadar sürer?",
        a: "MoneyShop kullanıcıları arası transferler anlık ve ücretsizdir. FAST ile yapılan transferler saniyeler içinde gerçekleşir. EFT/havale işlemleri ise bankalar arası işlem saatlerine bağlı olarak genellikle aynı gün içinde tamamlanır.",
      },
      fastLimit: {
        q: "FAST limiti nedir?",
        a: "Günlük FAST transfer limitiniz 25.000 TL, tek işlem limitiniz ise 10.000 TL'dir. Kurumsal hesaplar için bu limitler daha yüksektir.",
      },
      bankTransfer: {
        q: "Hangi bankalara para gönderebilirim?",
        a: "Tüm Türkiye'deki bankalara EFT/havale ve FAST ile para gönderebilirsiniz. Ayrıca tüm MoneyShop kullanıcılarına anında ücretsiz transfer yapabilirsiniz.",
      },
      international: {
        q: "Uluslararası para transferi yapabiliyor musunuz?",
        a: "Evet, uluslararası para transferi hizmetimiz mevcuttur. Döviz kurları ve işlem ücretleri hakkında detaylı bilgi için müşteri hizmetlerimizle iletişime geçebilirsiniz.",
      },
      billPayment: {
        q: "Fatura ödemesi yapabilir miyim?",
        a: "Evet, mobil uygulama ve web sitemiz üzerinden elektrik, su, doğalgaz, telefon, internet gibi tüm fatura ödemelerinizi gerçekleştirebilirsiniz.",
      },
      cardApply: {
        q: "MoneyShop Card'a nasıl başvururum?",
        a: "MoneyShop Card sayfasından veya /card adresinden başvuru yapabilirsiniz. Standart kart ücretsiz, Silver kart 50 TL, Gold kart ise 150 TL başvuru ücretine sahiptir.",
      },
      lostCard: {
        q: "Kartımı kaybettim/çaldırdım ne yapmalıyım?",
        a: "Hemen müşteri hizmetlerimizi arayarak kartınızı dondurun. Ardından mobil uygulama veya web sitemiz üzerinden kart yenileme talebi oluşturabilirsiniz. Yenileme ücreti 15 TL'dir.",
      },
      limitIncrease: {
        q: "Kart limitimi nasıl artırabilirim?",
        a: "Kart limit artış talebinizi mobil uygulama üzerinden veya müşteri hizmetlerimizi arayarak yapabilirsiniz. Limit artışı gelir durumunuza göre değerlendirilir.",
      },
      block: {
        q: "Kartıma bloke koyabilir miyim?",
        a: "Evet, mobil uygulama üzerinden kartınızı geçici olarak bloke edebilir veya kalıcı olarak iptal ettirebilirsiniz.",
      },
      forgotPin: {
        q: "Kart şifremi unuttum, ne yapmalıyım?",
        a: "Mobil uygulama üzerinden 'Şifremi Unuttum' seçeneğini kullanarak veya müşteri hizmetlerimizi arayarak yeni şifre oluşturabilirsiniz.",
      },
      safe: {
        q: "Kişisel bilgilerim güvende mi?",
        a: "Evet, tüm kişisel ve finansal verileriniz 256-bit SSL şifreleme ile korunur. Ayrıca KVKK ve uluslararası veri güvenliği standartlarına tam uyumluyuz.",
      },
      twoFA: {
        q: "İki faktörlü doğrulama (2FA) var mı?",
        a: "Evet, hesap güvenliğiniz için SMS doğrulama ve e-posta doğrulama gibi iki faktörlü doğrulama yöntemlerini aktif olarak kullanıyoruz.",
      },
      unauthorized: {
        q: "Yetkisiz işlem durumunda ne yapmalıyım?",
        a: "Hesabınızda fark ettiğiniz yetkisiz bir işlemi derhal müşteri hizmetlerimize bildirin. 7/24 destek hattımız üzerinden anında müdahale sağlanır.",
      },
      regulation: {
        q: "MoneyShop hangi düzenlemelere tabidir?",
        a: "MoneyShop, Irak Merkez Bankası (CBI) tarafından lisanslandırılmış bir ödeme hizmet sağlayıcısıdır. Tüm faaliyetlerimiz ilgili yasal düzenlemelere ve denetimlere tabidir.",
      },
      app: {
        q: "Mobil uygulamayı nereden indirebilirim?",
        a: "MoneyShop mobil uygulamasını App Store (iOS) ve Google Play Store (Android) üzerinden ücretsiz olarak indirebilirsiniz.",
      },
      api: {
        q: "API entegrasyonu nasıl yapılır?",
        a: "Kurumsal müşterilerimiz için REST API dokümantasyonu ve teknik destek sağlıyoruz. API kullanımı ücretsizdir. Detaylı bilgi için teknik ekibimizle iletişime geçebilirsiniz.",
      },
      support: {
        q: "Müşteri hizmetlerine nasıl ulaşırım?",
        a: "7/24 müşteri hizmetleri hattımızı arayabilir, e-posta gönderebilir veya web sitemiz üzerinden canlı destek talebi oluşturabilirsiniz. Premium destek paketimizle öncelikli destek alabilirsiniz.",
      },
      history: {
        q: "İşlem geçmişimi nasıl görüntülerim?",
        a: "Tüm işlem geçmişinize mobil uygulama ve web sitemiz üzerinden anlık olarak erişebilir, hesap özeti ve raporları görüntüleyebilirsiniz.",
      },
    },
  },
  en: {
    title: "FAQ",
    subtitle: "Frequently Asked Questions — if you cannot find the answer you are looking for, contact us.",
    notFoundTitle: "Could not find your answer?",
    notFoundDesc: "Our customer service team is ready to help 24/7.",
    categories: {
      account: "Account & Application",
      transfer: "Transfers & Payments",
      card: "Card Operations",
      security: "Security & Privacy",
      support: "Technical Support",
    },
    items: {
      accountOpen: {
        q: "How do I open a MoneyShop account?",
        a: "You can open a free account in a few steps by clicking the 'Register' button on the homepage or by going directly to /register. After entering your identity details and completing SMS verification, your account becomes active immediately.",
      },
      feeOpen: {
        q: "Do I need to pay any fee to open an account?",
        a: "No, opening an individual account is completely free. No application or activation fee is charged.",
      },
      close: {
        q: "How can I close my account?",
        a: "You can call our customer service or create a support request to close your account. Before the closure, you need to transfer any remaining balance to another account.",
      },
      multi: {
        q: "Can I have more than one account?",
        a: "Yes, you can open both individual and corporate accounts. To open more than one account of the same type, please contact customer service.",
      },
      docs: {
        q: "Which documents are required for a corporate account?",
        a: "For a corporate account, company registration certificate, signature circular, tax certificate, and identity documents of authorized persons are required. Your application is reviewed within 1–2 business days.",
      },
      transferTime: {
        q: "How long do transfers take?",
        a: "Transfers between MoneyShop users are instant and free. FAST transfers are completed within seconds. EFT/bank transfers are usually completed on the same day depending on interbank processing hours.",
      },
      fastLimit: {
        q: "What is the FAST limit?",
        a: "Your daily FAST transfer limit is 25,000 TL and your single transaction limit is 10,000 TL. These limits are higher for corporate accounts.",
      },
      bankTransfer: {
        q: "Which banks can I send money to?",
        a: "You can send money to all banks in Turkey via EFT/bank transfer and FAST. You can also make instant free transfers to all MoneyShop users.",
      },
      international: {
        q: "Can you make international transfers?",
        a: "Yes, our international money transfer service is available. For exchange rates and transaction fees, please contact customer service.",
      },
      billPayment: {
        q: "Can I pay bills?",
        a: "Yes, you can pay electricity, water, gas, phone, internet, and all other bills through our mobile app and website.",
      },
      cardApply: {
        q: "How do I apply for a MoneyShop Card?",
        a: "You can apply from the MoneyShop Card page or by visiting /card. The Standard card is free, Silver card costs 50 TL, and Gold card has a 150 TL application fee.",
      },
      lostCard: {
        q: "I lost my card / it was stolen. What should I do?",
        a: "Immediately call customer service to freeze your card. Then create a replacement request through the mobile app or website. The replacement fee is 15 TL.",
      },
      limitIncrease: {
        q: "How can I increase my card limit?",
        a: "You can request a limit increase through the mobile app or by calling customer service. Limit increases are reviewed based on your income status.",
      },
      block: {
        q: "Can I block my card?",
        a: "Yes, you can temporarily block your card or permanently cancel it through the mobile app.",
      },
      forgotPin: {
        q: "I forgot my card PIN. What should I do?",
        a: "You can create a new PIN using the 'Forgot PIN' option in the mobile app or by calling customer service.",
      },
      safe: {
        q: "Is my personal information secure?",
        a: "Yes, all your personal and financial data is protected with 256-bit SSL encryption. We are also fully compliant with KVKK and international data security standards.",
      },
      twoFA: {
        q: "Is two-factor authentication (2FA) available?",
        a: "Yes, we actively use two-factor authentication methods such as SMS verification and email verification for account security.",
      },
      unauthorized: {
        q: "What should I do in case of unauthorized activity?",
        a: "Report any unauthorized transaction you notice immediately to customer service. Our 24/7 support line provides instant response.",
      },
      regulation: {
        q: "Which regulations is MoneyShop subject to?",
        a: "MoneyShop is a payment service provider licensed by the Central Bank of Iraq (CBI). All our activities are subject to relevant legal regulations and supervision.",
      },
      app: {
        q: "Where can I download the mobile app?",
        a: "You can download the MoneyShop mobile app for free from the App Store (iOS) and Google Play Store (Android).",
      },
      api: {
        q: "How do I integrate the API?",
        a: "We provide REST API documentation and technical support for our corporate customers. API usage is free. Please contact our technical team for details.",
      },
      support: {
        q: "How can I reach customer service?",
        a: "You can call our 24/7 customer service line, send an email, or create a live support request on our website. With our premium support package, you get priority assistance.",
      },
      history: {
        q: "How can I view my transaction history?",
        a: "You can access your entire transaction history instantly via the mobile app and website, and view statements and reports.",
      },
    },
  },
  ar: {
    title: "الأسئلة الشائعة",
    subtitle: "أسئلة متكررة — إذا لم تجد الإجابة التي تبحث عنها، لا تتردد في الاتصال بنا.",
    notFoundTitle: "لم تجد إجابتك؟",
    notFoundDesc: "فريق خدمة العملاء لدينا مستعد لمساعدتك على مدار الساعة.",
    categories: {
      account: "الحساب والتقديم",
      transfer: "تحويل الأموال والمدفوعات",
      card: "عمليات البطاقة",
      security: "الأمان والخصوصية",
      support: "الدعم الفني",
    },
    items: {
      accountOpen: { q: "كيف يمكنني فتح حساب MoneyShop؟", a: "يمكنك فتح حساب مجاني في بضع خطوات بالنقر على زر 'سجل الآن' في الصفحة الرئيسية أو بالذهاب إلى /register. بعد إدخال بيانات هويتك وإتمام التحقق، يصبح حسابك نشطًا فورًا." },
      feeOpen: { q: "هل أحتاج إلى دفع أي رسوم لفتح حساب؟", a: "لا، فتح حساب فردي مجاني تمامًا. لا يتم فرض أي رسوم تقديم أو تفعيل." },
      close: { q: "كيف يمكنني إغلاق حسابي؟", a: "يمكنك الاتصال بخدمة العملاء أو إنشاء طلب دعم لإغلاق حسابك. قبل الإغلاق، يجب عليك تحويل أي رصيد متبقي إلى حساب آخر." },
      multi: { q: "هل يمكن أن يكون لدي أكثر من حساب واحد؟", a: "نعم، يمكنك فتح حسابات فردية ومؤسسية. لفتح أكثر من حساب من نفس النوع، يرجى الاتصال بخدمة العملاء." },
      docs: { q: "ما هي المستندات المطلوبة للحساب المؤسسي؟", a: "لحساب مؤسسي، شهادة تسجيل الشركة، محضر التوقيع، شهادة ضريبية، ومستندات هوية الأشخاص المخولين مطلوبة." },
      transferTime: { q: "كم تستغرق التحويلات من وقت؟", a: "التحويلات بين مستخدمي MoneyShop فورية ومجانية. تتم تحويلات FAST في ثوانٍ. عادةً ما تكتمل التحويلات الإلكترونية في نفس اليوم." },
      fastLimit: { q: "ما هو حد FAST؟", a: "حد التحويل اليومي عبر FAST هو 25,000 TL وحد المعاملة الواحدة 10,000 TL. هذه الحدود أعلى للحسابات المؤسسية." },
      bankTransfer: { q: "إلى أي البنوك يمكنني إرسال الأموال؟", a: "يمكنك إرسال الأموال إلى جميع البنوك في تركيا عبر التحويل الإلكتروني وFAST. يمكنك أيضًا إجراء تحويلات فورية مجانية لمستخدمي MoneyShop." },
      international: { q: "هل يمكنكم إجراء تحويلات دولية؟", a: "نعم، خدمة التحويل الدولي متاحة. لأسعار الصرف ورسوم المعاملات، يرجى الاتصال بخدمة العملاء." },
      billPayment: { q: "هل يمكنني دفع الفواتير؟", a: "نعم، يمكنك دفع فواتير الكهرباء والمياه والغاز والهاتف والإنترنت وجميع الفواتير الأخرى من خلال التطبيق والموقع." },
      cardApply: { q: "كيف أتقدم بطلب للحصول على بطاقة MoneyShop؟", a: "يمكنك التقديم من صفحة بطاقة MoneyShop أو بزيارة /card. البطاقة القياسية مجانية، البطاقة الفضية رسومها 50 TL، والبطاقة الذهبية 150 TL." },
      lostCard: { q: "فقدت بطاقتي / سُرقت. ماذا أفعل؟", a: "اتصل فورًا بخدمة العملاء لتجميد بطاقتك. ثم أنشئ طلب استبدال من خلال التطبيق أو الموقع. رسوم الاستبدال 15 TL." },
      limitIncrease: { q: "كيف يمكنني زيادة حد بطاقتي؟", a: "يمكنك طلب زيادة الحد من خلال التطبيق أو بالاتصال بخدمة العملاء. تتم مراجعة زيادة الحد بناءً على حالتك المالية." },
      block: { q: "هل يمكنني حظر بطاقتي؟", a: "نعم، يمكنك حظر بطاقتك مؤقتًا أو إلغاؤها بشكل دائم من خلال التطبيق." },
      forgotPin: { q: "نسيت رمز PIN الخاص بي. ماذا أفعل؟", a: "يمكنك إنشاء رمز PIN جديد باستخدام خيار 'نسيت PIN' في التطبيق أو بالاتصال بخدمة العملاء." },
      safe: { q: "هل معلوماتي الشخصية آمنة؟", a: "نعم، جميع بياناتك الشخصية والمالية محمية بتشفير SSL 256-bit. نحن متوافقون مع معايير أمان البيانات المحلية والدولية." },
      twoFA: { q: "هل تتوفر المصادقة الثنائية (2FA)؟", a: "نعم، نستخدم طرق المصادقة الثنائية مثل التحقق عبر الرسائل النصية والبريد الإلكتروني لأمان الحساب." },
      unauthorized: { q: "ماذا أفعل في حالة وجود نشاط غير مصرح به؟", a: "أبلغ عن أي معاملة غير مصرح بها فورًا لخدمة العملاء. خط الدعم على مدار الساعة يوفر استجابة فورية." },
      regulation: { q: "ما هي اللوائح التي يخضع لها MoneyShop؟", a: "MoneyShop هو مزود خدمة دفع مرخص. جميع أنشطتنا تخضع للوائح القانونية والرقابية ذات الصلة." },
      app: { q: "من أين يمكنني تنزيل التطبيق؟", a: "يمكنك تنزيل تطبيق MoneyShop مجانًا من App Store (iOS) وGoogle Play Store (Android)." },
      api: { q: "كيف أقوم بتكامل API؟", a: "نقدم وثائق REST API ودعم فني لعملائنا المؤسسين. استخدام API مجاني. يرجى الاتصال بفريقنا الفني للتفاصيل." },
      support: { q: "كيف يمكنني التواصل مع خدمة العملاء؟", a: "يمكنك الاتصال بخط خدمة العملاء على مدار الساعة، أو إرسال بريد إلكتروني، أو إنشاء طلب دعم مباشر على موقعنا." },
      history: { q: "كيف يمكنني عرض سجل معاملاتي؟", a: "يمكنك الوصول إلى سجل معاملاتك بالكامل فورًا عبر التطبيق والموقع، وعرض البيانات والتقارير." },
    },
  },
  ku: {
    title: "Pirsên Pir Pir tên Pirsîn",
    subtitle: "Pirsên Pir Pir tên Pirsîn — heke hûn bersiva ku lê digerin nebînin, bi me re têkilî daynin.",
    notFoundTitle: "Bersiva xwe nedît?",
    notFoundDesc: "Tîma karûbarê xerîdar a me 24/7 amade ye ku alîkariya we bike.",
    categories: {
      account: "Hesab û Serlêdan",
      transfer: "Veguhestina Pere û Dayîn",
      card: "Karê Kartê",
      security: "Ewlehî û Nepenî",
      support: "Piştgiriya Teknîkî",
    },
    items: {
      accountOpen: { q: "Ez çawa dikarim hesabek MoneyShop vekim?", a: "Serdana malpera me bike an sepanê dakêşe, rêbernameyê bişopîne da ku qeyda xwe temam bikî. Tevahiya pêvajoyê çend deqeyan digire." },
      feeOpen: { q: "Ma ji bo vekirina hesabê tu xercek heye?", a: "Na, vekirina hesabê MoneyShop bi tevahî belaş e û tu xercên veşartî nînin." },
      close: { q: "Ez çawa dikarim hesabê xwe bigirim?", a: "Tu dikarî bi têkiliyê bi tîma karûbarê xerîdar a me re hesabê xwe bigirî. Berî girtinê, hemû pereyên xwe derxîne." },
      multi: { q: "Ez dikarim ji yekê bêtir hesaban vekim?", a: "Erê, tu dikarî li gorî hewcedariyên xwe gelek hesaban vekî." },
      docs: { q: "Ji bo vekirina hesabê kîjan belge hewce ne?", a: "Belgeyek nasnameyê ya derbasdar (nasname an pasaport) û delîla navnîşanê hewce ye." },
      transferTime: { q: "Veguhestina pere çiqas wext digire?", a: "Veguhestinên navxweyî tavilê ne, veguhestinên nav-bankê 1-3 rojên karsaziyê digirin. Veguhestinên navneteweyî 1-5 rojan digirin." },
      fastLimit: { q: "Sînorê veguhestina lezgîn çi ye?", a: "Sînorê EFT/FAST rojane 50,000 ₺ ye. Sînorê veguhestina te li gorî pakêta hesabê te diguhere." },
      bankTransfer: { q: "Ez çawa dikarim pere bişînim hesabekî bankê?", a: "Tu dikarî bi riya EFT an veguhestina Swiftê pere bişînî hesabekî bankê. Pêvajo di sepanê de çend deqeyan digire." },
      international: { q: "Ez dikarim pere bişînim derveyî welêt?", a: "Erê, em veguhestinên Swiftê piştgirî dikin. Bihayên pêşbaziyê ji %0.5 dest pê dikin." },
      billPayment: { q: "Ez dikarim fatûreyên xwe bi riya MoneyShop bidim?", a: "Erê, tu dikarî fatûreyên kargêrî, têlefon, înternet û gelek fatûreyên din bi hêsanî bi riya sepanê bidî." },
      cardApply: { q: "Ez çawa dikarim serlêdana kartê bikim?", a: "Karta ku herî baş li hewcedariyên te tê hilbijêre û serlêdana xwe temam bike. Di çend deqeyan de tê pejirandin." },
      lostCard: { q: "Eger karta min winda bibe ez çi bikim?", a: "Tu dikarî di cih de bi riya sepanê an bi têkiliyê bi xeta piştgiriya me re kartê asteng bikî. Em ê karta nû bişînin." },
      limitIncrease: { q: "Ez dikarim sînorê karta xwe zêde bikim?", a: "Erê, tu dikarî bi riya sepanê daxwaza zêdekirina sînor bikî. Piştî nirxandina krediyê tê pejirandin." },
      block: { q: "Ez dikarim karta xwe demkî asteng bikim?", a: "Erê, tu dikarî karta xwe demkî asteng bikî û her dema ku bixwazî bi riya sepanê vekî." },
      forgotPin: { q: "Eger PINa xwe ji bîr bikim ez çi bikim?", a: "Tu dikarî bi riya sepanê an bi têkiliyê bi xeta piştgiriya me re PINa xwe ji nû ve saz bikî." },
      safe: { q: "Pereyên min çawa tên parastin?", a: "Hemû danûstandinên te bi şîfrekirina pola saziya darayî û erêkirina du-faktorî tên parastin." },
      twoFA: { q: "Erêkirina du-gavî çi ye?", a: "Erêkirina du-gavî astek ewlehiyê ya din zêde dike û hewce dike ku kodek piştrastkirinê ya din dema têketinê." },
      unauthorized: { q: "Eger ez danûstandineke nedestûr bibînim ez çi bikim?", a: "Tavilê bi piştgiriya xerîdar a me re têkilî daynin. Em bi bangek ji we re ne." },
      regulation: { q: "Ma MoneyShop birêkûpêk e?", a: "Em li gorî rêzikên MASAK û BDDK yên Tirkiyeyê dixebitin û bi hişkî standardên navneteweyî dişopînin." },
      app: { q: "Ez çawa dikarim sepanê dakêşim?", a: "Sepana MoneyShop li App Store û Google Play-ê heye. Li MoneyShop bigere û dakêşe." },
      api: { q: "Ez çawa dikarim API-yê entegre bikim?", a: "Em ji bo xerîdarên xwe yên pargînanî belgeyên REST API û piştgiriya teknîkî peyda dikin." },
      support: { q: "Ez çawa dikarim bi piştgiriya xerîdar re têkilî daynim?", a: "Tu dikarî bi xeta karûbarê xerîdar a 24/7 re têkilî daynî, e-nameyê bişînî an jî di malpera me de daxwazek çêbikî." },
      history: { q: "Ez çawa dikarim dîroka danûstandinên xwe bibînim?", a: "Tu dikarî bi riya sepanê mobîl û malperê yekser bigihîjî tevahiya dîroka danûstandinên xwe." },
    },
  },
  fr: {
    title: "Questions Fréquentes",
    subtitle: "Questions fréquentes — si vous ne trouvez pas la réponse que vous cherchez, n'hésitez pas à nous contacter.",
    notFoundTitle: "Vous n'avez pas trouvé votre réponse ?",
    notFoundDesc: "Notre équipe de service client est prête à vous aider 24h/24.",
    categories: {
      account: "Compte et Candidature",
      transfer: "Transfert d'argent et Paiements",
      card: "Opérations sur la carte",
      security: "Sécurité et Confidentialité",
      support: "Assistance Technique",
    },
    items: {
      accountOpen: { q: "Comment ouvrir un compte MoneyShop ?", a: "Visitez notre site Web ou téléchargez l'application et suivez les instructions pour finaliser votre inscription. Le processus prend quelques minutes." },
      feeOpen: { q: "Y a-t-il des frais pour ouvrir un compte ?", a: "Non, l'ouverture d'un compte MoneyShop est totalement gratuite et sans frais cachés." },
      close: { q: "Comment fermer mon compte ?", a: "Vous pouvez fermer votre compte en contactant notre service client. Assurez-vous de solder votre solde avant la fermeture." },
      multi: { q: "Puis-je ouvrir plusieurs comptes ?", a: "Oui, vous pouvez ouvrir plusieurs comptes selon vos besoins." },
      docs: { q: "Quels documents sont nécessaires pour ouvrir un compte ?", a: "Une pièce d'identité en cours de validité (carte d'identité ou passeport) et un justificatif de domicile sont requis." },
      transferTime: { q: "Combien de temps prend un transfert ?", a: "Les transferts internes sont instantanés, les transferts interbancaires prennent 1 à 3 jours ouvrés. Les transferts internationaux prennent 1 à 5 jours." },
      fastLimit: { q: "Quelle est la limite de transfert rapide ?", a: "La limite EFT/FAST est de 50 000 ₺ par jour. Votre limite varie selon votre formule de compte." },
      bankTransfer: { q: "Comment transférer vers un compte bancaire ?", a: "Vous pouvez transférer de l'argent vers un compte bancaire via EFT ou virement Swift. L'opération prend quelques minutes." },
      international: { q: "Puis-je envoyer de l'argent à l'étranger ?", a: "Oui, nous prenons en charge les virements Swift vers de nombreux pays. Tarifs à partir de 0,5 %." },
      billPayment: { q: "Puis-je payer mes factures via MoneyShop ?", a: "Oui, vous pouvez payer facilement vos factures via l'application MoneyShop." },
      cardApply: { q: "Comment demander une carte ?", a: "Choisissez la carte qui correspond à vos besoins et finalisez votre demande. Approuvée en quelques minutes." },
      lostCard: { q: "Que faire si je perds ma carte ?", a: "Vous pouvez bloquer immédiatement votre carte via l'application ou en contactant notre ligne d'assistance." },
      limitIncrease: { q: "Puis-je augmenter la limite de ma carte ?", a: "Oui, vous pouvez demander une augmentation de limite via l'application. Approuvée après évaluation de crédit." },
      block: { q: "Puis-je bloquer temporairement ma carte ?", a: "Oui, vous pouvez bloquer et débloquer votre carte à tout moment via l'application." },
      forgotPin: { q: "Que faire si j'oublie mon code PIN ?", a: "Vous pouvez réinitialiser votre code PIN via l'application ou en contactant notre ligne d'assistance." },
      safe: { q: "Comment mon argent est-il protégé ?", a: "Toutes vos transactions sont protégées par un cryptage de niveau institution financière et une authentification à deux facteurs." },
      twoFA: { q: "Qu'est-ce que la vérification en deux étapes ?", a: "La vérification en deux étapes ajoute une couche de sécurité supplémentaire lors de la connexion." },
      unauthorized: { q: "Que faire en cas de transaction non autorisée ?", a: "Contactez immédiatement notre service client. Nous sommes à un appel de vous." },
      regulation: { q: "MoneyShop est-il réglementé ?", a: "Nous opérons conformément aux réglementations MASAK et BDDK en Turquie et suivons les normes internationales." },
      app: { q: "Comment télécharger l'application ?", a: "L'application MoneyShop est disponible sur l'App Store et Google Play." },
      api: { q: "Comment intégrer l'API ?", a: "Nous fournissons une documentation REST API et un support technique pour nos clients professionnels." },
      support: { q: "Comment contacter le service client ?", a: "Vous pouvez appeler notre service client 24h/24, envoyer un e-mail ou créer une demande d'assistance sur notre site." },
      history: { q: "Comment consulter mon historique de transactions ?", a: "Vous pouvez accéder à tout votre historique instantanément via l'application et le site web." },
    },
  },
  ru: {
    title: "Часто задаваемые вопросы",
    subtitle: "Часто задаваемые вопросы — если вы не нашли ответ, свяжитесь с нами.",
    notFoundTitle: "Не нашли ответ?",
    notFoundDesc: "Наша служба поддержки готова помочь вам круглосуточно.",
    categories: {
      account: "Аккаунт и регистрация",
      transfer: "Переводы и платежи",
      card: "Операции с картой",
      security: "Безопасность и конфиденциальность",
      support: "Техническая поддержка",
    },
    items: {
      accountOpen: { q: "Как открыть счет MoneyShop?", a: "Посетите наш сайт или скачайте приложение, следуйте инструкциям. Весь процесс занимает несколько минут." },
      feeOpen: { q: "Есть ли плата за открытие счета?", a: "Нет, открытие счета MoneyShop абсолютно бесплатно, без скрытых комиссий." },
      close: { q: "Как закрыть счет?", a: "Вы можете закрыть счет, связавшись с нашей службой поддержки. Обнулите баланс перед закрытием." },
      multi: { q: "Могу ли я открыть несколько счетов?", a: "Да, вы можете открыть несколько счетов в соответствии с вашими потребностями." },
      docs: { q: "Какие документы нужны для открытия счета?", a: "Требуется действующее удостоверение личности и подтверждение адреса." },
      transferTime: { q: "Сколько времени занимает перевод?", a: "Внутренние переводы мгновенные, межбанковские — 1-3 дня. Международные — 1-5 рабочих дней." },
      fastLimit: { q: "Каков лимит быстрого перевода?", a: "Лимит EFT/FAST составляет 50 000 ₺ в день. Лимит зависит от вашего тарифного плана." },
      bankTransfer: { q: "Как перевести деньги на банковский счет?", a: "Вы можете перевести деньги через EFT или Swift-перевод. Процесс занимает несколько минут." },
      international: { q: "Могу ли я отправить деньги за границу?", a: "Да, мы поддерживаем Swift-переводы. Тарифы от 0,5%." },
      billPayment: { q: "Могу ли я оплачивать счета?", a: "Да, вы можете оплачивать счета через приложение MoneyShop." },
      cardApply: { q: "Как подать заявку на карту?", a: "Выберите подходящую карту и заполните заявку. Она будет одобрена в течение нескольких минут." },
      lostCard: { q: "Что делать, если я потерял карту?", a: "Немедленно заблокируйте карту через приложение или позвонив на линию поддержки." },
      limitIncrease: { q: "Могу ли я увеличить лимит карты?", a: "Да, вы можете запросить увеличение лимита через приложение." },
      block: { q: "Могу ли я временно заблокировать карту?", a: "Да, вы можете заблокировать и разблокировать карту в любое время через приложение." },
      forgotPin: { q: "Что делать, если я забыл ПИН-код?", a: "Вы можете сбросить ПИН-код через приложение или позвонив на линию поддержки." },
      safe: { q: "Как защищены мои деньги?", a: "Все транзакции защищены шифрованием уровня финансовых учреждений и двухфакторной аутентификацией." },
      twoFA: { q: "Что такое двухэтапная проверка?", a: "Двухэтапная проверка добавляет дополнительный уровень безопасности при входе." },
      unauthorized: { q: "Что делать при несанкционированной транзакции?", a: "Немедленно свяжитесь со службой поддержки." },
      regulation: { q: "Регулируется ли MoneyShop?", a: "Мы работаем в соответствии с правилами MASAK и BDDK в Турции." },
      app: { q: "Где скачать приложение?", a: "Приложение MoneyShop доступно в App Store и Google Play." },
      api: { q: "Как интегрировать API?", a: "Мы предоставляем документацию REST API и техподдержку для корпоративных клиентов." },
      support: { q: "Как связаться со службой поддержки?", a: "Позвоните на линию поддержки 24/7, отправьте email или создайте запрос на сайте." },
      history: { q: "Как просмотреть историю операций?", a: "Вы можете получить доступ к истории операций через приложение и веб-сайт." },
    },
  },
} as const;

const faqData = [
  { categoryKey: "account", icon: "fas fa-user-plus", items: ["accountOpen", "feeOpen", "close", "multi", "docs"] },
  { categoryKey: "transfer", icon: "fas fa-exchange-alt", items: ["transferTime", "fastLimit", "bankTransfer", "international", "billPayment"] },
  { categoryKey: "card", icon: "fas fa-credit-card", items: ["cardApply", "lostCard", "limitIncrease", "block", "forgotPin"] },
  { categoryKey: "security", icon: "fas fa-shield-alt", items: ["safe", "twoFA", "unauthorized", "regulation"] },
  { categoryKey: "support", icon: "fas fa-headset", items: ["app", "api", "support", "history"] },
] as const;

export default function FaqPage() {
  const { data: session } = useSession();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<Language>("tr");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const dir = getLangDir(lang);

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

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const c = copy[lang] ?? copy.en;

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

          <ul className="nav-links">
            <li><a href="/#services">{t(lang, "nav.services")}</a></li>
            <li><a href="/#how-it-works">{t(lang, "nav.howItWorks")}</a></li>
            <li><a href="/card">{t(lang, "nav.card")}</a></li>
            <li><a href="/#features">{t(lang, "nav.features")}</a></li>
            <li><a href="/#compliance">{t(lang, "nav.compliance")}</a></li>
            <li><a href="/#roadmap">{t(lang, "nav.roadmap")}</a></li>
            <li><a href="/pricing">{t(lang, "nav.pricing")}</a></li>
            <li><a href="/faq" className="active">{t(lang, "nav.faq")}</a></li>
          </ul>
        </div>
      </nav>

      <main className="hero" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="hero-container" style={{ gridTemplateColumns: "1fr", maxWidth: 800, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h1 style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 12 }}>
            <span className="gradient-text">{c.title}</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--gray-5)", maxWidth: 500, margin: "0 auto 48px" }}>
            {c.subtitle}
          </p>

          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 24 }}>
            {faqData.map((group) => (
              <div key={group.categoryKey} style={{ background: "#fff", borderRadius: 16, border: "1px solid var(--gray-3)", overflow: "hidden" }}>
                <div style={{ padding: "18px 24px", background: "var(--gradient-1)", borderBottom: "1px solid var(--gray-3)", display: "flex", alignItems: "center", gap: 10 }}>
                  <i className={group.icon} style={{ color: "#fff", fontSize: 18, width: 24, textAlign: "center" }} />
                  <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#fff" }}>{c.categories[group.categoryKey]}</h2>
                </div>
                <div>
                  {group.items.map((itemKey, idx) => {
                    const key = `${group.categoryKey}-${idx}`;
                    const item = c.items[itemKey];
                    const isOpen = openItems.has(key);
                    return (
                      <div key={key} style={{ borderBottom: idx < group.items.length - 1 ? "1px solid var(--gray-2)" : "none" }}>
                        <button
                          onClick={() => toggleItem(key)}
                          style={{
                            width: "100%", padding: "16px 24px", fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                            cursor: "pointer", border: "none", background: "none", textAlign: "left",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: 12, color: "var(--dark)", transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-1)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                        >
                          <span>{item.q}</span>
                          <i
                            className={`fas fa-chevron-${dir === "rtl" ? "left" : "down"}`}
                            style={{
                              fontSize: 12, color: "var(--gray-5)", flexShrink: 0,
                              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.3s",
                            }}
                          />
                        </button>
                        <div
                          style={{
                            maxHeight: isOpen ? 500 : 0,
                            overflow: "hidden",
                            transition: "max-height 0.4s ease, padding 0.3s ease",
                            padding: isOpen ? "0 24px 18px" : "0 24px",
                          }}
                        >
                          <p style={{ margin: 0, fontSize: 14, color: "var(--gray-5)", lineHeight: 1.7 }}>
                            {item.a}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, padding: 32, background: "#fff", borderRadius: 16, border: "1px solid var(--gray-3)" }}>
            <i className="fas fa-headset" style={{ fontSize: 32, color: "var(--primary)", marginBottom: 12 }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>{c.notFoundTitle}</h3>
            <p style={{ fontSize: 14, color: "var(--gray-5)", margin: "0 0 20px" }}>
              {c.notFoundDesc}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, color: "var(--gray-6)", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fas fa-phone" style={{ color: "var(--primary)" }} /> 444 0 123
              </span>
              <span style={{ fontSize: 14, color: "var(--gray-6)", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fas fa-envelope" style={{ color: "var(--primary)" }} /> destek@moneyshop.com
              </span>
              <span style={{ fontSize: 14, color: "var(--gray-6)", display: "flex", alignItems: "center", gap: 6 }}>
                <i className="fas fa-comment-dots" style={{ color: "var(--primary)" }} /> Canlı Destek
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

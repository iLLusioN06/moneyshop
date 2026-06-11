// =============================================
// MoneyShop Dashboard i18n
// =============================================

export type DashboardLang = "tr" | "en" | "ar" | "ku" | "fr" | "ru";

const STORAGE_KEY = "moneyshop-lang";

export function getDashboardLang(): DashboardLang {
  if (typeof window === "undefined") return "tr";
  const saved = localStorage.getItem(STORAGE_KEY) as DashboardLang | null;
  if (saved && ["tr", "en", "ar", "ku", "fr", "ru"].includes(saved)) return saved;
  return "tr";
}

type TranslationDict = Record<string, Record<DashboardLang, string>>;

const dict: TranslationDict = {
  // --- NAV ---
  "nav.dashboard":           { tr: "Genel Bakış", en: "Overview", ar: "نظرة عامة", ku: "Têgihiştinî", fr: "Aperçu", ru: "Обзор" },
  "nav.accounts":           { tr: "Hesaplar", en: "Accounts", ar: "الحسابات", ku: "Hesab", fr: "Comptes", ru: "Счета" },
"nav.transactions":        { tr: "İşlem Geçmişi", en: "Transaction History", ar: "سجل المعاملات", ku: "Dîroka Danûstandinan", fr: "Historique des transactions", ru: "История операций" },
  "nav.transfers":           { tr: "Para Transferi", en: "Money Transfer", ar: "تحويل الأموال", ku: "Veguhestina Pere", fr: "Transfert d'argent", ru: "Перевод денег" },
  "nav.deposit":             { tr: "Para Yatır", en: "Deposit", ar: "إيداع", ku: "Pere Bixe", fr: "Dépôt", ru: "Пополнить" },
  "nav.withdraw":            { tr: "Para Çek", en: "Withdraw", ar: "سحب", ku: "Pere Derxe", fr: "Retrait", ru: "Снять" },
  "nav.recurring":           { tr: "Tekrarlanan İşlemler", en: "Recurring Transactions", ar: "المعاملات المتكررة", ku: "Danûstandinên Dubare", fr: "Transactions récurrentes", ru: "Повторяющиеся операции" },
  "nav.portfolio":          { tr: "Yatırım Portföyü", en: "Portfolio", ar: "محفظة الاستثمار", ku: "Portfoliyoya Veberhênanê", fr: "Portefeuille d'investissement", ru: "Инвестиционный портфель" },
"nav.reports":             { tr: "Raporlar", en: "Reports", ar: "التقارير", ku: "Rapor", fr: "Rapports", ru: "Отчеты" },
  "nav.budgets":             { tr: "Bütçeler", en: "Budgets", ar: "الميزانيات", ku: "Budce", fr: "Budgets", ru: "Бюджеты" },
  "nav.payments":            { tr: "Ödemeler", en: "Payments", ar: "المدفوعات", ku: "Dedan", fr: "Paiements", ru: "Платежи" },
  "nav.card":                { tr: "MoneyShop Card", en: "MoneyShop Card", ar: "بطاقة MoneyShop", ku: "Karta MoneyShop", fr: "Carte MoneyShop", ru: "Карта MoneyShop" },
  "nav.profile":             { tr: "Profil", en: "Profile", ar: "الملف الشخصي", ku: "Profîl", fr: "Profil", ru: "Профиль" },
  "nav.logout":              { tr: "Çıkış Yap", en: "Log Out", ar: "تسجيل الخروج", ku: "Derkeve", fr: "Déconnexion", ru: "Выйти" },
  "nav.user":                { tr: "Kullanıcı", en: "User", ar: "مستخدم", ku: "Bikarhêner", fr: "Utilisateur", ru: "Пользователь" },
  "nav.admin":               { tr: "Yönetici", en: "Admin", ar: "مدير", ku: "Rêveber", fr: "Administrateur", ru: "Администратор" },
  "nav.close":               { tr: "Menüyü kapat", en: "Close menu", ar: "إغلاق القائمة", ku: "Menu bigre", fr: "Fermer le menu", ru: "Закрыть меню" },
  "nav.adminPanel":          { tr: "Admin Paneli", en: "Admin Panel", ar: "لوحة الإدارة", ku: "Panela Rêveberiyê", fr: "Panneau d'administration", ru: "Панель администратора" },
  "nav.adminUsers":          { tr: "Kullanıcılar", en: "Users", ar: "المستخدمون", ku: "Bikarhêner", fr: "Utilisateurs", ru: "Пользователи" },
  "nav.adminTransactions":   { tr: "Tüm İşlemler", en: "All Transactions", ar: "جميع المعاملات", ku: "Hemî Danûstandin", fr: "Toutes les transactions", ru: "Все операции" },
  "header.admin":            { tr: "Admin", en: "Admin", ar: "الإدارة", ku: "Rêveberî", fr: "Admin", ru: "Админ" },

  // --- HEADER ---
  "header.dashboard":        { tr: "Genel Bakış", en: "Overview", ar: "نظرة عامة", ku: "Têgihiştinî", fr: "Aperçu", ru: "Обзор" },
  "header.accounts":         { tr: "Hesaplar", en: "Accounts", ar: "الحسابات", ku: "Hesab", fr: "Comptes", ru: "Счета" },
  "header.transactions":     { tr: "İşlemler", en: "Transactions", ar: "المعاملات", ku: "Danûstandin", fr: "Transactions", ru: "Операции" },
  "header.portfolio":       { tr: "Yatırım Portföyü", en: "Portfolio", ar: "محفظة الاستثمار", ku: "Portfoliyoya Veberhênanê", fr: "Portefeuille d'investissement", ru: "Инвестиционный портфель" },
"header.recurring":        { tr: "Tekrarlanan İşlemler", en: "Recurring", ar: "المتكررة", ku: "Dubare", fr: "Récurrent", ru: "Повторяющиеся" },
  "header.reports":          { tr: "Raporlar", en: "Reports", ar: "التقارير", ku: "Rapor", fr: "Rapports", ru: "Отчеты" },
  "header.categories":       { tr: "Kategoriler", en: "Categories", ar: "الفئات", ku: "Kategorî", fr: "Catégories", ru: "Категории" },
  "header.budgets":          { tr: "Bütçeler", en: "Budgets", ar: "الميزانيات", ku: "Budce", fr: "Budgets", ru: "Бюджеты" },
  "header.settings":         { tr: "Ayarlar", en: "Settings", ar: "الإعدادات", ku: "Eyar", fr: "Paramètres", ru: "Настройки" },
  "header.profile":          { tr: "Profil", en: "Profile", ar: "الملف الشخصي", ku: "Profîl", fr: "Profil", ru: "Профиль" },
  "header.subtitle":         { tr: "Finansal durumunuzu takip edin", en: "Track your financial status", ar: "تتبع حالتك المالية", ku: "Rewşa xwe ya darayî bişopîne", fr: "Suivez votre situation financière", ru: "Отслеживайте свое финансовое состояние" },
  "header.search":           { tr: "Ara...", en: "Search...", ar: "بحث...", ku: "Lêbigere...", fr: "Rechercher...", ru: "Поиск..." },
  "header.menuToggle":       { tr: "Menüyü aç/kapat", en: "Toggle menu", ar: "فتح/إغلاق القائمة", ku: "Menu veke/bigre", fr: "Ouvrir/fermer le menu", ru: "Открыть/закрыть меню" },
  "header.notifications":    { tr: "Bildirimler", en: "Notifications", ar: "الإشعارات", ku: "Agahdarî", fr: "Notifications", ru: "Уведомления" },
  "header.noNotifications": { tr: "Bildirim bulunmuyor", en: "No notifications", ar: "لا توجد إشعارات", ku: "Ti agahdarî tune", fr: "Aucune notification", ru: "Нет уведомлений" },
  "budget.alert":            { tr: "Bütçe Uyarısı", en: "Budget Alert", ar: "تنبيه الميزانية", ku: "Hişyariya Budceyê", fr: "Alerte budget", ru: "Бюджетное предупреждение" },

  // --- DASHBOARD ---
  "dash.welcome":            { tr: "Hoş Geldiniz", en: "Welcome", ar: "مرحباً", ku: "Bi xêr hatî", fr: "Bienvenue", ru: "Добро пожаловать" },
  "dash.subtitle":           { tr: "Finansal durumunuzu takip edin ve yönetin", en: "Track and manage your financial status", ar: "تتبع وأدر حالتك المالية", ku: "Rewşa xwe ya darayî bişopîne û birêve bibe", fr: "Suivez et gérez votre situation financière", ru: "Отслеживайте и управляйте своим финансовым состоянием" },
  "dash.newTransaction":     { tr: "Yeni İşlem", en: "New Transaction", ar: "معاملة جديدة", ku: "Danûstandina Nû", fr: "Nouvelle transaction", ru: "Новая операция" },
  "dash.totalBalance":       { tr: "Toplam Bakiye", en: "Total Balance", ar: "الرصيد الإجمالي", ku: "Bakiya Giştî", fr: "Solde total", ru: "Общий баланс" },
  "dash.totalIncome":        { tr: "Toplam Gelir (Bu Ay)", en: "Total Income (This Month)", ar: "إجمالي الدخل (هذا الشهر)", ku: "Dahata Giştî (Vê Mehê)", fr: "Revenu total (Ce mois)", ru: "Общий доход (Этот месяц)" },
  "dash.totalExpense":       { tr: "Toplam Gider (Bu Ay)", en: "Total Expense (This Month)", ar: "إجمالي المصروفات (هذا الشهر)", ku: "Lêçûna Giştî (Vê Mehê)", fr: "Dépense totale (Ce mois)", ru: "Общий расход (Этот месяц)" },
  "dash.netWorth":           { tr: "Net Değer", en: "Net Worth", ar: "صافي القيمة", ku: "Nirxa Net", fr: "Valeur nette", ru: "Чистая стоимость" },
  "dash.vsLastMonth":        { tr: "geçen aya göre", en: "vs last month", ar: "مقارنة بالشهر الماضي", ku: "li gor meha borî", fr: "vs le mois dernier", ru: "по сравнению с прошлым месяцем" },
  "dash.monthlyChart":       { tr: "Aylık Gelir/Gider", en: "Monthly Income/Expense", ar: "الدخل/المصروفات الشهرية", ku: "Dahat/Lêçûna Mehane", fr: "Revenus/Dépenses mensuels", ru: "Ежемесячный доход/расход" },
  "dash.chartSubtitle":      { tr: "Son 6 aylık finansal akış", en: "Last 6 months financial flow", ar: "التدفق المالي لآخر 6 أشهر", ku: "Herika darayî ya 6 mehên dawî", fr: "Flux financier des 6 derniers mois", ru: "Финансовый поток за последние 6 месяцев" },
  "dash.income":             { tr: "Gelir", en: "Income", ar: "دخل", ku: "Dahat", fr: "Revenu", ru: "Доход" },
  "dash.expense":            { tr: "Gider", en: "Expense", ar: "مصروف", ku: "Lêçûn", fr: "Dépense", ru: "Расход" },
  "dash.incomeExpense":      { tr: "Gelir: {{income}} / Gider: {{expense}}", en: "Income: {{income}} / Expense: {{expense}}", ar: "الدخل: {{income}} / المصروفات: {{expense}}", ku: "Dahat: {{income}} / Lêçûn: {{expense}}", fr: "Revenu: {{income}} / Dépense: {{expense}}", ru: "Доход: {{income}} / Расход: {{expense}}" },
  "dash.recentTransactions": { tr: "Son İşlemler", en: "Recent Transactions", ar: "آخر المعاملات", ku: "Danûstandinên Dawî", fr: "Transactions récentes", ru: "Последние операции" },
  "dash.viewAll":            { tr: "Tümü", en: "View All", ar: "عرض الكل", ku: "Hemû bibîne", fr: "Voir tout", ru: "Все" },
  "dash.noData":             { tr: "Henüz veri bulunmuyor", en: "No data yet", ar: "لا توجد بيانات بعد", ku: "Hê tu daneyên tune", fr: "Pas encore de données", ru: "Данных пока нет" },
  "dash.noTransactions":     { tr: "Henüz işlem bulunmuyor", en: "No transactions yet", ar: "لا توجد معاملات بعد", ku: "Hê tu danûstandinên tune", fr: "Pas encore de transactions", ru: "Операций пока нет" },
  "dash.noCategory":         { tr: "Kategorisiz", en: "Uncategorized", ar: "بدون فئة", ku: "Bêkategorî", fr: "Sans catégorie", ru: "Без категории" },
  "dash.completed":          { tr: "Tamamlandı", en: "Completed", ar: "مكتمل", ku: "Temam", fr: "Terminé", ru: "Завершено" },
  "dash.pending":            { tr: "Beklemede", en: "Pending", ar: "معلق", ku: "Li bendê", fr: "En attente", ru: "В ожидании" },
  "dash.accounts":           { tr: "Hesaplarınız", en: "Your Accounts", ar: "حساباتك", ku: "Hesabên Te", fr: "Vos comptes", ru: "Ваши счета" },
  "dash.accountsSubtitle":   { tr: "Tüm banka hesaplarınız ve bakiyeleri", en: "All your bank accounts and balances", ar: "جميع حساباتك المصرفية وأرصدتها", ku: "Hemî hesabên te yên bankê û bakiyeyên wan", fr: "Tous vos comptes bancaires et soldes", ru: "Все ваши банковские счета и балансы" },
  "dash.addAccount":         { tr: "Hesap Ekle", en: "Add Account", ar: "إضافة حساب", ku: "Hesabê Zêdeke", fr: "Ajouter un compte", ru: "Добавить счет" },
  "dash.debt":               { tr: "Borç", en: "Debt", ar: "دين", ku: "Deyn", fr: "Dette", ru: "Долг" },
  "dash.balance":            { tr: "Bakiye", en: "Balance", ar: "الرصيد", ku: "Bakiye", fr: "Solde", ru: "Баланс" },
  "dash.verifiedAccount":    { tr: "Doğrulanmış Hesap", en: "Verified Account", ar: "حساب موثق", ku: "Hesaba Pejirandî", fr: "Compte vérifié", ru: "Подтвержденный аккаунт" },
  "dash.unverifiedAccount":  { tr: "Doğrulanmamış Hesap", en: "Unverified Account", ar: "حساب غير موثق", ku: "Hesaba Nepejirandî", fr: "Compte non vérifié", ru: "Неподтвержденный аккаунт" },
  "dash.verifyPrompt":       { tr: "İşlem yapabilmeniz için hesabınızı onaylayınız.", en: "Please verify your account to proceed.", ar: "يرجى توثيق حسابك للمتابعة.", ku: "Ji kerema xwe hesabê xwe piştrast bike.", fr: "Veuillez vérifier votre compte pour continuer.", ru: "Пожалуйста, подтвердите свой аккаунт." },

  // --- PROFILE ---
  "profile.title":           { tr: "Profil", en: "Profile", ar: "الملف الشخصي", ku: "Profîl", fr: "Profil", ru: "Профиль" },
  "profile.personalInfo":    { tr: "Kişisel Bilgiler", en: "Personal Information", ar: "المعلومات الشخصية", ku: "Agahiyên Kesane", fr: "Informations personnelles", ru: "Личная информация" },
  "profile.fullName":        { tr: "Ad Soyad", en: "Full Name", ar: "الاسم الكامل", ku: "Nav û Paşnav", fr: "Nom complet", ru: "Полное имя" },
  "profile.nameLocked":      { tr: "Ad soyad değiştirilemez.", en: "Name cannot be changed.", ar: "لا يمكن تغيير الاسم.", ku: "Nav nayê guhertin.", fr: "Le nom ne peut pas être changé.", ru: "Имя не может быть изменено." },
  "profile.email":           { tr: "E-posta Adresi", en: "Email Address", ar: "البريد الإلكتروني", ku: "Navnîşana E-postayê", fr: "Adresse e-mail", ru: "Адрес электронной почты" },
  "profile.phone":           { tr: "Telefon", en: "Phone", ar: "الهاتف", ku: "Telefon", fr: "Téléphone", ru: "Телефон" },
  "profile.memberSince":     { tr: "Kayıt Tarihi", en: "Member Since", ar: "عضو منذ", ku: "Endam Ji", fr: "Membre depuis", ru: "Участник с" },
  "profile.role":            { tr: "Rol", en: "Role", ar: "الدور", ku: "Rol", fr: "Rôle", ru: "Роль" },
  "profile.save":            { tr: "Kaydet", en: "Save", ar: "حفظ", ku: "Tomar bike", fr: "Enregistrer", ru: "Сохранить" },
  "profile.saving":          { tr: "Kaydediliyor...", en: "Saving...", ar: "جارٍ الحفظ...", ku: "Tê tomar kirin...", fr: "Enregistrement...", ru: "Сохранение..." },
  "profile.saved":           { tr: "Kaydedildi", en: "Saved", ar: "تم الحفظ", ku: "Hate tomar kirin", fr: "Enregistré", ru: "Сохранено" },
  "profile.saveError":       { tr: "Kaydedilirken hata oluştu", en: "Error saving", ar: "خطأ في الحفظ", ku: "Di tomarê de çewtî", fr: "Erreur d'enregistrement", ru: "Ошибка сохранения" },
  "profile.changePassword":  { tr: "Şifre Değiştir", en: "Change Password", ar: "تغيير كلمة المرور", ku: "Şifreyê Biguherîne", fr: "Changer le mot de passe", ru: "Сменить пароль" },
  "profile.currentPassword": { tr: "Mevcut Şifre", en: "Current Password", ar: "كلمة المرور الحالية", ku: "Şifreya Niha", fr: "Mot de passe actuel", ru: "Текущий пароль" },
  "profile.newPassword":     { tr: "Yeni Şifre", en: "New Password", ar: "كلمة المرور الجديدة", ku: "Şifreya Nû", fr: "Nouveau mot de passe", ru: "Новый пароль" },
  "profile.confirmPassword": { tr: "Yeni Şifre (Tekrar)", en: "Confirm New Password", ar: "تأكيد كلمة المرور الجديدة", ku: "Şifreya Nû Piştrast Bike", fr: "Confirmer le nouveau mot de passe", ru: "Подтвердите новый пароль" },
  "profile.passwordUpdated": { tr: "Şifre başarıyla güncellendi", en: "Password updated successfully", ar: "تم تحديث كلمة المرور بنجاح", ku: "Şifre bi serkeftî hate nûkirin", fr: "Mot de passe mis à jour avec succès", ru: "Пароль успешно обновлен" },
  "profile.statsTitle":      { tr: "İstatistikler", en: "Statistics", ar: "الإحصائيات", ku: "Statîstîk", fr: "Statistiques", ru: "Статистика" },
  "profile.totalAccounts":   { tr: "Toplam Hesap", en: "Total Accounts", ar: "إجمالي الحسابات", ku: "Hemî Hesab", fr: "Total des comptes", ru: "Всего счетов" },
  "profile.totalTransactions": { tr: "Toplam İşlem", en: "Total Transactions", ar: "إجمالي المعاملات", ku: "Hemî Danûstandin", fr: "Total des transactions", ru: "Всего операций" },
  "profile.totalBudgets":    { tr: "Toplam Bütçe", en: "Total Budgets", ar: "إجمالي الميزانيات", ku: "Hemî Budce", fr: "Total des budgets", ru: "Всего бюджетов" },
  "profile.verifyTitle":     { tr: "Hesabını Doğrula", en: "Verify Your Account", ar: "توثيق حسابك", ku: "Hesabê Xwe Piştrast Bike", fr: "Vérifiez votre compte", ru: "Подтвердите аккаунт" },
  "profile.verifyDesc":      { tr: "Hesabını yalnızca mobil uygulamadan onaylayabilirsin.", en: "You can only verify your account via the mobile app.", ar: "يمكنك توثيق حسابك فقط من خلال التطبيق المحمول.", ku: "Tu tenê dikarî hesabê xwe bi serlêdana mobîl piştrast bikî.", fr: "Vous ne pouvez vérifier votre compte que via l'application mobile.", ru: "Вы можете подтвердить аккаунт только через мобильное приложение." },
  "profile.verifyStep1":     { tr: "Kimlik Tara", en: "Scan ID", ar: "مسح الهوية", ku: "Nasname Bişopîne", fr: "Scanner la pièce d'identité", ru: "Сканировать удостоверение" },
  "profile.verifyStep1Desc": { tr: "Kimliğinin ön ve arka yüzünü kameranla tara.", en: "Scan the front and back of your ID with your camera.", ar: "قم بمسح الوجهين الأمامي والخلفي لهويتك بالكاميرا.", ku: "Rûyê pêş û paş ê nasnameya xwe bi kameraya xwe bişopîne.", fr: "Scannez le recto et verso de votre pièce d'identité avec votre caméra.", ru: "Отсканируйте лицевую и оборотную сторону удостоверения камерой." },
  "profile.verifyStep2":     { tr: "Bilgileri Doğrula", en: "Verify Info", ar: "تحقق من المعلومات", ku: "Agahî Piştrast Bike", fr: "Vérifier les informations", ru: "Подтвердить данные" },
  "profile.verifyStep2Desc": { tr: "Kimlik bilgilerini kontrol ederek doğrula.", en: "Check and verify the ID information.", ar: "تحقق من معلومات الهوية وصححها.", ku: "Agahiyên nasnameyê kontrol bike û piştrast bike.", fr: "Vérifiez les informations d'identité.", ru: "Проверьте и подтвердите данные удостоверения." },
  "profile.verifyStep3":     { tr: "Canlılık Kontrolü", en: "Liveness Check", ar: "التحقق من الحياة", ku: "Kontrola Jiyanê", fr: "Vérification de vivacité", ru: "Проверка живости" },
  "profile.verifyStep3Desc": { tr: "Canlılık kontrolünden geç.", en: "Complete the liveness check.", ar: "اجتاز فحص التحقق من الحياة.", ku: "Kontrola jiyanê derbas bike.", fr: "Effectuez la vérification de vivacité.", ru: "Пройдите проверку живости." },
  "profile.verifyStep4":     { tr: "Onay Bekliyor", en: "Awaiting Approval", ar: "في انتظار الموافقة", ku: "Li benda Pejirandinê", fr: "En attente d'approbation", ru: "Ожидание одобрения" },
  "profile.verifyStep4Desc": { tr: "Başvurun incelenip onaylandığında hesabın doğrulansın.", en: "Your account will be verified once your application is reviewed.", ar: "سيتم توثيق حسابك بعد مراجعة طلبك.", ku: "Dema ku serlêdana te were kontrol kirin û pejirandin, hesabê te were piştrast kirin.", fr: "Votre compte sera vérifié une fois votre demande examinée.", ru: "Ваш аккаунт будет подтвержден после проверки заявки." },
  "profile.qrTitle":         { tr: "QR Kod ile Uygulamaya Erişin", en: "Access the App via QR Code", ar: "الوصول إلى التطبيق عبر رمز QR", ku: "Bi QR Kodê Bernameyê Bide Dest", fr: "Accédez à l'application via QR code", ru: "Получите доступ к приложению через QR-код" },
  "profile.qrDesc":          { tr: "MoneyShop uygulamasına erişmek için QR kodu okut.", en: "Scan the QR code to access the MoneyShop app.", ar: "امسح رمز QR للوصول إلى تطبيق MoneyShop.", ku: "Ji bo gihîştina bernameya MoneyShop koda QR bişopîne.", fr: "Scannez le code QR pour accéder à l'application MoneyShop.", ru: "Отсканируйте QR-код для доступа к приложению MoneyShop." },
  "profile.appStore":        { tr: "App Store", en: "App Store", ar: "متجر التطبيقات", ku: "App Store", fr: "App Store", ru: "App Store" },
  "profile.googlePlay":      { tr: "Google Play", en: "Google Play", ar: "Google Play", ku: "Google Play", fr: "Google Play", ru: "Google Play" },

  // --- BUDGETS ---
  "budget.title":            { tr: "Bütçeler", en: "Budgets", ar: "الميزانيات", ku: "Budce", fr: "Budgets", ru: "Бюджеты" },
  "budget.create":           { tr: "Bütçe Oluştur", en: "Create Budget", ar: "إنشاء ميزانية", ku: "Budceyê Çêke", fr: "Créer un budget", ru: "Создать бюджет" },
  "budget.edit":             { tr: "Bütçeyi Düzenle", en: "Edit Budget", ar: "تعديل الميزانية", ku: "Budceyê Biguherîne", fr: "Modifier le budget", ru: "Редактировать бюджет" },
  "budget.delete":           { tr: "Sil", en: "Delete", ar: "حذف", ku: "Jê bibe", fr: "Supprimer", ru: "Удалить" },
  "budget.cancel":           { tr: "İptal", en: "Cancel", ar: "إلغاء", ku: "Betal bike", fr: "Annuler", ru: "Отмена" },
  "budget.confirmDelete":    { tr: "Bu bütçeyi silmek istediğinize emin misiniz?", en: "Are you sure you want to delete this budget?", ar: "هل أنت متأكد من حذف هذه الميزانية؟", ku: "Ma tu bi rastî dixwazî vê budceyê jê bibî?", fr: "Êtes-vous sûr de vouloir supprimer ce budget ?", ru: "Вы уверены, что хотите удалить этот бюджет?" },
  "budget.category":         { tr: "Kategori", en: "Category", ar: "الفئة", ku: "Kategorî", fr: "Catégorie", ru: "Категория" },
  "budget.amount":           { tr: "Tutar", en: "Amount", ar: "المبلغ", ku: "Mîqdar", fr: "Montant", ru: "Сумма" },
  "budget.period":           { tr: "Periyot", en: "Period", ar: "الفترة", ku: "Periyod", fr: "Période", ru: "Период" },
  "budget.weekly":           { tr: "Haftalık", en: "Weekly", ar: "أسبوعي", ku: "Hefteyî", fr: "Hebdomadaire", ru: "Еженедельный" },
  "budget.monthly":          { tr: "Aylık", en: "Monthly", ar: "شهري", ku: "Mehane", fr: "Mensuel", ru: "Ежемесячный" },
  "budget.yearly":           { tr: "Yıllık", en: "Yearly", ar: "سنوي", ku: "Salane", fr: "Annuel", ru: "Ежегодный" },
  "budget.spent":            { tr: "Harcanan", en: "Spent", ar: "تم إنفاقه", ku: "Hat xerckirin", fr: "Dépensé", ru: "Потрачено" },
  "budget.remaining":        { tr: "Kalan", en: "Remaining", ar: "المتبقي", ku: "Mayî", fr: "Restant", ru: "Осталось" },
  "budget.noBudgets":        { tr: "Henüz bütçe bulunmuyor", en: "No budgets yet", ar: "لا توجد ميزانيات بعد", ku: "Hê tu budce tune", fr: "Pas encore de budgets", ru: "Бюджетов пока нет" },
  "budget.noBudgetsDesc":    { tr: "İlk bütçenizi oluşturarak harcamalarınızı kontrol altına alın.", en: "Take control of your expenses by creating your first budget.", ar: "تحكم في مصروفاتك عن طريق إنشاء ميزانيتك الأولى.", ku: "Bi çêkirina budceya xwe ya yekem lêçûnên xwe kontrol bike.", fr: "Prenez le contrôle de vos dépenses en créant votre premier budget.", ru: "Возьмите под контроль свои расходы, создав первый бюджет." },

  // --- DEPOSIT ---
  "deposit.title":           { tr: "Para Yatır", en: "Deposit", ar: "إيداع", ku: "Pere Bixe", fr: "Dépôt", ru: "Пополнить" },
  "deposit.selectMethod":    { tr: "Hesabınıza para yatırma yöntemini seçin", en: "Select a deposit method", ar: "اختر طريقة الإيداع", ku: "Rêbaza danîna pereyan hilbijêre", fr: "Sélectionnez une méthode de dépôt", ru: "Выберите способ пополнения" },
  "deposit.iban":            { tr: "Kendi IBAN'ın ile Yatır", en: "Deposit with Your IBAN", ar: "الإيداع عبر IBAN الخاص بك", ku: "Bi IBAN-a xwe ve Bixe", fr: "Dépôt avec votre IBAN", ru: "Пополнить через свой IBAN" },
  "deposit.card":            { tr: "Banka/Kredi Kartı ile Yatır", en: "Deposit with Bank/Credit Card", ar: "الإيداع ببطاقة البنك/الائتمان", ku: "Bi Karta Bankê/Krediyê ve Bixe", fr: "Dépôt par carte bancaire/crédit", ru: "Пополнить банковской/кредитной картой" },
  "deposit.atm":             { tr: "ATM'den MoneyShop Card ile Yatır", en: "Deposit via ATM with MoneyShop Card", ar: "الإيداع عبر الصراف الآلي ببطاقة MoneyShop", ku: "Bi Karta MoneyShop ve ji ATM-yê Bixe", fr: "Dépôt via DAB avec la carte MoneyShop", ru: "Пополнить через банкомат картой MoneyShop" },
  "deposit.ibanSubtitle":    { tr: "Aşağıdaki IBAN numarasına havale/EFT yaparak hesabınıza para yatırabilirsiniz.", en: "You can deposit by making a wire transfer/EFT to the IBAN below.", ar: "يمكنك الإيداع عن طريق التحويل المصرفي/EFT إلى IBAN أدناه.", ku: "Tu dikarî bi şandina havale/EFT-ê li IBAN-a jêrîn pere bixî.", fr: "Vous pouvez déposer en effectuant un virement/EFT vers l'IBAN ci-dessous.", ru: "Вы можете пополнить счет, сделав перевод/EFT на IBAN ниже." },
  "deposit.recipient":       { tr: "Alıcı Adı", en: "Recipient Name", ar: "اسم المستلم", ku: "Navê Wergir", fr: "Nom du bénéficiaire", ru: "Получатель" },
  "deposit.description":     { tr: "Açıklama (Zorunlu)", en: "Description (Required)", ar: "الوصف (إلزامي)", ku: "Danasîn (Pêwîst)", fr: "Description (Obligatoire)", ru: "Описание (Обязательно)" },
  "deposit.descriptionNote": { tr: "Gönderilen tutarın doğru şekilde hesabınıza tanımlanması için açıklama kısmına MoneyShop kullanıcı kodunuzu yazmanız gerekmektedir.", en: "You must write your MoneyShop user code in the description for the amount to be credited correctly.", ar: "يجب كتابة رمز مستخدم MoneyShop في الوصف لإيداع المبلغ بشكل صحيح.", ku: "Ji bo ku mîqdar bi rastî were hesabê te, divê tu koda bikarhêner a MoneyShop-ê di danasînê de binivîsî.", fr: "Vous devez inscrire votre code utilisateur MoneyShop dans la description pour que le montant soit correctement crédité.", ru: "Вы должны указать код пользователя MoneyShop в описании для правильного зачисления средств." },
  "deposit.important":       { tr: "Önemli Bilgi", en: "Important Notice", ar: "معلومات مهمة", ku: "Agahiya Girîng", fr: "Information importante", ru: "Важная информация" },
  "deposit.ibanWarning":     { tr: "IBAN numarasına yapılan havalelerin hesabınıza yansıması 1-3 iş günü sürebilir. 50.000 TL ve üzeri işlemlerde bankanızın günlük transfer limitini kontrol ediniz.", en: "Transfers to the IBAN may take 1-3 business days to reflect. For transactions of 50,000 TL and above, check your bank's daily transfer limit.", ar: "قد تستغرق التحويلات إلى IBAN من 1-3 أيام عمل للظهور. للمعاملات التي تبلغ 50,000 TL وما فوق، تحقق من حد التحويل اليومي للبنك.", ku: "Veguhestinên ji bo IBAN-ê dibe ku 1-3 rojên karker bigirin. Ji bo danûstandinên 50,000 TL û jortir, sînorê veguhestinê yê rojane yê banka xwe kontrol bike.", fr: "Les virements vers l'IBAN peuvent prendre 1 à 3 jours ouvrés. Pour les transactions de 50 000 TL et plus, vérifiez la limite de transfert quotidienne de votre banque.", ru: "Переводы на IBAN могут отражаться в течение 1-3 рабочих дней. Для транзакций от 50 000 TL и выше проверьте ежедневный лимит перевода вашего банка." },
  "deposit.copy":            { tr: "Kopyala", en: "Copy", ar: "نسخ", ku: "Kopî bike", fr: "Copier", ru: "Копировать" },
  "deposit.copied":          { tr: "Kopyalandı", en: "Copied", ar: "تم النسخ", ku: "Hate kopî kirin", fr: "Copié", ru: "Скопировано" },
  "deposit.comingSoon":      { tr: "Bu özellik yakında kullanıma sunulacaktır.", en: "This feature will be available soon.", ar: "هذه الميزة ستكون متاحة قريباً.", ku: "Ev taybetmendî dê di nêzîk de were bikar anîn.", fr: "Cette fonctionnalité sera bientôt disponible.", ru: "Эта функция скоро будет доступна." },

  // --- WITHDRAW ---
  "withdraw.title":          { tr: "Para Çek", en: "Withdraw", ar: "سحب", ku: "Pere Derxe", fr: "Retrait", ru: "Снять" },
  "withdraw.selectMethod":   { tr: "Hesabınızdan para çekme yöntemini seçin", en: "Select a withdrawal method", ar: "اختر طريقة السحب", ku: "Rêbaza derxistina pereyan hilbijêre", fr: "Sélectionnez une méthode de retrait", ru: "Выберите способ снятия" },
  "withdraw.iban":           { tr: "IBAN ile Para Çek", en: "Withdraw via IBAN", ar: "السحب عبر IBAN", ku: "Bi IBAN-ê Pere Derxe", fr: "Retrait par IBAN", ru: "Снять через IBAN" },
  "withdraw.qr":             { tr: "QR ile Para Çek", en: "Withdraw via QR", ar: "السحب عبر QR", ku: "Bi QR-ê Pere Derxe", fr: "Retrait par QR", ru: "Снять через QR" },
  "withdraw.card":           { tr: "MoneyShop Card ile Para Çek", en: "Withdraw with MoneyShop Card", ar: "السحب ببطاقة MoneyShop", ku: "Bi Karta MoneyShop ve Pere Derxe", fr: "Retrait avec la carte MoneyShop", ru: "Снять картой MoneyShop" },
  "withdraw.comingSoon":     { tr: "Bu özellik yakında kullanıma sunulacaktır.", en: "This feature will be available soon.", ar: "هذه الميزة ستكون متاحة قريباً.", ku: "Ev taybetmendî dê di nêzîk de were bikar anîn.", fr: "Cette fonctionnalité sera bientôt disponible.", ru: "Эта функция скоро будет доступна." },

  // --- COMMON ---
  "common.back":             { tr: "Geri", en: "Back", ar: "رجوع", ku: "Vegere", fr: "Retour", ru: "Назад" },
  "common.loading":          { tr: "Yükleniyor...", en: "Loading...", ar: "جارٍ التحميل...", ku: "Tê barkirin...", fr: "Chargement...", ru: "Загрузка..." },
  "common.error":            { tr: "Hata", en: "Error", ar: "خطأ", ku: "Çewtî", fr: "Erreur", ru: "Ошибка" },
  "common.retry":            { tr: "Tekrar Dene", en: "Retry", ar: "إعادة المحاولة", ku: "Dîsa Biceribîne", fr: "Réessayer", ru: "Повторить" },
  "common.noResults":        { tr: "Sonuç bulunamadı", en: "No results found", ar: "لم يتم العثور على نتائج", ku: "Ti encam nehate dîtin", fr: "Aucun résultat trouvé", ru: "Результатов не найдено" },
};

export function t(key: string, fallback?: string): string {
  const lang = getDashboardLang();
  const entry = dict[key];
  if (!entry) return fallback ?? key;
  return entry[lang] ?? entry["tr"] ?? key;
}

export function tWithVars(key: string, vars: Record<string, string | number>): string {
  let result = t(key);
  for (const [k, v] of Object.entries(vars)) {
    result = result.replace(`{{${k}}}`, String(v));
  }
  return result;
}

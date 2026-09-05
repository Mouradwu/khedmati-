export type Lang = "fr" | "ar";

// Dictionnaire FR/AR — couvre en priorité la navigation partagée, la
// homepage et l'authentification (surfaces vues par 100% des visiteurs).
// Les pages plus profondes (formulaires métier, tableaux admin) restent
// en français pour l'instant : les traduire toutes correctement demande un
// travail dédié bien plus long qu'un correctif ponctuel.
export const translations = {
  "nav.myRequests": { fr: "Mes demandes", ar: "طلباتي" },
  "nav.newRequest": { fr: "Nouvelle demande", ar: "طلب جديد" },
  "nav.artisansNearMe": { fr: "Artisans autour de moi", ar: "الحرفيون القريبون" },
  "nav.myLocation": { fr: "Ma localisation", ar: "موقعي" },
  "nav.receivedRequests": { fr: "Demandes reçues", ar: "الطلبات الواردة" },
  "nav.myOffers": { fr: "Mes offres", ar: "عروضي" },
  "nav.newOffer": { fr: "Nouvelle offre", ar: "عرض جديد" },
  "nav.myProfile": { fr: "Mon profil", ar: "ملفي الشخصي" },
  "nav.callQueue": { fr: "File d'appels", ar: "قائمة الاتصالات" },
  "nav.artisansAdmin": { fr: "Artisans", ar: "الحرفيون" },
  "nav.clientsAdmin": { fr: "Demandeurs", ar: "الزبائن" },
  "nav.requestsAdmin": { fr: "Demandes", ar: "الطلبات" },
  "nav.categoriesAdmin": { fr: "Catégories", ar: "الفئات" },
  "nav.adminsAdmin": { fr: "Administrateurs", ar: "المشرفون" },
  "nav.auditLog": { fr: "Journal", ar: "السجل" },
  "nav.logout": { fr: "Déconnexion", ar: "تسجيل الخروج" },
  "nav.login": { fr: "Connexion", ar: "تسجيل الدخول" },
  "nav.categories": { fr: "Métiers", ar: "المهن" },
  "nav.artisanCta": { fr: "Je suis artisan", ar: "أنا حرفي" },
  "nav.home": { fr: "Accueil", ar: "الرئيسية" },
  "nav.notifications": { fr: "Notifications", ar: "الإشعارات" },
  "nav.menu": { fr: "Menu", ar: "القائمة" },
  "nav.close": { fr: "Fermer", ar: "إغلاق" },

  "home.heroTitle1": { fr: "De quoi", ar: "ما الذي" },
  "home.heroTitle2": { fr: "avez-vous besoin ?", ar: "تحتاجه؟" },
  "home.heroSubtitle": {
    fr: "Expliquez votre problème avec vos mots — en français, en arabe ou en darija. KHEDMATI trouve le bon artisan près de chez vous.",
    ar: "اشرح مشكلتك بكلماتك — بالفرنسية أو العربية أو الدارجة. خدمتي يجد لك الحرفي المناسب بالقرب منك.",
  },
  "home.tagline": { fr: "خدمتك قريبة ليك", ar: "خدمتك قريبة ليك" },
  "home.findNearMe": { fr: "Trouver un professionnel autour de moi", ar: "ابحث عن محترف بالقرب مني" },
  "home.useLocation": { fr: "Utiliser ma position", ar: "استخدام موقعي" },
  "home.viewAllTrades": { fr: "Voir tous les métiers", ar: "عرض كل المهن" },
  "home.artisanSectionTitle": { fr: "Vous êtes artisan ?", ar: "هل أنت حرفي؟" },
  "home.artisanSectionBody": {
    fr: "Créez votre profil gratuitement, précisez votre métier et votre zone d'intervention, et recevez des demandes vérifiées près de chez vous.",
    ar: "أنشئ ملفك مجانًا، حدد مهنتك ومنطقة تدخلك، واستقبل طلبات موثقة بالقرب منك.",
  },
  "home.createArtisanProfile": { fr: "Créer mon profil artisan", ar: "إنشاء ملف الحرفي" },
  "home.footerDisclaimer": {
    fr: "KHEDMATI met en relation ; ce n'est pas un service d'urgence officiel.",
    ar: "خدمتي منصة للتواصل، وليست خدمة طوارئ رسمية.",
  },

  "auth.login": { fr: "Connexion", ar: "تسجيل الدخول" },
  "auth.phone": { fr: "Téléphone", ar: "الهاتف" },
  "auth.password": { fr: "Mot de passe", ar: "كلمة المرور" },
  "auth.loginButton": { fr: "Se connecter", ar: "دخول" },
  "auth.loggingIn": { fr: "Connexion...", ar: "جارٍ الدخول..." },
  "auth.noAccount": { fr: "Pas encore de compte ?", ar: "ليس لديك حساب؟" },
  "auth.createClientAccount": { fr: "Créer un compte client", ar: "إنشاء حساب زبون" },
  "auth.artisanAccount": { fr: "Compte artisan", ar: "حساب حرفي" },
  "auth.alreadyAccount": { fr: "Déjà un compte ?", ar: "لديك حساب بالفعل؟" },
} as const;

export type TranslationKey = keyof typeof translations;

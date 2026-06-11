export const registerFields = {
  sections: [
    {
      id: "location",
      titleFr: "Votre emplacement",
      titleAr: "موقعكم",
      fields: [
        { name: "city", span: 2, type: "city" as const },
        { name: "professional_number", span: 2, type: "text" as const },
      ],
    },
    {
      id: "owner",
      titleFr: "Informations personnelles",
      titleAr: "المعلومات الشخصية",
      fields: [
        { name: "owner_first_name", span: 1, type: "text" as const },
        { name: "owner_last_name", span: 1, type: "text" as const },
        { name: "cin", span: 1, type: "text" as const },
        { name: "phone", span: 1, type: "text" as const },
        { name: "email", span: 1, type: "text" as const },
      ],
    },
    {
      id: "security",
      titleFr: "Accès & sécurité",
      titleAr: "الدخول والأمان",
      fields: [
        { name: "password", span: 1, type: "password" as const },
        { name: "confirmPassword", span: 1, type: "password" as const },
      ],
    },
  ],
  labels: {
    owner_first_name: { fr: "Prénom", ar: "الاسم الأول" },
    owner_last_name: { fr: "Nom", ar: "اسم العائلة" },
    cin: { fr: "CIN (Carte d'identité)", ar: "رقم البطاقة الوطنية" },
    phone: { fr: "Téléphone", ar: "الهاتف" },
    email: { fr: "Email professionnel", ar: "البريد الإلكتروني المهني" },
    city: { fr: "Ville d'exercice", ar: "مدينة مزاولة المهنة" },
    professional_number: { fr: "Numéro professionnel", ar: "الرقم المهني" },
    profile_image: { fr: "Photo de profil", ar: "صورة الملف الشخصي" },
    password: { fr: "Mot de passe", ar: "كلمة المرور" },
    confirmPassword: { fr: "Confirmer le mot de passe", ar: "تأكيد كلمة المرور" },
  },
  placeholders: {
    owner_first_name: { fr: "Ex : Mohamed", ar: "مثال: محمد" },
    owner_last_name: { fr: "Ex : Benali", ar: "مثال: بن علي" },
    cin: { fr: "Ex : AB123456", ar: "مثال: AB123456" },
    phone: { fr: "+212 6XX XX XX XX", ar: "+212 6XX XX XX XX" },
    email: { fr: "contact@exemple.ma", ar: "contact@exemple.ma" },
    city: { fr: "Choisir une ville", ar: "اختر مدينة" },
    professional_number: { fr: "Numéro d'inscription", ar: "رقم التسجيل المهني" },
  },
} as const;

export type RegisterFieldName = keyof typeof registerFields.labels;
export type RegisterFormInputName = Exclude<RegisterFieldName, "profile_image">;

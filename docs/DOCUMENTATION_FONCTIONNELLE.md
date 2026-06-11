# Adoul Portail — Documentation fonctionnelle
# بوابة العدول — التوثيق الوظيفي

**Version :** 1.1  
**Date :** juin 2026  
**Type :** documentation métier (non technique)  
**Langues :** français · العربية  

**Changements v1.1 :** enrichissement des calculateurs Wasiyyah, vente, donation, procuration et mariage selon Moudawana, CGI et dahir des adouls ; menu latéral détaillé ; référentiel juridique étendu (section 9).


---

## Table des matières · فهرس المحتويات

1. [Présentation générale](#1-présentation-générale)
2. [Public cible et bénéficiaires](#2-public-cible-et-bénéficiaires)
3. [Objectifs et valeur ajoutée](#3-objectifs-et-valeur-ajoutée)
4. [Principes d'utilisation](#4-principes-dutilisation)
5. [Vue d'ensemble des modules](#5-vue-densemble-des-modules)
6. [Parcours utilisateur type](#6-parcours-utilisateur-type)
7. [Description détaillée des interfaces](#7-description-détaillée-des-interfaces)
8. [Rôles et responsabilités](#8-rôles-et-responsabilités)
9. [Règles métier et référentiel juridique](#9-règles-métier-et-référentiel-juridique)
10. [Livrables et exports](#10-livrables-et-exports)
11. [Fonctionnalités prévues](#11-fonctionnalités-prévues)
12. [Limites et avertissements](#12-limites-et-avertissements)
13. [Budget prévisionnel du projet](#13-budget-prévisionnel-du-projet)

---


![Hero section — Landing page / القسم الرئيسي للصفحة العامة](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/herosection.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2hlcm9zZWN0aW9uLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODYwNjAsImV4cCI6MTgxMjcyMjA2MH0.dt3zH4pQ-j7biV5LEqUgbcn3UZzu_12f1uH2z1x5TXc)

---


## 1. Présentation générale

### Français

**Adoul Portail** est une plateforme numérique professionnelle conçue pour accompagner les **adouls** (officiers d'état civil et notaires adouls au Maroc) dans la gestion quotidienne de leur activité. Elle centralise les dossiers clients, automatise les calculs successoraux et contractuels, produit des rapports bilingues (français / arabe) et conserve l'historique des opérations réalisées au sein du cabinet.

L'application s'adresse prioritairement aux **successions (الميراث)** selon l'école **malikite** et le cadre de la **Moudawana** (Code de la famille marocain), tout en couvrant d'autres actes courants : wasiyyah (الوصية), partage immobilier, mariage (sadaq), vente, donation, procuration, etc.

L'interface est **bilingue** : chaque libellé, titre et message important est présenté en français et en arabe, afin de correspondre aux pratiques professionnelles des adouls marocains et à la compréhension des familles.

### العربية

**بوابة العدول** منصة رقمية مهنية مخصصة لدعم **العدول** (موثقي الأحوال المدنية والعدول الشرعيون في المغرب) في إدارة نشاطهم اليومي. تجمع المنصة ملفات العملاء، وتؤتمت حسابات الميراث والعقود، وتنتج تقارير ثنائية اللغة (فرنسية / عربية)، وتحفظ سجل العمليات المنفذة داخل المكتب.

تركز التطبيق أولاً على **الميراث** وفق **المذهب المالكي** و**مدونة الأسرة** المغربية، مع تغطية عقود أخرى شائعة: الوصية، تقسيم العقار، الزواج (الصداق)، البيع، الهبة، الوكالة، وغيرها.

الواجهة **ثنائية اللغة**: كل عنوان ورسالة مهمة معروضة بالفرنسية والعربية، بما يتوافق مع ممارسات العدول المغاربة وتوقعات الأسر.

---
![Page d'accueil / Connexion — الصفحة الرئيسية / تسجيل الدخول](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/insc.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2luc2MucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NzgyOSwiZXhwIjoxODEyNzIzODI5fQ.aPu_KvxY_ryrxFkEoBc7F_z-XUmOhPfG69J89EoNIaM)

---


## 2. Public cible et bénéficiaires

### Français

| Profil | Description | Usage principal |
|--------|-------------|-----------------|
| **Adoul / عدل** | Professionnel habilité à authentifier les actes | Création de dossiers, calculs, rapports, suivi client |
| **Propriétaire de cabinet** | Responsable de la structure | Supervision des dossiers, activité de l'équipe |
| **Assistant(e) de cabinet** | Soutien administratif | Saisie clients, préparation dossiers, consultation |
| **Super administrateur** | Gestion de la plateforme (niveau global) | Administration des cabinets, utilisateurs, activité |

**Bénéficiaires indirects :**
- Les **familles** et héritiers qui reçoivent des calculs clairs et documentés ;
- Les **cabinets d'adoul** qui gagnent en rigueur, traçabilité et professionnalisme.

### العربية

| الفئة | الوصف | الاستخدام الرئيسي |
|-------|--------|-------------------|
| **العدل** | مهني مرخص لتوثيق العقود | إنشاء الملفات، الحسابات، التقارير، متابعة العملاء |
| **مالك المكتب** | مسؤول الهيكل | الإشراف على الملفات ونشاط الفريق |
| **مساعد المكتب** | دعم إداري | إدخال العملاء، تجهيز الملفات، الاطلاع |
| **المشرف العام** | إدارة المنصة (مستوى شامل) | إدارة المكاتب والمستخدمين والنشاط |

**المستفيدون غير المباشرين:**
- **الأسر** والورثة الذين يتلقون حسابات واضحة وموثقة؛
- **مكاتب العدول** التي تكتسب دقة وتتبعاً واحترافية.

---

## 3. Objectifs et valeur ajoutée

### Français

| Objectif | Description |
|----------|-------------|
| **Centraliser** | Un seul espace pour clients, dossiers, calculs et documents |
| **Fiabiliser** | Calculs d'héritage structurés avec justifications juridiques |
| **Tracer** | Historique des calculs, activité récente, statuts de dossiers |
| **Professionnaliser** | Rapports PDF bilingues prêts à être présentés ou archivés |
| **Gagner du temps** | Feuilles de calcul patrimoniales, répartition automatique, KPIs |
| **Préparer l'avenir** | Modules IA et OCR prévus pour assistance et numérisation |

### العربية

| الهدف | الوصف |
|-------|--------|
| **المركزية** | فضاء واحد للعملاء والملفات والحسابات والوثائق |
| **الموثوقية** | حسابات ميراث منظمة مع تعليلات شرعية وقانونية |
| **التتبع** | سجل الحسابات، النشاط الأخير، حالات الملفات |
| **الاحترافية** | تقارير PDF ثنائية اللغة جاهزة للعرض أو الأرشفة |
| **توفير الوقت** | أوراق حساب التركة، التوزيع الآلي، مؤشرات ملخصة |
| **الاستعداد للمستقبل** | وحدات الذكاء الاصطناعي وOCR مخططة للمساعدة والرقمنة |

---

## 4. Principes d'utilisation

### Français

1. **Tout calcul est lié à un dossier** — chaque opération s'inscrit dans le suivi client.
2. **Bilinguisme systématique** — français et arabe affichés conjointement dans l'interface.
3. **École malikite / Moudawana** — référentiel par défaut pour l'héritage au Maroc.
4. **Indicatif, non substitutif** — les rapports informent ; l'acte authentique reste la responsabilité de l'adoul.
5. **Multi-utilisateurs par cabinet** — chaque cabinet dispose de ses propres données isolées.

### العربية

1. **كل حساب مرتبط بملف** — كل عملية ضمن متابعة العميل.
2. **ثنائية اللغة منهجية** — الفرنسية والعربية معروضتان معاً في الواجهة.
3. **المذهب المالكي / مدونة الأسرة** — المرجع الافتراضي للميراث في المغرب.
4. **إرشادي وليس بديلاً** — التقارير للتوجيه؛ المحضر الموثق يبقى مسؤولية العدل.
5. **تعدد المستخدمين لكل مكتب** — كل مكتب له بياناته المعزولة.

---

## 5. Vue d'ensemble des modules

### Français

```
┌─────────────────────────────────────────────────────────────┐
│                    ADOUL PORTAIL                            │
├─────────────┬─────────────┬──────────────┬────────────────┤
│  Tableau    │   Clients   │   Dossiers   │   Documents    │
│  de bord    │             │              │   par dossier  │
├─────────────┴─────────────┴──────────────┴────────────────┤
│                    CALCULATEURS MÉTIER                      │
│  Héritage │ Wasiyyah │ Partage │ Vente │ Donation │ Wakala │ Mariage │
├─────────────────────────────────────────────────────────────┤
│  Assistant IA (à venir)  │  OCR documents (à venir)        │
├─────────────────────────────────────────────────────────────┤
│              Administration (Super Admin)                   │
└─────────────────────────────────────────────────────────────┘
```

### العربية

```
┌─────────────────────────────────────────────────────────────┐
│                    بوابة العدول                             │
├─────────────┬─────────────┬──────────────┬────────────────┤
│  لوحة       │   العملاء   │   الملفات    │   وثائق        │
│  التحكم     │             │              │   الملف        │
├─────────────┴─────────────┴──────────────┴────────────────┤
│                    حاسبات مهنية                             │
│  الميراث │ الوصية │ تقسيم │ بيع │ هبة │ وكالة │ زواج      │
├─────────────────────────────────────────────────────────────┤
│  المساعد الذكي (قريباً)  │  OCR الوثائق (قريباً)          │
├─────────────────────────────────────────────────────────────┤
│              الإدارة (المشرف العام)                        │
└─────────────────────────────────────────────────────────────┘
```

| Module (FR) | الوحدة (AR) | Rôle fonctionnel |
|-------------|-------------|------------------|
| Tableau de bord | لوحة التحكم | Vue synthétique : KPIs, activité, accès rapides |
| Clients | العملاء | Répertoire des personnes accompagnées |
| Dossiers | الملفات | Unité de travail : un dossier = une affaire |
| Héritage | الميراث | Calcul الفرائض complet avec preuves |
| Wasiyyah | الوصية | Calcul du legs testamentaire (plafond 1/3 après dettes) |
| Partage immobilier | تقسيم العقار | Répartition de biens et soultes |
| Vente | البيع | Frais de vente immobilière (TPI, enregistrement, conservation) |
| Donation | الهبة | Frais de donation (hiba) selon lien de parenté |
| Procuration | الوكالة | Frais de procuration (wakala) devant adoul |
| Mariage | الزواج | Calcul du sadaq (صداق) et frais d'acte |
| Calculs divers | عقود أخرى | Acte personnalisé (montant, taux, frais fixes) |
| Documents | الوثائق | Pièces jointes par dossier (PDF, images) |

---

## 6. Parcours utilisateur type

### Français — Succession complète

1. **Connexion** à l'espace cabinet  
2. **Création ou sélection** d'un client  
3. **Ouverture d'un dossier** de type « Héritage »  
4. **Téléversement** des pièces (acte de décès, CIN…) dans le dossier  
5. **Nouveau calcul d'héritage** : saisie du défunt, patrimoine, héritiers  
6. **Consultation du résultat** : graphique, tableau détaillé, preuves juridiques  
7. **Export PDF** du rapport professionnel  
8. **Calcul wasiyyah** éventuel (1/3 après dettes et frais funéraires)  
9. **Partage immobilier** si des biens doivent être répartis physiquement  
10. **Clôture** du dossier (statut « Terminé »)

### العربية — مسار التركة الكامل

1. **تسجيل الدخول** إلى فضاء المكتب  
2. **إنشاء أو اختيار** عميل  
3. **فتح ملف** من نوع « الميراث »  
4. **رفع الوثائق** (شهادة الوفاة، البطاقة…) في الملف  
5. **حساب ميراث جديد**: إدخال الهالك، التركة، الورثة  
6. **الاطلاع على النتيجة**: رسم بياني، جدول تفصيلي، أدلة شرعية  
7. **تصدير PDF** للتقرير المهني  
8. **حساب الوصية** إن لزم (الثلث بعد الديون ومصاريف الدفن)  
9. **تقسيم العقار** إذا تطلب الأمر توزيعاً مادياً  
10. **إغلاق الملف** (حالة « مكتمل »)



## 7. Description détaillée des interfaces

---

### 7.1 Connexion et accueil

#### Français

L'utilisateur accède à la plateforme via une page de **connexion sécurisée** (email et mot de passe). Après authentification, il arrive sur le **tableau de bord** de son cabinet. Un sélecteur de langue permet de naviguer en interface française ou arabe (contenu bilingue dans les deux cas).

**Éléments visibles :**
- Formulaire identifiant / mot de passe  
- Lien vers la page d'accueil publique  
- Changement de langue (FR / AR)

#### العربية

يدخل المستخدم المنصة عبر صفحة **دخول آمنة** (البريد وكلمة المرور). بعد المصادقة يصل إلى **لوحة التحكم** لمكتبه. مبدّل اللغة يسمح بالتصفح بالفرنسية أو العربية (المحتوى ثنائي اللغة في الحالتين).

**العناصر الظاهرة:**
- نموذج المعرف وكلمة المرور  
- رابط للصفحة الرئيسية العامة  
- تغيير اللغة (FR / AR)

---

![Connexion — تسجيل الدخول](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/login.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2xvZ2luLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODYwODIsImV4cCI6MTgxMjcyMjA4Mn0.qKfOEpf4sinqopspuTFcGqu4-72GB3OOIbtmXrjLShM)

---

### 7.2 Tableau de bord · لوحة التحكم

#### Français

Page d'accueil après connexion. Elle offre une **vision globale** de l'activité du cabinet :

| Zone | Contenu |
|------|---------|
| **Indicateurs (KPIs)** | Nombre de dossiers, clients, calculs réalisés |
| **Activité récente** | Dernières actions (création dossier, calcul héritage, export PDF…) |
| **Dossiers récents** | Liste des derniers fichiers ouverts |
| **Actions rapides** | Raccourcis : nouveau dossier, nouveau client, calcul héritage, wasiyyah |
| **Graphiques** | Répartition des dossiers par statut et par type |
| **Alertes** | Dossiers en cours ou en attente |

Chaque ligne d'activité peut mener directement au calcul ou au dossier concerné.

#### العربية

صفحة الاستقبال بعد الدخول. تعرض **رؤية شاملة** لنشاط المكتب:

| المنطقة | المحتوى |
|---------|---------|
| **المؤشرات** | عدد الملفات والعملاء والحسابات |
| **النشاط الأخير** | آخر الإجراءات (إنشاء ملف، حساب ميراث، تصدير PDF…) |
| **الملفات الأخيرة** | قائمة آخر الملفات المفتوحة |
| **إجراءات سريعة** | اختصارات: ملف جديد، عميل جديد، حساب ميراث، وصية |
| **رسوم بيانية** | توزيع الملفات حسب الحالة والنوع |
| **تنبيهات** | ملفات قيد التنفيذ أو في الانتظار |

كل سطر نشاط يمكن أن يوجه مباشرة إلى الحساب أو الملف المعني.

---

![Tableau de bord — لوحة التحكم](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/dashboard.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2Rhc2hib2FyZC5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgxMTg2MjQzLCJleHAiOjE4MTI3MjIyNDN9.n28FPQeyVzDq532YYK_aQ7b93B1rFhnFV4Kjj-2pDxw)


---

### 7.3 Gestion des clients · إدارة العملاء

#### Français

Module de **répertoire client**. Permet de créer, consulter et modifier les fiches des personnes accompagnées par le cabinet.

**Informations gérées :**
- Identité (nom, prénom, CIN)  
- Coordonnées (téléphone, email, adresse)  
- Profession  
- Historique des dossiers liés  

**Actions possibles :**
- Ajouter un client  
- Rechercher / filtrer  
- Modifier une fiche  
- Ouvrir les dossiers associés  

#### العربية

وحدة **سجل العملاء**. تتيح إنشاء واستعراض وتعديل بطاقات الأشخاص الذين يتابعهم المكتب.

**المعلومات المدارة:**
- الهوية (الاسم، اللقب، البطاقة الوطنية)  
- بيانات الاتصال (الهاتف، البريد، العنوان)  
- المهنة  
- سجل الملفات المرتبطة  

**الإجراءات الممكنة:**
- إضافة عميل  
- بحث / تصفية  
- تعديل بطاقة  
- فتح الملفات المرتبطة  

---

![Liste des clients — قائمة العملاء](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/clients.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2NsaWVudHMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NjI3NywiZXhwIjoxODEyNzIyMjc3fQ.0OKBQQ4j1KzwCzOVy-Ti1lGnAu29ECB9rLrvx-Z2i6E)

---

![Fiche client — بطاقة العميل](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/clients-details.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2NsaWVudHMtZGV0YWlscy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgxMTg2MzYwLCJleHAiOjE4MTI3MjIzNjB9.Xf-oH8T9gvToEHs1bCQxt0WoDs8em-PWCQtTRVJJQfM)



---

### 7.4 Gestion des dossiers · إدارة الملفات

#### Français

Le **dossier** est l'unité centrale de travail. Chaque affaire (succession, vente, mariage…) est un dossier rattaché à un client.

**Types de dossiers disponibles :**

| Type | Usage |
|------|-------|
| Héritage | Successions et calculs de الفرائض |
| Wasiyyah | Legs testamentaire lié à une succession |
| Partage immobilier | Répartition physique des biens |
| Vente | Actes de vente immobilière |
| Donation | Actes de donation (hiba) |
| Procuration | Actes de procuration (wakala) |
| Mariage | Contrats de mariage et sadaq |
| Autre | Actes divers |

**Statuts du dossier :**

| Statut | Signification |
|--------|---------------|
| Brouillon | Dossier créé, travail non commencé |
| En cours | Calculs ou traitement en cours |
| En attente | Informations ou pièces manquantes |
| Terminé | Affaire clôturée |
| Archivé | Dossier conservé hors flux actif |

**Fiche dossier — contenu :**
- Numéro unique, titre, client, type, statut  
- **Documents** : téléversement de pièces (PDF, JPG, PNG) — acte de décès, CIN, titres fonciers…  
- **Calculs enregistrés** : liste de tous les calculs liés avec accès PDF  
- Bouton **Lancer le calculateur** adapté au type de dossier  

#### العربية

**الملف** هو وحدة العمل المركزية. كل قضية (ميراث، بيع، زواج…) ملف مرتبط بعميل.

**أنواع الملفات:**

| النوع | الاستخدام |
|-------|-----------|
| الميراث | التركات وحسابات الفرائض |
| الوصية | الوصية التبرعية المرتبطة بالتركة |
| تقسيم العقار | التوزيع المادي للأصول |
| البيع | عقود البيع العقاري |
| الهبة | عقود الهبة |
| الوكالة | عقود الوكالة |
| الزواج | عقود الزواج والصداق |
| أخرى | عقود متنوعة |

**حالات الملف:**

| الحالة | المعنى |
|--------|--------|
| مسودة | ملف منشأ، العمل لم يبدأ |
| قيد التنفيذ | حسابات أو معالجة جارية |
| في الانتظار | معلومات أو وثائق ناقصة |
| مكتمل | القضية مغلقة |
| مؤرشف | ملف محفوظ خارج التدفق النشط |

**بطاقة الملف — المحتوى:**
- رقم فريد، عنوان، عميل، نوع، حالة  
- **الوثائق**: رفع مرفقات (PDF، JPG، PNG)  
- **الحسابات المسجلة**: قائمة كل الحسابات مع وصول PDF  
- زر **بدء الحاسبة** المناسبة لنوع الملف  

---

![Liste des dossiers — قائمة الملفات](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/dossiers.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2Rvc3NpZXJzLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODYzOTMsImV4cCI6MTgxMjcyMjM5M30.UBCmWrQJMW2p6Mg-GrbFNhd1eMtWX6mSZUnqTA7q_yg)

---
![Détail dossier + documents — تفاصيل الملف والوثائق](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/dossier-details.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2Rvc3NpZXItZGV0YWlscy5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgxMTg2NDA2LCJleHAiOjE4MTI3MjI0MDZ9.BDH7WEDbh8d5GeqCQQpWA3IVYRrPzvNVTov4fY5OLwU)


---

### 7.5 Module Héritage · وحدة الميراث

> *Module principal de la plateforme.*

#### Français

Le module **Héritage** permet de calculer la répartition de la succession (الفرائض) selon l'école malikite et la Moudawana marocaine. Il comprend trois vues :

#### 7.5.1 Historique des calculs

Tableau de tous les calculs d'héritage déjà enregistrés :

| Colonne | Description |
|---------|-------------|
| Date | Date du calcul |
| Titre | Intitulé du calcul |
| Dossier | Numéro et client |
| Défunt | Nom du défunt (الهالك) |
| Héritiers | Nombre d'héritiers et exclus (hajb) |
| Patrimoine net | Montant net de la tarika |
| Actions | Voir le détail |

Fonctions : recherche, pagination, accès au détail complet.

#### 7.5.2 Nouveau calcul — workflow en 3 étapes

**Étape 1 — Dossier**  
Sélection du dossier de type « Héritage » auquel le calcul sera rattaché.

**Étape 2 — Patrimoine et défunt**  
- Patrimoine brut (total, immobilier, banque)  
- Dettes et frais → calcul automatique du **patrimoine net**  
- **Fiche du défunt** : nom (FR/AR), CIN, date et lieu de décès, sexe  
- **Feuille de calcul patrimoniale** : saisie ligne par ligne des biens et dettes  

**Étape 3 — Héritiers**  
Pour chaque catégorie d'héritier :
- Type (époux, fils, fille, père, mère, frères, sœurs, oncles, cousins, neveux…)  
- Nombre de personnes  
- **Identité de chaque héritier** : nom, nom arabe, genre (homme / femme)  

Catégories couvertes : conjoints, ascendants, descendants, collatéraux germains et consanguins, oncles/tantes, cousins, neveux, الحمل، المفقود، etc.

#### 7.5.3 Résultat et preuves

Après calcul, affichage complet :

| Section | Contenu |
|---------|---------|
| **Synthèse (KPIs)** | Net, nombre d'héritiers, exclus, école juridique, badges العول / الرد |
| **Graphique** | Camembert de répartition en pourcentages |
| **Tableau de distribution** | Parts et montants par catégorie |
| **Détail par héritier** | Nom, genre, statut (hérite / محجوب / en attente), %, montant MAD |
| **Preuves juridiques** | Étapes du calcul, références Coran / Maliki / Moudawana |
| **Vérification juridique** | Règle appliquée, justification, héritier bloquant |
| **Héritiers exclus** | Liste des محجوبون avec motifs (hajb) |
| **Corrections** | العول (réduction proportionnelle) et الرد (restitution du surplus) |
| **Actions** | Export PDF, lien dossier, accès wasiyyah |

#### العربية

وحدة **الميراث** تحسب توزيع التركة (الفرائض) وفق المذهب المالكي ومدونة الأسرة المغربية. تتضمن ثلاث واجهات:

#### 7.5.1 سجل الحسابات

جدول بكل حسابات الميراث المسجلة: التاريخ، العنوان، الملف، الهالك، الورثة، صافي التركة، عرض التفاصيل. مع بحث وترقيم صفحات.

#### 7.5.2 حساب جديد — ثلاث مراحل

**1 — الملف:** اختيار ملف من نوع « الميراث ».  
**2 — التركة والهالك:** إجمالي التركة، عقار، بنك، ديون، مصاريف، صافي التركة، بيانات الهالك، ورقة حساب التركة.  
**3 — الورثة:** نوع كل وارث، العدد، الاسم والجنس لكل شخص.

#### 7.5.3 النتيجة والأدلة

ملخص، رسم دائري، جداول التوزيع والتفصيل، الأدلة الشرعية والقانونية، التحقق، المحجوبون، العول والرد، تصدير PDF، رابط الملف، الوصية.

---

![Historique héritage — سجل الميراث](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/inheritance-list.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2luaGVyaXRhbmNlLWxpc3QucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NjY2MCwiZXhwIjoxODEyNzIyNjYwfQ.mEPtWL50Rz3PIoz2d8TCSSEkbDBxMWWmqmprohr46Wc)  

---

![Étape 1 — Sélection dossier / المرحلة 1](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/heritage-step1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2hlcml0YWdlLXN0ZXAxLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODY3OTUsImV4cCI6MTgxMjcyMjc5NX0.PpygK69NU28UyBLcmII-UpW-HdynhOE15Z_ijBVHRD0) 

---

![Étape 2 — Patrimoine et défunt / المرحلة 2](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/heritage-estate1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2hlcml0YWdlLWVzdGF0ZTEucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NjgxNywiZXhwIjoxODEyNzIyODE3fQ.02bO923yhEH0hLmGTu5PQ9H6EB7exDK9FwLB7w8v6C0)  

---
![Étape 2 — Patrimoine et défunt / المرحلة 2](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/heritage-estate2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2hlcml0YWdlLWVzdGF0ZTIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NjgzNiwiZXhwIjoxODEyNzIyODM2fQ.V6qcfH6wefRLi8GRz5ONVs578N1FX9Zv1m95420QU9M)  

---
![Étape 3 — Héritiers / المرحلة 3](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/heritage-heirs.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2hlcml0YWdlLWhlaXJzLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODY4NjUsImV4cCI6MTgxMjcyMjg2NX0.YfcWPzbkO0kxx6MnnG8uHoSuWTpWV4tdjpL9kXml4ps)

---

![Résultat — graphique et KPIs / النتيجة](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/heritage-resultat.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2hlcml0YWdlLXJlc3VsdGF0LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODY4OTIsImV4cCI6MTgxMjcyMjg5Mn0.-b42n6SrSTxR_Dtvx8tosyGO82T2daUYHajOchhrHWw)  

---


![Tableau détail héritiers / جدول التفصيل](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/heritage-table-resultat.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2hlcml0YWdlLXRhYmxlLXJlc3VsdGF0LnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODY5MTMsImV4cCI6MTgxMjcyMjkxM30.WL7WvYEGNIiLcg0DtPBkEAn2CZrAJi7puxNsiohO8xU)  

---
![Preuves juridiques / الأدلة الشرعية](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/heitage-preuve.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2hlaXRhZ2UtcHJldXZlLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODY5OTcsImV4cCI6MTgxMjcyMjk5N30.gwKe-mw68ndzOROo9EpyQwyowd70ciwP-oGeSyNhKYE)  

---
![Rapport PDF / تقرير PDF](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/pdf.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL3BkZi5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgxMTg3MDcwLCJleHAiOjE4MTI3MjMwNzB9.3mmSPud7IBYoU2EKeNefOuSTRUaYUZ0g639DIKMncN8)  


---

### 7.6 Module Wasiyyah · وحدة الوصية

#### Français

Calcule le **legs testamentaire (الوصية)** dans la limite du **tiers (1/3)** de la tarika nette **après déduction des dettes et frais funéraires**, conformément au Coran (Sourate Al-Baqara, 2:180-182), à l'école **malikite** et à la **Moudawana** (art. 328 à 334).

**Saisies :**

| Champ | Description |
|-------|-------------|
| Dossier | Dossier de type « Héritage » (obligatoire) |
| Patrimoine net brut | Montant total de la tarika avant wasiyyah |
| Dettes du défunt | Dettes à déduire en priorité |
| Frais funéraires | Dépenses de sépulture à déduire |
| Montant wasiyyah | Montant souhaité par le testateur |
| Nature | En numéraire ou bien déterminé (عين معينة) |
| Légataire (FR / AR) | Nom du الموصى له en français et en arabe |
| Légataire = héritier | Case à cocher si le bénéficiaire est déjà وارث |
| Consentement des héritiers | Si légataire = héritier : accord unanime requis (art. 330) |

**Règles appliquées :**

1. **Base de calcul** = patrimoine net brut − dettes − frais funéraires  
2. **Plafond** = 1/3 de cette base (ثُلُثُكُمْ)  
3. **Wasiyyah au profit d'un héritier** : invalide sans consentement unanime des cohéritiers  
4. **Dépassement du tiers** : montant ramené automatiquement au plafond  
5. **Reste** = base − wasiyyah retenue → soumis aux règles de الفرائض  

**Résultats affichés :**
- Détail ligne par ligne (brut, déductions, base, plafond, montant retenu, reste)  
- Statut de validité (conforme / invalide / ramené au plafond)  
- Message bilingue FR / AR  
- Preuves juridiques (Coran, Moudawana, mention de la الوصية الواجبة non couverte)  
- Export PDF  

**Lien avec l'héritage :** depuis le résultat d'un calcul d'héritage, un bouton permet d'ouvrir le calculateur wasiyyah avec le patrimoine net pré-rempli.

#### العربية

تحسب **الوصية التبرعية** في حدود **الثلث** من صافي التركة **بعد خصم الديون ومصاريف الدفن**، وفق القرآن (البقرة 2:180-182) والمذهب المالكي ومدونة الأسرة (م.328 إلى 334).

**المدخلات:** ملف ميراث، صافي التركة الإجمالي، الديون، مصاريف الدفن، مبلغ الوصية، طبيعتها (نقداً أو عيناً)، اسم الموصى له بالفرنسية والعربية، هل هو وارث، موافقة الورثة بالإجماع إن كان وارثاً.

**القواعد:** الأساس = الصافي − الديون − الدفن؛ الحد = الثلث؛ الوصية للوارث بلا إجماع = غير صالحة؛ التجاوز يُخفّض للحد؛ الباقي للفرائض.

**المخرجات:** تفصيل الحساب، حالة الصلاحية، رسالة ثنائية اللغة، أدلة شرعية، تصدير PDF. رابط من نتيجة الميراث مع تعبئة الصافي مسبقاً.

---

![Calcul Wasiyyah — حساب الوصية](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/wassiyah-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL3dhc3NpeWFoLTEucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NzEyMiwiZXhwIjoxODEyNzIzMTIyfQ.PbZ-s48RsHa929bmlURklxHKNdg4kmUXa0ZSZDEn-XY)

---
![Calcul Wasiyyah — حساب الوصية](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/wassiyah-2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL3dhc3NpeWFoLTIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NzEyOSwiZXhwIjoxODEyNzIzMTI5fQ.xn_i6YXPw2fJZID3wZ4GovlN-P-Btg0XB3a0GIILt2U)

---

### 7.7 Module Partage immobilier · تقسيم العقار

#### Français

Répartit des **biens immobiliers** entre plusieurs héritiers ou copartageants, avec calcul des **soultes** (compensations financières).

**Fonctionnalités :**
- Ajout de biens (appartement, villa, terrain, local commercial…) avec valeur et surface  
- Ajout d'héritiers avec parts en % (égales ou personnalisées)  
- Attribution de biens à chaque héritier  
- Calcul automatique des écarts et soultes (à verser / à recevoir)  
- Export PDF du résultat  

#### العربية

يوزع **العقارات** بين الورثة أو الشركاء، مع حساب **التسويات** النقدية. إضافة عقارات وورثة وحصص، تخصيص العقارات، حساب الفوارق والتسويات، تصدير PDF.

---

![Partage immobilier — تقسيم العقار](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/imobilier-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2ltb2JpbGllci0xLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODcxNzMsImV4cCI6MTgxMjcyMzE3M30.b-DTKgJe-j4Kv6yRRtbSy4lDqvbCFCeSGV_QpTdFrFU)

---

![Partage immobilier — تقسيم العقار](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/imobilier-2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2ltb2JpbGllci0yLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODcxODEsImV4cCI6MTgxMjcyMzE4MX0.Mc2mLLg5R6PhVAuw3OMcN2_b-LozmVBCHPYgrHlqICU)
---

### 7.8 Calculateurs d'actes · حاسبات العقود

#### Français

Calculateurs accessibles depuis le **menu latéral** et rattachés à un **dossier** du type correspondant. Chaque calculateur produit : lignes de frais détaillées, preuves juridiques bilingues, enregistrement dans l'historique du dossier, export PDF.

---

#### 7.8.1 Vente immobilière · البيع العقاري

**Références :** CGI (TPI art. 91-92, droits d'enregistrement), ANCFCC (conservation foncière), dahir des adouls (honoraires).

| Saisie | Rôle |
|--------|------|
| Prix de vente | Base des droits d'enregistrement et conservation |
| Prix d'acquisition + frais | Calcul de la plus-value imposable |
| Années de détention | Abattement TPI progressif (10 %/an à partir de la 5e année, plafond 100 % à 14 ans) |
| Résidence principale | Exonération TPI totale si occupation continue ≥ 6 ans |
| Type de bien | Habitation (4 %), commercial (5 %), terrain nu (5 %), agricole (4 %) |
| Plus-value manuelle | Option si prix d'acquisition inconnu |

**Postes calculés :** droits d'enregistrement, conservation foncière (1,5 %), honoraires adoul, formalités / timbre, TPI (20 % sur base après abattement).

---

#### 7.8.2 Donation (Hiba) · الهبة

**Références :** Moudawana Livre III (art. 336 à 362), CGI (mutation à titre gratuit).

| Saisie | Rôle |
|--------|------|
| Valeur du bien | Base des droits |
| Nature du bien | Immobilier (عقار) ou mobilier (منقول) — conservation si immobilier |
| Lien de parenté | Détermine le taux d'enregistrement |

**Barème indicatif d'enregistrement :**

| Lien | Taux |
|------|------|
| Conjoint, enfant, petit-enfant, parent | 2,5 % |
| Frère / sœur | 5 % |
| Collatéral ou sans lien | 6 % |

**Postes calculés :** droits d'enregistrement, conservation foncière (si immobilier), honoraires adoul.

---

#### 7.8.3 Procuration (Wakala) · الوكالة

**Références :** Dahir n° 1-57-223 (statut des adouls), Code des obligations et contrats (mandat).

| Saisie | Rôle |
|--------|------|
| Type | Générale, spéciale, vente immobilière, achat, succession, représentation |
| Durée (années) | Majoration au-delà de 1 an ; alerte si > 5 ans |
| Valeur du bien | Pour procuration vente/achat immobilier |

**Postes calculés :** honoraires adoul (selon type et durée), timbre / frais administratifs.

---

#### 7.8.4 Mariage (Sadaq / الصداق) · الزواج

**Références :** Moudawana Livre II (art. 49 et suiv.), dahir des adouls.

| Saisie | Rôle |
|--------|------|
| Sadaq immédiat (الحال / المعجل) | Versé à la conclusion du contrat |
| Sadaq différé (المؤجل) | Dû ultérieurement |
| Or (grammes × prix/gramme) | Valeur en dirhams |
| Mobilier du foyer | Complément du sadaq |
| Ordre du mariage | Premier mariage ou mariage supplémentaire (art. 41-47 Moudawana) |

**Postes calculés :** total sadaq, honoraires adoul, frais d'enregistrement de l'acte.

---

#### 7.8.5 Autre acte · عقد آخر

Calcul personnalisé : montant de base, taux (%), frais fixes, description libre.

---

#### العربية

حاسبات العقود متاحة من القائمة الجانبية ومرتبطة بملف من النوع المناسب. كل حاسبة تنتج تفاصيل الرسوم، أدلة شرعية وقانونية ثنائية اللغة، سجلاً في الملف، وتصدير PDF.

- **البيع:** ثمن البيع والشراء، سنوات الحيازة، نوع العقار، السكن الرئيسي، الضريبة على الأرباح العقارية مع الإعفاء التدريجي، التسجيل والمحافظة العقارية.
- **الهبة:** قيمة العين، عقار أو منقول، صلة القرابة (2,5% إلى 6%)، أتعاب العدل.
- **الوكالة:** نوع الوكالة، المدة، قيمة العقار إن وجدت، تنبيه إذا تجاوزت 5 سنوات.
- **الزواج:** الصداق الحال والمؤجل والذهب والأثاث، زواج أول أو إضافي، أتعاب العدل ورسوم التسجيل.
- **عقد آخر:** حساب مخصص.

---

![Calcul vente — حساب البيع](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/baia.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2JhaWEucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NzIxNCwiZXhwIjoxODEyNzIzMjE0fQ.FQAQRcdL2JljiTiCnlTd0gngNXERZmdPHmkB3gQAQEA)  

---
![Calcul mariage / Sadaq — حساب الزواج](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/zawaj.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL3phd2FqLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODcyMzcsImV4cCI6MTgxMjcyMzIzN30.ym98_P5P-HfKABK2JgquYCZsR48PUZGcR_3xVDerVQY)

---

![Calcul donation — حساب الهبة](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/hiba.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2hpYmEucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NzI1NiwiZXhwIjoxODEyNzIzMjU2fQ.1bYzBl5XkJxkAezQFDhHQoPq_aYZNcwn9oRRpP_Y8vQ)  

---
![Calcul procuration — حساب الوكالة](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/wakala.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL3dha2FsYS5wbmciLCJzY29wZSI6ImRvd25sb2FkIiwiaWF0IjoxNzgxMTg3MjcxLCJleHAiOjE4MTI3MjMyNzF9.n6nm3GvaTwzkote0d380aQBjCr-QsaDzg67mY6kqXbc)

---


---

### 7.9 Navigation et ergonomie · التصفح وسلاسة الاستخدام

#### Français

**Menu latéral (sidebar) :**
- Tableau de bord, Clients, Dossiers  
- Héritage, Wasiyyah, Partage immobilier  
- Mariage, Vente, Donation, Procuration (calculateurs d'actes)  
- Assistant IA et OCR (marqués « Bientôt »)  
- Section Super Admin (si applicable)  
- Profil utilisateur, photo, déconnexion  

**En-tête :**
- Menu mobile (hamburger)  
- Lien accueil public  
- Sélecteur de langue FR / AR  

#### العربية

**القائمة الجانبية:** لوحة التحكم، العملاء، الملفات، الميراث، الوصية، تقسيم العقار، الزواج، البيع، الهبة، الوكالة، المساعد الذكي وOCR (قريباً)، إدارة المشرف، الملف الشخصي والخروج.

**الرأس:** قائمة الجوال، رابط الرئيسية، مبدّل اللغة.

---

![Menu latéral — القائمة الجانبية](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/sidebar.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL3NpZGViYXIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NzMxMSwiZXhwIjoxODEyNzIzMzExfQ.DACZe3ZUFxYZtoOLlWXjfEqzvVGQ5t_rNcMJtkFZn7U)


---

### 7.10 Administration (Super Admin) · الإدارة

#### Français

Espace réservé au **super administrateur** de la plateforme :

| Section | Rôle |
|---------|------|
| Vue d'ensemble | Statistiques globales |
| Adouls | Gestion des professionnels inscrits |
| Cabinets | Gestion des cabinets / structures |
| Utilisateurs | Comptes et rôles |
| Activité | Journal des actions sur la plateforme |

#### العربية

فضاء **المشرف العام**: نظرة شاملة، العدول، المكاتب، المستخدمون، سجل النشاط.

---

![Administration Super Admin — إدارة المشرف العام](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/super-1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL3N1cGVyLTEucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NzM1MSwiZXhwIjoxODEyNzIzMzUxfQ.03RY74JSt-tB8MdhvrQibiT5iULvfNNYhfQcz4XDdTs)

---

![Administration Super Admin — إدارة المشرف العام](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/super-2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL3N1cGVyLTIucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NzM1NywiZXhwIjoxODEyNzIzMzU3fQ.mNZtvhg7bIr9EWGvz2aw-3II5RpkFiftkYuLj0TdYp0)

---

![Administration Super Admin — إدارة المشرف العام](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/super-3.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL3N1cGVyLTMucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MTE4NzM2NCwiZXhwIjoxODEyNzIzMzY0fQ.C3aOiOfLaroaWvEpmApyKlKvcRjIZPtWuhJTz8vfg6A)

---

## 8. Rôles et responsabilités

### Français

| Rôle | Accès | Responsabilités |
|------|-------|-----------------|
| **Super Admin** | Toute la plateforme | Création cabinets, supervision globale |
| **Propriétaire cabinet** | Son cabinet | Gestion équipe, dossiers, paramètres |
| **Adoul** | Cabinet assigné | Dossiers, calculs, rapports, clients |
| **Assistant** | Cabinet assigné (limité) | Saisie, consultation selon permissions |

Chaque utilisateur ne voit que les données de **son cabinet** (isolation multi-tenant).

### العربية

| الدور | الوصول | المسؤوليات |
|-------|--------|------------|
| **المشرف العام** | المنصة كاملة | إنشاء المكاتب، الإشراف الشامل |
| **مالك المكتب** | مكتبه | إدارة الفريق والملفات |
| **العدل** | المكتب المعين | الملفات والحسابات والتقارير |
| **المساعد** | المكتب (محدود) | إدخال واطلاع حسب الصلاحيات |

كل مستخدم يرى فقط بيانات **مكتبه** (عزل متعدد المستأجرين).

---

## 9. Règles métier et référentiel juridique

### Français

Le moteur d'héritage applique les règles suivantes (liste non exhaustive) :

| Règle | Description fonctionnelle |
|-------|---------------------------|
| **Fard (فرض)** | Parts fixes (époux, épouse, père, mère, fille…) |
| **Asaba (عصبة)** | Héritiers résiduaires (fils, père en complément…) |
| **Hajb (حجب)** | Exclusion d'un héritier par un autre plus proche |
| **'Awl (العول)** | Réduction proportionnelle si parts > 100 % |
| **Radd (الرد)** | Redistribution du surplus aux héritiers à part fixe |
| **Ratio 2:1** | Pour le fils et la fille (الذكر مثل حظ الأنثيين) |
| **Germain / consanguin** | Distinction frères/sœurs et oncles/cousins |
| **Neveux** | Fils de frère décédé |
| **الحمل / المفقود** | Statut « en attente » sans part automatique |

**Références affichées dans les rapports d'héritage :**
- Versets coraniques (Sourate An-Nisa)  
- École malikite  
- Moudawana — Livre IV (succession)  

#### Wasiyyah (الوصية)

| Règle | Description fonctionnelle |
|-------|---------------------------|
| **Plafond du tiers** | La wasiyyah ne dépasse pas 1/3 de la tarika nette après dettes |
| **Priorité des dettes** | Dettes et frais funéraires déduits avant calcul du tiers |
| **Interdiction pour l'héritier** | Wasiyyah au profit d'un وارث sans consentement unanime = non valide (art. 330) |
| **Nature** | Numéraire ou bien déterminé (عين معينة) |
| **Non couvert** | الوصية الواجبة (petits-enfants de la fille) — module à venir |

**Références :** Coran (Al-Baqara 2:180-182), Moudawana art. 328-334.

#### Vente immobilière

| Règle | Description fonctionnelle |
|-------|---------------------------|
| **TPI** | 20 % sur la plus-value, avec abattement linéaire (10 %/an dès la 5e année) |
| **Résidence principale** | Exonération si occupation ≥ 6 ans |
| **Enregistrement** | 4 % (habitation/agricole) ou 5 % (commercial/terrain nu) |
| **Conservation** | 1,5 % (ANCFCC) |

**Références :** CGI art. 91-92, ANCFCC.

#### Donation (hiba)

| Règle | Description fonctionnelle |
|-------|---------------------------|
| **Conditions Moudawana** | Acceptation, capacité, réserve héréditaire à vérifier par l'adoul |
| **Enregistrement** | Barème CGI selon lien de parenté (2,5 % à 6 %) |
| **Immobilier** | Conservation foncière en sus |

**Références :** Moudawana Livre III (art. 336-362), CGI.

#### Procuration (wakala)

| Règle | Description fonctionnelle |
|-------|---------------------------|
| **Types** | Générale, spéciale, vente, achat, succession, représentation |
| **Durée** | Alerte si mandat > 5 ans (limites du Code des obligations) |
| **Acte** | Authentification devant adoul (dahir 1-57-223) |

**Références :** Dahir des adouls, Code des obligations et contrats.

#### Mariage (sadaq)

| Règle | Description fonctionnelle |
|-------|---------------------------|
| **Sadaq immédiat** | الحال / المعجل — versé au contrat |
| **Sadaq différé** | المؤجل — dû ultérieurement |
| **Polygamie** | Mariage supplémentaire soumis aux art. 41-47 Moudawana |
| **Minimum** | Le sadaq peut être symbolique (art. 49) |

**Références :** Moudawana Livre II, dahir des adouls.

### العربية

محرك الميراث يطبق: الفرض، العصبة، الحجب، العول، الرد، نسبة 2:1، التمييز بين الشقيق واللأب، أبناء الأخ، الحمل والمفقود. المراجع: القرآن، المذهب المالكي، مدونة الأسرة الكتاب الرابع.

**الوصية:** حد الثلث بعد الديون؛ الوصية للوارث بلا إجماع غير صالحة (م.330)؛ الوصية الواجبة غير مغطاة بعد.

**البيع:** ضريبة 20% مع إعفاء تدريجي؛ إعفاء السكن الرئيسي ≥ 6 سنوات؛ تسجيل 4-5%؛ محافظة عقارية 1,5%.

**الهبة:** شروط مدونة الأسرة الكتاب الثالث؛ رسوم تسجيل 2,5% إلى 6%.

**الوكالة:** أنواع متعددة؛ تنبيه إذا المدة > 5 سنوات؛ ظهير العدول 1-57-223.

**الزواج:** صداق حال ومؤجل؛ زواج إضافي (م.41-47)؛ مدونة الأسرة الكتاب الثاني.

---

## 10. Livrables et exports

### Français

| Livrable | Contenu |
|----------|---------|
| **Rapport PDF héritage** | Défunt, synthèse patrimoine, distribution, détail héritiers, exclus, العول/الرد, preuves juridiques, avertissement |
| **Rapport PDF wasiyyah** | Brut, dettes, base nette, plafond 1/3, montant retenu, légataire, reste pour الفرائض, statut, preuves (Coran, Moudawana) |
| **Rapport PDF partage** | Biens, attribution, soultes |
| **Rapport PDF vente** | Plus-value, abattement TPI, enregistrement, conservation, honoraires, total |
| **Rapport PDF donation** | Valeur, parenté, taux, conservation, honoraires |
| **Rapport PDF procuration** | Type, durée, honoraires, timbre |
| **Rapport PDF mariage** | Sadaq (immédiat, différé, or, mobilier), honoraires, enregistrement |
| **Rapport PDF acte divers** | Montant base, taux, frais, total |
| **Documents dossier** | Fichiers téléversés conservés par dossier |

Les rapports sont **bilingues** (français et arabe) et portent la mention d'avertissement : document indicatif, ne remplace pas l'acte authentique.

### العربية

| المخرجات | المحتوى |
|----------|---------|
| **تقرير PDF للميراث** | الهالك، ملخص التركة، التوزيع، التفصيل، المحجوبون، العول والرد، الأدلة، تنبيه |
| **تقرير PDF للوصية** | الإجمالي، الديون، الأساس، حد الثلث، المبلغ، الموصى له، الباقي، الحالة، الأدلة |
| **تقرير PDF للتقسيم** | العقارات، التخصيص، التسويات |
| **تقرير PDF للبيع** | الربح، الإعفاء الضريبي، التسجيل، المحافظة، الأتعاب |
| **تقرير PDF للهبة** | القيمة، القرابة، النسبة، المحافظة، الأتعاب |
| **تقرير PDF للوكالة** | النوع، المدة، الأتعاب، الطابع |
| **تقرير PDF للزواج** | الصداق (حال، مؤجل، ذهب، أثاث)، الأتعاب، التسجيل |
| **تقرير PDF لعقد آخر** | الأساس، النسبة، الرسوم، المجموع |
| **وثائق الملف** | المرفقات المحفوظة |


---

## 11. Fonctionnalités prévues

### Français

| Module | Description | Statut |
|--------|-------------|--------|
| **Assistant IA** | Questions juridiques, aide à la rédaction, base de connaissances | Bientôt disponible |
| **OCR documents** | Extraction automatique de données depuis PDF/images (CIN, actes…) | Bientôt disponible |
| **الوصية الواجبة** | Legs obligatoire en faveur des petits-enfants de la fille | À venir |
| **المشاركة** | Cas grand-père + frères | À venir |

Ces modules apparaissent dans le menu mais sont **désactivés** en attendant leur mise en production.

### العربية

| الوحدة | الوصف | الحالة |
|--------|--------|--------|
| **المساعد الذكي** | أسئلة قانونية، مساعدة في الصياغة | قريباً |
| **OCR الوثائق** | استخراج تلقائي من PDF/صور | قريباً |
| **الوصية الواجبة** | الوصية الإلزامية لأبناء البنت | قادم |
| **المشاركة** | حالة الجد مع الإخوة | قادم |



---

## 12. Limites et avertissements

### Français

1. **Nature indicative** — Les calculs et rapports sont des outils d'aide à la décision. Seul l'adoul habilité valide l'acte officiel.  
2. **Cas complexes** — Certains cas rares (الوصية الواجبة، المشاركة، abnā' al-bint…) ne sont pas encore couverts automatiquement.  
3. **Barèmes fiscaux** — Les taux TPI, d'enregistrement et honoraires adoul sont **indicatifs** ; les barèmes officiels (CGI, dahir, tarifs ANCFCC) peuvent évoluer.  
4. **Saisie utilisateur** — La qualité du résultat dépend de l'exactitude des données saisies (patrimoine, liens de parenté, années de détention).  
5. **Évolution légale** — Le référentiel suit la Moudawana, le CGI et le malikisme ; toute réforme législative nécessite une mise à jour.  
6. **Données confidentielles** — Les informations clients et successorales sont sensibles ; accès réservé aux utilisateurs autorisés du cabinet.

### العربية

1. **طبيعة إرشادية** — الحسابات والتقارير أدوات مساعدة؛ العدل المرخص وحده يصادق على المحضر.  
2. **حالات معقدة** — بعض الحالات النادرة (الوصية الواجبة، المشاركة…) غير مغطاة آلياً بعد.  
3. **الرسوم الضريبية** — نسب TPI والتسجيل وأتعاب العدول **تقديرية** وقابلة للتغيير.  
4. **إدخال المستخدم** — دقة النتيجة تعتمد على صحة البيانات (التركة، القرابة، سنوات الحيازة).  
5. **تطور التشريع** — المرجع يتبع مدونة الأسرة والمدونة العامة للضرائب والمالكية.  
6. **بيانات حساسة** — معلومات العملاء والتركات سرية؛ الوصول للمخولين فقط.

---

## 13. Budget prévisionnel du projet

### Français

Le tableau ci-dessous présente le **budget global estimé** du projet **Adoul Portail**, exprimé en **dirhams marocains (MAD)**. Il couvre la conception, le développement des modules fonctionnels décrits dans ce document, la mise en production initiale et une provision pour les évolutions prévues (assistant IA, OCR).

> **Budget total du projet : 524 100,00 MAD**  
> *(cinq cent vingt-quatre mille cent dirhams)*

| Poste budgétaire | Description | Montant (MAD) | % |
|------------------|-------------|---------------|---|
| **Analyse et conception** | Cadrage métier, parcours adoul, spécifications fonctionnelles, documentation | 52 410 | 10 % |
| **Cœur métier — Héritage** | Moteur الفرائض, preuves juridiques, العول / الرد / الحجب, rapports PDF | 183 435 | 35 % |
| **Gestion cabinet** | Clients, dossiers, documents, historique des calculs, tableau de bord | 104 820 | 20 % |
| **Calculateurs complémentaires** | Wasiyyah, partage immobilier, actes (vente, donation, mariage, procuration) | 78 615 | 15 % |
| **Interface bilingue (FR / AR)** | Ergonomie, navigation, tableaux, exports, adaptation mobile | 52 410 | 10 % |
| **Tests, déploiement et livraison** | Recette fonctionnelle, mise en ligne, formation initiale | 31 446 | 6 % |
| **Provision — évolutions** | Assistant IA, OCR documents, cas juridiques avancés | 20 964 | 4 % |
| | **TOTAL GÉNÉRAL** | **524 100** | **100 %** |

**Modalités indicatives :**
- Montants **hors taxes** (HT), sauf mention contraire dans le contrat de prestation ;
- Le budget inclut la **version actuelle** de la plateforme et les modules opérationnels listés aux sections 5 à 10 ;
- Les modules marqués « Bientôt » (section 11) sont couverts en partie par la provision évolutions ;
- Toute extension hors périmètre (intégrations tierces, hébergement long terme, maintenance annuelle) fera l'objet d'un avenant séparé.

**Répartition visuelle :**

```
Héritage & preuves juridiques  ████████████████████████████████████  35 %
Gestion cabinet & dossiers       ████████████████████                20 %
Calculateurs actes               ███████████████                     15 %
Interface bilingue               ██████████                          10 %
Analyse & conception             ██████████                          10 %
Tests & livraison                ██████                               6 %
Provision IA / OCR               ████                                 4 %
                                 ─────────────────────────────────────────
                                 TOTAL : 524 100 MAD
```

### العربية

يعرض الجدول أدناه **الميزانية الإجمالية التقديرية** لمشروع **بوابة العدول**، بالدرهم المغربي (MAD). تشمل التصميم، تطوير الوحدات الوظيفية الموصوفة في هذه الوثيقة، الإطلاق الأولي، ومخصصاً للتطورات المخططة (المساعد الذكي، OCR).

> **الميزانية الإجمالية للمشروع: 524.100,00 درهم**  
> *(خمسمائة وأربعة وعشرون ألفاً ومائة درهم)*

| البند | الوصف | المبلغ (درهم) | النسبة |
|-------|--------|---------------|--------|
| **التحليل والتصميم** | الإطار المهني، مسارات العدل، المواصفات الوظيفية، التوثيق | 52 410 | 10 % |
| **اللب المهني — الميراث** | محرك الفرائض، الأدلة الشرعية، العول والرد والحجب، تقارير PDF | 183 435 | 35 % |
| **إدارة المكتب** | العملاء، الملفات، الوثائق، سجل الحسابات، لوحة التحكم | 104 820 | 20 % |
| **حاسبات تكميلية** | الوصية، تقسيم العقار، العقود (بيع، هبة، زواج، وكالة) | 78 615 | 15 % |
| **الواجهة ثنائية اللغة** | سهولة الاستخدام، التصفح، الجداول، التصدير، التكيف مع الجوال | 52 410 | 10 % |
| **الاختبارات والإطلاق والتسليم** | القبول الوظيفي، النشر، التكوين الأولي | 31 446 | 6 % |
| **مخصص — التطورات** | المساعد الذكي، OCR الوثائق، حالات شرعية متقدمة | 20 964 | 4 % |
| | **المجموع العام** | **524 100** | **100 %** |

**ملاحظات:**
- المبالغ **بدون ضريبة** (HT) ما لم ينص العقد على خلاف ذلك؛
- الميزانية تشمل **النسخة الحالية** من المنصة والوحدات العاملة المذكورة في الأقسام 5 إلى 10؛
- الوحدات المعلمة «قريباً» (القسم 11) مغطاة جزئياً بمخصص التطورات؛
- أي توسيع خارج النطاق (تكاملات خارجية، استضافة طويلة الأمد، صيانة سنوية) يخضع لملحق منفصل.

---

![Synthèse budget — ملخص الميزانية](https://prkcjcdbecrtpdpfifcd.supabase.co/storage/v1/object/sign/documentation-pictures/budget_adoul_portail.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lNWYwZDI5MS02M2NjLTQ2MTItYWVhZC04MDU3M2Y2YThiYTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJkb2N1bWVudGF0aW9uLXBpY3R1cmVzL2J1ZGdldF9hZG91bF9wb3J0YWlsLnBuZyIsInNjb3BlIjoiZG93bmxvYWQiLCJpYXQiOjE3ODExODc2MTAsImV4cCI6MTgxMjcyMzYxMH0.xdHQLGU803GQUXgOSieo61XsUpYiFAU-YFX9IoE7esE)


---


*Document rédigé à des fins de description fonctionnelle. Aucune information technique (code, architecture, API) n'est incluse volontairement.*

*وثيقة وصفية وظيفية. لم تُدرج معلومات تقنية (برمجة، بنية، واجهات برمجة) عن قصد.*

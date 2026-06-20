# المرحلة 13: النظام المالي المتكامل — Gateo Financial Ecosystem (GFE)

> تمت إضافة هذا الملف بناءً على ملفات المديول المالي المرفقة:
> `Gateo_Financial_Model.xlsx`، `المديول المالي .odt`، وجداول مصادر الدخل والتوقعات.
> الهدف: تحويل المدفوعات من "ميزة جانبية" إلى **محرك مالي مركزي** يخدم جميع أقسام المنصة وقابل للتوسع المستقل.

---

## 1. الملخص التنفيذي

**Gateo Financial Ecosystem (GFE)** هو النظام المالي المركزي للمنصة. لا يقتصر على دفع اشتراك أو حجز، بل يدير أي حركة قيمة داخل Gateo:

- اشتراكات الأفراد والأنشطة التجارية.
- عمولات المبيعات والحجوزات والخدمات.
- الإعلانات المدفوعة داخل المنصة.
- المحفظة الداخلية والسحوبات.
- النقاط والمكافآت والإحالات.
- الفوترة والضرائب والتقارير المالية.

### الرؤية

> أي عملية مالية داخل Gateo يجب أن تمر عبر GFE، حتى تبقى البيانات متسقة وقابلة للتدقيق والتوسع.

---

## 2. نموذج الإيرادات (Revenue Model)

| مصدر الدخل | الوصف | النسبة / القيمة |
|---|---|---|
| **عمولة المبيعات** | نسبة من كل عملية بيع داخل المتجر أو الحجز | **8% - 15%** حسب الفئة |
| **اشتراكات البائعين** | خطط شهرية للحسابات والأنشطة التجارية | **$0 - $299/شهر** |
| **الإعلانات والقوائم المميزة** | منتجات مروجة، بانرات، منشورات مدفوعة | **$5 - $200** |
| **رسوم المعاملات** | علاوة على معالجة الدفع (Stripe وغيره) | **1.5%** |
| **البيانات و API** | تحليلات متقدمة ووصول للمطورين | **$49 - $499/شهر** |

### التوصية الاستراتيجية للإطلاق

1. ابدأ بنموذج **العمولة فقط (5-8%)** لجذب البائعين في البداية.
2. أضف **الاشتراكات المدفوعة** بعد الوصول إلى **500+ بائع نشط**.
3. ركز على **فئة واحدة ناجحة** (مثل الجمال أو الأزياء) قبل التوسع العام.
4. احتفظ بـ **5% من GMV** كاحتياطي نقدي للمخاطر.

---

## 3. التوقعات المالية لـ 5 سنوات

| المؤشر | السنة 1 | السنة 2 | السنة 3 | السنة 4 | السنة 5 |
|---|---:|---:|---:|---:|---:|
| **GMV سنوي** | $6M | $42M | $240M | $960M | $3B |
| **إجمالي الإيرادات** | $1.77M | $8.19M | $42M | $163.4M | $489.3M |
| **إجمالي التكاليف** | $665K | $1.48M | $4.1M | $11M | $25M |
| **الربح الصافي** | $1.11M | $6.71M | $37.9M | $152.4M | $464.3M |
| **هامش الربح الإجمالي** | 62.5% | 81.9% | 90.2% | 93.3% | 94.9% |
| **البائعون النشطون** | 500 | 2,500 | 12,000 | 45,000 | 120,000 |
| **المستخدمون المسجلون (ألف)** | 50 | 200 | 800 | 2,500 | 6,000 |

### الأهداف الرقمية عند الإطلاق

| المؤشر | القيمة |
|---|---|
| نقطة التعادل الشهرية (Break-Even) | ~**$995K** إيرادات شهرياً |
| عدد الطلبات الشهرية عند التعادل | ~**22,119** طلب |
| عدد البائعين النشطين عند التعادل | ~**2,000** بائع |
| نسبة LTV / CAC | **4.5x** (ممتازة، المستهدف >3x) |
| هامش المساهمة لكل طلب | **$7.02** (83%) |

---

## 4. معمارية النظام المالي (GFE Architecture)

بدلاً من وجود "جدول مدفوعات" واحد، يُبنى GFE على **18 طبقة** منظمة حول محرك مالي مركزي:

### الطبقات الرئيسية

| الطبقة | الوظيفة | الارتباط الحالي / المقترح |
|---|---|---|
| **1. Core Financial Engine** | تسجيل جميع العمليات، الأرصدة، العمولات، الضرائب، التحويلات | خدمة مركزية `src/lib/finance/engine.ts` |
| **2. نظام الحسابات الداخلية** | حساب نقدي، معلق، أرباح، عمولات، مكافآت، إعلانات | جدول `FinancialAccount` |
| **3. المحفظة الذكية** | إيداع، سحب، تحويل، تجميد، استرداد، كشف حساب | خدمة `wallet.service.ts` |
| **4. نظام المحاسبة** | دفتر أستاذ، قيود محاسبية، مراكز تكلفة، ميزانية عمومية | جدول `LedgerEntry` |
| **5. إدارة الاشتراكات** | شهري، سنوي، ربع سنوي، حسب الاستخدام | `SubscriptionPlan` + `BusinessSubscription` موجودان |
| **6. إدارة العمولات** | نسب ثابتة، مبالغ ثابتة، حسب الفئة | جدول `CommissionRule` |
| **7. الفوترة الذكية** | فواتير PDF، QR Code، ضريبة، ختم رقمي | جدول `Invoice` |
| **8. بوابات الدفع** | Visa, MasterCard, Apple Pay, Google Pay, CliQ, eFawateercom, PayPal, Stripe, HyperPay | جدول `PaymentGateway` + محولات (Adapters) |
| **9. نظام الإيرادات** | تصنيف مصادر الدخل | جدول `RevenueCategory` |
| **10. السوق التجاري المركزي** | استيراد منتجات، احتساب عمولات، أرباح | مرتبط بـ `Product` + `MarketplaceListing` |
| **11. الحجوزات والمدفوعات** | دفع مقدم، دفع كامل، إلغاء، استرداد | مرتبط بـ `Booking` |
| **12. التمويل الجماعي** | مشاريع، أبحاث، مبادرات، تبرعات | وحدة مستقبلية |
| **13. الاستثمار** | استثمار في مشاريع وشركات وأفكار | وحدة مستقبلية |
| **14. نظام الولاء** | نقاط، شارات، مستويات عضوية | `PointTransaction` + `Badge` موجودان |
| **15. الذكاء المالي** | تحليل الإنفاق والربحية والإعلانات | خدمة تحليلية مستقبلية |
| **16. مكافحة الاحتيال** | كشف العمليات المشبوهة وغسل الأموال | قواعد + مراجعة يدوية |
| **17. التقارير التنفيذية** | إيرادات، مصروفات، أرباح، نمو المنصة | لوحة تحكم الإدارة |
| **18. البنية المستقبلية** | عملات رقمية، تقسيط، تأمين | أبواب مفتوحة للتوسع |

---

## 5. التعديلات المقترحة على قاعدة البيانات (Prisma)

> **مبدأ محافظ:** لا يتم تعديل الجداول الأساسية (`User`, `Business`, `Profile`). يتم إضافة جداول جانبية جديدة فقط.

### 5.1 الحسابات المالية الداخلية

```prisma
model FinancialAccount {
  id          String            @id @default(cuid())
  userId      String
  type        FinancialAccountType // CASH | HOLD | EARNINGS | COMMISSION | REWARDS | ADS_CREDIT
  currency    String            @default("USD")
  balance     Decimal           @default(0) @db.Decimal(12, 2)
  isActive    Boolean           @default(true)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions FinancialTransaction[]

  @@unique([userId, type, currency])
  @@map("financial_accounts")
}

enum FinancialAccountType {
  CASH
  HOLD
  EARNINGS
  COMMISSION
  REWARDS
  ADS_CREDIT
}
```

### 5.2 الحركات المالية والقيود المحاسبية

```prisma
model FinancialTransaction {
  id                String                  @id @default(cuid())
  accountId         String
  type              TransactionType         // DEPOSIT | WITHDRAWAL | TRANSFER | HOLD | RELEASE | REFUND | COMMISSION | FEE | REWARD
  amount            Decimal                 @db.Decimal(12, 2)
  currency          String                  @default("USD")
  status            TransactionStatus       @default(PENDING) // PENDING | COMPLETED | FAILED | REVERSED
  referenceType     String?                 // INVOICE | BOOKING | AD | SUBSCRIPTION | WITHDRAWAL
  referenceId       String?
  description       String?
  metadata          Json?
  createdAt         DateTime                @default(now())

  account     FinancialAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  ledgerEntries LedgerEntry[]

  @@index([accountId, createdAt])
  @@index([referenceType, referenceId])
  @@map("financial_transactions")
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  TRANSFER
  HOLD
  RELEASE
  REFUND
  COMMISSION
  FEE
  REWARD
}

enum TransactionStatus {
  PENDING
  COMPLETED
  FAILED
  REVERSED
}

model LedgerEntry {
  id              String   @id @default(cuid())
  transactionId   String
  accountId       String
  debit           Decimal  @db.Decimal(12, 2)
  credit          Decimal  @db.Decimal(12, 2)
  entryType       String   // ASSET | LIABILITY | REVENUE | EXPENSE | EQUITY
  costCenter      String?  // subscription | ads | marketplace | booking
  createdAt       DateTime @default(now())

  transaction FinancialTransaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  @@index([accountId, createdAt])
  @@map("ledger_entries")
}
```

### 5.3 الفواتير والمدفوعات

```prisma
model Invoice {
  id            String        @id @default(cuid())
  userId        String
  invoiceNumber String        @unique
  type          InvoiceType   // SUBSCRIPTION | AD | MARKETPLACE | BOOKING | SERVICE | FEE
  subtotal      Decimal       @db.Decimal(12, 2)
  taxAmount     Decimal       @default(0) @db.Decimal(12, 2)
  discount      Decimal       @default(0) @db.Decimal(12, 2)
  total         Decimal       @db.Decimal(12, 2)
  currency      String        @default("USD")
  status        InvoiceStatus @default(DRAFT) // DRAFT | ISSUED | PAID | OVERDUE | CANCELLED | REFUNDED
  dueDate       DateTime?
  paidAt        DateTime?
  pdfUrl        String?
  metadata      Json?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  user         User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  lineItems    InvoiceLineItem[]
  payments     Payment[]

  @@index([userId, status])
  @@map("invoices")
}

model InvoiceLineItem {
  id          String  @id @default(cuid())
  invoiceId   String
  description String
  quantity    Int     @default(1)
  unitPrice   Decimal @db.Decimal(12, 2)
  total       Decimal @db.Decimal(12, 2)

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@map("invoice_line_items")
}

model Payment {
  id            String        @id @default(cuid())
  invoiceId     String?
  userId        String
  gatewayId     String
  amount        Decimal       @db.Decimal(12, 2)
  currency      String        @default("USD")
  status        PaymentStatus @default(PENDING) // موجود حالياً
  gatewayRef    String?       // رقم العملية عند بوابة الدفع
  failureReason String?
  paidAt        DateTime?
  metadata      Json?
  createdAt     DateTime      @default(now())

  invoice   Invoice?       @relation(fields: [invoiceId], references: [id], onDelete: SetNull)
  gateway   PaymentGateway @relation(fields: [gatewayId], references: [id])

  @@index([userId, status])
  @@map("payments")
}

model PaymentGateway {
  id          String  @id @default(cuid())
  code        String  @unique // stripe | hyperpay | paypal | cliq | fawateer
  name        String
  nameAr      String?
  isActive    Boolean @default(false)
  config      Json?   // مفاتيح API وإعدادات البيئة
  countries   String? // قائمة الدول المدعومة
  currencies  String? // قائمة العملات
  sortOrder   Int     @default(0)
  createdAt   DateTime @default(now())

  payments Payment[]

  @@map("payment_gateways")
}
```

### 5.4 العمولات والكوبونات والإحالات

```prisma
model CommissionRule {
  id              String   @id @default(cuid())
  name            String
  appliesTo       String   // marketplace | bookings | services | ads | all
  categoryId      String?
  subcategoryId   String?
  type            CommissionType // PERCENTAGE | FIXED | TIERED
  value           Decimal  @db.Decimal(10, 4)
  minAmount       Decimal? @db.Decimal(12, 2)
  maxAmount       Decimal? @db.Decimal(12, 2)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())

  @@map("commission_rules")
}

enum CommissionType {
  PERCENTAGE
  FIXED
  TIERED
}

model Coupon {
  id            String    @id @default(cuid())
  code          String    @unique
  type          CouponType // PERCENTAGE | FIXED | FREE_SHIPPING | FREE_ADS
  value         Decimal?  @db.Decimal(12, 2)
  maxUses       Int?
  usedCount     Int       @default(0)
  minOrderAmount Decimal? @db.Decimal(12, 2)
  validFrom     DateTime  @default(now())
  validUntil    DateTime?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())

  usages CouponUsage[]

  @@map("coupons")
}

model CouponUsage {
  id        String   @id @default(cuid())
  couponId  String
  userId    String
  orderId   String?
  createdAt DateTime @default(now())

  coupon Coupon @relation(fields: [couponId], references: [id], onDelete: Cascade)

  @@unique([couponId, userId])
  @@map("coupon_usages")
}

model Referral {
  id              String   @id @default(cuid())
  referrerId      String
  referredId      String   @unique
  status          ReferralStatus @default(PENDING) // PENDING | COMPLETED | REWARDED
  rewardType      String?  // POINTS | CREDIT | DISCOUNT
  rewardAmount    Decimal? @db.Decimal(12, 2)
  rewardedAt      DateTime?
  createdAt       DateTime @default(now())

  @@unique([referrerId, referredId])
  @@map("referrals")
}

enum ReferralStatus {
  PENDING
  COMPLETED
  REWARDED
}
```

### 5.5 السحوبات والضرائب

```prisma
model Withdrawal {
  id            String            @id @default(cuid())
  userId        String
  amount        Decimal           @db.Decimal(12, 2)
  currency      String            @default("USD")
  method        WithdrawalMethod  // BANK | CLIQ | PAYPAL
  methodDetails   Json?           // IBAN / alias / account
  status        WithdrawalStatus  @default(PENDING) // PENDING | APPROVED | REJECTED | SENT
  reviewedBy    String?
  reviewedAt    DateTime?
  notes         String?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([userId, status])
  @@map("withdrawals")
}

enum WithdrawalMethod {
  BANK
  CLIQ
  PAYPAL
}

enum WithdrawalStatus {
  PENDING
  APPROVED
  REJECTED
  SENT
}

model TaxRate {
  id          String   @id @default(cuid())
  countryCode String
  name        String
  rate        Decimal  @db.Decimal(5, 2) // نسبة مئوية
  type        TaxType  // VAT | SALES | LOCAL
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  @@unique([countryCode, type])
  @@map("tax_rates")
}

enum TaxType {
  VAT
  SALES
  LOCAL
}
```

### 5.6 الوحدات المستقبلية ( placeholders )

```prisma
// CrowdfundingCampaign، InvestmentOpportunity، InstallmentPlan، InsuranceProduct
// تُضاف لاحقاً كوحدات منفصلة دون تعديل الجداول الأساسية.
```

---

## 6. خطة التنفيذ التطويرية

### المرحلة 1: الإطلاق (Launch — الأساسيات المطلوبة فوراً)

**المدة المقترحة:** 3 - 4 أسابيع بعد اكتمال Milestone 6.
**الهدف:** تمكين المنصة من تحصيل الإيرادات من اليوم الأول.

| الأولوية | المهمة | الوصف | التأثير على البنية |
|---|---|---|---|
| 🔴 عالية | ربط بوابة دفع رئيسية | Stripe أو HyperPay للدفع بالبطاقة | إضافة `PaymentGateway` + Adapter |
| 🔴 عالية | إدارة خطط الاشتراكات | إنشاء/تعديل خطط الأعمال من لوحة الإدارة | إعادة استخدام `SubscriptionPlan` |
| 🔴 عالية | شراء الاشتراك | دفع اشتراك نشاط تجاري وتحديث حالته | `BusinessSubscription` + `Invoice` |
| 🔴 عالية | فواتير تلقائية | إنشاء فاتورة لكل عملية دفع | جدول `Invoice` + PDF |
| 🟡 متوسطة | إعلانات مدفوعة | شراء حملة إعلانية داخل المنصة | ربط بجدول `Ad` الموجود |
| 🟡 متوسطة | تقارير إيرادات أساسية | إيرادات يومية/شهرية حسب المصدر | لوحة تحكم الإدارة |
| 🟢 منخفضة | ضريبة القيمة المضافة | احتساب تلقائي حسب الدولة | جدول `TaxRate` |

### المرحلة 2: النمو (Growth — المحفظة والولاء)

**المدة المقترحة:** 4 - 6 أسابيع.
**الهدف:** زيادة الاحتفاظ والتفاعل عبر المحفظة والنقاط.

| الأولوية | المهمة | الوصف |
|---|---|---|
| 🔴 عالية | المحفظة الإلكترونية | إيداع وسحب وتحويل داخلي |
| 🔴 عالية | الحسابات الداخلية | فصل الرصيد النقدي والمعلق والأرباح |
| 🟡 متوسطة | نظام النقاط القابل للإنفاق | استبدال النقاط باشتراكات وإعلانات |
| 🟡 متوسطة | نظام الإحالات | مكافأة المستخدم عند دعوة صديق |
| 🟡 متوسطة | الكوبونات والخصومات | أكواد تسويقية ومكافآت |
| 🟡 متوسطة | سحوبات أصحاب الأنشطة | طلب سحب الأرباح مع مراجعة إدارية |
| 🟢 منخفضة | كشف حساب كامل | سجل الحركات مع فلاتر وتصدير |

### المرحلة 3: التوسع (Scale — العمولات والسوق)

**المدة المقترحة:** 6 - 8 أسابيع.
**الهدف:** تحويل المنصة إلى سوق حقيقي يدير المدفوعات بين المستخدمين.

| الأولوية | المهمة | الوصف |
|---|---|---|
| 🔴 عالية | محرك العمولات | قواعد عمولة حسب الفئة والقسم |
| 🔴 عالية | مدفوعات الحجوزات | دفع مقدم/كامل عند الحجز مع إمكانية الاسترداد |
| 🟡 متوسطة | مدفوعات المتجر المركزي | احتساب عمولة وتحويل الأرباح تلقائياً |
| 🟡 متوسطة | التعامل مع متعدد العملات | USD + العملات المحلية |
| 🟡 متوسطة | مكافحة الاحتيال | قواعد كشف عمليات مشبوهة |
| 🟢 منخفضة | الذكاء المالي | توصيات ربحية لأصحاب الأنشطة |

### المرحلة 4: المستقبل (Future — التمويل والاستثمار)

**المدة المقترحة:** بعد السنة الأولى.
**الهدف:** إضافة خدمات مالية متقدمة.

| الأولوية | المهمة |
|---|---|
| 🟢 منخفضة | التمويل الجماعي للمشاريع والأبحاث |
| 🟢 منخفضة | الاستثمار في الشركات والأفكار |
| 🟢 منخفضة | خدمات التقسيط |
| 🟢 منخفضة | التأمين الإلكتروني |
| 🟢 منخفضة | دعم العملات الرقمية القانونية |

---

## 7. الـ APIs والشاشات المطلوبة

### 7.1 APIs

| المسار | الوظيفة |
|---|---|
| `POST /api/payments/intent` | إنشاء نية دفع |
| `POST /api/payments/webhook/:gateway` | استقبال webhook من بوابة الدفع |
| `GET /api/invoices` | قائمة فواتير المستخدم |
| `GET /api/invoices/:id/pdf` | تحميل فاتورة PDF |
| `GET /api/finance/accounts` | حسابات المستخدم المالية |
| `GET /api/finance/transactions` | سجل الحركات |
| `POST /api/finance/wallet/deposit` | إيداع في المحفظة |
| `POST /api/finance/wallet/withdraw` | طلب سحب |
| `POST /api/subscriptions/business` | شراء/تجديد اشتراك نشاط تجاري |
| `GET /api/admin/finance/revenue` | تقارير الإيرادات |
| `GET /api/admin/finance/withdrawals` | مراجعة طلبات السحب |
| `POST /api/admin/finance/withdrawals/:id/approve` | اعتماد سحب |
| `POST /api/coupons/validate` | التحقق من كوبون |
| `POST /api/referrals/claim` | المطالبة بمكافأة إحالة |

### 7.2 صفحات الواجهة الأمامية

| المسار | الوصف |
|---|---|
| `/finance/wallet` | صفحة المحفظة والرصيد |
| `/finance/transactions` | سجل الحركات |
| `/finance/invoices` | الفواتير |
| `/business-dashboard/subscription` | إدارة اشتراك النشاط التجاري |
| `/business-dashboard/withdrawals` | طلبات سحب الأرباح |
| `/admin-dashboard/finance` | لوحة التحكم المالية |
| `/admin-dashboard/finance/withdrawals` | مراجعة السحوبات |
| `/admin-dashboard/finance/gateways` | إعدادات بوابات الدفع |
| `/admin-dashboard/finance/commission-rules` | قواعد العمولة |
| `/admin-dashboard/finance/coupons` | إدارة الكوبونات |

---

## 8. لوحة التحكم المالية للإدارة

### المؤشرات الرئيسية (KPIs)

| المؤشر | المصدر |
|---|---|
| إجمالي الإيرادات اليومية/الشهرية/السنوية | `Invoice` + `Payment` |
| GMV | مجموع قيمة الطلبات والحجوزات |
| العمولات المحصلة | `LedgerEntry` من نوع REVENUE |
| عدد الاشتراكات النشطة | `BusinessSubscription` |
| متوسط قيمة الطلب | GMV ÷ عدد الطلبات |
| نسبة LTV/CAC | حساب من بيانات المستخدمين |
| أفضل القطاعات أداءً | تجميع حسب `Category` |
| أعلى الأنشطة مبيعاً | تجميع حسب `Business` |
| حالة السحوبات | `Withdrawal` |
| رصيد المحفظة الكلي | `FinancialAccount` |

### التقارير المطلوبة

1. تقرير الربح والخسارة (P&L).
2. تقرير التدفقات النقدية (Cash Flow).
3. تقرير الميزانية العمومية (Balance Sheet).
4. تقرير مصادر الدخل حسب النوع.
5. تقرير العمولات حسب الفئة.
6. تقرير حركات المحفظة.
7. تصدير CSV/PDF لكل تقرير.

---

## 9. الأمان والامتثال

### إجراءات الأمان

| الإجراء | الوصف |
|---|---|
| **TLS/SSL** | جميع مدفوعات HTTPS |
| **PCI DSS** | عدم تخزين بيانات البطاقة؛ استخدام tokenization من بوابة الدفع |
| **Webhook Verification** | التحقق من توقيع كل webhook |
| **Idempotency** | منع الدفع المكرر عبر مفتاح idempotency |
| **Audit Trail** | تسجيل كل عملية مالية في `LedgerEntry` |
| **Fraud Rules** | كشف عمليات غير طبيعية (مبالغ كبيرة، تكرار، دول غريبة) |
| **Manual Review** | مراجعة السحوبات والمبالغ المعلقة قبل الإصدار |

### الامتثال الضريبي

- دعم ضريبة القيمة المضافة حسب الدولة.
- دعم الإعفاءات الضريبية.
- أرشفة الفواتير إلكترونياً.
- إمكانية تصدير بيانات ضريبية دورية.

---

## 10. المخاطر وكيفية إدارتها

| المخاطر | التأثير | الحل |
|---|---|---|
| فشل بوابة دفع | 🔴 عالي | توفير بوابتين على الأقل + رسائل خطأ واضحة |
| استرداد مبالغ كبيرة | 🔴 عالي | تجميد الأموال لمدة قصيرة قبل التحويل |
| غسل الأموال | 🔴 عالي | حدود سحب، مراجعة يدوية، KYC للبائعين |
| تأخر التحصيل من البوابات | 🟡 متوسط | تتبع حالة كل دفع عبر webhook |
| تغيرات ضريبية | 🟡 متوسط | جدول `TaxRate` ديناميكي حسب الدولة |
| تعقيد المحاسبة | 🟡 متوسط | توليد قيود محاسبية تلقائية لكل عملية |

---

## 11. معايير القبول (Acceptance Criteria)

- [ ] يمكن للمستخدم دفع اشتراك نشاط تجاري عبر بوابة دفع.
- [ ] يتم إنشاء فاتورة تلقائية لكل عملية دفع.
- [ ] تظهر الإيرادات في لوحة تحكم الإدارة حسب المصدر.
- [ ] يدعم النظام عمولة على الأقل قسم واحد (مثل الحجوزات).
- [ ] يمكن لصاحب النشاط طلب سحب أرباح ومراجعته من الإدارة.
- [ ] النظام يحسب الضريبة تلقائياً حسب دولة المستخدم.
- [ ] جميع العمليات المالية مسجلة في سجل قابل للتدقيق.
- [ ] `npm run build` يمر بنجاح بعد كل تغيير.

---

## 12. الخلاصة

بناء **Gateo Financial Ecosystem** يضمن:

- إدارة مالية مركزية لكل أقسام المنصة.
- نموذج إيرادات متنوع (عمولات، اشتراكات، إعلانات، رسوم معاملات، بيانات).
- قابلية التوسع المستقبلي دون إعادة بناء النظام.
- شفافية مالية عالية عبر الفوترة والقيود المحاسبية.
- دعم قرارات الإدارة بالأرقام والتقارير التنفيذية.

> **الخطوة التالية:** تنفيذ **المرحلة الأولى (Launch)** فور اكتمال Milestone 6، مع البدء بربط بوابة الدفع وإنشاء الفواتير.

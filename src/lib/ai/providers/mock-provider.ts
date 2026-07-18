import {
  AiProvider,
  AiMessage,
  AiCompletionResult,
  AiVisionMessage,
  AiImageGenerationResult,
} from "@/lib/ai/types";

/**
 * Mock AI provider for development/testing without API keys.
 * Returns deterministic fallback content.
 */
export class MockProvider implements AiProvider {
  readonly name = "openai" as const;

  async completeText({
    messages,
  }: {
    messages: AiMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }): Promise<AiCompletionResult> {
    const userMessage = messages.find((m) => m.role === "user")?.content || "";
    const systemMessage = messages.find((m) => m.role === "system")?.content || "";
    const businessNameMatch = userMessage.match(/"([^"]+)"/);
    const businessName = businessNameMatch?.[1] || "نشاطي التجاري";

    // Business analysis request
    if (systemMessage.includes("خبير في بناء المواقع") || userMessage.includes("حلل نشاط")) {
      const mockAnalysis = JSON.stringify({
        businessType: "شركة خدمات احترافية",
        websiteType: "INTRO",
        pageCount: 7,
        designStyle: "احترافي عصري",
        suggestedPages: [
          { slug: "home", title: "الرئيسية", reason: "واجهة الموقع الرئيسية تعرض الهوية والخدمات" },
          { slug: "about", title: "من نحن", reason: "يعرض قصة النشاط وقيمه" },
          { slug: "services", title: "خدماتنا", reason: "يستعرض الخدمات المقدمة للعملاء" },
          { slug: "portfolio", title: "أعمالنا", reason: "يعرض نماذج من الأعمال السابقة" },
          { slug: "team", title: "فريق العمل", reason: "يعرف بالفريق والخبرات" },
          { slug: "faq", title: "الأسئلة الشائعة", reason: "يجيب على استفسارات العملاء" },
          { slug: "contact", title: "تواصل معنا", reason: "يوفر وسائل التواصل مع النشاط" },
        ],
        homeSections: [
          { id: "hero", title: "قسم الترحيب الرئيسي", reason: "يجذب الانتباه ويقدم العرض" },
          { id: "about", title: "نبذة عنا", reason: "يختصر قصة النشاط" },
          { id: "services", title: "خدماتنا", reason: "يعرض أهم الخدمات" },
          { id: "features", title: "لماذا نحن", reason: "يبرز المميزات التنافسية" },
          { id: "testimonials", title: "آراء العملاء", reason: "يبني الثقة" },
          { id: "cta", title: "دعوة للتواصل", reason: "يشجع على اتخاذ إجراء" },
        ],
        colors: {
          primaryColor: "#7c3aed",
          secondaryColor: "#ec4899",
          accentColor: "#f59e0b",
          backgroundColor: "#ffffff",
          surfaceColor: "#f8fafc",
          textColor: "#1e293b",
          reasoning: "ألوان متناسقة تعكس الاحترافية والحداثة",
        },
        fontFamily: "Cairo",
        imageStyle: "صور احترافية نظيفة بألوان متناسقة مع الهوية",
        suggestedServices: [
          { name: "الخدمة الأساسية", description: "خدمة شاملة ومتميزة", price: 200 },
          { name: "خدمة مميزة", description: "خدمة متقدمة بمعايير عالية", price: 350 },
          { name: "استشارة احترافية", description: "استشارة مع أحد خبرائنا", price: 150 },
        ],
        suggestedProducts: [],
        features: [
          { title: "جودة عالية", description: "نلتزم بأعلى معايير الجودة في كل خدمة" },
          { title: "فريق محترف", description: "نخبة من الخبراء والمتخصصين" },
          { title: "دعم ممتاز", description: "نسعى دائمًا لتحقيق رضا العملاء" },
        ],
        seoKeywords: ["خدمات", "جودة", "احترافية", businessName],
        tagline: "جودة تليق بك",
        aboutSummary: `${businessName} وجهة موثوقة تقدم خدمات متميزة بأعلى معايير الجودة.`,
        reasoning: "تم اختيار تصميم احترافي عصري يناسب طبيعة النشاط وجمهوره المستهدف.",
      });

      return {
        content: mockAnalysis,
        model: "mock-gpt-4o-mini",
        usage: { promptTokens: 100, completionTokens: 500, totalTokens: 600 },
      };
    }

    // Site generation request
    const mockOutput = JSON.stringify({
      business: {
        name: businessName,
        description: `${businessName} وجهة موثوقة تقدم خدمات متميزة بأعلى معايير الجودة. نسعى دائمًا لتقديم تجربة فريدة لعملائنا من خلال فريق محترف وخدمات متكاملة.`,
        tagline: "جودة تليق بك",
        aboutSummary: `${businessName} وجهة موثوقة تقدم خدمات متميزة بأعلى معايير الجودة والاحترافية، مع فريق محترف يعمل على تحقيق أعلى مستويات الرضا للعملاء.`,
        vision: `أن نكون الخيار الأول في ${businessName} لتقديم الخدمات المتميزة في المنطقة.`,
        mission: `تقديم حلول مبتكرة وعالية الجودة تعزز نجاح عملائنا وتجاوز توقعاتهم.`,
        values: ["الجودة", "الاحترافية", "الشفافية", "الابتكار", "رضا العميل"],
        city: "الرياض",
        phone: "0500000000",
        email: "info@example.com",
      },
      theme: {
        homeTemplate: "default",
        primaryColor: "#7c3aed",
        secondaryColor: "#ec4899",
        accentColor: "#f59e0b",
        backgroundColor: "#ffffff",
        surfaceColor: "#ffffff",
        textColor: "#1a1a2e",
        fontFamily: "Cairo",
        borderRadius: "1rem",
        buttonStyle: "gradient",
        heroLayout: "center",
        navbarStyle: "fixed",
      },
      pages: [
        {
          slug: "home",
          title: "الرئيسية",
          template: "HOME",
          content: `مرحبًا بك في ${businessName}. نقدم لك أفضل الخدمات بجودة عالية.`,
        },
        {
          slug: "about",
          title: "من نحن",
          template: "ABOUT",
          content: `${businessName} تأسست بهدف تقديم خدمات متميزة تلبي احتياجات عملائنا. فريقنا من الخبراء جاهز دائمًا لخدمتك.`,
        },
        {
          slug: "services",
          title: "خدماتنا",
          template: "CUSTOM",
          content: "نقدم مجموعة متنوعة من الخدمات المصممة خصيصًا لتلبية احتياجاتك.",
        },
        {
          slug: "portfolio",
          title: "أعمالنا",
          template: "CUSTOM",
          content: "نماذج من أعمالنا السابقة التي تعكس جودة خدماتنا.",
        },
        {
          slug: "team",
          title: "فريق العمل",
          template: "CUSTOM",
          content: "تعرف على فريقنا المحترف من الخبراء والمتخصصين.",
        },
        {
          slug: "blog",
          title: "المدونة",
          template: "CUSTOM",
          content: "أحدث الأخبار والمقالات المتعلقة بمجال عملنا.",
        },
        {
          slug: "faq",
          title: "الأسئلة الشائعة",
          template: "FAQ",
          content: "إليك الإجابات على الأسئلة الأكثر شيوعًا.",
        },
        {
          slug: "contact",
          title: "تواصل معنا",
          template: "CONTACT",
          content: "يسعدنا تواصلك معنا في أي وقت.",
        },
        {
          slug: "privacy",
          title: "سياسة الخصوصية",
          template: "PRIVACY",
          content: "نحن نحترم خصوصيتك ونحمي بياناتك الشخصية.",
        },
        {
          slug: "terms",
          title: "الشروط والأحكام",
          template: "TERMS",
          content: "يرجى قراءة الشروط والأحكام قبل استخدام خدماتنا.",
        },
      ],
      services: [
        { name: "الخدمة الأساسية", description: "خدمة شاملة ومتميزة", price: 200, duration: "60 دقيقة" },
        { name: "خدمة مميزة", description: "خدمة متقدمة بمعايير عالية", price: 350, duration: "90 دقيقة" },
        { name: "استشارة احترافية", description: "استشارة مع أحد خبرائنا", price: 150, duration: "30 دقيقة" },
      ],
      products: [],
      team: [
        { name: "أحمد محمد", role: "المدير التنفيذي", bio: "خبرة واسعة في إدارة المشاريع وتطوير الأعمال." },
        { name: "سارة علي", role: "مدير التسويق", bio: "متخصصة في استراتيجيات التسويق الرقمي وبناء الهوية." },
        { name: "خالد عبدالله", role: "مستشار", bio: "يقدم استشارات احترافية تساعد العملاء على تحقيق أهدافهم." },
      ],
      testimonials: [
        { name: "محمد سالم", role: "عميل", content: "خدمة ممتازة وفريق محترف، أنصح بالتعامل معهم.", rating: 5 },
        { name: "نورة أحمد", role: "عميلة", content: "تجربة رائعة وجودة عالية في كل التفاصيل.", rating: 5 },
      ],
      faq: [
        { question: "ما هي ساعات العمل؟", answer: "نعمل من الأحد إلى الخميس من 9 صباحًا حتى 6 مساءً." },
        { question: "هل تقدمون خدمات طوارئ؟", answer: "نعم، لدينا فريق متخصص للحالات العاجلة." },
        { question: "كيف يمكنني الحجز؟", answer: "يمكنك الحجز عبر الموقع أو الاتصال بنا مباشرة." },
      ],
      stats: [
        { value: "+500", label: "عميل سعيد" },
        { value: "10+", label: "سنوات خبرة" },
        { value: "50+", label: "مشروع منجز" },
      ],
      features: [
        { title: "جودة عالية", description: "نلتزم بأعلى معايير الجودة في كل خدمة." },
        { title: "فريق محترف", description: "نخبة من الخبراء والمتخصصين في المجال." },
        { title: "دعم ممتاز", description: "نسعى دائمًا لتحقيق رضا العملاء." },
      ],
      seo: {
        title: `${businessName} | خدمات متميزة`,
        description: `تعرف على ${businessName} واكتشف خدماتنا المتميزة المصممة خصيصًا لك.`,
      },
      imageRoles: ["hero-main", "about-main", "service", "team"],
    });

    return {
      content: mockOutput,
      model: "mock-gpt-4o-mini",
      usage: { promptTokens: 100, completionTokens: 500, totalTokens: 600 },
    };
  }

  async completeVision({
    messages,
  }: {
    messages: AiVisionMessage[];
    model?: string;
    maxTokens?: number;
  }): Promise<AiCompletionResult> {
    return {
      content: JSON.stringify({
        qualityScore: 0.8,
        relevanceScore: 0.75,
        brandMatchScore: 0.7,
        hasWatermark: false,
        suggestedAltText: "صورة نشاط تجاري",
        suggestedRole: "other",
        description: "صورة مناسبة للموقع",
      }),
      model: "mock-gpt-4o-vision",
      usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
    };
  }

  async generateImage({
    prompt,
    size,
  }: {
    prompt: string;
    model?: string;
    size?: string;
    quality?: any;
  }): Promise<AiImageGenerationResult> {
    // Use an inline SVG data URI so tests don't depend on external image hosts.
    const [width, height] = parseSize(size);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <rect width="100%" height="100%" fill="#e2e8f0"/>
        <text x="50%" y="50%" font-size="${Math.max(24, Math.round(width / 40))}" 
              text-anchor="middle" dominant-baseline="middle" fill="#64748b">
          AI Generated Image
        </text>
      </svg>
    `.trim();
    const base64 = Buffer.from(svg).toString("base64");
    return {
      url: `data:image/svg+xml;base64,${base64}`,
      revisedPrompt: prompt,
    };
  }
}

function parseSize(size?: string): [number, number] {
  if (typeof size !== "string") return [1024, 1024];
  const [w, h] = size.toLowerCase().split("x").map(Number);
  if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
    return [w, h];
  }
  return [1024, 1024];
}

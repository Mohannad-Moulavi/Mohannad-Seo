import type { ProductData, ImageFile } from '../types';

// ArvanCloud AI Gateway version (OpenAI-compatible).
// Keep the real gateway URL only in Vercel Environment Variables, not in source code.
const Type = { OBJECT: 'object', ARRAY: 'array', STRING: 'string' } as const;

// This is a Vercel Serverless Function. It will not be bundled with the client-side code.
// To use it with Vercel, you need to configure your project to handle TypeScript files in the /api directory.
// For the purpose of this environment, we assume Vercel's build process handles this correctly.
// We must redeclare the types that would be imported in a real project with a build system.
interface VercelRequest {
  method?: string;
  body: {
    productName: string;
    productImage: ImageFile | null;
    briefDescription: string;
    isNutsOrDriedFruit: boolean;
  };
}

interface VercelResponse {
  setHeader: (name: string, value: string | string[]) => void;
  status: (code: number) => VercelResponse;
  json: (body: any) => void;
  end: (body?: string) => void;
}


const advancedSeoAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        keyphraseSynonyms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "آرایه‌ای از حداقل ۳ عبارت کلیدی مترادف یا مرتبط."
        },
        lsiKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "آرایه‌ای از کلیدواژه‌های معنایی مرتبط (LSI)."
        },
        longTailKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "آرایه‌ای از ۲ تا ۳ عبارت کلیدی دم‌بلند و دقیق‌تر."
        },
        semanticEntities: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "موجودیت‌های معنایی کلیدی مانند برند، دسته‌بندی محصول، و ویژگی‌های اصلی."
        },
        searchIntent: {
            type: Type.STRING,
            description: "هدف جستجوی کاربر (مثلاً: خرید، مقایسه، اطلاعاتی)."
        },
        internalLinkingSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "کلمات یا عبارات پیشنهادی برای لینک‌دهی داخلی به صفحات مرتبط."
        }
    },
    required: ["keyphraseSynonyms", "lsiKeywords", "longTailKeywords", "semanticEntities", "searchIntent", "internalLinkingSuggestions"]
};

const productSchema = {
  type: Type.OBJECT,
  properties: {
    correctedProductName: {
      type: Type.STRING,
      description: "نام فارسی صحیح و کامل محصول که از روی تصویر تشخیص داده شده است. اگر نام ورودی کاربر صحیح بود، همان نام را برگردان. در صورت عدم وجود تصویر، بر اساس نام ورودی، نام کامل را حدس بزن.",
    },
    englishProductName: {
      type: Type.STRING,
      description: "نام انگلیسی دقیق محصول که از روی تصویر تشخیص داده شده یا بر اساس دانش عمومی حدس زده شده است.",
    },
    fullDescription: {
      type: Type.STRING,
      description: "توضیحات کامل محصول با فرمت HTML. این توضیحات باید با یک پاراگراف مقدمه جذاب شروع شود که شامل نام محصول به صورت **bold** است. بخش‌های مختلف باید با تیترهای مشخص از هم جدا شوند.",
    },
    shortDescription: {
        type: Type.STRING,
        description: "یک جمله کوتاه، خلاصه و جذاب برای توضیحات کوتاه محصول (بین ۲۰ تا ۳۰ کلمه). از هیچ‌گونه قالب‌بندی مانند bold یا strong استفاده نکن."
    },
    seoTitle: {
      type: Type.STRING,
      description: "عنوان سئو جذاب و بهینه (حداکثر ۶۰ کاراکتر) شامل کلیدواژه کانونی و کلمات کلیدی مانند 'خرید' یا 'قیمت'."
    },
    slug: {
      type: Type.STRING,
      description: "نامک (slug) سئو شده و تمیز **فقط به زبان انگلیسی** برای URL.",
    },
    focusKeyword: {
        type: Type.STRING,
        description: "کلیدواژه کانونی اصلی محصول (به فارسی)."
    },
    metaDescription: {
        type: Type.STRING,
        description: "توضیحات متا جذاب برای گوگل (بین ۱۲۰ تا ۱۵۵ کاراکتر) که شامل کلیدواژه کانونی، یک مزیت کلیدی و یک فراخوان به اقدام (CTA) باشد. از هیچ‌گونه قالب‌بندی مانند bold یا strong استفاده نکن."
    },
    altImageText: {
        type: Type.STRING,
        description: "متن جایگزین (alt text) توصیفی و بهینه برای تصویر محصول (حداکثر ۱۰ کلمه) که شامل کلیدواژه کانونی باشد."
    },
    advancedSeoAnalysis: advancedSeoAnalysisSchema,
  },
  required: [
    "correctedProductName",
    "englishProductName",
    "fullDescription",
    "shortDescription",
    "seoTitle",
    "slug",
    "focusKeyword",
    "metaDescription",
    "altImageText",
    "advancedSeoAnalysis"
  ]
};

const systemInstruction = `
تو یک متخصص ارشد سئو (SEO) و تولید محتوا برای فروشگاه‌های اینترنتی در ایران هستی. وظیفه تو تولید محتوای کامل و بهینه برای صفحه محصول وردپرس، مطابق با سخت‌گیرانه‌ترین اصول افزونه Yoast SEO است.
تمام خروجی‌ها باید به زبان فارسی روان، جذاب و کاملاً یونیک (غیرکپی) باشد.
داده‌های خروجی باید در قالب یک آبجکت JSON و مطابق با اسکیمای ارائه‌شده بازگردانده شوند. به هیچ وجه نباید هیچ متنی خارج از ساختار JSON برگردانی.
`;

const nuts_description_prompt = `
برای فیلد 'fullDescription'، یک متن کامل و تخصصی با فرمت HTML تولید کن که تمام ساختار و قوانین زیر را **به طور دقیق و کامل** برای محصولات دسته آجیل و خشکبار رعایت کند:

# 1. قوانین کلی محتوا (Yoast SEO)
- **طول متن:** کل توضیحات باید بین ۲۲۰ تا ۳۰۰ کلمه باشد.
- **خوانایی:** جملات باید کوتاه و روان باشند. حداقل در ۲۵٪ جملات از کلمات انتقالی استفاده کن و میزان استفاده از صدای مجهول را به کمتر از ۱۰٪ محدود کن.
- **استفاده از کلیدواژه کانونی:** کلیدواژه باید در پاراگراف اول بیاید و به طور طبیعی ۳ تا ۴ بار در کل متن تکرار شود.
- **لینک‌سازی داخلی:** در متن، یک عبارت کلیدی مناسب را به یک محصول یا دسته‌بندی مرتبط لینک بده (مثلاً: "برای مشاهده همه پسته‌ها کلیک کنید"). این لینک باید به صورت یک تگ \`<a>\` با \`href="#"\` و متنی توصیفی باشد.

# 2. ساختار و فرمت متن (بسیار مهم)
- توضیحات باید با یک پاراگراف مقدمه جذاب با طول ۳۰ تا ۴۰ کلمه شروع شود. **این پاراگراف نباید هیچ تیتری داشته باشد.**
- سایر بخش‌ها باید **دقیقاً** به ترتیب زیر باشند. هر بخش با یک تیتر \`<h5>\` که شامل ایموجی و متن است شروع می‌شود و با یک جداکننده \`<hr class="mohannad-divider">\` به پایان می‌رسد.

<p>یک پاراگراف مقدمه جذاب با طول ۳۰ تا ۴۰ کلمه که شامل کلیدواژه کانونی است.</p>
<hr class="mohannad-divider">

<h5>✅ مشخصات کلی و مبدأ تولید</h5>
<ul>
    <li>شهر/منطقه کشت (مثلاً: رفسنجان، کرمان)</li>
    <li>نوع فرآوری (خام، بو داده، نمکی)</li>
</ul>
<hr class="mohannad-divider">

<h5>🥗 خواص و ارزش تغذیه‌ای</h5>
<p>در ۲ تا ۳ جمله ساده و علمی، به خواص اصلی مانند پروتئین، فیبر، و فواید اثبات‌شده (سلامت قلب، کنترل قند خون) اشاره کن.</p>
<hr class="mohannad-divider">

<h5>⭐ نکات ویژه / تمایزها</h5>
<ul>
    <li>طعم و تازگی خاص</li>
    <li>بدون افزودنی، ارگانیک، یا بسته‌بندی ویژه</li>
    <li>هر مزیت رقابتی دیگر در یک خط</li>
</ul>
<hr class="mohannad-divider">

<h5>🍽️ پیشنهاد مصرف</h5> (**اختیاری و فقط در صورت لزوم**)
<p>موارد مصرف را پیشنهاد بده (اسنک روزانه، همراه چای، روی سالاد).</p>
<hr class="mohannad-divider">

<h5>🧊 روش نگهداری</h5>
<ul>
    <li>محل نگهداری: خشک و خنک، دور از نور</li>
    <li>پس از باز کردن: در ظرف درب‌دار یا یخچال</li>
    <li>زمان ماندگاری پیشنهادی</li>
</ul>
<hr class="mohannad-divider">

<h5>📦 مشخصات محصول</h5>
<ul>
    <li>نوع (خام/بو داده/نمکی/بدون نمک)</li>
    <li>مبدأ</li>
</ul>
<hr class="mohannad-divider">

<h5>⚠️ نکات مهم / هشدارها</h5> (**اختیاری و فقط در صورت لزوم**)
<p>به هشدار آلرژی یا توصیه‌هایی برای افراد با فشار خون بالا اشاره کن.</p>
<hr class="mohannad-divider">

# 3. لحن
لحن متن باید دوستانه، حرفه‌ای و متقاعدکننده باشد و حس کیفیت و اعتماد را منتقل کند.
`;

const standard_description_prompt = `
برای فیلد 'fullDescription'، یک متن کامل با فرمت HTML تولید کن که تمام ساختار و قوانین زیر را **به طور دقیق و کامل** برای محصولات غیر از آجیل و خشکبار رعایت کند:

# 1. قوانین کلی محتوا (Yoast SEO)
- **طول متن:** کل توضیحات باید بین ۲۵۰ تا ۳۵۰ کلمه باشد.
- **پاراگراف‌ها:** یک پاراگراف مقدمه جذاب با طول ۳۰ تا ۴۰ کلمه بنویس. سایر پاراگراف‌ها باید بین ۴۰ تا ۶۰ کلمه باشند.
- **خوانایی:** جملات باید کوتاه (حداکثر ۲۰ کلمه) باشند. حداقل در ۲۵٪ جملات از کلمات انتقالی استفاده کن و میزان استفاده از صدای مجهول را به کمتر از ۱۰٪ محدود کن.
- **استفاده از کلیدواژه کانونی:** کلیدواژه باید در پاراگراف اول (۵۰ کلمه ابتدایی) بیاید و به طور طبیعی ۳ تا ۴ بار در کل متن تکرار شود.
- **لینک‌سازی داخلی:** در متن، یک عبارت کلیدی مناسب را به یک محصول یا دسته‌بندی مرتبط لینک بده (به صورت یک تگ \`<a>\` با \`href="#"\` و متنی توصیفی).

# 2. ساختار و فرمت متن
- **بخش‌های تطبیقی (Dynamic Sections):** ساختار بخش‌ها باید **بر اساس نوع محصول** هوشمندانه انتخاب شود. هر بخش باید با یک تیتر \`<h5>\` همراه با یک ایموجی مناسب شروع شود (مثال: \`<h5>✅ ویژگی‌های اصلی:</h5>\`). **بخش‌های نامرتبط را به صورت خودکار حذف کن.**
    - **مثال‌های دقیق برای الهام گرفتن:**
        - **غذا و نوشیدنی:** پیشنهاد مصرف | ترکیبات | روش نگهداری
        - **لوازم الکترونیکی:** مشخصات فنی | ویژگی‌ها | راهنمای استفاده | گارانتی
        - **اسباب‌بازی:** رده سنی | نکات ایمنی | ارزش آموزشی | جنس و مراقبت
        - **پوشاک و اکسسوری:** جنس و نگهداری | راهنمای سایز | نکات استایل
        - **لوازم آرایشی:** ترکیبات | طریقه مصرف | مزایا | هشدارها
- **جداکننده:** بعد از هر بخش، **باید** از یک تگ \`<hr />\` برای جداسازی استفاده کنی. **از جداکننده متنی "---" استفاده نکن.**
- **لیست‌ها:** برای لیست کردن ویژگی‌ها یا مشخصات، از تگ \`<ul>\` و \`<li>\` استفاده کن.
- **لحن:** لحن متن باید دوستانه، حرفه‌ای و متقاعدکننده باشد و حس کیفیت و اعتماد را منتقل کند.

# 3. مثال فرمت کلی (برای کرم دور چشم):
<p>با کرم دور چشم کلینیک آل ابوت آیز ریچ، رطوبت عمقی پوست حساس اطراف چشم را تامین کرده و ظاهر پف و تیرگی را کاهش دهید.</p>
<hr />
<h5>✅ ویژگی‌های اصلی:</h5>
<ul>
    <li>فرمولاسیون غنی برای آبرسان</li>
    <li>کاهش پف و تیرگی</li>
    <li>تست‌شده توسط چشم‌پزشکان</li>
    <li>فاقد عطر</li>
</ul>
<hr />
<h5>✨ مزایای استفاده:</h5>
<p>پوست را نرم و شاداب می‌کند و برای استفاده زیر آرایش ایده‌آل است.</p>
<hr />
<h5>📌 طریقه مصرف:</h5>
<p>صبح و شب مقدار کمی کرم را با ضربات ملایم جذب کنید.</p>
<hr />
<h5>📦 مشخصات محصول:</h5>
<ul>
    <li>برند: کلینیک</li>
    <li>حجم: ۱۵ میلی‌لیتر</li>
    <li>کشور سازنده: آمریکا</li>
</ul>
<hr />
<h5>🟢 نکات مهم:</h5>
<p>در صورت بروز حساسیت مصرف را قطع کنید.</p>
`;


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { productName, productImage, briefDescription, isNutsOrDriedFruit } = req.body;

    if (!productName || typeof productName !== 'string') {
      return res.status(400).json({ message: 'Product name is required and must be a string.' });
    }

    const rawGatewayUrl = process.env.ARVAN_AI_GATEWAY_URL || process.env.AI_GATEWAY_URL || process.env.GEMINI_GATEWAY_URL;
    if (!rawGatewayUrl) {
      return res.status(500).json({
        message: 'AI Gateway URL is missing. Set ARVAN_AI_GATEWAY_URL in Vercel Environment Variables.'
      });
    }

    const gatewayBaseUrl = rawGatewayUrl.replace(/\/+$/, '');
    const chatCompletionsUrl = gatewayBaseUrl.endsWith('/chat/completions')
      ? gatewayBaseUrl
      : `${gatewayBaseUrl}/chat/completions`;

    const description_generation_instruction = isNutsOrDriedFruit
      ? nuts_description_prompt
      : standard_description_prompt;

    const fullSystemInstruction = `${systemInstruction}\n\n# Rules for 'fullDescription' field:\n${description_generation_instruction}\n\n# JSON shape\nReturn only a valid JSON object with these exact keys: correctedProductName, englishProductName, fullDescription, shortDescription, seoTitle, slug, focusKeyword, metaDescription, altImageText, advancedSeoAnalysis. advancedSeoAnalysis must include: keyphraseSynonyms, lsiKeywords, longTailKeywords, semanticEntities, searchIntent, internalLinkingSuggestions.`;

    const userContent: any[] = [];

    let userPrompt = `بر اساس اطلاعات زیر، محتوای صفحه محصول را تولید کن:\n- نام محصول: "${productName}"`;
    if (briefDescription) {
      userPrompt += `\n- توضیحات اولیه: "${briefDescription}"`;
    }

    userContent.push({ type: 'text', text: userPrompt });

    if (productImage) {
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${productImage.mimeType};base64,${productImage.base64}`,
        },
      });
      userContent.push({
        type: 'text',
        text: 'از تصویر ارائه شده برای تشخیص نام دقیق فارسی و انگلیسی و جزئیات محصول استفاده کن.',
      });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Optional: Only set this if your gateway panel gives you a separate Bearer token.
    const gatewayToken = process.env.ARVAN_AI_GATEWAY_TOKEN || process.env.AI_GATEWAY_TOKEN;
    if (gatewayToken) {
      headers.Authorization = `Bearer ${gatewayToken}`;
    }

    const requestPayload: any = {
      model: process.env.ARVAN_AI_MODEL || 'Gemini-2.5-Flash',
      messages: [
        { role: 'system', content: fullSystemInstruction },
        { role: 'user', content: userContent },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    };

    let gatewayResponse = await fetch(chatCompletionsUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestPayload),
    });

    let gatewayText = await gatewayResponse.text();

    // Some gateways do not support OpenAI's response_format field. Retry once without it.
    if (!gatewayResponse.ok && /response_format|json_object|unsupported|unknown/i.test(gatewayText)) {
      delete requestPayload.response_format;
      gatewayResponse = await fetch(chatCompletionsUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });
      gatewayText = await gatewayResponse.text();
    }
    if (!gatewayResponse.ok) {
      return res.status(gatewayResponse.status).json({
        message: `AI Gateway Error: ${gatewayText}`,
      });
    }

    let gatewayData: any;
    try {
      gatewayData = JSON.parse(gatewayText);
    } catch {
      return res.status(500).json({ message: `AI Gateway returned non-JSON response: ${gatewayText}` });
    }

    let content = gatewayData?.choices?.[0]?.message?.content;
    if (Array.isArray(content)) {
      content = content.map((part: any) => part?.text || '').join('');
    }

    if (!content || typeof content !== 'string') {
      return res.status(500).json({ message: 'AI Gateway response did not contain message content.' });
    }

    const jsonText = content
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    let generatedData: any;
    try {
      generatedData = JSON.parse(jsonText);
    } catch {
      const match = jsonText.match(/\{[\s\S]*\}/);
      if (!match) {
        return res.status(500).json({ message: `Could not parse AI JSON output: ${jsonText}` });
      }
      generatedData = JSON.parse(match[0]);
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(generatedData);

  } catch (error) {
    console.error('Error in Vercel function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    res.status(500).json({ message: `Internal Server Error: ${errorMessage}` });
  }
}
// IMPORTANT: Vercel automatically handles dependencies for serverless functions.
// This function will run in a Node.js environment on the server.

import { GoogleGenAI, Type } from "@google/genai";
import type { ProductData, ImageFile } from '../types';

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
        description: "یک جمله کوتاه، خلاصه و جذاب برای توضیحات کوتاه محصول (بین ۲۰ تا ۳۰ کلمه)."
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
        description: "توضیحات متا جذاب برای گوگل (بین ۱۲۰ تا ۱۵۵ کاراکتر) که شامل کلیدواژه کانونی، یک مزیت کلیدی و یک فراخوان به اقدام (CTA) باشد."
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
برای فیلد 'fullDescription'، یک متن کامل و تخصصی با فرمت HTML تولید کن که ساختار زیر را **به طور دقیق و کامل** برای محصولات دسته آجیل و خشکبار رعایت کند:

1.  **پاراگراف مقدمه:** یک پاراگراف جذاب (۲ تا ۳ جمله) که طراوت، طعم، ظاهر یا ویژگی منحصربه‌فرد محصول را توصیف می‌کند. نام محصول باید به صورت **bold** در این پاراگراف بیاید.

2.  **بخش‌های تخصصی:** شامل بخش‌های زیر باشد که هر کدام با یک تیتر \`<h4>\` و یک ایموجی مرتبط شروع می‌شود. **فقط بخش‌هایی را ایجاد کن که برای محصول مورد نظر منطقی و مرتبط باشند.**
    -   \`<h4>🌍 خاستگاه و ویژگی‌ها:</h4>\` (به منطقه کشت مانند رفسنجان یا دامغان، نوع محصول (خام، شور، بوداده) و اندازه یا گرید آن اشاره کن.)
    -   \`<h4>💪 ارزش غذایی و خواص:</h4>\` (مواد مغذی کلیدی مانند پروتئین، فیبر، ویتامین‌ها و آنتی‌اکسیدان‌ها را لیست کن. به فواید سلامتی مانند سلامت قلب، گوارش و... اشاره کن.)
    -   \`<h4>✨ ویژگی‌های منحصربه‌فرد:</h4>\` (دلایلی که این محصول را متمایز می‌کند را بیان کن. مثلاً ارگانیک بودن، بدون افزودنی، سایز اعلا، بسته‌بندی خاص یا گواهی‌نامه‌ها.)
    -   \`<h4>🍽️ پیشنهاد مصرف:</h4>\` (**اختیاری و فقط در صورت لزوم**) (نحوه لذت بردن از محصول را پیشنهاد بده: به عنوان میان‌وعده، در سالاد، دسر و...)
    -   \`<h4>📦 روش نگهداری:</h4>\` (دستورالعمل‌های دقیق: در جای خشک و خنک، دور از نور، و پس از باز شدن در ظرف دربسته یا یخچال.)
    -   \`<h4>📋 مشخصات محصول:</h4>\` (لیستی شامل برند، وزن خالص، نوع (خام/شور) و نوع بسته‌بندی.)
    -   \`<h4>🟢 نکات مهم:</h4>\` (**اختیاری و فقط در صورت لزوم**) (هشدارهای آلرژی، نکاتی برای افراد با فشار خون بالا (در صورت شور بودن)، و مناسب بودن برای کودکان.)

3.  **جداکننده:** بین هر دو بخش، **باید** از یک تگ \`<hr />\` برای جداسازی استفاده کنی.

4.  **لیست‌ها:** برای تمام لیست‌ها از تگ \`<ul>\` و \`<li>\` استفاده کن.

5.  **قواعد Yoast SEO:** تمام متن باید طبق اصول Yoast SEO نوشته شود (استفاده طبیعی از کلیدواژه، خوانایی بالا، پاراگراف‌های کوتاه، جملات روان).

6.  **لحن:** لحن متن باید دوستانه، حرفه‌ای و متقاعدکننده باشد و حس کیفیت و اعتماد را منتقل کند.
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
- **بخش‌های تطبیقی (Dynamic Sections):** ساختار بخش‌ها باید **بر اساس نوع محصول** هوشمندانه انتخاب شود. هر بخش باید با یک تیتر **bold** شده همراه با یک ایموجی مناسب شروع شود (مثال: \`<p><strong>✅ ویژگی‌های اصلی:</strong></p>\`). از تگ‌های هدر (h1-h6) استفاده نکن. **بخش‌های نامرتبط را به صورت خودکار حذف کن.**
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
<p><strong>✅ ویژگی‌های اصلی:</strong></p>
<ul>
    <li>فرمولاسیون غنی برای آبرسانی</li>
    <li>کاهش پف و تیرگی</li>
    <li>تست‌شده توسط چشم‌پزشکان</li>
    <li>فاقد عطر</li>
</ul>
<hr />
<p><strong>✨ مزایای استفاده:</strong></p>
<p>پوست را نرم و شاداب می‌کند و برای استفاده زیر آرایش ایده‌آل است.</p>
<hr />
<p><strong>📌 طریقه مصرف:</strong></p>
<p>صبح و شب مقدار کمی کرم را با ضربات ملایم جذب کنید.</p>
<hr />
<p><strong>📦 مشخصات محصول:</strong></p>
<ul>
    <li>برند: کلینیک</li>
    <li>حجم: ۱۵ میلی‌لیتر</li>
    <li>کشور سازنده: آمریکا</li>
</ul>
<hr />
<p><strong>🟢 نکات مهم:</strong></p>
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

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const description_generation_instruction = isNutsOrDriedFruit
      ? nuts_description_prompt
      : standard_description_prompt;
      
    const fullSystemInstruction = `${systemInstruction}\n\n# Rules for 'fullDescription' field:\n${description_generation_instruction}`;

    const parts: any[] = [];
    
    let userPrompt = `بر اساس اطلاعات زیر، محتوای صفحه محصول را تولید کن:\n- نام محصول: "${productName}"`;
    if (briefDescription) {
        userPrompt += `\n- توضیحات اولیه: "${briefDescription}"`;
    }
    
    if (productImage) {
      parts.push({
        inlineData: {
          mimeType: productImage.mimeType,
          data: productImage.base64,
        },
      });
      userPrompt += "\n- از تصویر ارائه شده برای تشخیص نام دقیق فارسی و انگلیسی و جزئیات محصول استفاده کن."
    }

    parts.push({ text: userPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        systemInstruction: fullSystemInstruction,
        responseMimeType: 'application/json',
        responseSchema: productSchema,
      },
    });
    
    const generatedData = JSON.parse(response.text);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(generatedData);

  } catch (error) {
    console.error('Error in Vercel function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    res.status(500).json({ message: `Internal Server Error: ${errorMessage}` });
  }
}
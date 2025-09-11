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
            description: "آرایه‌ای از ۳ تا ۵ عبارت کلیدی مترادف یا مرتبط."
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
        description: "یک جمله کوتاه، خلاصه و جذاب برای توضیحات کوتاه محصول (حداکثر ۲۰ کلمه)."
    },
    seoTitle: {
      type: Type.STRING,
      description: "عنوان سئو جذاب و بهینه (زیر ۶۰ کاراکتر) شامل کلیدواژه کانونی.",
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
        description: "توضیحات متا جذاب برای گوگل (زیر ۱۶۰ کاراکتر) که شامل کلیدواژه کانونی و یک فراخوان به اقدام (CTA) باشد."
    },
    altImageText: {
        type: Type.STRING,
        description: "متن جایگزین (alt text) بهینه برای تصویر محصول که توصیفی و شامل کلیدواژه کانونی باشد."
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
برای فیلد 'fullDescription'، یک متن کامل با فرمت HTML تولید کن که ساختار زیر را **به طور دقیق و کامل** رعایت کند:

1.  **پاراگراف مقدمه:** یک پاراگراف جذاب و کامل در معرفی محصول.
2.  **بخش‌ها:** شامل بخش‌های زیر باشد که هر کدام با یک تیتر \`h4\` شروع می‌شود. **حتماً و حتماً در ابتدای هر تیتر \`h4\` یک ایموجی مرتبط و مناسب قرار بده.**
    -   \`<h4>🌰 خواص و فواید [نام محصول]:</h4>\` (لیستی از خواص محصول با توضیحات کوتاه)
    -   \`<h4>📊 جدول ارزش غذایی در هر ۱۰۰ گرم:</h4>\` (یک جدول HTML ساده با دو ستون: 'ماده مغذی' و 'مقدار تقریبی')
    -   \`<h4>🍽️ روش مصرف و نگهداری:</h4>\` (توضیح در مورد نحوه مصرف و بهترین شرایط نگهداری)
    -   \`<h4>💡 نکات تکمیلی و دانستنی‌ها:</h4>\` (اطلاعات جالب و کمتر شناخته شده در مورد محصول)
3.  **جداکننده:** بین هر دو بخش، **باید** از یک تگ \`<hr />\` برای جداسازی استفاده کنی.
4.  **لیست‌ها:** برای لیست‌ها از تگ \`<ul>\` و \`<li>\` استفاده کن.
5.  **قواعد Yoast SEO:** تمام متن باید طبق اصول Yoast SEO نوشته شود (استفاده از کلیدواژه، خوانایی بالا، پاراگراف‌های کوتاه).
6.  **لحن:** لحن متن باید دوستانه، حرفه‌ای و متقاعدکننده باشد.
`;

const standard_description_prompt = `
برای فیلد 'fullDescription'، یک متن کامل با فرمت HTML تولید کن که ساختار زیر را **به طور دقیق و کامل** رعایت کند:

1.  **پاراگراف مقدمه:** یک پاراگراف جذاب و کامل در معرفی محصول.
2.  **بخش‌ها:** شامل بخش‌های زیر باشد که هر کدام با یک تیتر \`h5\` شروع می‌شود. **حتماً و حتماً در ابتدای هر تیتر \`h5\` یک ایموجی مرتبط و مناسب قرار بده.**
    -   \`<h5>✅ ویژگی‌های اصلی:</h5>\` (لیست ویژگی‌ها)
    -   \`<h5>✨ مزایای استفاده:</h5>\` (لیست مزایا)
    -   \`<h5>📌 طریقه مصرف:</h5>\` (یک یا دو پاراگراف)
    -   \`<h5>🔍 مناسب چه کسانی‌ست؟:</h5>\` (یک پاراگراف)
    -   \`<h5>📦 مشخصات محصول:</h5>\` (لیست مشخصات)
    -   \`<h5>🟢 نکات مهم:</h5>\` (لیست نکات)
3.  **جداکننده:** بین هر دو بخش، **باید** از یک تگ \`<hr />\` برای جداسازی استفاده کنی.
4.  **لیست‌ها:** برای لیست‌ها از تگ \`<ul>\` و \`<li>\` استفاده کن.
5.  **قواعد Yoast SEO:** تمام متن باید طبق اصول Yoast SEO نوشته شود (استفاده از کلیدواژه، خوانایی بالا، پاراگراف‌های کوتاه).
6.  **لحن:** لحن متن باید دوستانه، حرفه‌ای و متقاعدکننده باشد.

**مثال خروجی برای fullDescription (این فقط یک نمونه ساختار است):**
<p>مقدمه جذاب درباره محصول...</p>
<h5>✅ ویژگی‌های اصلی:</h5>
<ul><li>ویژگی ۱</li><li>ویژگی ۲</li></ul>
<hr />
<h5>✨ مزایای استفاده:</h5>
<ul><li>مزیت ۱</li><li>مزیت ۲</li></ul>
<hr />
... و به همین ترتیب برای سایر بخش‌ها.
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

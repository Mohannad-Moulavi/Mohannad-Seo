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
      description: "توضیحات کامل محصول با فرمت HTML. این توضیحات باید با یک پاراگراف مقدمه جذاب شروع شود که شامل نام محصول به صورت **bold** است. بخش‌های مختلف باید با تگ <hr> جدا شوند.",
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
      description: "نامک (slug) سئو شده و تمیز **فقط به زبان انگلیسی** برای آدرس صفحه محصول. کلمات باید با خط تیره (-) از هم جدا شوند.",
    },
    focusKeyword: {
      type: Type.STRING,
      description: "کلیدواژه کانونی اصلی (۱ تا ۳ کلمه) برای افزونه Yoast SEO.",
    },
    metaDescription: {
      type: Type.STRING,
      description: "توضیحات متا جذاب و سئو شده (بین ۱۴۰ تا ۱۵۰ کاراکتر).",
    },
    altImageText: {
      type: Type.STRING,
      description: "متن جایگزین (Alt Text) برای تصویر محصول. باید یک جمله کوتاه توصیفی (حداکثر ۱۰-۱۲ کلمه) شامل کلیدواژه کانونی و نام کامل محصول باشد."
    },
    advancedSeoAnalysis: advancedSeoAnalysisSchema,
  },
  required: ["correctedProductName", "englishProductName", "fullDescription", "shortDescription", "seoTitle", "slug", "focusKeyword", "metaDescription", "altImageText", "advancedSeoAnalysis"],
};


const createPrompt = (productName: string, hasImage: boolean) => {
    const intro = `شما یک متخصص تولید محتوای سئو (SEO Content Writer) برای یک فروشگاه آنلاین وردپرسی هستید که از افزونه Yoast SEO استفاده می‌کند. وظیفه شما تولید یک پکیج کامل محتوایی برای صفحه محصول بر اساس نام و تصویر محصول است. تمام خروجی‌ها باید به زبان فارسی و با لحنی حرفه‌ای، جذاب و متقاعدکننده برای مخاطب ایرانی باشد. شما باید خروجی را دقیقاً در قالب یک شیء JSON با ساختار مشخص شده ارائه دهید. تمام متن‌ها باید کوتاه، مختصر و هدفمند باشند.`;

    const step1_withImage = `**مرحله ۱: تشخیص و اصلاح نام محصول**
ابتدا، تصویر محصول و نام ارائه شده توسط کاربر ("${productName}") را به دقت بررسی کنید.
- اگر نام ورودی کاربر اشتباه یا ناقص است (مثلاً فاقد برند، وزن یا مدل دقیق است)، آن را بر اساس اطلاعات دقیق تصویر اصلاح کنید.
- نام **فارسی** صحیح و کامل محصول را در فیلد \`correctedProductName\` قرار دهید.
- نام **انگلیسی** دقیق محصول را در فیلد \`englishProductName\` قرار دهید.
- تمام مراحل بعدی تولید محتوا را بر اساس **نام صحیح و اصلاح شده** انجام دهید.`;

    const step1_withoutImage = `**مرحله ۱: تحلیل نام محصول**
نام محصول ارائه شده توسط کاربر "${productName}" است. تصویری برای تحلیل وجود ندارد.
- بر اساس نام ورودی کاربر، نام کامل و صحیح محصول را حدس بزنید و در فیلد \`correctedProductName\` قرار دهید (مثلاً اگر ورودی "کافی میت" بود، شما "پودر کافی میت نستله" را در نظر بگیرید).
- نام **انگلیسی** محصول را بر اساس دانش عمومی خود در فیلد \`englishProductName\` قرار دهید.
- تمام مراحل بعدی تولید محتوا را بر اساس **نامی که در correctedProductName قرار داده‌اید** انجام دهید.`;

    const main_instructions = `
**مرحله ۲: تولید محتوای سئو شده**
بر اساس نام نهایی محصول، محتوای زیر را تولید کنید و در فیلدهای مربوطه در JSON قرار دهید. **ترتیب خروجی باید دقیقاً مطابق لیست زیر باشد:**

1.  **توضیحات کامل محصول (\`fullDescription\`):**
    *   این فیلد باید حاوی کد **HTML** تمیز و ساختاریافته باشد.
    *   **ساختار الزامی و دقیق:**
        *   **پاراگراف مقدمه:** با یک پاراگراف کوتاه (۲-۳ جمله)، جذاب و شامل نام محصول فارسی به صورت **bold** (\`<strong>...\`) شروع شود.
        *   **استفاده از جداکننده:** هر بخش بعدی باید با یک تگ \`<hr>\` از بخش قبلی جدا شود.
        *   **بخش‌ها:** هر بخش باید مختصر باشد (نهایتاً ۲–۳ خط یا ۲–۴ بولت).
          *   عنوان \`<strong>✅ ویژگی‌های اصلی:\`</strong> و یک لیست بالت (\`<ul>\`) از ویژگی‌ها.
          *   عنوان \`<strong>✨ مزایای استفاده:\`</strong> و یک لیست بالت از مزایا.
          *   عنوان \`<strong>📌 طریقه مصرف:\`</strong> (فقط اگر مرتبط است).
          *   عنوان \`<strong>🔍 مناسب چه کسانی‌ست؟:\`</strong>.
          *   عنوان \`<strong>📦 مشخصات محصول:\`</strong> (شامل برند، وزن، بسته‌بندی، کشور سازنده و غیره).
          *   عنوان \`<strong>🟢 نکات مهم:\`</strong>.

2.  **توضیحات کوتاه (\`shortDescription\`):**
    *   یک جمله‌ی خلاصه و جذاب (حداکثر ۲۰ کلمه).

3.  **کلیدواژه کانونی (\`focusKeyword\`):**
    *   اصلی‌ترین عبارت (۱ تا ۳ کلمه).

4.  **عنوان سئو (\`seoTitle\`):**
    *   زیر ۶۰ کاراکتر، شامل کلیدواژه کانونی.

5.  **نامک (\`slug\`):**
    *   **الزامی: حتماً به زبان انگلیسی باشد.** کوتاه، سئوپسند و با خط تیره (-) بین کلمات.

6.  **توضیحات متا (\`metaDescription\`):**
    *   بین ۱۴۰ تا ۱۵۰ کاراکتر، شامل کلیدواژه کانونی و فراخوان به اقدام.

7.  **متن جایگزین تصویر (\`altImageText\`):**
    *   یک جمله کوتاه توصیفی (حداکثر ۱۰–۱۲ کلمه).
    *   شامل کلیدواژه کانونی.
    *   توصیف دقیق محصول برای موتور جستجو (مثال: "Vichy 24h Deodorant Spray 100ml – اسپری دئودورانت ویشی ۲۴ ساعته").

8.  **تجزیه و تحلیل سئو برتر (\`advancedSeoAnalysis\`):**
    *   یک آبجکت کامل و حرفه‌ای شامل موارد زیر:
        *   \`keyphraseSynonyms\`: آرایه‌ای از ۳ تا ۵ مترادف کلیدواژه.
        *   \`lsiKeywords\`: آرایه‌ای از کلیدواژه‌های معنایی مرتبط (LSI).
        *   \`longTailKeywords\`: آرایه‌ای از ۲-۳ عبارت دم‌بلند دقیق‌تر.
        *   \`semanticEntities\`: موجودیت‌های معنایی (برند، دسته‌بندی، ویژگی کلیدی).
        *   \`searchIntent\`: هدف جستجو (خرید، مقایسه، اطلاعاتی).
        *   \`internalLinkingSuggestions\`: کلمات پیشنهادی برای لینک‌دهی داخلی.

**قوانین نهایی:**
- خروجی شما باید **فقط و فقط یک شیء JSON معتبر** باشد.
- تمام فیلدهای JSON باید تکمیل شوند.
- لحن برای بازار ایران مناسب باشد.
- متن‌ها کوتاه و کاربردی باشند، نه طولانی و خسته‌کننده.`;

    return `${intro}\n${hasImage ? step1_withImage : step1_withoutImage}\n${main_instructions}`;
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY environment variable not set.");
    res.status(500).json({ message: "کلید API سمت سرور تنظیم نشده است. لطفاً با مدیر سایت تماس بگیرید." });
    return;
  }

  try {
    const { productName, productImage } = req.body;

    if (!productName) {
      res.status(400).json({ message: "Product name is required." });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = createPrompt(productName, !!productImage);
    
    // Using a type assertion here because the structure is known
    const contents: { parts: ({ text: string; } | { inlineData: { mimeType: string; data: string; }})[] } = {
        parts: [
            { text: prompt }
        ]
    };
    
    if (productImage) {
        contents.parts.push({
            inlineData: {
                mimeType: productImage.mimeType,
                data: productImage.base64
            }
        });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
      },
    });

    const responseText = response.text.trim();
    // In a real-world scenario, you might want more robust validation than just JSON.parse
    const generatedData: ProductData = JSON.parse(responseText);

    res.status(200).json(generatedData);

  } catch (error) {
    console.error("Error in generate API:", error);
    let errorMessage = "An unexpected error occurred during content generation.";
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    res.status(500).json({ message: `خطا در تولید محتوا. لطفاً دوباره تلاش کنید. (${errorMessage})` });
  }
}
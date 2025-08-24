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
    seoTitle: {
      type: Type.STRING,
      description: "عنوان سئو جذاب و بهینه (زیر ۶۰ کاراکتر) شامل کلیدواژه کانونی.",
    },
    slug: {
      type: Type.STRING,
      description: "نامک (slug) سئو شده و تمیز به زبان فارسی یا انگلیسی برای آدرس صفحه محصول.",
    },
    fullDescription: {
      type: Type.STRING,
      description: "توضیحات کامل و کوتاه محصول با فرمت HTML دقیقاً مطابق ساختار درخواستی در پرامپت. این توضیحات باید شامل مقدمه (با نام بولد شده محصول)، ویژگی‌های کلیدی، پیشنهاد مصرف، روش نگهداری، مشخصات و نکات مهم باشد که هر بخش با یک تگ <hr> از دیگری جدا شده است.",
    },
    focusKeyword: {
      type: Type.STRING,
      description: "کلیدواژه کانونی اصلی (۱ تا ۳ کلمه) برای افزونه Yoast SEO.",
    },
    metaDescription: {
      type: Type.STRING,
      description: "توضیحات متا جذاب و سئو شده (بین ۱۴۰ تا ۱۵۰ کاراکتر).",
    },
    keyphraseSynonyms: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: "آرایه‌ای از ۳ تا ۵ عبارت کلیدی مترادف برای بخش 'Advanced SEO Analysis'.",
    },
  },
  required: ["correctedProductName", "englishProductName", "seoTitle", "slug", "fullDescription", "focusKeyword", "metaDescription", "keyphraseSynonyms"],
};


const createPrompt = (productName: string, hasImage: boolean) => {
    const intro = `شما یک متخصص تولید محتوای سئو (SEO Content Writer) برای یک فروشگاه آنلاین وردپرسی هستید که از افزونه Yoast SEO استفاده می‌کند. وظیفه شما تولید یک پکیج کامل محتوایی برای صفحه محصول بر اساس نام و تصویر محصول است. تمام خروجی‌ها باید به زبان فارسی و با لحنی حرفه‌ای، جذاب و متقاعدکننده برای مخاطب ایرانی باشد. شما باید خروجی را دقیقاً در قالب یک شیء JSON با ساختار مشخص شده ارائه دهید.`;

    const step1_withImage = `**مرحله ۱: تشخیص و اصلاح نام محصول**
ابتدا، تصویر محصول و نام ارائه شده توسط کاربر ("${productName}") را به دقت بررسی کنید.
- اگر نام ورودی کاربر اشتباه یا ناقص است (مثلاً فاقد برند، وزن یا مدل دقیق است)، آن را بر اساس اطلاعات دقیق تصویر اصلاح کنید.
- نام **فارسی** اصلاح شده یا تأیید شده را در فیلد \`correctedProductName\` قرار دهید.
- نام **انگلیسی** دقیق محصول را در فیلد \`englishProductName\` قرار دهید.
- تمام مراحل بعدی تولید محتوا را بر اساس **نام صحیح و اصلاح شده** انجام دهید.`;

    const step1_withoutImage = `**مرحله ۱: تحلیل نام محصول**
نام محصول ارائه شده توسط کاربر "${productName}" است. تصویری برای تحلیل وجود ندارد.
- بر اساس نام ورودی کاربر، نام کامل و صحیح محصول را حدس بزنید و در فیلد \`correctedProductName\` قرار دهید (مثلاً اگر ورودی "کافی میت" بود، شما "پودر کافی میت نستله" را در نظر بگیرید).
- نام **انگلیسی** محصول را بر اساس دانش عمومی خود در فیلد \`englishProductName\` قرار دهید.
- تمام مراحل بعدی تولید محتوا را بر اساس **نامی که در correctedProductName قرار داده‌اید** انجام دهید.`;

    const main_instructions = `
**مرحله ۲: تولید محتوای سئو شده**
بر اساس نام نهایی محصول، محتوای زیر را تولید کنید و در فیلدهای مربوطه در JSON قرار دهید:

1.  **توضیحات کامل محصول (\`fullDescription\`):**
    *   این فیلد باید حاوی کد **HTML** تمیز، ساختاریافته، کوتاه و هدفمند باشد. هر بخش با یک \`<hr>\` از بخش بعدی جدا شود.
    *   **ساختار الزامی و دقیق:**
        *   **پاراگراف مقدمه:** با **بولد کردن نام محصول** شروع شود (مثلاً \`<p><strong>پودر کافی میت نستله</strong> ...\`). این پاراگراف باید کوتاه (۲-۳ جمله)، جذاب و شامل کلیدواژه کانونی باشد.
        *   **بخش "ویژگی‌های کلیدی":** با عنوان \`<strong>✅ ویژگی‌های کلیدی:\`</strong> شروع شود و شامل یک لیست بالت (\`<ul>\`) از ۴ تا ۶ ویژگی برتر باشد.
        *   **بخش "پیشنهاد مصرف" (اختیاری):** فقط اگر برای محصول کاملاً مرتبط است، این بخش را با عنوان \`<strong>🍽 پیشنهاد مصرف:\`</strong> و یک لیست بالت از ۲ تا ۴ مورد اضافه کنید. در غیر این صورت، این بخش را کاملاً حذف کنید.
        *   **بخش "روش نگهداری":** با عنوان \`<strong>📌 روش نگهداری:\`</strong> و یک لیست بالت از ۲ تا ۳ مورد.
        *   **بخش "مشخصات محصول":** با عنوان \`<strong>📦 مشخصات محصول:\`</strong> و لیستی از مشخصات کلیدی. هر مشخصه را با \`<strong>\` شروع کنید (مانند \`<strong>وزن:</strong> 100 گرم\`) و با \`<br>\` از مشخصه بعدی جدا کنید.
        *   **بخش "نکات مهم":** با عنوان \`<strong>🟢 نکات مهم:\`</strong> و یک لیست بالت از ۲ تا ۳ نکته.

2.  **کلیدواژه کانونی (\`focusKeyword\`):**
    *   اصلی‌ترین عبارت (۱ تا ۳ کلمه).

3.  **عنوان سئو (\`seoTitle\`):**
    *   زیر ۶۰ کاراکتر، شامل کلیدواژه کانونی.

4.  **نامک (\`slug\`):**
    *   کوتاه و سئو شده به فارسی یا انگلیسی با خط تیره (-).

5.  **توضیحات متا (\`metaDescription\`):**
    *   بین ۱۴۰ تا ۱۵۰ کاراکتر، شامل کلیدواژه کانونی و فراخوان به اقدام.

6.  **عبارات کلیدی مترادف (\`keyphraseSynonyms\`):**
    *   آرایه‌ای از ۳ تا ۵ عبارت مرتبط برای "Advanced SEO Analysis".
    
**نکات نهایی بسیار مهم:**
- خروجی شما باید **فقط و فقط یک شیء JSON معتبر** باشد.
- تمام فیلدهای JSON باید تکمیل شوند.
- لحن برای بازار ایران مناسب باشد.
- تمام بخش‌های داخل \`fullDescription\` باید کوتاه و کاربردی باشند.`;

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
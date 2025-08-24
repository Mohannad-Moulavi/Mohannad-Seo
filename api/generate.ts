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
     shortDescription: {
      type: Type.STRING,
      description: "توضیحات کوتاه و جذاب برای نمایش در بالای صفحه محصول (۲-۳ خط)."
    },
    seoTitle: {
      type: Type.STRING,
      description: "عنوان سئو جذاب و بهینه (زیر ۶۰ کاراکتر) شامل کلیدواژه کانونی.",
    },
    slug: {
      type: Type.STRING,
      description: "نامک (slug) سئو شده و تمیز **فقط به زبان انگلیسی** برای آدرس صفحه محصول.",
    },
    fullDescription: {
      type: Type.STRING,
      description: "توضیحات کامل محصول با فرمت HTML دقیقاً مطابق ساختار درخواستی در پرامپت. این توضیحات باید با نام محصول شروع شده و شامل مقدمه، ویژگی‌های اصلی، مزایای استفاده، طریقه مصرف، مناسب چه کسانی‌ست، مشخصات و نکات مهم باشد که هر بخش با یک تگ <hr> از دیگری جدا شده است.",
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
  required: ["correctedProductName", "englishProductName", "shortDescription", "seoTitle", "slug", "fullDescription", "focusKeyword", "metaDescription", "keyphraseSynonyms"],
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
    *   این فیلد باید حاوی کد **HTML** تمیز و ساختاریافته باشد. هر بخش با یک \`<hr>\` از بخش بعدی جدا شود.
    *   **ساختار الزامی و دقیق:**
        *   **ردیف نام محصول:** در ابتدای توضیحات، نام فارسی **بولد** شده و نام انگلیسی را قرار بده. به این شکل: \`<p><strong>[نام فارسی محصول]</strong><br>[نام انگلیسی محصول]</p>\`
        *   **پاراگراف مقدمه:** یک پاراگراف کوتاه (۲-۳ جمله) و جذاب که محصول را معرفی می‌کند.
        *   **بخش "ویژگی‌های اصلی":** با عنوان \`<strong>✅ ویژگی‌های اصلی:\`</strong> و یک لیست بالت (\`<ul>\`) از ۴ تا ۶ ویژگی.
        *   **بخش "مزایای استفاده":** با عنوان \`<strong>✨ مزایای استفاده:\`</strong> و یک لیست بالت (\`<ul>\`) از ۳ تا ۴ مزیت.
        *   **بخش "طریقه مصرف":** با عنوان \`<strong>📌 طریقه مصرف:\`</strong> و یک لیست بالت یا پاراگراف کوتاه (۲-۳ مورد).
        *   **بخش "مناسب چه کسانی‌ست؟":** با عنوان \`<strong>🔍 مناسب چه کسانی‌ست؟:\`</strong> و یک توضیح کوتاه (۲-۳ خط یا بولت).
        *   **بخش "مشخصات محصول":** با عنوان \`<strong>📦 مشخصات محصول:\`</strong> و لیستی از مشخصات. هر مشخصه را با \`<strong>\` شروع کنید (مانند \`<strong>وزن:</strong> 100 گرم\`) و با \`<br>\` از بعدی جدا کنید.
        *   **بخش "نکات مهم":** با عنوان \`<strong>🟢 نکات مهم:\`</strong> و یک لیست بالت از ۲ تا ۳ نکته.
    *   **مهم:** تمام بخش‌ها باید مختصر و کاربردی باشند.

2.  **توضیحات کوتاه (\`shortDescription\`):**
    *   یک متن بسیار کوتاه (۲-۳ خط) و جذاب برای بالای صفحه محصول.

3.  **کلیدواژه کانونی (\`focusKeyword\`):**
    *   اصلی‌ترین عبارت (۱ تا ۳ کلمه).

4.  **عنوان سئو (\`seoTitle\`):**
    *   زیر ۶۰ کاراکتر، شامل کلیدواژه کانونی.

5.  **نامک (\`slug\`):**
    *   **الزامی: حتماً به زبان انگلیسی باشد.** کوتاه و سئو شده با خط تیره (-).

6.  **توضیحات متا (\`metaDescription\`):**
    *   بین ۱۴۰ تا ۱۵۰ کاراکتر، شامل کلیدواژه کانونی و فراخوان به اقدام.

7.  **عبارات کلیدی مترادف (\`keyphraseSynonyms\`):**
    *   آرایه‌ای از ۳ تا ۵ عبارت مرتبط برای "Advanced SEO Analysis".
    
**نکات نهایی بسیار مهم:**
- خروجی شما باید **فقط و فقط یک شیء JSON معتبر** باشد.
- تمام فیلدهای JSON باید تکمیل شوند.
- لحن برای بازار ایران مناسب باشد.
- از نمونه محصول "Vichy" که قبلا داده شده به عنوان الگو برای ساختار و لحن استفاده کن اما محتوای اختصاصی برای محصول فعلی تولید کن.`;

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
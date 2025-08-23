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
      description: "توضیحات کامل و حرفه‌ای محصول با فرمت HTML دقیقاً مطابق ساختار درخواستی در پرامپت (مقدمه، ویژگی‌ها، مشخصات و...). این توضیحات باید بسیار مختصر و مفید باشد.",
    },
    shortDescription: {
        type: Type.STRING,
        description: "توضیحات کوتاه و جذاب محصول (حداکثر ۲۰ کلمه) برای نمایش در لیست محصولات.",
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
      description: "آرایه‌ای از ۳ تا ۵ عبارت کلیدی مترادف.",
    },
  },
  required: ["correctedProductName", "englishProductName", "seoTitle", "slug", "fullDescription", "shortDescription", "focusKeyword", "metaDescription", "keyphraseSynonyms"],
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
    *   این فیلد باید حاوی کد **HTML** تمیز و ساختاریافته باشد.
    *   **ساختار الزامی:**
        *   **یک پاراگراف مقدمه (Introduction):** متنی کوتاه و جذاب (حدود ۲-۳ جمله) که محصول و مزیت اصلی آن را معرفی می‌کند. **حتماً کلیدواژه کانونی را در این پاراگراف به کار ببرید.**
        *   **عنوان "ویژگی‌های کلیدی":** از تگ \`<strong>ویژگی‌های کلیدی:\`</strong> استفاده کنید.
        *   **لیست ویژگی‌ها:** یک لیست بالت (\`<ul>\`) شامل ۳ تا ۵ ویژگی برتر محصول به صورت موردی (\`<li>\`).
        *   **عنوان "مشخصات فنی":** از تگ \`<strong>مشخصات فنی:\`</strong> استفاده کنید.
        *   **لیست مشخصات:** لیستی از مشخصات مهم محصول. هر مشخصه را با \`<strong>\` شروع کنید (مانند \`<strong>وزن:</strong> 100 گرم\`). هر مشخصه در یک خط جدید باشد (از \`<br>\` استفاده کنید).
        *   **یک پاراگراف پایانی (Conclusion):** یک جمله کوتاه برای جمع‌بندی و دعوت به اقدام (Call to Action).
    *   **لحن:** حرفه‌ای، روان و متقاعدکننده.

2.  **توضیحات کوتاه محصول (\`shortDescription\`):**
    *   یک جمله بسیار کوتاه و جذاب (حداکثر ۲۰ کلمه) که بهترین ویژگی محصول را برجسته می‌کند.

3.  **کلیدواژه کانونی (\`focusKeyword\`):**
    *   اصلی‌ترین و پرتکرارترین عبارت (۱ تا ۳ کلمه) که کاربران برای یافتن این محصول جستجو می‌کنند. این عبارت باید نام اصلی محصول باشد.

4.  **عنوان سئو (\`seoTitle\`):**
    *   یک عنوان جذاب و بهینه برای گوگل، زیر ۶۰ کاراکتر.
    *   **فرمول:** نام محصول | ویژگی کلیدی | نام برند (در صورت وجود) | نام فروشگاه (فرض کنید "فروشگاه ما")
    *   **مثال:** پودر کافی میت نستله ۴۰۰ گرمی | خرید و قیمت | فروشگاه ما
    *   **حتماً باید شامل کلیدواژه کانونی باشد.**

5.  **نامک (\`slug\`):**
    *   یک آدرس کوتاه، خوانا و سئو شده به زبان فارسی یا انگلیسی. کلمات با خط تیره (-) از هم جدا شوند.
    *   **حتماً باید شامل کلیدواژه کانونی باشد.**
    *   **مثال:** \`coffee-mate-nestle-400g\` یا \`پودر-کافی-میت-نستله\`.

6.  **توضیحات متا (\`metaDescription\`):**
    *   یک خلاصه جذاب و متقاعدکننده بین ۱۴۰ تا ۱۵۰ کاراکتر.
    *   **باید شامل کلیدواژه کانونی و یک فراخوان به اقدام (Call to Action) باشد.**
    *   **مثال:** "خرید آنلاین پودر کافی میت نستله ۴۰۰ گرمی اصل با بهترین قیمت. طعمی بی‌نظیر به قهوه خود اضافه کنید. همین حالا سفارش دهید!"

7.  **عبارات کلیدی مترادف (\`keyphraseSynonyms\`):**
    *   آرایه‌ای از ۳ تا ۵ عبارت جایگزین که کاربران ممکن است استفاده کنند.
    *   **مثال:** ["خرید کافی میت نستله", "قیمت پودر شیر نستله", "کافی میت اورجینال"]
    
**نکات نهایی بسیار مهم:**
- خروجی شما باید **فقط و فقط یک شیء JSON معتبر** باشد و هیچ متن اضافی، توضیحات یا کاراکترهای форматирования قبل یا بعد از آن وجود نداشته باشد.
- تمام فیلدهای JSON باید تکمیل شوند.
- لحن باید برای بازار ایران مناسب باشد.`;

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

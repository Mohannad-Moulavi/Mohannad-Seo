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
      description: "توضیحات کامل محصول با فرمت HTML. این توضیحات باید با یک پاراگراف مقدمه جذاب شروع شود که شامل نام محصول به صورت **bold** است. بخش‌های مختلف باید با تیترهای `<h4>` از هم جدا شوند.",
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


const createPrompt = (productName: string, hasImage: boolean, briefDescription: string, isNutsOrDriedFruit: boolean) => {
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

    const nuts_description_prompt = `
1.  **توضیحات کامل محصول (\`fullDescription\`):**
    *   این فیلد باید حاوی کد **HTML** تمیز، ساختاریافته و **بسیار مفصل** باشد.
    *   **الزام مهم:** متن نهایی باید **حداقل ۳۵۰ کلمه** باشد تا استانداردهای Yoast SEO را برآورده کند.
    *   **دستورالعمل ویژه برای آجیل و خشکبار (با رعایت اصول Yoast SEO):** با توجه به اینکه این محصول آجیل یا خشکبار است، یک متن توصیفی بسیار بلند، جذاب، داستانی و جامع بنویس.
    *   **از اطلاعات زیر به عنوان منبع اصلی استفاده کن:**
        *   توضیحات مختصر کاربر: "${briefDescription || 'وجود ندارد'}"
    *   **قوانین نگارشی برای سئو (بسیار مهم):**
        *   **استفاده از تیتر:** برای جدا کردن هر بخش از متن، از یک تیتر با تگ \`<h4>\` استفاده کن. **فقط از تگ h4 استفاده کن و از هیچ تگ دیگری مثل h1, h2, h3 و غیره، یا ایموجی، یا تگ strong استفاده نکن.** این یک الزام است.
        *   **کوتاهی جملات:** جملات را کوتاه و روان بنویس. **بیش از ۷۵٪ جملات باید زیر ۲۵ کلمه باشند.** از جملات طولانی و پیچیده پرهیز کن.
        *   **لحن فعال (Active Voice):** همیشه از لحن فعال استفاده کن. از حالت مجهول (passive voice) پرهیز کن. (مثال: به جای «این محصول توسط کشاورزان برداشت می‌شود»، بنویس «کشاورزان این محصول را برداشت می‌کنند»).
    *   **ساختار الزامی و دقیق متن:**
        *   **مقدمه داستانی (حدود ۵۰ کلمه):** با یک مقدمه جذاب و گیرا شروع کن. محصول را معرفی کن، به خاستگاه یا تاریخچه آن اشاره‌ای کوتاه کن و نام محصول را **bold** کن. این بخش **نباید** تیتر داشته باشد.
        *   **<h4>سفری به خاستگاه</h4> (حدود ۸۰ کلمه):** به طور مفصل در مورد منطقه کشت و اصالت محصول بنویس. ویژگی‌های جغرافیایی یا فرهنگی که این محصول را خاص می‌کند را توصیف کن.
        *   **<h4>تجربه طعم و عطر</h4> (حدود ۷۰ کلمه):** طعم، بافت، و عطر محصول را با جزئیات دقیق و وسوسه‌انگیز توصیف کن. از صفات توصیفی غنی استفاده کن.
        *   **<h4>گنجینه‌ای از خواص</h4> (حدود ۱۰۰ کلمه):** خواص و فواید محصول برای سلامتی را به تفصیل شرح بده. به ویتامین‌ها، مواد معدنی، و تاثیرات مثبت آن بر بدن اشاره کن. این بخش باید بسیار کامل باشد.
        *   **<h4>همراه لحظه‌های شما</h4> (حدود ۵۰ کلمه):** کاربردهای مختلف محصول را بیان کن. از مصرف به عنوان میان‌وعده تا استفاده در آشپزی، شیرینی‌پزی یا همراهی با نوشیدنی‌های مختلف.
        *   **نتیجه‌گیری و دعوت به خرید (حدود ۳۰ کلمه):** با یک پاراگراف کوتاه و یک فراخوان به اقدام (Call to action) قوی و متقاعدکننده برای خرید، متن را به پایان برسان. این بخش **نباید** تیتر داشته باشد.
    *   متن باید روان و یکپارچه باشد و حس کیفیت و اصالت را به خواننده منتقل کند. **تکرار می‌کنم، طول کل متن باید حتماً بالای ۳۵۰ کلمه باشد و تمام قوانین نگارشی سئو رعایت شود.**`;

    const standard_description_prompt = `
1.  **توضیحات کامل محصول (\`fullDescription\`):**
    *   این فیلد باید حاوی کد **HTML** تمیز و ساختاریافته باشد.
    *   **اطلاعات تکمیلی از کاربر (در صورت وجود، از آن برای غنی‌تر کردن محتوا استفاده کن):** "${briefDescription || 'وجود ندارد'}"
    *   **قوانین نگارشی برای سئو (بسیار مهم):**
        *   جملات را کوتاه و روان بنویس.
        *   همیشه از لحن فعال (Active Voice) استفاده کن.
    *   **ساختار الزامی و دقیق:**
        *   **پاراگراف مقدمه:** با یک پاراگراف کوتاه (۲-۳ جمله)، جذاب و شامل نام محصول فارسی به صورت **bold** (\`<strong>...\`) شروع شود.
        *   **بدنه اصلی:** در ادامه، با استفاده از پاراگراف‌ها و تیترهای \`<h4>\`, محصول را به طور کامل معرفی کن. ویژگی‌ها، مزایا، و کاربردهای آن را شرح بده. در صورت لزوم از لیست بالت (\`<ul>\`) استفاده کن.
        *   **پاراگراف پایانی:** با یک پاراگراف کوتاه و یک فراخوان به اقدام (Call to action) متن را به پایان برسان.`;
    
    const description_instructions = isNutsOrDriedFruit ? nuts_description_prompt : standard_description_prompt;

    const main_instructions = `
**مرحله ۲: تولید محتوای سئو شده**
بر اساس نام نهایی محصول، محتوای زیر را تولید کنید و در فیلدهای مربوطه در JSON قرار دهید. **ترتیب خروجی باید دقیقاً مطابق لیست زیر باشد:**

${description_instructions}

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
    const { productName, productImage, briefDescription, isNutsOrDriedFruit } = req.body;

    if (!productName) {
      res.status(400).json({ message: "Product name is required." });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = createPrompt(productName, !!productImage, briefDescription, isNutsOrDriedFruit);
    
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

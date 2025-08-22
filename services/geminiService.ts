import { GoogleGenAI, Type } from "@google/genai";
import type { ProductData, ImageFile } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    const intro_withImage = `وظیفه شما تولید یک پکیج کامل محتوایی برای یک صفحه محصول وردپرس بر اساس نام و تصویر محصول است.`;
    const intro_withoutImage = `وظیفه شما تولید یک پکیج کامل محتوایی برای یک صفحه محصول وردپرس فقط بر اساس نام محصول ارائه شده است.`;
    
    const finalInstruction_withImage = `اکنون، بر اساس نام محصول "${productName}" و تصویر ضمیمه شده، محتوای JSON کامل را تولید کنید.`;
    const finalInstruction_withoutImage = `اکنون، فقط بر اساس نام محصول "${productName}"، محتوای JSON کامل را تولید کنید.`;

    return `
شما یک متخصص ارشد سئو وردپرس (متخصص در Yoast SEO) و تولید محتوای حرفه‌ای برای محصولات به زبان فارسی هستید.
${hasImage ? intro_withImage : intro_withoutImage}

${hasImage ? step1_withImage : step1_withoutImage}

**مرحله ۲: تولید محتوا بر اساس ساختار و اصول مشخص شده**
با استفاده از نام صحیح محصول، محتوای زیر را تولید کنید و در یک آبجکت JSON معتبر و دقیق مطابق با اسکیمای ارائه شده برگردانید. هیچ متنی خارج از آبجکت JSON قرار ندهید.

---
**ساختار الزامی برای "توضیحات کامل" (fullDescription):**
محتوای این فیلد باید یک HTML خالص و آماده برای کپی باشد و **دقیقا** از ساختار زیر پیروی کند.
**بسیار مهم: تمام بخش‌ها باید بسیار کوتاه و مختصر باشند.** از نوشتن متن‌های طولانی و غیرضروری جداً خودداری کنید. هر بخش باید با یک تگ \`<hr />\` از بخش بعدی جدا شود.

1.  **پاراگراف مقدمه:**
    *   باید با نام محصول به صورت **بولد** شروع شود (مثال: \`<strong>کره بادام زمینی نرم جیف</strong>\`).
    *   فقط **یک پاراگراف کوتاه** (حداکثر ۲ تا ۳ خط).
    *   به بافت/طعم، کیفیت و نقطه فروش اصلی اشاره کند.
    *   بعد از این بخش، یک تگ \`<hr />\` قرار دهید.

2.  **✅ ویژگی‌های کلیدی:**
    *   عنوان به صورت \`<strong>✅ ویژگی‌های کلیدی</strong>\`.
    *   لیستی از **حداکثر ۲ تا ۳ مورد** کلیدی با ایموجی. هر مورد کوتاه و در یک خط باشد.
    *   بعد از این بخش، یک تگ \`<hr />\` قرار دهید.

3.  **🍽 پیشنهاد مصرف (در صورت مرتبط بودن):**
    *   فقط اگر محصول خوراکی یا قابل استفاده است، این بخش را اضافه کنید.
    *   عنوان به صورت \`<strong>🍽 پیشنهاد مصرف</strong>\`.
    *   لیستی از **حداکثر ۲ پیشنهاد**.
    *   بعد از این بخش، یک تگ \`<hr />\` قرار دهید.

4.  **📌 روش نگهداری (در صورت مرتبط بودن):**
    *   عنوان به صورت \`<strong>📌 روش نگهداری</strong>\`.
    *   لیستی از **حداکثر ۲ نکته** کوتاه.
    *   بعد از این بخش، یک تگ \`<hr />\` قرار دهید.

5.  **📦 مشخصات محصول:**
    *   عنوان به صورت \`<strong>📦 مشخصات محصول</strong>\`.
    *   لیستی شامل **مهم‌ترین مشخصات** مانند برند، وزن، کشور مبدا.
    *   بعد از این بخش، یک تگ \`<hr />\` قرار دهید.

6.  **🟢 نکات مهم:**
    *   عنوان به صورت \`<strong>🟢 نکات مهم</strong>\`.
    *   لیستی از **حداکثر ۲ نکته** مهم (مانند آلرژن‌ها).
    *   بعد از این بخش، یک تگ \`<hr />\` قرار دهید.

---
**سایر الزامات محتوایی:**

*   **توضیحات کوتاه (shortDescription):**
    *   یک جمله جذاب و کوتاه (حداکثر ۲۰ کلمه) که ماهیت اصلی محصول را بیان می‌کند.

*   **نامک (slug):**
    *   یک نامک تمیز، کوتاه و سئو-محور به زبان فارسی یا انگلیسی (مثال: nestle-coffee-mate-1kg یا کافی-میت-نستله).

*   **عنوان سئو (seoTitle):**
    *   باید شامل کلیدواژه کانونی باشد.
    *   طول آن **کمتر از ۶۰ کاراکتر** باشد.

*   **توضیحات متا (metaDescription):**
    *   طول آن بین **۱۴۰ تا ۱۵۰ کاراکتر** باشد. **هرگز از ۱۵۰ کاراکتر بیشتر نشود.**
    *   باید شامل کلیدواژه کانونی باشد.

*   **کلیدواژه کانونی (focusKeyword):**
    *   دقیق‌ترین عبارت ۱ تا ۳ کلمه‌ای.

*   **مترادف‌های کلیدی (keyphraseSynonyms):**
    *   لیستی از ۳ تا ۵ عبارت مترادف.

---
**مثال ساختار خروجی برای محصول "کافی میت نستله ۱ کیلویی":**
{
  "correctedProductName": "پودر کافی میت نستله ۱ کیلوگرمی",
  "englishProductName": "Nestle Coffee-Mate 1kg",
  "seoTitle": "خرید کافی میت نستله ۱ کیلویی | بهترین قیمت",
  "slug": "nestle-coffee-mate-1kg",
  "fullDescription": "<p><strong>پودر کافی‌میت نستله ۱ کیلوگرمی</strong> بهترین جایگزین شیر برای قهوه است که نوشیدنی شما را کرمی، نرم و خوش‌طعم می‌کند. این محصول با فرمولاسیون ویژه خود، تجربه‌ای لذت‌بخش برای شما می‌سازد و انتخابی ایده‌آل برای مصرف روزانه است.</p><hr /><strong>✅ ویژگی‌های کلیدی</strong><ul><li>افزودن بافت خامه‌ای و غنی به قهوه</li><li>بدون لاکتوز و کلسترول</li><li>حلالیت سریع و آسان در نوشیدنی داغ</li></ul><hr /><strong>🍽 پیشنهاد مصرف</strong><ul><li>یک تا دو قاشق چای‌خوری را به فنجان قهوه داغ خود اضافه کرده و هم بزنید.</li><li>برای تهیه انواع نوشیدنی‌های گرم مانند هات چاکلت نیز قابل استفاده است.</li></ul><hr /><strong>📦 مشخصات محصول</strong><ul><li>برند: نستله (Nestle)</li><li>وزن: ۱ کیلوگرم</li><li>کشور مبدا: تایلند</li></ul><hr /><strong>🟢 نکات مهم</strong><ul><li>این محصول جایگزین شیر خشک برای نوزادان نیست.</li></ul><hr />",
  "shortDescription": "کافی میت نستله، بهترین همراه قهوه برای طعمی خامه‌ای و دلپذیر.",
  "focusKeyword": "کافی میت نستله",
  "metaDescription": "خرید پودر کافی میت نستله ۱ کیلوگرمی با طعم خامه‌ای، بدون کلسترول و مناسب قهوه. بهترین قیمت و کیفیت را تجربه کرده و از نوشیدنی خود لذت ببرید.",
  "keyphraseSynonyms": ["Coffee Mate", "پودر کافی میت Nestlé", "خامه قهوه", "خرید کافی میت"]
}
---

${hasImage ? finalInstruction_withImage : finalInstruction_withoutImage}
`;
}


export const generateProductContent = async (
  productName: string,
  productImage: ImageFile | null
): Promise<ProductData> => {
  try {
    const hasImage = !!productImage;
    const prompt = createPrompt(productName, hasImage);

    const textPart = { text: prompt };
    const parts: any[] = [];

    if (productImage) {
        const imagePart = {
          inlineData: {
            data: productImage.base64,
            mimeType: productImage.mimeType,
          },
        };
        parts.push(imagePart);
    }
    parts.push(textPart);


    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: productSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    // Ensure the array is actually an array
    if (!Array.isArray(parsedData.keyphraseSynonyms)) {
        parsedData.keyphraseSynonyms = [];
    }

    return parsedData as ProductData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("خطا در ارتباط با سرویس هوش مصنوعی. لطفاً دوباره تلاش کنید.");
  }
};
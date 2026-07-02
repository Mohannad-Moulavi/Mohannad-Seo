import type { ImageFile } from '../types';

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
    type: "object",
    properties: {
        keyphraseSynonyms: {
            type: "array",
            items: { type: "string" },
            description: "آرایه‌ای از حداقل ۳ عبارت کلیدی مترادف یا مرتبط."
        },
        lsiKeywords: {
            type: "array",
            items: { type: "string" },
            description: "آرایه‌ای از کلیدواژه‌های معنایی مرتبط (LSI)."
        },
        longTailKeywords: {
            type: "array",
            items: { type: "string" },
            description: "آرایه‌ای از ۲ تا ۳ عبارت کلیدی دم‌بلند و دقیق‌تر."
        },
        semanticEntities: {
            type: "array",
            items: { type: "string" },
            description: "موجودیت‌های معنایی کلیدی مانند برند، دسته‌بندی محصول، و ویژگی‌های اصلی."
        },
        searchIntent: {
            type: "string",
            description: "هدف جستجوی کاربر (مثلاً: خرید، مقایسه، اطلاعاتی)."
        },
        internalLinkingSuggestions: {
            type: "array",
            items: { type: "string" },
            description: "کلمات یا عبارات پیشنهادی برای لینک‌دهی داخلی به صفحات مرتبط."
        }
    },
    required: ["keyphraseSynonyms", "lsiKeywords", "longTailKeywords", "semanticEntities", "searchIntent", "internalLinkingSuggestions"]
};

const productSchema = {
  type: "object",
  properties: {
    correctedProductName: {
      type: "string",
      description: "نام فارسی صحیح و کامل محصول که از روی تصویر تشخیص داده شده است. اگر نام ورودی کاربر صحیح بود، همان نام را برگردان. در صورت عدم وجود تصویر، بر اساس نام ورودی، نام کامل را حدس بزن.",
    },
    englishProductName: {
      type: "string",
      description: "نام انگلیسی دقیق محصول که از روی تصویر تشخیص داده شده یا بر اساس دانش عمومی حدس زده شده است.",
    },
    fullDescription: {
      type: "string",
      description: "توضیحات کامل محصول با فرمت HTML. این توضیحات باید با یک پاراگراف مقدمه جذاب شروع شود که شامل نام محصول به صورت **bold** است. بخش‌های مختلف باید با تیترهای مشخص از هم جدا شوند.",
    },
    shortDescription: {
        type: "string",
        description: "یک جمله کوتاه، خلاصه و جذاب برای توضیحات کوتاه محصول (بین ۲۰ تا ۳۰ کلمه). از هیچ‌گونه قالب‌بندی مانند bold یا strong استفاده نکن."
    },
    seoTitle: {
      type: "string",
      description: "عنوان سئو جذاب و بهینه (حداکثر ۶۰ کاراکتر) شامل کلیدواژه کانونی و کلمات کلیدی مانند 'خرید' یا 'قیمت'."
    },
    slug: {
      type: "string",
      description: "نامک (slug) سئو شده و تمیز **فقط به زبان انگلیسی** برای URL.",
    },
    focusKeyword: {
        type: "string",
        description: "کلیدواژه کانونی اصلی محصول (به فارسی)."
    },
    metaDescription: {
        type: "string",
        description: "توضیحات متا جذاب برای گوگل (بین ۱۲۰ تا ۱۵۵ کاراکتر) که شامل کلیدواژه کانونی، یک مزیت کلیدی و یک فراخوان به اقدام (CTA) باشد. از هیچ‌گونه قالب‌بندی مانند bold یا strong استفاده نکن."
    },
    altImageText: {
        type: "string",
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




type ArvanContentPart = { type: string; text?: string; image_url?: { url: string } };

const INTERNAL_CATEGORIES: Array<{ title: string; url: string }> = [
  {
    "title": "قهوه فوری",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/instant-coffee/"
  },
  {
    "title": "نسکافه",
    "url": "https://noon-valqalam.ir/product-category/%d9%86%d8%b3%da%a9%d8%a7%d9%81%d9%87/"
  },
  {
    "title": "هات چاکلت",
    "url": "https://noon-valqalam.ir/product-category/%d9%87%d8%a7%d8%aa-%da%86%d8%a7%da%a9%d9%84%d8%aa/"
  },
  {
    "title": "قهوه",
    "url": "https://noon-valqalam.ir/product-category/coffee/"
  },
  {
    "title": "گز",
    "url": "https://noon-valqalam.ir/product-category/%da%af%d8%b2/"
  },
  {
    "title": "سوهان",
    "url": "https://noon-valqalam.ir/product-category/%d8%b3%d9%88%d9%87%d8%a7%d9%86/"
  },
  {
    "title": "زعفران",
    "url": "https://noon-valqalam.ir/product-category/saffron/"
  },
  {
    "title": "پسته ها",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/"
  },
  {
    "title": "پسته اکبری",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/pistachio-akbari/"
  },
  {
    "title": "پسته احمد آقایی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/pistachio-ahmad-aghaei/"
  },
  {
    "title": "بادام هندی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/cashew/"
  },
  {
    "title": "بادام زمینی",
    "url": "https://noon-valqalam.ir/product-category/nuts/peanuts/"
  },
  {
    "title": "بادام",
    "url": "https://noon-valqalam.ir/product-category/nuts/almond/"
  },
  {
    "title": "خشکبار و آجیل",
    "url": "https://noon-valqalam.ir/product-category/nuts/"
  },
  {
    "title": "آجیل",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/"
  },
  {
    "title": "شکلات",
    "url": "https://noon-valqalam.ir/product-category/%d8%b4%da%a9%d9%84%d8%a7%d8%aa/"
  },
  {
    "title": "شیرینی",
    "url": "https://noon-valqalam.ir/product-category/sweets/"
  },
  {
    "title": "هایپرمارکت",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/"
  },
  {
    "title": "بهداشت بانوان و آقایان",
    "url": "https://noon-valqalam.ir/product-category//deodorant-spray/women-men-care/"
  },
  {
    "title": "ابزار آرایش و پیرایش",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/hair/hair-cutting-tools/"
  },
  {
    "title": "لوازم آرایشی بهداشتی",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/"
  },
  {
    "title": "بهداشت دهان و دندان",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/personal-care/mouth-teeth/"
  },
  {
    "title": "دئودرانت و ضد تعریق",
    "url": "https://noon-valqalam.ir/product-category//deodorant-spray/"
  },
  {
    "title": "جعبه کادویی زعفران",
    "url": "https://noon-valqalam.ir/product-category/saffron/saffron-gift-pack/"
  },
  {
    "title": "مراقبت و زیبایی مو",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/hair/"
  },
  {
    "title": "پاک کننده و شوینده",
    "url": "https://noon-valqalam.ir/product-category/skincare/cleanser/"
  },
  {
    "title": "زعفران نیم مثقالی",
    "url": "https://noon-valqalam.ir/product-category/saffron/saffron-nim-mesghal/"
  },
  {
    "title": "مراقبت دست و ناخن",
    "url": "https://noon-valqalam.ir/product-category/skincare/hand-nail-treat/"
  },
  {
    "title": "مراقبت چشم و ابرو",
    "url": "https://noon-valqalam.ir/product-category/skincare/eye-care/"
  },
  {
    "title": "آرایش چشم و ابرو",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/eye-makeup/"
  },
  {
    "title": "خوشبو کننده لباس",
    "url": "https://noon-valqalam.ir/product-category/%d8%ae%d9%88%d8%b4%d8%a8%d9%88-%da%a9%d9%86%d9%86%d8%af%d9%87-%d9%84%d8%a8%d8%a7%d8%b3/"
  },
  {
    "title": "زعفران دو مثقالی",
    "url": "https://noon-valqalam.ir/product-category/saffron/saffron-2-mesghal/"
  },
  {
    "title": "زعفران چهار گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/4g-saffron-saffron/"
  },
  {
    "title": "زعفران یک مثقالی",
    "url": "https://noon-valqalam.ir/product-category/saffron/saffron-1-mesghal/"
  },
  {
    "title": "خوشبو کننده هوا",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/perfume/air-freshner/"
  },
  {
    "title": "زعفران نیم گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/%d8%b2%d8%b9%d9%81%d8%b1%d8%a7%d9%86-%d9%86%db%8c%d9%85-%da%af%d8%b1%d9%85%db%8c/"
  },
  {
    "title": "زعفران پنج گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/5g-saffron/"
  },
  {
    "title": "زعفران ده گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/10g-saffron/"
  },
  {
    "title": "زعفران دو گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/2gr-saffron/"
  },
  {
    "title": "زعفران سه گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/4g-saffron/"
  },
  {
    "title": "زعفران یک گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/1g-saffron/"
  },
  {
    "title": "محصولات کادوئی",
    "url": "https://noon-valqalam.ir/product-category/gifts/"
  },
  {
    "title": "پسته کله قوچی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/pistachio-kalleh-ghouchi/"
  },
  {
    "title": "کمربند حرارتی",
    "url": "https://noon-valqalam.ir/product-category/%da%a9%d9%85%d8%b1%d8%a8%d9%86%d8%af-%d8%ad%d8%b1%d8%a7%d8%b1%d8%aa%db%8c/"
  },
  {
    "title": "آجیل مناسبتی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/date-nuts/"
  },
  {
    "title": "دیگر محصولات",
    "url": "https://noon-valqalam.ir/product-category/uncategorized/"
  },
  {
    "title": "مراقبت از مو",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/hair/hair-care/"
  },
  {
    "title": "مغز پسته خام",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/raw-pistachio/"
  },
  {
    "title": "ژله و کارامل",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/jelly-and-caramel/"
  },
  {
    "title": "آجیل ترکیبی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/mixed-nuts/"
  },
  {
    "title": "ابزار آرایش",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/makeup-accessories/"
  },
  {
    "title": "بهداشت شخصی",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/personal-care/"
  },
  {
    "title": "حبه میوه ای",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/fruit-cubes/"
  },
  {
    "title": "زیبایی پوست",
    "url": "https://noon-valqalam.ir/product-category/%d8%b2%db%8c%d8%a8%d8%a7%db%8c%db%8c-%d9%be%d9%88%d8%b3%d8%aa/"
  },
  {
    "title": "عطر و ادکلن",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/perfume/fragrance/"
  },
  {
    "title": "عطر و اسپری",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/perfume/"
  },
  {
    "title": "غلات صبحانه",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/cornflakes/"
  },
  {
    "title": "لوازم اصلاح",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/personal-care/shaving-supplies/"
  },
  {
    "title": "لوازم قنادی",
    "url": "https://noon-valqalam.ir/product-category/confectionery/"
  },
  {
    "title": "مراقبت صورت",
    "url": "https://noon-valqalam.ir/product-category/skincare/face-care/"
  },
  {
    "title": "مراقبت پوست",
    "url": "https://noon-valqalam.ir/product-category/skincare/"
  },
  {
    "title": "مواد شوینده",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/%d9%85%d9%88%d8%a7%d8%af-%d8%b4%d9%88%db%8c%d9%86%d8%af%d9%87/"
  },
  {
    "title": "پسته بادامی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/pistachio-badami/"
  },
  {
    "title": "پودر سوخاری",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/breadcrumbs/"
  },
  {
    "title": "آرایش صورت",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/face-makeup/"
  },
  {
    "title": "آرایش ناخن",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/nail/"
  },
  {
    "title": "بادی اسپلش",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/perfume/bod-splash/"
  },
  {
    "title": "بدن و حمام",
    "url": "https://noon-valqalam.ir/product-category//deodorant-spray/body-bath/"
  },
  {
    "title": "روغن زیتون",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/olive-oil/"
  },
  {
    "title": "لوسیون بدن",
    "url": "https://noon-valqalam.ir/product-category/%d9%84%d9%88%d8%b3%db%8c%d9%88%d9%86-%d8%a8%d8%af%d9%86/"
  },
  {
    "title": "مراقبت بدن",
    "url": "https://noon-valqalam.ir/product-category/skincare/body-care/"
  },
  {
    "title": "وسایل برقی",
    "url": "https://noon-valqalam.ir/product-category/%d9%88%d8%b3%d8%a7%db%8c%d9%84-%d8%a8%d8%b1%d9%82%db%8c/"
  },
  {
    "title": "ویفر شکلات",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/%d9%88%db%8c%d9%81%d8%b1-%d8%b4%da%a9%d9%84%d8%a7%d8%aa/"
  },
  {
    "title": "پودر شکلات",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/%d9%be%d9%88%d8%af%d8%b1-%d8%b4%da%a9%d9%84%d8%a7%d8%aa/"
  },
  {
    "title": "کرم خوراکی",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/edible-cream/"
  },
  {
    "title": "کرم کارامل",
    "url": "https://noon-valqalam.ir/product-category/%da%a9%d8%b1%d9%85-%da%a9%d8%a7%d8%b1%d8%a7%d9%85%d9%84/"
  },
  {
    "title": "اسپری بدن",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/perfume/body-spray/"
  },
  {
    "title": "اسکراب مو",
    "url": "https://noon-valqalam.ir/product-category/%d8%a7%d8%b3%da%a9%d8%b1%d8%a7%d8%a8-%d9%85%d9%88/"
  },
  {
    "title": "انجیر خشک",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/fig/"
  },
  {
    "title": "تراول ماگ",
    "url": "https://noon-valqalam.ir/product-category/%d8%aa%d8%b1%d8%a7%d9%88%d9%84-%d9%85%d8%a7%da%af/"
  },
  {
    "title": "جو و ماجی",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/jo-and-maji/"
  },
  {
    "title": "زیبایی مو",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/hair/hair-makeup/"
  },
  {
    "title": "مراقبت لب",
    "url": "https://noon-valqalam.ir/product-category/skincare/lip-care/"
  },
  {
    "title": "مراقبت پا",
    "url": "https://noon-valqalam.ir/product-category/skincare/feet-care/"
  },
  {
    "title": "پودر شربت",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/syrup-powder/"
  },
  {
    "title": "آرایش لب",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/lip-makeup/"
  },
  {
    "title": "اسمارتیز",
    "url": "https://noon-valqalam.ir/product-category/%d8%a7%d8%b3%d9%85%d8%a7%d8%b1%d8%aa%db%8c%d8%b2/"
  },
  {
    "title": "بیسکوویت",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/biscuit/"
  },
  {
    "title": "ساعت مچی",
    "url": "https://noon-valqalam.ir/product-category/%d8%b3%d8%a7%d8%b9%d8%aa-%d9%85%da%86%db%8c/"
  },
  {
    "title": "ضد آفتاب",
    "url": "https://noon-valqalam.ir/product-category/skincare/sunscreen/"
  },
  {
    "title": "عطر جیبی",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/perfume/pocket-perfume/"
  },
  {
    "title": "قالب موج",
    "url": "https://noon-valqalam.ir/product-category/%d9%82%d8%a7%d9%84%d8%a8-%d9%85%d9%88%d8%ac/"
  },
  {
    "title": "قرص قهوه",
    "url": "https://noon-valqalam.ir/product-category/%d9%82%d8%b1%d8%b5-%d9%82%d9%87%d9%88%d9%87/"
  },
  {
    "title": "میوه خشک",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%85%db%8c%d9%88%d9%87-%d8%ae%d8%b4%da%a9/"
  },
  {
    "title": "پودر ژله",
    "url": "https://noon-valqalam.ir/product-category/%d9%be%d9%88%d8%af%d8%b1-%da%98%d9%84%d9%87/"
  },
  {
    "title": "کافی شاپ",
    "url": "https://noon-valqalam.ir/product-category/cafe/"
  },
  {
    "title": "برگه ها",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/appricot/"
  },
  {
    "title": "سبزیجات",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-herbs/"
  },
  {
    "title": "شیر خشک",
    "url": "https://noon-valqalam.ir/product-category/%d8%b4%db%8c%d8%b1-%d8%ae%d8%b4%da%a9/"
  },
  {
    "title": "عرقیجات",
    "url": "https://noon-valqalam.ir/product-category/%d8%b9%d8%b1%d9%82%db%8c%d8%ac%d8%a7%d8%aa/"
  },
  {
    "title": "نوشیدنی",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/drink/"
  },
  {
    "title": "چای کرک",
    "url": "https://noon-valqalam.ir/product-category/%da%86%d8%a7%db%8c-%da%a9%d8%b1%da%a9/"
  },
  {
    "title": "کرم دست",
    "url": "https://noon-valqalam.ir/product-category/%da%a9%d8%b1%d9%85-%d8%af%d8%b3%d8%aa/"
  },
  {
    "title": "آبنبات",
    "url": "https://noon-valqalam.ir/product-category/%d8%a2%d8%a8%d9%86%d8%a8%d8%a7%d8%aa/"
  },
  {
    "title": "آرایشی",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/"
  },
  {
    "title": "تنقلات",
    "url": "https://noon-valqalam.ir/product-category/snacks/"
  },
  {
    "title": "حبوبات",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%ad%d8%a8%d9%88%d8%a8%d8%a7%d8%aa/"
  },
  {
    "title": "خشکبار",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/"
  },
  {
    "title": "سوغاتی",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/souvenir/"
  },
  {
    "title": "شوینده",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/detergent/"
  },
  {
    "title": "لوسیون",
    "url": "https://noon-valqalam.ir/product-category/%d9%84%d9%88%d8%b3%db%8c%d9%88%d9%86/"
  },
  {
    "title": "کادویی",
    "url": "https://noon-valqalam.ir/product-category/%da%a9%d8%a7%d8%af%d9%88%db%8c%db%8c/"
  },
  {
    "title": "آدامس",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/gum/"
  },
  {
    "title": "ادویه",
    "url": "https://noon-valqalam.ir/product-category/nuts/spices/"
  },
  {
    "title": "دمنوش",
    "url": "https://noon-valqalam.ir/product-category/%d8%af%d9%85%d9%86%d9%88%d8%b4/"
  },
  {
    "title": "رمضان",
    "url": "https://noon-valqalam.ir/product-category/%d8%b1%d9%85%d8%b6%d8%a7%d9%86/"
  },
  {
    "title": "زیتون",
    "url": "https://noon-valqalam.ir/product-category/%d8%b2%db%8c%d8%aa%d9%88%d9%86/"
  },
  {
    "title": "سرلاک",
    "url": "https://noon-valqalam.ir/product-category/%d8%b3%d8%b1%d9%84%d8%a7%da%a9/"
  },
  {
    "title": "سیروپ",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/syrup/"
  },
  {
    "title": "شامپو",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/hair/shampoo/"
  },
  {
    "title": "ضدجوش",
    "url": "https://noon-valqalam.ir/product-category/%d8%b6%d8%af%d8%ac%d9%88%d8%b4/"
  },
  {
    "title": "قنادی",
    "url": "https://noon-valqalam.ir/product-category/%d9%82%d9%86%d8%a7%d8%af%db%8c/"
  },
  {
    "title": "وانیل",
    "url": "https://noon-valqalam.ir/product-category/%d9%88%d8%a7%d9%86%db%8c%d9%84/"
  },
  {
    "title": "کمپوت",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/compote/"
  },
  {
    "title": "ارده",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%a7%d8%b1%d8%af%d9%87/"
  },
  {
    "title": "برنج",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%a8%d8%b1%d9%86%d8%ac/"
  },
  {
    "title": "تخمه",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%aa%d8%ae%d9%85%d9%87/"
  },
  {
    "title": "حلوا",
    "url": "https://noon-valqalam.ir/product-category/%d8%ad%d9%84%d9%88%d8%a7/"
  },
  {
    "title": "خرما",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/dates/"
  },
  {
    "title": "روغن",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/oil/"
  },
  {
    "title": "زرشک",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%b2%d8%b1%d8%b4%da%a9/"
  },
  {
    "title": "شربت",
    "url": "https://noon-valqalam.ir/product-category/%d8%b4%d8%b1%d8%a8%d8%aa/"
  },
  {
    "title": "شلات",
    "url": "https://noon-valqalam.ir/product-category/%d8%b4%d9%84%d8%a7%d8%aa/"
  },
  {
    "title": "فندق",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%81%d9%86%d8%af%d9%82/"
  },
  {
    "title": "میوه",
    "url": "https://noon-valqalam.ir/product-category/%d9%85%db%8c%d9%88%d9%87/"
  },
  {
    "title": "نبات",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%86%d8%a8%d8%a7%d8%aa/"
  },
  {
    "title": "نخود",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%86%d8%ae%d9%88%d8%af/"
  },
  {
    "title": "نودل",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/noodles/"
  },
  {
    "title": "پنیر",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/milk/"
  },
  {
    "title": "چیپس",
    "url": "https://noon-valqalam.ir/product-category/snacks/chips/"
  },
  {
    "title": "کشمش",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/%da%a9%d8%b4%d9%85%d8%b4/"
  },
  {
    "title": "کنجد",
    "url": "https://noon-valqalam.ir/product-category/nuts/%da%a9%d9%86%d8%ac%d8%af/"
  },
  {
    "title": "گردو",
    "url": "https://noon-valqalam.ir/product-category/nuts/%da%af%d8%b1%d8%af%d9%88/"
  },
  {
    "title": "توت",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/berry/"
  },
  {
    "title": "دسر",
    "url": "https://noon-valqalam.ir/product-category/%d8%af%d8%b3%d8%b1/"
  },
  {
    "title": "قند",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%82%d9%86%d8%af/"
  },
  {
    "title": "چای",
    "url": "https://noon-valqalam.ir/product-category/%da%86%d8%a7%db%8c-2/"
  },
  {
    "title": "ژله",
    "url": "https://noon-valqalam.ir/product-category/%da%98%d9%84%d9%87/"
  },
  {
    "title": "کشک",
    "url": "https://noon-valqalam.ir/product-category/nuts/%da%a9%d8%b4%da%a9/"
  },
  {
    "title": "جو",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%ac%d9%88/"
  },
  {
    "title": "سس",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/sauce/"
  },
  {
    "title": "هل",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%87%d9%84/"
  }
];

function normalizePersian(input: string): string {
  return (input || '')
    .toLowerCase()
    .replace(/[ي]/g, 'ی')
    .replace(/[ك]/g, 'ک')
    .replace(/[ة]/g, 'ه')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[‌‌]/g, ' ')
    .replace(/[ًٌٍَُِّْ]/g, '')
    .replace(/[^؀-ۿa-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function chooseInternalCategory(productName: string, briefDescription: string, isNutsOrDriedFruit: boolean): { title: string; url: string } {
  const text = normalizePersian(`${productName} ${briefDescription || ''}`);

  // خروجی لینک همیشه فقط نام خود دسته‌بندی است؛ این کلمات فقط برای تشخیص بهتر دسته‌اند و به عنوان متن لینک استفاده نمی‌شوند.
  const aliases: Array<{ title: string; terms: string[] }> = [
    { title: 'قهوه', terms: ['قهوه', 'کافی میت', 'کافی‌میت', 'کافیمیت', 'coffee mate', 'نسکافه', 'هات چاکلت', 'کاپوچینو', 'لاته', 'کافی میکس', 'کافه میکس', 'کافی'] },
    { title: 'گز', terms: ['گز', 'گز آردی', 'گز لقمه', 'گز پسته', 'گز پسته ای'] },
    { title: 'سوهان', terms: ['سوهان', 'سوهان عسلی', 'سوهان لقمه', 'سوهان گل'] },
    { title: 'زعفران', terms: ['زعفران', 'سفران'] },
    { title: 'پسته ها', terms: ['پسته', 'مغز پسته'] },
    { title: 'بادام هندی', terms: ['بادام هندی', 'کاجو'] },
    { title: 'بادام زمینی', terms: ['بادام زمینی'] },
    { title: 'بادام', terms: ['بادام'] },
    { title: 'آجیل', terms: ['آجیل', 'اجیل', 'مغز', 'مغزها'] },
    { title: 'خشکبار و آجیل', terms: ['خشکبار', 'میوه خشک', 'کشمش', 'انجیر خشک', 'خرما'] },
    { title: 'شکلات', terms: ['شکلات', 'ویفر', 'اسمارتیز'] },
    { title: 'شیرینی', terms: ['شیرینی', 'کیک', 'کلوچه'] },
    { title: 'هایپرمارکت', terms: ['نستله', 'نوشیدنی', 'بیسکویت', 'سس', 'پنیر', 'شیر', 'روغن', 'نودل'] },
  ];

  const byTitle = (title: string) => INTERNAL_CATEGORIES.find(c => c.title === title);
  for (const group of aliases) {
    if (group.terms.some(term => text.includes(normalizePersian(term)))) {
      const found = byTitle(group.title);
      if (found) return found;
    }
  }

  let best: { item: { title: string; url: string }; score: number } | null = null;
  for (const item of INTERNAL_CATEGORIES) {
    const normalizedTitle = normalizePersian(item.title);
    if (!normalizedTitle || normalizedTitle.length < 2) continue;
    let score = 0;
    if (text.includes(normalizedTitle)) score += normalizedTitle.length * 10;
    for (const part of normalizedTitle.split(' ')) {
      if (part.length >= 3 && text.includes(part)) score += part.length;
    }
    if (score > 0 && (!best || score > best.score)) best = { item, score };
  }

  return best?.item || (isNutsOrDriedFruit
    ? (byTitle('خشکبار و آجیل') || INTERNAL_CATEGORIES[0])
    : (byTitle('هایپرمارکت') || INTERNAL_CATEGORIES[0]));
}

function stripCodeFence(input: string): string {
  const trimmed = (input || '').trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) return fenceMatch[1].trim();
  return trimmed;
}

function parseJsonStrict(content: string): any {
  const cleaned = stripCodeFence(content);
  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error('AI response was not valid JSON.');
  }
}

function getSchemaInstruction(): string {
  return `
# ساختار دقیق JSON خروجی
خروجی فقط و فقط باید یک JSON معتبر باشد. هیچ متن، توضیح، markdown یا code fence خارج از JSON ننویس.
فیلدهای اجباری دقیقاً این‌ها هستند:
- correctedProductName: نام فارسی صحیح و کامل محصول
- englishProductName: نام انگلیسی دقیق محصول
- fullDescription: توضیحات کامل محصول با فرمت HTML و دقیقاً مطابق قوانین fullDescription بالا
- shortDescription: یک جمله کوتاه ۲۰ تا ۳۰ کلمه‌ای، بدون bold و بدون HTML اضافی
- seoTitle: عنوان سئو حداکثر ۶۰ کاراکتر شامل کلیدواژه و واژه‌هایی مثل خرید یا قیمت
- slug: نامک انگلیسی تمیز برای URL
- focusKeyword: کلیدواژه کانونی فارسی
- metaDescription: توضیحات متا ۱۲۰ تا ۱۵۵ کاراکتر، بدون bold و بدون HTML
- altImageText: متن جایگزین تصویر حداکثر ۱۰ کلمه
- advancedSeoAnalysis: شامل این فیلدها باشد:
  - keyphraseSynonyms: حداقل ۳ عبارت مرتبط
  - lsiKeywords: کلیدواژه‌های معنایی مرتبط
  - longTailKeywords: ۲ تا ۳ عبارت دم‌بلند
  - semanticEntities: موجودیت‌های معنایی مثل برند، دسته‌بندی و ویژگی‌ها
  - searchIntent: هدف جستجو
  - internalLinkingSuggestions: پیشنهادهای لینک‌سازی داخلی
قانون مهم: fullDescription باید فقط طبق ساختار و قوانین همین پرامپت ساخته شود. برای لینک داخلی همان قانون اصلی را رعایت کن و فقط یک تگ <a> تولید کن.
`;
}

function enforceSingleInternalLink(html: string, category: { title: string; url: string }): string {
  if (!html || typeof html !== 'string') return html;

  let anchorSeen = 0;
  let result = html.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, (_match, inner) => {
    anchorSeen += 1;
    if (anchorSeen === 1) {
      return `<a href="${category.url}">${category.title}</a>`;
    }
    return inner;
  });

  if (anchorSeen === 0) {
    const linkSentence = ` برای مشاهده محصولات مرتبط، <a href="${category.url}">${category.title}</a> را ببینید.`;
    if (/<\/p>/i.test(result)) {
      result = result.replace(/<\/p>/i, `${linkSentence}</p>`);
    } else {
      result += `<p>${linkSentence.trim()}</p>`;
    }
  }

  return result;
}

function buildArvanEndpoint(rawUrl: string): string {
  const base = rawUrl.trim().replace(/\/+$/, '');
  if (/\/chat\/completions$/i.test(base)) return base;
  return `${base}/chat/completions`;
}

function buildArvanAuthorization(rawKey: string): string {
  const key = rawKey.trim();
  return key.toLowerCase().startsWith('apikey ') ? key : `apikey ${key}`;
}

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

    const gatewayUrl = process.env.ARVAN_AI_GATEWAY_URL;
    const arvanApiKey = process.env.ARVAN_API_KEY || process.env.API_KEY;

    if (!gatewayUrl) {
      return res.status(500).json({ message: 'ARVAN_AI_GATEWAY_URL is not configured.' });
    }
    if (!arvanApiKey) {
      return res.status(500).json({ message: 'ARVAN_API_KEY is not configured.' });
    }

    const description_generation_instruction = isNutsOrDriedFruit
      ? nuts_description_prompt
      : standard_description_prompt;
      
    const fullSystemInstruction = `${systemInstruction}\n\n# Rules for 'fullDescription' field:\n${description_generation_instruction}\n\n${getSchemaInstruction()}`;

    const content: ArvanContentPart[] = [];
    
    let userPrompt = `بر اساس اطلاعات زیر، محتوای صفحه محصول را تولید کن:\n- نام محصول: "${productName}"`;
    if (briefDescription) {
        userPrompt += `\n- توضیحات اولیه: "${briefDescription}"`;
    }
    
    if (productImage) {
      content.push({
        type: 'image_url',
        image_url: {
          url: `data:${productImage.mimeType};base64,${productImage.base64}`,
        },
      });
      userPrompt += "\n- از تصویر ارائه شده برای تشخیص نام دقیق فارسی و انگلیسی و جزئیات محصول استفاده کن."
    }

    content.push({ type: 'text', text: userPrompt });

    const arvanResponse = await fetch(buildArvanEndpoint(gatewayUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': buildArvanAuthorization(arvanApiKey),
      },
      body: JSON.stringify({
        model: process.env.ARVAN_MODEL || 'Gemini-2.5-Flash',
        messages: [
          { role: 'system', content: fullSystemInstruction },
          { role: 'user', content },
        ],
        temperature: Number(process.env.ARVAN_TEMPERATURE || 0.35),
        max_tokens: Number(process.env.ARVAN_MAX_TOKENS || 6000),
        response_format: { type: 'json_object' },
      }),
    });

    const arvanData = await arvanResponse.json().catch(() => null);

    if (!arvanResponse.ok) {
      const errorText = arvanData ? JSON.stringify(arvanData) : arvanResponse.statusText;
      throw new Error(`AI Gateway Error: ${errorText}`);
    }

    const messageContent = arvanData?.choices?.[0]?.message?.content;
    const contentText = Array.isArray(messageContent)
      ? messageContent.map((part: any) => part?.text || '').join('\n')
      : String(messageContent || '');

    const generatedData = parseJsonStrict(contentText);

    if (generatedData?.fullDescription) {
      const selectedCategory = chooseInternalCategory(productName, briefDescription || '', Boolean(isNutsOrDriedFruit));
      generatedData.fullDescription = enforceSingleInternalLink(generatedData.fullDescription, selectedCategory);
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(generatedData);

  } catch (error) {
    console.error('Error in Vercel function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    res.status(500).json({ message: `Internal Server Error: ${errorMessage}` });
  }
}

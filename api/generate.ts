import type { ProductData, ImageFile } from '../types';

const Type = {
  OBJECT: 'object',
  ARRAY: 'array',
  STRING: 'string',
} as const;

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


type InternalLink = { title: string; url: string; keywords?: string[] };

const INTERNAL_LINKS: InternalLink[] = [
  {
    "title": "آبنبات",
    "url": "https://noon-valqalam.ir/product-category/%d8%a2%d8%a8%d9%86%d8%a8%d8%a7%d8%aa/"
  },
  {
    "title": "آجیل",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/"
  },
  {
    "title": "آجیل ترکیبی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/mixed-nuts/"
  },
  {
    "title": "آجیل مناسبتی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/date-nuts/"
  },
  {
    "title": "آدامس",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/gum/"
  },
  {
    "title": "آرایش چشم و ابرو",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/eye-makeup/"
  },
  {
    "title": "آرایش صورت",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup/%d8%a2%d8%b1%d8%a7%db%8c%d8%b4-%d8%b5%d9%88%d8%b1%d8%aa/"
  },
  {
    "title": "آرایش لب",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup/%d8%a2%d8%b1%d8%a7%db%8c%d8%b4-%d9%84%d8%a8/"
  },
  {
    "title": "آرایش ناخن",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/nail/"
  },
  {
    "title": "آرایشی",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/"
  },
  {
    "title": "ابزار آرایش",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/makeup-cosmetics-2/makeup-accessories/"
  },
  {
    "title": "ابزار آرایش و پیرایش",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/hair/hair-cutting-tools/"
  },
  {
    "title": "ادویه",
    "url": "https://noon-valqalam.ir/product-category/nuts/spices/"
  },
  {
    "title": "ارده",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%a7%d8%b1%d8%af%d9%87/"
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
    "title": "اسمارتیز",
    "url": "https://noon-valqalam.ir/product-category/%d8%a7%d8%b3%d9%85%d8%a7%d8%b1%d8%aa%db%8c%d8%b2/"
  },
  {
    "title": "انجیر خشک",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/fig/"
  },
  {
    "title": "بادام",
    "url": "https://noon-valqalam.ir/product-category/nuts/almond/"
  },
  {
    "title": "بادام زمینی",
    "url": "https://noon-valqalam.ir/product-category/nuts/peanuts/"
  },
  {
    "title": "بادام هندی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/cashew/"
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
    "title": "برگه ها",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/appricot/"
  },
  {
    "title": "برنج",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%a8%d8%b1%d9%86%d8%ac/"
  },
  {
    "title": "بهداشت بانوان و آقایان",
    "url": "https://noon-valqalam.ir/product-category//deodorant-spray/women-men-care/"
  },
  {
    "title": "بهداشت دهان و دندان",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/personal-care/mouth-teeth/"
  },
  {
    "title": "بهداشت شخصی",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/personal-care/"
  },
  {
    "title": "بیسکوویت",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/biscuit/"
  },
  {
    "title": "پاک کننده و شوینده",
    "url": "https://noon-valqalam.ir/product-category/skincare/cleanser/"
  },
  {
    "title": "پسته احمد آقایی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/pistachio-ahmad-aghaei/"
  },
  {
    "title": "پسته اکبری",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/pistachio-akbari/"
  },
  {
    "title": "پسته بادامی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/pistachio-badami/"
  },
  {
    "title": "پسته کله قوچی",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/pistachio-kalleh-ghouchi/"
  },
  {
    "title": "پسته ها",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/"
  },
  {
    "title": "پنیر",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/cheese/"
  },
  {
    "title": "پودر ژله",
    "url": "https://noon-valqalam.ir/product-category/%d9%be%d9%88%d8%af%d8%b1-%da%98%d9%84%d9%87/"
  },
  {
    "title": "پودر سوخاری",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/breadcrumbs/"
  },
  {
    "title": "پودر شربت",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/syrup-powder/"
  },
  {
    "title": "پودر شکلات",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/%d9%be%d9%88%d8%af%d8%b1-%d8%b4%da%a9%d9%84%d8%a7%d8%aa/"
  },
  {
    "title": "تخمه",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%aa%d8%ae%d9%85%d9%87/"
  },
  {
    "title": "تراول ماگ",
    "url": "https://noon-valqalam.ir/product-category/%d8%aa%d8%b1%d8%a7%d9%88%d9%84-%d9%85%d8%a7%da%af/"
  },
  {
    "title": "تنقلات",
    "url": "https://noon-valqalam.ir/product-category/snacks/"
  },
  {
    "title": "توت",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/berry/"
  },
  {
    "title": "جعبه کادویی زعفران",
    "url": "https://noon-valqalam.ir/product-category/saffron/saffron-gift-pack/"
  },
  {
    "title": "جو",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%ac%d9%88/"
  },
  {
    "title": "جو و ماجی",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/jo-and-maji/"
  },
  {
    "title": "چای",
    "url": "https://noon-valqalam.ir/product-category/%da%86%d8%a7%db%8c-2/"
  },
  {
    "title": "چای کرک",
    "url": "https://noon-valqalam.ir/product-category/%da%86%d8%a7%db%8c-%da%a9%d8%b1%da%a9/"
  },
  {
    "title": "چیپس",
    "url": "https://noon-valqalam.ir/product-category/snacks/chips/"
  },
  {
    "title": "حبه میوه ای",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/fruit-cubes/"
  },
  {
    "title": "حبوبات",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%ad%d8%a8%d9%88%d8%a8%d8%a7%d8%aa/"
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
    "title": "خشکبار",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/"
  },
  {
    "title": "خشکبار و آجیل",
    "url": "https://noon-valqalam.ir/product-category/nuts/"
  },
  {
    "title": "خوشبو کننده لباس",
    "url": "https://noon-valqalam.ir/product-category/%d8%ae%d9%88%d8%b4%d8%a8%d9%88-%da%a9%d9%86%d9%86%d8%af%d9%87-%d9%84%d8%a8%d8%a7%d8%b3/"
  },
  {
    "title": "خوشبو کننده هوا",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/perfume/air-freshner/"
  },
  {
    "title": "دئودرانت و ضد تعریق",
    "url": "https://noon-valqalam.ir/product-category//deodorant-spray/"
  },
  {
    "title": "دسر",
    "url": "https://noon-valqalam.ir/product-category/%d8%af%d8%b3%d8%b1/"
  },
  {
    "title": "دمنوش",
    "url": "https://noon-valqalam.ir/product-category/%d8%af%d9%85%d9%86%d9%88%d8%b4/"
  },
  {
    "title": "دیگر محصولات",
    "url": "https://noon-valqalam.ir/product-category/uncategorized/"
  },
  {
    "title": "رمضان",
    "url": "https://noon-valqalam.ir/product-category/%d8%b1%d9%85%d8%b6%d8%a7%d9%86/"
  },
  {
    "title": "روغن",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/oil/"
  },
  {
    "title": "روغن زیتون",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/olive-oil/"
  },
  {
    "title": "زرشک",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d8%b2%d8%b1%d8%b4%da%a9/"
  },
  {
    "title": "زعفران",
    "url": "https://noon-valqalam.ir/product-category/saffron/"
  },
  {
    "title": "زعفران پنج گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/5g-saffron/"
  },
  {
    "title": "زعفران چهار گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/4g-saffron-saffron/"
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
    "title": "زعفران دو مثقالی",
    "url": "https://noon-valqalam.ir/product-category/saffron/saffron-2-mesghal/"
  },
  {
    "title": "زعفران سه گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/4g-saffron/"
  },
  {
    "title": "زعفران نیم گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/%d8%b2%d8%b9%d9%81%d8%b1%d8%a7%d9%86-%d9%86%db%8c%d9%85-%da%af%d8%b1%d9%85%db%8c/"
  },
  {
    "title": "زعفران نیم مثقالی",
    "url": "https://noon-valqalam.ir/product-category/saffron/saffron-nim-mesghal/"
  },
  {
    "title": "زعفران یک گرمی",
    "url": "https://noon-valqalam.ir/product-category/saffron/1g-saffron/"
  },
  {
    "title": "زعفران یک مثقالی",
    "url": "https://noon-valqalam.ir/product-category/saffron/saffron-1-mesghal/"
  },
  {
    "title": "زیبایی پوست",
    "url": "https://noon-valqalam.ir/product-category/%d8%b2%db%8c%d8%a8%d8%a7%db%8c%db%8c-%d9%be%d9%88%d8%b3%d8%aa/"
  },
  {
    "title": "زیبایی مو",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/hair/hair-makeup/"
  },
  {
    "title": "زیتون",
    "url": "https://noon-valqalam.ir/product-category/%d8%b2%db%8c%d8%aa%d9%88%d9%86/"
  },
  {
    "title": "ژله",
    "url": "https://noon-valqalam.ir/product-category/%da%98%d9%84%d9%87/"
  },
  {
    "title": "ژله و کارامل",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/jelly-and-caramel/"
  },
  {
    "title": "ساعت مچی",
    "url": "https://noon-valqalam.ir/product-category/%d8%b3%d8%a7%d8%b9%d8%aa-%d9%85%da%86%db%8c/"
  },
  {
    "title": "سبزیجات",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-herbs/"
  },
  {
    "title": "سرلاک",
    "url": "https://noon-valqalam.ir/product-category/%d8%b3%d8%b1%d9%84%d8%a7%da%a9/"
  },
  {
    "title": "سس",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/sauce/"
  },
  {
    "title": "سوغاتی",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/souvenir/"
  },
  {
    "title": "سوهان",
    "url": "https://noon-valqalam.ir/product-category/%d8%b3%d9%88%d9%87%d8%a7%d9%86/"
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
    "title": "شربت",
    "url": "https://noon-valqalam.ir/product-category/%d8%b4%d8%b1%d8%a8%d8%aa/"
  },
  {
    "title": "شکلات",
    "url": "https://noon-valqalam.ir/product-category/%d8%b4%da%a9%d9%84%d8%a7%d8%aa/"
  },
  {
    "title": "شلات",
    "url": "https://noon-valqalam.ir/product-category/%d8%b4%d9%84%d8%a7%d8%aa/"
  },
  {
    "title": "شوینده",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/detergent/"
  },
  {
    "title": "شیر خشک",
    "url": "https://noon-valqalam.ir/product-category/%d8%b4%db%8c%d8%b1-%d8%ae%d8%b4%da%a9/"
  },
  {
    "title": "شیرینی",
    "url": "https://noon-valqalam.ir/product-category/sweets/"
  },
  {
    "title": "ضد آفتاب",
    "url": "https://noon-valqalam.ir/product-category/skincare/sunscreen/"
  },
  {
    "title": "ضدجوش",
    "url": "https://noon-valqalam.ir/product-category/%d8%b6%d8%af%d8%ac%d9%88%d8%b4/"
  },
  {
    "title": "عرقیجات",
    "url": "https://noon-valqalam.ir/product-category/%d8%b9%d8%b1%d9%82%db%8c%d8%ac%d8%a7%d8%aa/"
  },
  {
    "title": "عطر جیبی",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/perfume/pocket-perfume/"
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
    "title": "فندق",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%81%d9%86%d8%af%d9%82/"
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
    "title": "قنادی",
    "url": "https://noon-valqalam.ir/product-category/%d9%82%d9%86%d8%a7%d8%af%db%8c/"
  },
  {
    "title": "قند",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%82%d9%86%d8%af/"
  },
  {
    "title": "قهوه",
    "url": "https://noon-valqalam.ir/product-category/coffee/"
  },
  {
    "title": "قهوه فوری",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/instant-coffee/"
  },
  {
    "title": "کادویی",
    "url": "https://noon-valqalam.ir/product-category/%da%a9%d8%a7%d8%af%d9%88%db%8c%db%8c/"
  },
  {
    "title": "کافی شاپ",
    "url": "https://noon-valqalam.ir/product-category/cafe/"
  },
  {
    "title": "کرم خوراکی",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/edible-cream/"
  },
  {
    "title": "کرم دست",
    "url": "https://noon-valqalam.ir/product-category/%da%a9%d8%b1%d9%85-%d8%af%d8%b3%d8%aa/"
  },
  {
    "title": "کرم کارامل",
    "url": "https://noon-valqalam.ir/product-category/%da%a9%d8%b1%d9%85-%da%a9%d8%a7%d8%b1%d8%a7%d9%85%d9%84/"
  },
  {
    "title": "کشک",
    "url": "https://noon-valqalam.ir/product-category/nuts/%da%a9%d8%b4%da%a9/"
  },
  {
    "title": "کشمش",
    "url": "https://noon-valqalam.ir/product-category/nuts/dried-fruits/%da%a9%d8%b4%d9%85%d8%b4/"
  },
  {
    "title": "کمپوت",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/compote/"
  },
  {
    "title": "کمربند حرارتی",
    "url": "https://noon-valqalam.ir/product-category/%da%a9%d9%85%d8%b1%d8%a8%d9%86%d8%af-%d8%ad%d8%b1%d8%a7%d8%b1%d8%aa%db%8c/"
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
    "title": "گز",
    "url": "https://noon-valqalam.ir/product-category/%da%af%d8%b2/"
  },
  {
    "title": "لوازم آرایشی بهداشتی",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/"
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
    "title": "لوسیون",
    "url": "https://noon-valqalam.ir/product-category/%d9%84%d9%88%d8%b3%db%8c%d9%88%d9%86/"
  },
  {
    "title": "لوسیون بدن",
    "url": "https://noon-valqalam.ir/product-category/%d9%84%d9%88%d8%b3%db%8c%d9%88%d9%86-%d8%a8%d8%af%d9%86/"
  },
  {
    "title": "محصولات کادوئی",
    "url": "https://noon-valqalam.ir/product-category/gifts/"
  },
  {
    "title": "مراقبت از مو",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/hair/hair-care/"
  },
  {
    "title": "مراقبت بدن",
    "url": "https://noon-valqalam.ir/product-category/skincare/body-care/"
  },
  {
    "title": "مراقبت پا",
    "url": "https://noon-valqalam.ir/product-category/skincare/feet-care/"
  },
  {
    "title": "مراقبت پوست",
    "url": "https://noon-valqalam.ir/product-category/skincare/"
  },
  {
    "title": "مراقبت چشم و ابرو",
    "url": "https://noon-valqalam.ir/product-category/skincare/eye-care/"
  },
  {
    "title": "مراقبت دست و ناخن",
    "url": "https://noon-valqalam.ir/product-category/skincare/hand-nail-treat/"
  },
  {
    "title": "مراقبت صورت",
    "url": "https://noon-valqalam.ir/product-category/skincare/face-care/"
  },
  {
    "title": "مراقبت لب",
    "url": "https://noon-valqalam.ir/product-category/skincare/lip-care/"
  },
  {
    "title": "مراقبت و زیبایی مو",
    "url": "https://noon-valqalam.ir/product-category/cosmetics/hair/"
  },
  {
    "title": "مغز پسته خام",
    "url": "https://noon-valqalam.ir/product-category/nuts/nut/pistachios/raw-pistachio/"
  },
  {
    "title": "مواد شوینده",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/%d9%85%d9%88%d8%a7%d8%af-%d8%b4%d9%88%db%8c%d9%86%d8%af%d9%87/"
  },
  {
    "title": "میوه",
    "url": "https://noon-valqalam.ir/product-category/%d9%85%db%8c%d9%88%d9%87/"
  },
  {
    "title": "میوه خشک",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%85%db%8c%d9%88%d9%87-%d8%ae%d8%b4%da%a9/"
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
    "title": "نسکافه",
    "url": "https://noon-valqalam.ir/product-category/%d9%86%d8%b3%da%a9%d8%a7%d9%81%d9%87/"
  },
  {
    "title": "نودل",
    "url": "https://noon-valqalam.ir/product-category/%d9%86%d9%88%d8%af%d9%84/"
  },
  {
    "title": "نوشیدنی",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/drink/"
  },
  {
    "title": "هات چاکلت",
    "url": "https://noon-valqalam.ir/product-category/%d9%87%d8%a7%d8%aa-%da%86%d8%a7%da%a9%d9%84%d8%aa/"
  },
  {
    "title": "هایپرمارکت",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/"
  },
  {
    "title": "هل",
    "url": "https://noon-valqalam.ir/product-category/nuts/%d9%87%d9%84/"
  },
  {
    "title": "وانیل",
    "url": "https://noon-valqalam.ir/product-category/%d9%88%d8%a7%d9%86%db%8c%d9%84/"
  },
  {
    "title": "وسایل برقی",
    "url": "https://noon-valqalam.ir/product-category/%d9%88%d8%b3%d8%a7%db%8c%d9%84-%d8%a8%d8%b1%d9%82%db%8c/"
  },
  {
    "title": "ویفر شکلات",
    "url": "https://noon-valqalam.ir/product-category/hypermarket/%d9%88%db%8c%d9%81%d8%b1-%d8%b4%da%a9%d9%84%d8%a7%d8%aa/"
  }
];

const INTERNAL_LINK_KEYWORDS: Record<string, string[]> = {
  'قهوه': ['قهوه', 'کافی', 'کافی میت', 'نسکافه', 'کریمر', 'کاپوچینو', 'لاته', 'اسپرسو', 'coffee', 'cafe', 'کافه'],
  'قهوه فوری': ['قهوه فوری', 'نسکافه فوری', 'کافی میکس', 'کافی میت', 'کاپوچینو فوری'],
  'کافی شاپ': ['کافی شاپ', 'کافه', 'شربت سرد', 'سیروپ', 'هات چاکلت'],
  'هات چاکلت': ['هات چاکلت', 'شکلات داغ'],
  'شکلات': ['شکلات', 'کاکائو', 'تلخ', 'شیری', 'ویفر شکلات'],
  'سوهان': ['سوهان', 'ساعدی نیا', 'بوستان', 'سوهان عسلی', 'سوهان لقمه'],
  'گز': ['گز', 'آردی', 'لقمه ای', 'نوقا', 'پسته ای'],
  'قند': ['قند', 'کله قند', 'شکسته'],
  'زعفران': ['زعفران', 'سرگل', 'نگین', 'مثقال'],
  'پسته ها': ['پسته', 'مغز پسته', 'پسته خام', 'پسته شور'],
  'مغز پسته خام': ['مغز پسته خام', 'مغز پسته'],
  'بادام': ['بادام', 'مغز بادام'],
  'بادام هندی': ['بادام هندی', 'کاجو', 'cashew'],
  'فندق': ['فندق', 'مغز فندق'],
  'گردو': ['گردو', 'مغز گردو'],
  'آجیل': ['آجیل', 'مغز', 'مغزها'],
  'آجیل ترکیبی': ['آجیل مخلوط', 'آجیل ترکیبی', 'چهار مغز'],
  'خشکبار': ['خشکبار', 'میوه خشک', 'برگه', 'کشمش', 'توت خشک', 'انجیر خشک'],
  'میوه خشک': ['میوه خشک', 'حبه میوه', 'برگه'],
  'ادویه': ['ادویه', 'فلفل', 'زردچوبه', 'دارچین', 'چاشنی'],
  'چای': ['چای', 'تی بگ', 'چای سیاه'],
  'چای کرک': ['چای کرک', 'کرک'],
  'دمنوش': ['دمنوش', 'گیاهی'],
  'نبات': ['نبات', 'شاخه نبات'],
  'نوشیدنی': ['نوشیدنی', 'آبمیوه', 'دلستر', 'انرژی زا'],
  'بیسکویت': ['بیسکویت', 'کوکی'],
  'تنقلات': ['تنقلات', 'اسنک', 'پفک', 'چیپس'],
  'چیپس': ['چیپس'],
  'لوازم آرایشی بهداشتی': ['آرایشی', 'بهداشتی', 'میکاپ', 'لوازم آرایش'],
  'مراقبت پوست': ['کرم', 'سرم', 'مراقبت پوست', 'پوست', 'آبرسان', 'مرطوب کننده'],
  'ضد آفتاب': ['ضد آفتاب', 'سان اسکرین', 'sunscreen'],
  'شامپو': ['شامپو'],
  'عطر و ادکلن': ['عطر', 'ادکلن', 'پرفیوم', 'fragrance'],
  'شوینده': ['شوینده', 'مایع ظرفشویی', 'پودر لباسشویی', 'جرم گیر'],
  'هایپرمارکت': ['هایپرمارکت', 'سوپرمارکت'],
  'شیرینی': ['شیرینی', 'کیک', 'کلوچه'],
  'قنادی': ['قنادی', 'لوازم قنادی'],
};

const normalizePersian = (value: string = ''): string =>
  value
    .toLowerCase()
    .replace(/[ك]/g, 'ک')
    .replace(/[ي]/g, 'ی')
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const selectInternalLink = (data: Partial<ProductData>, productName: string, briefDescription: string): InternalLink => {
  const sourceText = normalizePersian([
    productName,
    briefDescription,
    data.correctedProductName,
    data.englishProductName,
    data.focusKeyword,
    data.seoTitle,
    data.metaDescription,
    ...(data.advancedSeoAnalysis?.semanticEntities || []),
    ...(data.advancedSeoAnalysis?.lsiKeywords || []),
  ].filter(Boolean).join(' '));

  let best = INTERNAL_LINKS.find(link => link.title === 'هایپرمارکت') || INTERNAL_LINKS[0];
  let bestScore = -1;

  for (const link of INTERNAL_LINKS) {
    const title = normalizePersian(link.title);
    const words = title.split(' ').filter(word => word.length > 2);
    let score = 0;

    if (title && sourceText.includes(title)) score += 120 + title.length;

    for (const word of words) {
      if (sourceText.includes(word)) score += 12 + word.length;
    }

    const aliases = INTERNAL_LINK_KEYWORDS[link.title] || [];
    for (const alias of aliases) {
      const normalizedAlias = normalizePersian(alias);
      if (normalizedAlias && sourceText.includes(normalizedAlias)) score += 90 + normalizedAlias.length;
    }

    if (score > bestScore) {
      bestScore = score;
      best = link;
    }
  }

  return best;
};

const stripHtmlTags = (html: string): string => html.replace(/<[^>]*>/g, '').trim();
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const replaceOrInsertSingleInternalLink = (html: string, link: InternalLink, data: Partial<ProductData>): string => {
  if (!html || typeof html !== 'string') return html;
  const anchorRegex = /<a[^>]*>([\s\S]*?)<\/a>/gi;
  const matches = [...html.matchAll(anchorRegex)];

  if (matches.length > 0) {
    let usedFirst = false;
    return html.replace(anchorRegex, (_match, innerText) => {
      const cleanText = stripHtmlTags(innerText || '') || link.title;
      if (!usedFirst) {
        usedFirst = true;
        return `<a href="${link.url}">${cleanText}</a>`;
      }
      return cleanText;
    });
  }

  const candidateTexts = [
    link.title,
    data.focusKeyword,
    data.correctedProductName,
    data.seoTitle,
  ].filter((item): item is string => Boolean(item && item.trim().length > 2));

  for (const text of candidateTexts) {
    const escaped = escapeRegExp(text);
    const regex = new RegExp(`(${escaped})`, 'i');
    if (regex.test(html)) {
      return html.replace(regex, `<a href="${link.url}">$1</a>`);
    }
  }

  return html.replace(/<\/p>/i, ` برای مشاهده محصولات مرتبط، <a href="${link.url}">${link.title}</a> را ببینید.</p>`);
};

const buildJsonInstruction = (): string => `
# ساختار خروجی JSON الزامی
فقط و فقط یک JSON معتبر برگردان. هیچ متن، توضیح، Markdown یا کد بلاک خارج از JSON ننویس.
کلیدهای JSON باید دقیقاً این‌ها باشند و هیچ کلید اصلی حذف نشود:
- correctedProductName: string
- englishProductName: string
- fullDescription: string HTML
- shortDescription: string
- seoTitle: string
- slug: string انگلیسی
- focusKeyword: string فارسی
- metaDescription: string
- altImageText: string
- advancedSeoAnalysis: object شامل keyphraseSynonyms, lsiKeywords, longTailKeywords, semanticEntities, searchIntent, internalLinkingSuggestions

قانون مهم: fullDescription باید دقیقاً طبق قوانین و ساختار بخش زیر ساخته شود. ساختار، تیترها، ترتیب بخش‌ها، تگ‌های HTML، hr و ul/li را تغییر نده.
`;

const extractTextFromGatewayResponse = (payload: any): string => {
  const messageContent = payload?.choices?.[0]?.message?.content;
  if (typeof messageContent === 'string') return messageContent;
  if (Array.isArray(messageContent)) {
    return messageContent
      .map((part: any) => typeof part === 'string' ? part : (part?.text || part?.content || ''))
      .join('');
  }
  if (typeof payload?.output_text === 'string') return payload.output_text;
  if (typeof payload?.text === 'string') return payload.text;
  return '';
};

const parseModelJson = (rawText: string): ProductData => {
  const cleaned = rawText
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error('AI response was not valid JSON.');
  }
};

const getArvanAuthorizationHeader = (): string => {
  const rawKey = (process.env.ARVAN_API_KEY || process.env.API_KEY || '').trim();
  if (!rawKey) throw new Error('ARVAN_API_KEY is not configured in Vercel Environment Variables.');
  if (/^(apikey|bearer)\s+/i.test(rawKey)) return rawKey;
  return `apikey ${rawKey}`;
};


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

    const description_generation_instruction = isNutsOrDriedFruit
      ? nuts_description_prompt
      : standard_description_prompt;
      
    const fullSystemInstruction = `${systemInstruction}
${buildJsonInstruction()}

# Rules for 'fullDescription' field:
${description_generation_instruction}`;

    let userPrompt = `بر اساس اطلاعات زیر، محتوای صفحه محصول را تولید کن:
- نام محصول: "${productName}"`;
    if (briefDescription) {
        userPrompt += `
- توضیحات اولیه: "${briefDescription}"`;
    }
    
    const userContent: any[] = [{ type: 'text', text: userPrompt }];

    if (productImage) {
      userPrompt += "\n- از تصویر ارائه شده برای تشخیص نام دقیق فارسی و انگلیسی و جزئیات محصول استفاده کن.";
      userContent[0].text = userPrompt;
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${productImage.mimeType};base64,${productImage.base64}`,
        },
      });
    }

    const gatewayUrl = (process.env.ARVAN_AI_GATEWAY_URL || '').trim().replace(/\/+$/, '');
    if (!gatewayUrl) {
      throw new Error('ARVAN_AI_GATEWAY_URL is not configured in Vercel Environment Variables.');
    }

    const gatewayResponse = await fetch(`${gatewayUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getArvanAuthorizationHeader(),
      },
      body: JSON.stringify({
        model: process.env.ARVAN_MODEL || 'Gemini-2.5-Flash',
        messages: [
          { role: 'system', content: fullSystemInstruction },
          { role: 'user', content: userContent },
        ],
        temperature: Number(process.env.ARVAN_TEMPERATURE || '0.5'),
        max_tokens: Number(process.env.ARVAN_MAX_TOKENS || '6000'),
        response_format: { type: 'json_object' },
      }),
    });

    const gatewayPayload = await gatewayResponse.json().catch(() => null);
    if (!gatewayResponse.ok) {
      throw new Error(`AI Gateway Error: ${JSON.stringify(gatewayPayload || { status: gatewayResponse.status, statusText: gatewayResponse.statusText })}`);
    }

    const rawText = extractTextFromGatewayResponse(gatewayPayload);
    if (!rawText) {
      throw new Error('AI Gateway returned an empty response.');
    }

    const generatedData = parseModelJson(rawText);
    const internalLink = selectInternalLink(generatedData, productName, briefDescription || '');
    generatedData.fullDescription = replaceOrInsertSingleInternalLink(generatedData.fullDescription, internalLink, generatedData);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(generatedData);

  } catch (error) {
    console.error('Error in Vercel function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    res.status(500).json({ message: `Internal Server Error: ${errorMessage}` });
  }
}
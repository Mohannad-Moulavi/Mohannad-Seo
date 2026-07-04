import type { ImageFile } from '../types';

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
- **لینک‌سازی داخلی:** لینک داخلی توسط سیستم پس از تولید متن اضافه می‌شود. در متن هیچ تگ `<a>`، هیچ `href="#"` و هیچ جمله‌ای مانند «برای مشاهده محصولات مرتبط»، «کلیک کنید» یا پیشنهاد لینک داخلی ننویس.

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
- **لینک‌سازی داخلی:** لینک داخلی توسط سیستم پس از تولید متن اضافه می‌شود. در متن هیچ تگ `<a>`، هیچ `href="#"` و هیچ جمله‌ای مانند «برای مشاهده محصولات مرتبط»، «کلیک کنید» یا پیشنهاد لینک داخلی ننویس.

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


type ArvanContentPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };

type InternalCategory = {
  title: string;
  url: string;
  keywords: string[];
  group: 'beauty' | 'food' | 'other';
  priority: number;
};

const SITE_ORIGIN = 'https://noon-valqalam.ir';

const categoryUrl = (path: string): string => {
  const cleanPath = String(path || '').trim().replace(/^\/+/, '').replace(/\/{2,}/g, '/');
  return `${SITE_ORIGIN}/${cleanPath}${cleanPath.endsWith('/') ? '' : '/'}`;
};

const INTERNAL_CATEGORIES: InternalCategory[] = [
  {
    title: 'شامپو',
    url: categoryUrl('product-category/cosmetics/hair/shampoo/'),
    group: 'beauty',
    priority: 120,
    keywords: [
      'شامپو', 'شامپو مو', 'شامپو سر', 'شامپو بدن', 'شامپو ضد شوره', 'ضد شوره', 'شوره',
      'shampoo', 'anti dandruff', 'clear shampoo'
    ]
  },
  {
    title: 'مراقبت از مو',
    url: categoryUrl('product-category/cosmetics/hair/hair-care/'),
    group: 'beauty',
    priority: 100,
    keywords: [
      'نرم کننده مو', 'نرم‌کننده مو', 'ماسک مو', 'اسکراب مو', 'سرم مو', 'روغن مو', 'تونیک مو',
      'حالت دهنده مو', 'حالت‌دهنده مو', 'ژل مو', 'واکس مو', 'اسپری مو', 'کراتین',
      'مراقبت مو', 'مراقبت از مو', 'conditioner', 'hair mask', 'hair serum', 'hair oil', 'hair care'
    ]
  },
  {
    title: 'زیبایی مو',
    url: categoryUrl('product-category/cosmetics/hair/hair-makeup/'),
    group: 'beauty',
    priority: 98,
    keywords: [
      'رنگ مو', 'اکسیدان', 'دکلره', 'زیبایی مو', 'hair color', 'hair dye'
    ]
  },
  {
    title: 'عطر و اسپری',
    url: categoryUrl('product-category/cosmetics/perfume/'),
    group: 'beauty',
    priority: 95,
    keywords: [
      'عطر', 'ادکلن', 'ادوپرفیوم', 'ادو پرفیوم', 'ادوتویلت', 'ادو تویلت', 'پرفیوم', 'فرگرنس',
      'عطر جیبی', 'اسپری خوشبو کننده بدن', 'خوشبو کننده بدن', 'perfume', 'fragrance', 'cologne', 'eau de parfum', 'eau de toilette'
    ]
  },
  {
    title: 'مراقبت پوست',
    url: categoryUrl('product-category/skincare/'),
    group: 'beauty',
    priority: 90,
    keywords: [
      'پوست', 'مراقبت پوست', 'ضد آفتاب', 'ضدآفتاب', 'ضدجوش', 'جوش', 'آبرسان', 'مرطوب کننده',
      'مرطوب‌کننده', 'کرم صورت', 'کرم دور چشم', 'دور چشم', 'تونر', 'میسلار', 'پاک کننده صورت',
      'پاک‌کننده صورت', 'شیر پاک کن', 'شیرپاک کن', 'شیرپاک‌کن', 'پاک کن آرایش', 'پاک‌کن آرایش', 'شوینده صورت', 'ژل شستشو', 'فوم شستشو', 'سرم صورت', 'ماسک صورت', 'لوسیون',
      'اسکراب صورت', 'کرم دست', 'skincare', 'skin care', 'sunscreen', 'acne', 'moisturizer', 'cleanser', 'toner', 'serum'
    ]
  },
  {
    title: 'لوازم آرایشی بهداشتی',
    url: categoryUrl('product-category/cosmetics/'),
    group: 'beauty',
    priority: 80,
    keywords: [
      'دئودرانت', 'دئودورانت', 'ضد تعریق', 'ضدتعریق', 'مام', 'رول ضد تعریق', 'اسپری بدن',
      'بادی اسپلش', 'خوشبو کننده', 'خوشبوکننده', 'بهداشت شخصی', 'بهداشتی', 'لوازم بهداشتی',
      'رژ', 'رژلب', 'رژ لب', 'ریمل', 'خط چشم', 'مداد چشم', 'ابرو', 'آرایش', 'کرم پودر',
      'پنکک', 'کانسیلر', 'لاک', 'ناخن', 'لوازم آرایشی', 'makeup', 'cosmetic', 'cosmetics',
      'deodorant', 'antiperspirant', 'body spray', 'body splash'
    ]
  },
  {
    title: 'گز',
    url: categoryUrl('product-category/%da%af%d8%b2/'),
    group: 'food',
    priority: 75,
    keywords: ['گز']
  },
  {
    title: 'سوهان',
    url: categoryUrl('product-category/%d8%b3%d9%88%d9%87%d8%a7%d9%86/'),
    group: 'food',
    priority: 75,
    keywords: ['سوهان']
  },
  {
    title: 'زعفران',
    url: categoryUrl('product-category/saffron/'),
    group: 'food',
    priority: 75,
    keywords: ['زعفران', 'saffron']
  },
  {
    title: 'قهوه',
    url: categoryUrl('product-category/coffee/'),
    group: 'food',
    priority: 75,
    keywords: ['قهوه', 'نسکافه', 'کافی میت', 'کافی‌میت', 'کاپوچینو', 'لاته', 'هات چاکلت', 'موکا', 'اسپرسو', 'coffee', 'nescafe', 'coffee mate', 'cappuccino', 'latte', 'hot chocolate', 'espresso']
  },
  {
    title: 'شیرینی',
    url: categoryUrl('product-category/sweets/'),
    group: 'food',
    priority: 70,
    keywords: ['شیرینی', 'کیک', 'کلوچه', 'کوکی', 'باقلوا', 'sweet', 'cake', 'cookie']
  },
  {
    title: 'لوازم قنادی',
    url: categoryUrl('product-category/confectionery/'),
    group: 'food',
    priority: 65,
    keywords: ['لوازم قنادی', 'قالب', 'وانیل', 'پودر ژله', 'ژله', 'کرم کارامل', 'پودر کیک', 'خامه قنادی']
  },
  {
    title: 'خشکبار و آجیل',
    url: categoryUrl('product-category/nuts/'),
    group: 'food',
    priority: 85,
    keywords: ['آجیل', 'خشکبار', 'پسته', 'بادام', 'گردو', 'فندق', 'تخمه', 'بادام هندی', 'بادام زمینی', 'کشمش', 'خرما', 'انجیر خشک', 'میوه خشک', 'نبات', 'قند', 'ارده', 'کنجد', 'کشک', 'حبوبات', 'ادویه', 'زرشک', 'هل']
  },
  {
    title: 'پنیر',
    url: categoryUrl('product-category/hypermarket/cheese/'),
    group: 'food',
    priority: 90,
    keywords: ['پنیر', 'cheese']
  },
  {
    title: 'شکلات',
    url: categoryUrl('product-category/%d8%b4%da%a9%d9%84%d8%a7%d8%aa/'),
    group: 'food',
    priority: 90,
    keywords: ['شکلات', 'chocolate']
  },
  {
    title: 'چیپس',
    url: categoryUrl('product-category/snacks/chips/'),
    group: 'food',
    priority: 85,
    keywords: ['چیپس', 'chips']
  },
  {
    title: 'بیسکویت',
    url: categoryUrl('product-category/hypermarket/biscuit/'),
    group: 'food',
    priority: 85,
    keywords: ['بیسکویت', 'بیسکوویت', 'biscuit', 'biscuits']
  },
  {
    title: 'نوشیدنی',
    url: categoryUrl('product-category/hypermarket/drink/'),
    group: 'food',
    priority: 85,
    keywords: ['نوشیدنی', 'آبمیوه', 'نوشابه', 'ماءالشعیر', 'انرژی زا', 'انرژی‌زا', 'drink', 'beverage']
  },
  {
    title: 'نودل',
    url: categoryUrl('product-category/hypermarket/noodles/'),
    group: 'food',
    priority: 85,
    keywords: ['نودل', 'noodle', 'noodles']
  },
  {
    title: 'سس',
    url: categoryUrl('product-category/hypermarket/sauce/'),
    group: 'food',
    priority: 80,
    keywords: ['سس', 'sauce']
  },
  {
    title: 'روغن',
    url: categoryUrl('product-category/hypermarket/oil/'),
    group: 'food',
    priority: 80,
    keywords: ['روغن خوراکی', 'روغن مایع', 'روغن سرخ کردنی', 'edible oil', 'cooking oil']
  },
];

const HYPERMARKET_FALLBACK_CATEGORY: InternalCategory = {
  title: 'هایپرمارکت',
  url: categoryUrl('product-category/hypermarket/'),
  group: 'food',
  priority: 10,
  keywords: []
};

const BEAUTY_FALLBACK_CATEGORY_TITLE = 'لوازم آرایشی بهداشتی';

const getCategory = (title: string): InternalCategory => {
  if (title === HYPERMARKET_FALLBACK_CATEGORY.title) return HYPERMARKET_FALLBACK_CATEGORY;
  return INTERNAL_CATEGORIES.find(item => item.title === title)!;
};

const normalizeText = (value: unknown): string => String(value || '')
  .toLowerCase()
  .replace(/[ي]/g, 'ی')
  .replace(/[ك]/g, 'ک')
  .replace(/[أإآ]/g, 'ا')
  .replace(/[‌\u200c]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeUrl = (url: string): string => {
  const trimmed = String(url || '').trim();
  try {
    const parsed = new URL(trimmed);
    parsed.protocol = 'https:';
    parsed.hostname = 'noon-valqalam.ir';
    parsed.pathname = parsed.pathname.replace(/\/{2,}/g, '/');
    if (!parsed.pathname.endsWith('/')) parsed.pathname += '/';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return trimmed.replace(/([^:])\/{2,}/g, '$1/');
  }
};

const countKeywordMatches = (text: string, keywords: string[]): number => {
  return keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) return score;
    if (text.includes(normalizedKeyword)) return score + Math.max(1, normalizedKeyword.split(' ').length);
    return score;
  }, 0);
};

const hasBeautySignal = (text: string): boolean => {
  const beautySignals = [
    'شامپو', 'شامپو مو', 'شامپو بدن', 'ضد شوره', 'ماسک مو', 'سرم مو', 'نرم کننده مو', 'نرم‌کننده مو',
    'رنگ مو', 'اکسیدان', 'دکلره', 'کراتین', 'پوست', 'کرم صورت', 'کرم دست', 'کرم دور چشم',
    'ضد آفتاب', 'ضدآفتاب', 'مرطوب کننده', 'مرطوب‌کننده', 'آبرسان', 'شوینده صورت',
    'ژل شستشو', 'فوم شستشو', 'تونر', 'میسلار', 'شیر پاک کن', 'پاک کن آرایش',
    'آرایش', 'آرایشی', 'لوازم آرایشی', 'بهداشتی', 'لوازم بهداشتی', 'عطر', 'ادکلن',
    'دئودرانت', 'دئودورانت', 'ضد تعریق', 'ضدتعریق', 'مام', 'اسپری بدن', 'بادی اسپلش',
    'لاک', 'رژ', 'ریمل', 'خط چشم', 'cosmetic', 'cosmetics', 'makeup', 'skincare',
    'skin care', 'shampoo', 'hair mask', 'perfume', 'fragrance', 'deodorant'
  ];
  return beautySignals.some(signal => countKeywordMatches(text, [signal]) > 0);
};

const hasFoodSignal = (text: string): boolean => {
  const foodSignals = [
    'خوراکی', 'مواد غذایی', 'غذایی', 'تنقلات', 'سوپرمارکتی', 'سوپر مارکتی', 'صبحانه',
    'نوشیدنی', 'آبمیوه', 'نوشابه', 'دلستر', 'ماءالشعیر', 'انرژی زا', 'انرژی‌زا',
    'شکلات', 'بیسکویت', 'بیسکوویت', 'ویفر', 'کیک', 'کلوچه', 'چیپس', 'پفک', 'اسنک',
    'آدامس', 'آبنبات', 'پنیر', 'ماست', 'کره', 'خامه', 'شیر', 'دوغ', 'لبنیات',
    'رب', 'سس', 'ماکارونی', 'نودل', 'برنج', 'روغن خوراکی', 'روغن مایع', 'قند', 'شکر',
    'چای', 'دمنوش', 'قهوه', 'نسکافه', 'کافی میت', 'هات چاکلت', 'زعفران', 'گز', 'سوهان',
    'آجیل', 'خشکبار', 'پسته', 'بادام', 'گردو', 'خرما', 'کشمش', 'حبوبات', 'ادویه',
    'food', 'snack', 'drink', 'beverage', 'chocolate', 'biscuit', 'chips', 'cheese',
    'milk', 'yogurt', 'sauce', 'noodle', 'rice', 'tea', 'coffee'
  ];
  return foodSignals.some(signal => countKeywordMatches(text, [signal]) > 0);
};

const pickInternalCategory = (data: any, productName: string, briefDescription: string, isNutsOrDriedFruit: boolean): InternalCategory | null => {
  if (isNutsOrDriedFruit) {
    return getCategory('خشکبار و آجیل');
  }

  const userText = normalizeText([productName, briefDescription].filter(Boolean).join(' '));
  const modelText = normalizeText([
    data?.correctedProductName,
    data?.englishProductName,
    data?.focusKeyword,
    data?.seoTitle,
    data?.metaDescription,
    ...(Array.isArray(data?.advancedSeoAnalysis?.semanticEntities) ? data.advancedSeoAnalysis.semanticEntities : []),
    ...(Array.isArray(data?.advancedSeoAnalysis?.lsiKeywords) ? data.advancedSeoAnalysis.lsiKeywords : [])
  ].filter(Boolean).join(' '));
  const allText = `${userText} ${modelText}`.trim();
  const beautySignal = hasBeautySignal(allText);
  const foodSignal = hasFoodSignal(allText);

  // قوانین قطعی و اولویت‌دار: شامپو و محصولات آرایشی/بهداشتی هیچ‌وقت نباید هایپرمارکت شوند.
  if (/\b(shampoo|anti dandruff)\b/i.test(allText) || allText.includes('شامپو') || allText.includes('ضد شوره')) {
    return getCategory('شامپو');
  }
  if (allText.includes('عطر') || allText.includes('ادکلن') || /\b(perfume|fragrance|cologne)\b/i.test(allText)) {
    return getCategory('عطر و اسپری');
  }
  if (allText.includes('دئودرانت') || allText.includes('دئودورانت') || allText.includes('ضد تعریق') || allText.includes('ضدتعریق') || allText.includes('مام') || allText.includes('اسپری بدن') || allText.includes('بادی اسپلش') || /\b(deodorant|antiperspirant|body spray|body splash)\b/i.test(allText)) {
    return getCategory(BEAUTY_FALLBACK_CATEGORY_TITLE);
  }
  if (allText.includes('پنیر') || /\bcheese\b/i.test(allText)) {
    return getCategory('پنیر');
  }
  if (allText.includes('شکلات') || /\bchocolate\b/i.test(allText)) {
    return getCategory('شکلات');
  }

  let bestCategory: InternalCategory | null = null;
  let bestScore = 0;

  for (const category of INTERNAL_CATEGORIES) {
    const userScore = countKeywordMatches(userText, category.keywords) * 10;
    const modelScore = countKeywordMatches(modelText, category.keywords) * 3;
    const totalScore = userScore + modelScore + (userScore || modelScore ? category.priority / 100 : 0);

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestCategory = category;
    }
  }

  if (bestCategory && bestScore > 0) {
    // قفل ضد اشتباه: اگر کوچک‌ترین سیگنال آرایشی/بهداشتی وجود داشت، انتخاب خوراکی/هایپرمارکت ممنوع است.
    if (beautySignal && bestCategory.group === 'food') {
      return getCategory(BEAUTY_FALLBACK_CATEGORY_TITLE);
    }
    return bestCategory;
  }

  // اگر محصول آرایشی/بهداشتی است ولی دسته دقیق ندارد، به دسته مادر آرایشی‌بهداشتی لینک بده.
  if (beautySignal) {
    return getCategory(BEAUTY_FALLBACK_CATEGORY_TITLE);
  }

  // هایپرمارکت فقط برای خوراکی‌هاست؛ شامپو، کرم، عطر، بهداشتی و آرایشی هرگز وارد این شرط نمی‌شوند.
  if (foodSignal && !beautySignal) {
    return HYPERMARKET_FALLBACK_CATEGORY;
  }

  return null;
};

const stripAllAnchors = (html: string): string => {
  let output = String(html || '');
  for (let i = 0; i < 5; i += 1) {
    const next = output.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');
    if (next === output) break;
    output = next;
  }
  return output;
};

const removeDangerousHtml = (html: string): string => {
  return String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '')
    .replace(/<input\b[^>]*>/gi, '')
    .replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/href\s*=\s*("|')\s*javascript:[\s\S]*?\1/gi, 'href="#"');
};

const removeModelInternalLinkSentences = (html: string): string => {
  let output = String(html || '');

  // مدل حق لینک‌سازی ندارد. هر جمله‌ای که بوی لینک داخلی/کلیک/مشاهده دسته‌بندی بدهد حذف می‌شود.
  output = output
    .replace(/[^<>.!؟。]*(برای\s+مشاهده|محصولات\s+مرتبط|دسته\s*بندی|دسته\s+|کلیک\s+کنید|اینجا\s+کلیک|لینک\s+داخلی)[^<>.!؟。]*(?:[.!؟。]|$)/gi, '')
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1');

  // مدل نباید خودش لینک‌سازی کند. اگر خودش هایپرمارکت/سوپرمارکت را بی‌دلیل داخل متن آورد، جمله مدل حذف می‌شود.
  // لینک نهایی هایپرمارکت فقط وقتی محصول واقعاً خوراکی باشد، بعداً توسط کد اضافه می‌شود.
  const marketTerms = '(?:هایپر\\s*مارکت|هایپرمارکت|سوپر\\s*مارکت|سوپرمارکت|hypermarket|supermarket)';
  const marketSentenceRegex = new RegExp(`[^<>.!؟。]*${marketTerms}[^<>.!؟。]*(?:[.!؟。]|$)`, 'gi');
  output = output.replace(marketSentenceRegex, '');

  // پاکسازی نهایی اگر کلمه تنها باقی مانده باشد.
  output = output
    .replace(/(?:هایپر\s*مارکت|هایپرمارکت|سوپر\s*مارکت|سوپرمارکت|hypermarket|supermarket)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<li>\s*<\/li>/gi, '');

  return output;
};

const removeMarketMentionsOnly = (html: string): string => {
  let output = String(html || '');
  const marketTerms = '(?:هایپر\s*مارکت|هایپرمارکت|سوپر\s*مارکت|سوپرمارکت|hypermarket|supermarket)';
  const marketSentenceRegex = new RegExp(`[^<>.!؟。]*${marketTerms}[^<>.!؟。]*(?:[.!؟。]|$)`, 'gi');
  output = output.replace(marketSentenceRegex, '');
  return output
    .replace(/(?:هایپر\s*مارکت|هایپرمارکت|سوپر\s*مارکت|سوپرمارکت|hypermarket|supermarket)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/<p>\s*<\/p>/gi, '')
    .replace(/<li>\s*<\/li>/gi, '');
};

const addSingleInternalLink = (html: string, category: InternalCategory): string => {
  const safeTitle = category.title;
  const safeUrl = normalizeUrl(category.url);
  const linkSentence = ` همچنین برای مشاهده محصولات مرتبط، دسته <a href="${safeUrl}">${safeTitle}</a> را ببینید.`;
  const withoutLinks = removeModelInternalLinkSentences(removeDangerousHtml(stripAllAnchors(html)));

  if (/<p\b[^>]*>[\s\S]*?<\/p>/i.test(withoutLinks)) {
    return withoutLinks.replace(/(<p\b[^>]*>[\s\S]*?)(<\/p>)/i, (_match, start, end) => `${start}${linkSentence}${end}`);
  }

  return `<p>${linkSentence.trim()}</p>\n${withoutLinks}`;
};

const buildSchemaInstruction = (): string => `
# ساختار خروجی JSON الزامی
فقط و فقط یک JSON معتبر برگردان. هیچ متن، توضیح، مارک‌داون یا کدبلاک بیرون JSON ننویس. در fullDescription هیچ لینک داخلی، جمله پیشنهادی لینک‌سازی، کلیک کنید یا مشاهده دسته‌بندی ننویس.
کلیدهای JSON باید دقیقاً این‌ها باشند:
- correctedProductName: string
- englishProductName: string
- fullDescription: string؛ HTML کامل مطابق قوانین بالا
- shortDescription: string؛ بدون bold و بدون HTML
- seoTitle: string؛ حداکثر ۶۰ کاراکتر
- slug: string؛ فقط انگلیسی
- focusKeyword: string؛ فارسی
- metaDescription: string؛ ۱۲۰ تا ۱۵۵ کاراکتر، بدون HTML
- altImageText: string؛ حداکثر ۱۰ کلمه
- advancedSeoAnalysis: object شامل keyphraseSynonyms، lsiKeywords، longTailKeywords، semanticEntities، searchIntent، internalLinkingSuggestions
`;

const getArvanGatewayEndpoint = (): string => {
  const gatewayUrl = process.env.ARVAN_AI_GATEWAY_URL;
  if (!gatewayUrl) {
    throw new Error('ARVAN_AI_GATEWAY_URL is not configured.');
  }

  const cleanGatewayUrl = gatewayUrl.trim().replace(/\/+$/, '');
  return cleanGatewayUrl.endsWith('/chat/completions') ? cleanGatewayUrl : `${cleanGatewayUrl}/chat/completions`;
};

const getArvanAuthorizationHeader = (): string | undefined => {
  const rawKey = process.env.ARVAN_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!rawKey) return undefined;

  const cleanKey = rawKey.trim();
  return cleanKey.toLowerCase().startsWith('apikey ') ? cleanKey : `apikey ${cleanKey}`;
};

const extractJsonText = (value: string): string => {
  let text = String(value || '').trim();
  text = text.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();

  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text;
};

const toText = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const toStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(item => toText(item).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split(/[،,\n]/).map(item => item.trim()).filter(Boolean);
  }
  return [];
};

const normalizeGeneratedProductData = (value: any, productName: string): any => {
  const data = value && typeof value === 'object' ? value : {};
  const analysis = data.advancedSeoAnalysis && typeof data.advancedSeoAnalysis === 'object'
    ? data.advancedSeoAnalysis
    : {};

  return {
    correctedProductName: toText(data.correctedProductName, productName),
    englishProductName: toText(data.englishProductName, ''),
    fullDescription: toText(data.fullDescription, `<p>${productName}</p>`),
    shortDescription: toText(data.shortDescription, ''),
    seoTitle: toText(data.seoTitle, productName),
    slug: toText(data.slug, ''),
    focusKeyword: toText(data.focusKeyword, productName),
    metaDescription: toText(data.metaDescription, ''),
    altImageText: toText(data.altImageText, productName),
    advancedSeoAnalysis: {
      keyphraseSynonyms: toStringArray(analysis.keyphraseSynonyms),
      lsiKeywords: toStringArray(analysis.lsiKeywords),
      longTailKeywords: toStringArray(analysis.longTailKeywords),
      semanticEntities: toStringArray(analysis.semanticEntities),
      searchIntent: toText(analysis.searchIntent, 'خرید'),
      internalLinkingSuggestions: toStringArray(analysis.internalLinkingSuggestions),
    },
  };
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
      
    const fullSystemInstruction = `${systemInstruction}\n\n# Rules for 'fullDescription' field:\n${description_generation_instruction}\n\n${buildSchemaInstruction()}`;

    const contentParts: ArvanContentPart[] = [];
    
    let userPrompt = `بر اساس اطلاعات زیر، محتوای صفحه محصول را تولید کن:
- نام محصول: "${productName}"
- هشدار مهم: لینک داخلی، کلیک کنید یا مشاهده دسته‌بندی داخل متن ننویس. لینک داخلی فقط بعد از تولید متن توسط سیستم اضافه می‌شود.`;
    if (briefDescription) {
        userPrompt += `\n- توضیحات اولیه: "${briefDescription}"`;
    }
    
    if (productImage) {
      contentParts.push({
        type: 'image_url',
        image_url: {
          url: `data:${productImage.mimeType};base64,${productImage.base64}`,
        },
      });
      userPrompt += "\n- از تصویر ارائه شده برای تشخیص نام دقیق فارسی و انگلیسی و جزئیات محصول استفاده کن."
    }

    contentParts.push({ type: 'text', text: userPrompt });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const authorizationHeader = getArvanAuthorizationHeader();
    if (authorizationHeader) {
      headers.Authorization = authorizationHeader;
    }

    const response = await fetch(getArvanGatewayEndpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: process.env.ARVAN_AI_MODEL || process.env.ARVAN_MODEL || 'Gemini-2.5-Flash',
        messages: [
          { role: 'system', content: fullSystemInstruction },
          { role: 'user', content: contentParts },
        ],
        temperature: Number(process.env.ARVAN_TEMPERATURE || 0.4),
        max_tokens: Number(process.env.ARVAN_MAX_TOKENS || 6000),
        response_format: { type: 'json_object' },
      }),
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = responseBody ? JSON.stringify(responseBody) : response.statusText;
      throw new Error(`AI Gateway Error: ${detail}`);
    }

    const rawContent = responseBody?.choices?.[0]?.message?.content;
    if (!rawContent || typeof rawContent !== 'string') {
      throw new Error('AI Gateway did not return a valid text response.');
    }
    
    const parsedData = JSON.parse(extractJsonText(rawContent));
    const generatedData = normalizeGeneratedProductData(parsedData, productName);
    const selectedCategory = pickInternalCategory(generatedData, productName, briefDescription, isNutsOrDriedFruit);

    // اول تمام لینک‌ها و جمله‌های لینک‌سازی مدل حذف می‌شود. مدل حق ندارد خودش هایپرمارکت یا دسته‌بندی بسازد.
    generatedData.fullDescription = removeModelInternalLinkSentences(removeDangerousHtml(stripAllAnchors(generatedData.fullDescription)));

    if (selectedCategory) {
      generatedData.fullDescription = addSingleInternalLink(generatedData.fullDescription, selectedCategory);
      generatedData.advancedSeoAnalysis.internalLinkingSuggestions = [selectedCategory.title];
    } else {
      generatedData.advancedSeoAnalysis.internalLinkingSuggestions = [];
    }

    // گارد نهایی: اگر دسته انتخاب‌شده هایپرمارکت نیست، هیچ اثری از هایپرمارکت/سوپرمارکت نباید در خروجی بماند.
    // این گارد فقط کلمات هایپرمارکت/سوپرمارکت را پاک می‌کند و لینک درست خودمان را دست نمی‌زند.
    if (!selectedCategory || selectedCategory.title !== 'هایپرمارکت') {
      generatedData.fullDescription = removeMarketMentionsOnly(generatedData.fullDescription);
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(generatedData);

  } catch (error) {
    console.error('Error in Vercel function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    res.status(500).json({ message: `Internal Server Error: ${errorMessage}` });
  }
}
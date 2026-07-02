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


type ArvanContentPart = { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } };

type InternalCategory = {
  title: string;
  url: string;
  keywords: string[];
};

const SITE_ORIGIN = 'https://noon-valqalam.ir';

const categoryUrl = (path: string): string => {
  const cleanPath = path.trim().replace(/^\/+/, '').replace(/\/{2,}/g, '/');
  return `${SITE_ORIGIN}/${cleanPath}${cleanPath.endsWith('/') ? '' : '/'}`;
};

const INTERNAL_CATEGORIES: InternalCategory[] = [
  {
    title: 'مراقبت پوست',
    url: categoryUrl('product-category/skincare/'),
    keywords: ['پوست', 'ضد آفتاب', 'ضدآفتاب', 'ضدجوش', 'جوش', 'آبرسان', 'مرطوب کننده', 'مرطوب‌کننده', 'کرم صورت', 'کرم دست', 'کرم دور چشم', 'دور چشم', 'تونر', 'میسلار', 'پاک کننده', 'پاک‌کننده', 'شوینده صورت', 'ژل شستشو', 'سرم صورت', 'ماسک صورت', 'لوسیون', 'اسکراب صورت']
  },
  {
    title: 'مراقبت و زیبایی مو',
    url: categoryUrl('product-category/cosmetics/hair/'),
    keywords: ['شامپو', 'ماسک مو', 'مو', 'اسکراب مو', 'سرم مو', 'نرم کننده مو', 'نرم‌کننده مو', 'حالت دهنده مو', 'رنگ مو', 'کراتین']
  },
  {
    title: 'عطر و اسپری',
    url: categoryUrl('product-category/cosmetics/perfume/'),
    keywords: ['عطر', 'ادکلن', 'ادوپرفیوم', 'ادوتویلت', 'پرفیوم', 'فرگرنس', 'عطر جیبی']
  },
  {
    title: 'لوازم آرایشی بهداشتی',
    url: categoryUrl('product-category/cosmetics/'),
    keywords: ['دئودرانت', 'ضد تعریق', 'ضدتعریق', 'مام', 'رول ضد تعریق', 'اسپری بدن', 'بادی اسپلش', 'خوشبو کننده', 'خوشبوکننده', 'رژ', 'ریمل', 'خط چشم', 'ابرو', 'آرایش', 'کرم پودر', 'پنکک', 'کانسیلر', 'لاک', 'ناخن', 'لوازم آرایشی', 'بهداشتی']
  },
  {
    title: 'گز',
    url: categoryUrl('product-category/%da%af%d8%b2/'),
    keywords: ['گز']
  },
  {
    title: 'سوهان',
    url: categoryUrl('product-category/%d8%b3%d9%88%d9%87%d8%a7%d9%86/'),
    keywords: ['سوهان']
  },
  {
    title: 'زعفران',
    url: categoryUrl('product-category/saffron/'),
    keywords: ['زعفران']
  },
  {
    title: 'قهوه',
    url: categoryUrl('product-category/coffee/'),
    keywords: ['قهوه', 'نسکافه', 'کافی میت', 'کافی‌میت', 'کاپوچینو', 'لاته', 'هات چاکلت', 'موکا', 'اسپرسو']
  },
  {
    title: 'شیرینی',
    url: categoryUrl('product-category/sweets/'),
    keywords: ['شیرینی', 'کیک', 'کلوچه', 'کوکی', 'باقلوا']
  },
  {
    title: 'لوازم قنادی',
    url: categoryUrl('product-category/confectionery/'),
    keywords: ['لوازم قنادی', 'قالب', 'وانیل', 'پودر ژله', 'ژله', 'کرم کارامل', 'پودر کیک', 'خامه قنادی']
  },
  {
    title: 'خشکبار و آجیل',
    url: categoryUrl('product-category/nuts/'),
    keywords: ['آجیل', 'خشکبار', 'پسته', 'بادام', 'گردو', 'فندق', 'تخمه', 'بادام هندی', 'بادام زمینی', 'کشمش', 'خرما', 'انجیر خشک', 'میوه خشک', 'نبات', 'قند', 'ارده', 'کنجد', 'کشک', 'حبوبات', 'ادویه', 'زرشک', 'هل']
  },
  {
    title: 'هایپرمارکت',
    url: categoryUrl('product-category/hypermarket/'),
    keywords: ['شکلات', 'چیپس', 'بیسکویت', 'بیسکوویت', 'ویفر', 'نوشیدنی', 'نودل', 'سس', 'روغن', 'برنج', 'پنیر', 'شیر', 'غلات', 'آدامس', 'آبنبات', 'کمپوت', 'شربت', 'دسر', 'سوپرمارکت', 'هایپرمارکت']
  }
];

const normalizeText = (value: unknown): string => String(value || '')
  .toLowerCase()
  .replace(/[ي]/g, 'ی')
  .replace(/[ك]/g, 'ک')
  .replace(/[‌\u200c]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const normalizeUrl = (url: string): string => {
  const trimmed = String(url || '').trim();
  try {
    const parsed = new URL(trimmed);
    parsed.pathname = parsed.pathname.replace(/\/{2,}/g, '/');
    if (!parsed.pathname.endsWith('/')) parsed.pathname += '/';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return trimmed.replace(/([^:])\/{2,}/g, '$1/');
  }
};

const pickInternalCategory = (data: any, productName: string, briefDescription: string, isNutsOrDriedFruit: boolean): InternalCategory => {
  if (isNutsOrDriedFruit) {
    return INTERNAL_CATEGORIES.find(item => item.title === 'خشکبار و آجیل')!;
  }

  const haystack = normalizeText([
    productName,
    briefDescription,
    data?.correctedProductName,
    data?.englishProductName,
    data?.focusKeyword,
    ...(Array.isArray(data?.advancedSeoAnalysis?.semanticEntities) ? data.advancedSeoAnalysis.semanticEntities : []),
    ...(Array.isArray(data?.advancedSeoAnalysis?.lsiKeywords) ? data.advancedSeoAnalysis.lsiKeywords : [])
  ].filter(Boolean).join(' '));

  for (const category of INTERNAL_CATEGORIES) {
    if (category.keywords.some(keyword => haystack.includes(normalizeText(keyword)))) {
      return category;
    }
  }

  return INTERNAL_CATEGORIES.find(item => item.title === 'هایپرمارکت')!;
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

const addSingleInternalLink = (html: string, category: InternalCategory): string => {
  const safeTitle = category.title;
  const safeUrl = normalizeUrl(category.url);
  const linkSentence = ` همچنین برای مشاهده محصولات مرتبط، دسته <a href="${safeUrl}">${safeTitle}</a> را ببینید.`;
  const withoutLinks = stripAllAnchors(html);

  if (/<p\b[^>]*>[\s\S]*?<\/p>/i.test(withoutLinks)) {
    return withoutLinks.replace(/(<p\b[^>]*>[\s\S]*?)(<\/p>)/i, (_match, start, end) => `${start}${linkSentence}${end}`);
  }

  return `<p>${linkSentence.trim()}</p>\n${withoutLinks}`;
};

const buildSchemaInstruction = (): string => `
# ساختار خروجی JSON الزامی
فقط و فقط یک JSON معتبر برگردان. هیچ متن، توضیح، مارک‌داون یا کدبلاک بیرون JSON ننویس.
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
  return `${cleanGatewayUrl}/chat/completions`;
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
    
    let userPrompt = `بر اساس اطلاعات زیر، محتوای صفحه محصول را تولید کن:\n- نام محصول: "${productName}"`;
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
        model: process.env.ARVAN_MODEL || 'Gemini-2.5-Flash',
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
    generatedData.fullDescription = addSingleInternalLink(generatedData.fullDescription, selectedCategory);
    generatedData.advancedSeoAnalysis.internalLinkingSuggestions = [selectedCategory.title];

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(generatedData);

  } catch (error) {
    console.error('Error in Vercel function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    res.status(500).json({ message: `Internal Server Error: ${errorMessage}` });
  }
}
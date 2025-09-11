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
      description: "توضیحات کامل محصول با فرمت HTML. این توضیحات باید با یک پاراگراف مقدمه جذاب شروع شود که شامل نام محصول به صورت **bold** است. بخش‌های مختلف باید با تیترهای مشخص از هم جدا شوند.",
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
      description: "نامک (slug) سئو شده و تمیز **فقط به زبان انگلیسی** برای
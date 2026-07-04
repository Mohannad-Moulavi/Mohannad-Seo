import type { ProductData, ImageFile } from '../types';

export const generateProductContent = async (
  productName: string,
  productImage: ImageFile | null,
  briefDescription: string,
  isNutsOrDriedFruit: boolean,
): Promise<ProductData> => {
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 85000);

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productName, productImage, briefDescription, isNutsOrDriedFruit }),
      signal: controller.signal,
    }).finally(() => window.clearTimeout(timeoutId));

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorMessage = '';

      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => null);
        errorMessage = errorData?.message || errorData?.error || '';
      } else {
        const errorText = await response.text().catch(() => '');
        errorMessage = errorText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 900);
      }

      if (!errorMessage) {
        errorMessage = response.status === 504
          ? 'زمان اجرای تابع سرور تمام شد. دوباره تلاش کنید یا تصویر محصول را حذف کنید.'
          : `خطای سرور ${response.status}: ${response.statusText || 'بدون توضیح'}`;
      }

      throw new Error(errorMessage);
    }

    const data: ProductData = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling backend API:", error);
    if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('زمان پاسخ‌گویی سرور طولانی شد. دوباره تلاش کنید یا تصویر محصول را حذف کنید.');
    }
    if (error instanceof Error) {
        throw new Error(`${error.message}`);
    }
    throw new Error("یک خطای ناشناخته در ارتباط با سرور رخ داد.");
  }
};
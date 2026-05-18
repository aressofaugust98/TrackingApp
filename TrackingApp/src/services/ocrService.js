const FALLBACK_OCR_URL = 'https://soccer-influenced-quit-scan.trycloudflare.com/ocr';

const resolveOcrApiUrl = () => {
  const configuredUrl = (import.meta.env.VITE_AI_API_URL || '').trim();

  if (!configuredUrl) {
    return import.meta.env.DEV ? '/ai-api/ocr' : FALLBACK_OCR_URL;
  }

  if (!import.meta.env.DEV && configuredUrl.startsWith('/')) {
    return FALLBACK_OCR_URL;
  }

  return `${configuredUrl}/ocr`;
};
// ... các đoạn code bên dưới giữ nguyên

const OCR_API_URL = resolveOcrApiUrl();

const ensureNamedImageFile = (imageFile) => {
  if (imageFile instanceof File) {
    return imageFile;
  }

  const fallbackName = `receipt-${Date.now()}.jpg`;
  return new File([imageFile], fallbackName, {
    type: imageFile?.type || 'image/jpeg',
  });
};

export const extractInvoice = async (imageFile) => {
  const formData = new FormData();
  const normalizedFile = ensureNamedImageFile(imageFile);
  formData.append('file', normalizedFile, normalizedFile.name);

  const response = await fetch(OCR_API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unable to read error response body');
    throw new Error(
      `Invoice extraction failed (${response.status} ${response.statusText}): ${errorText || 'No response body'}`
    );
  }

  return await response.json();
};

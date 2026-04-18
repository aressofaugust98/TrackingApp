const FALLBACK_AI_URL = 'https://all-lifestyle-invitation-phrases.trycloudflare.com/ocr';

const resolveOcrApiUrl = () => {
  const configuredUrl = (import.meta.env.VITE_AI_API_URL || '').trim();

  if (!configuredUrl) {
    return import.meta.env.DEV ? '/ai-api/ocr' : FALLBACK_AI_URL;
  }

  if (!import.meta.env.DEV && configuredUrl.startsWith('/')) {
    return FALLBACK_AI_URL;
  }

  return `${configuredUrl}/ocr`;
};

const OCR_API_URL = resolveOcrApiUrl();

export const extractInvoice = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);

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

const OCR_API_URL =
  import.meta.env.VITE_OCR_API_URL ||
  '/ocr-api/extract';

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

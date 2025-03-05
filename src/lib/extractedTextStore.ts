let extractedTextStore: string = "";

/**
 * Function to set the extracted text.
 * @param text - The extracted text from the uploaded document.
 */
export const setExtractedText = (text: string) => {
  extractedTextStore = text;
};

/**
 * Function to get the extracted text.
 * @returns The stored extracted text.
 */
export const getExtractedText = (): string => {
  return extractedTextStore;
};

/**
 * Function to clear the stored extracted text.
 */
export const clearExtractedText = () => {
  extractedTextStore = "";
};

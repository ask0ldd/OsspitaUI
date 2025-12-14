/**
 * Interface defining the contract for a service
 * that extracts text from PDF files.
 */
export interface IPDFService {
  /**
   * Converts a PDF file to plain text by extracting text from all pages.
   * @param file - The PDF file to extract text from.
   * @returns A promise resolving with the extracted text.
   * @throws If extraction fails.
   */
  convertToText(file: File | Blob | MediaSource): Promise<string>;
}

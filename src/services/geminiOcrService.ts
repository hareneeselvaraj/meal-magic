import { extractWithAI } from '@/lib/aiFetcher';

export const geminiService = {

  // Converts standard File object to base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Calls AI (Gemini or Groq) to extract text dynamically into a string array
  async extractInvoiceItems(imageFile: File): Promise<string[]> {
    const mimeType = imageFile.type || "image/jpeg";
    const base64Data = await this.fileToBase64(imageFile);

    const prompt = "Extract all grocery items purchased from this invoice/receipt image. Look for names, quantities, and units. Return the data PURELY as a raw JSON array of strings formatted like this: ['1 kg Onion', '500 ml Amul Milk', 'Tata Salt 1x']. Do not include markdown formatting or the word 'json'.";

    const textOut = await extractWithAI(prompt, base64Data, mimeType);

    // Clean potential markdown blocks
    const cleaned = textOut.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const itemArray = JSON.parse(cleaned);
      if (Array.isArray(itemArray)) {
        return itemArray;
      } else {
        throw new Error("Parsed output is not an array");
      }
    } catch (e) {
      console.error("Failed to parse AI output into array. Raw text:", cleaned);
      // Fallback: split by lines as raw strings if JSON.parse fails
      return cleaned.split('\n').map((str: string) => str.trim()).filter((s: string) => s.length > 0);
    }
  }
};

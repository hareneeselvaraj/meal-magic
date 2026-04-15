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

  // Calls Google Gemini Flash to extract text dynamically into a string array
  async extractInvoiceItems(imageFile: File): Promise<string[]> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key is missing. Ensure VITE_GEMINI_API_KEY is embedded in .env");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Determine mime type
    const mimeType = imageFile.type || "image/jpeg";
    const base64Data = await this.fileToBase64(imageFile);

    const payload = {
      contents: [
        {
          parts: [
            { text: "Extract all grocery items purchased from this invoice/receipt image. Look for names, quantities, and units. Return the data PURELY as a raw JSON array of strings formatted like this: ['1 kg Onion', '500 ml Amul Milk', 'Tata Salt 1x']. Do not include markdown formatting or the word 'json'." },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    let textOut = data.candidates[0].content.parts[0].text;
    
    // Clean potential markdown blocks
    textOut = textOut.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const itemArray = JSON.parse(textOut);
      if (Array.isArray(itemArray)) {
        return itemArray;
      } else {
        throw new Error("Parsed output is not an array");
      }
    } catch (e) {
      console.error("Failed to parse Gemini output into array. Raw text:", textOut);
      // Fallback: split by lines as raw strings if JSON.parse fails
      return textOut.split('\n').map((str: string) => str.trim()).filter((s: string) => s.length > 0);
    }
  }
};

import { GoogleGenerativeAI } from '@google/generative-ai';

// Ensure you have GEMINI_API_KEY set in your .env.local file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ExtractedData {
  studentId: string;
  studentName: string;
  marks: string;
  confidenceScore: number;
}

export interface ImagePart {
  base64Image: string;
  mimeType: string;
}

export class GeminiExtractor {
  /**
   * Takes an array of base64 encoded images of grading sheets and extracts structured JSON data.
   */
  async extractMarksFromImages(images: ImagePart[]): Promise<ExtractedData[]> {
    try {
      // Use the Pro model which is highly capable of OCR and multimodal reasoning
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          responseMimeType: "application/json",
        }
      });

      const prompt = `
      You are an AI teaching assistant. Your task is to extract student roll numbers, names, and marks (or attendance) from the provided images of assessment sheets.
      
      Requirements:
      1. Carefully identify the 'Roll Number' or 'Student ID', the 'Student Name', and the 'Marks' or 'Total' column across all provided images.
      2. Extract each row accurately. Combine results from all images into a single array.
      3. For each row, calculate a 'confidenceScore' (integer from 0 to 100) based on how legible the handwriting is and your certainty of extraction.
         - 95-100: Very confident, clear text.
         - 70-90: Medium confidence, messy but readable.
         - Below 70: Low confidence, highly ambiguous text.
      
      Return a JSON array of objects with exactly these keys: "studentId" (string), "studentName" (string), "marks" (string), and "confidenceScore" (number).
      `;

      const imageParts = images.map(img => ({
        inlineData: {
          data: img.base64Image,
          mimeType: img.mimeType,
        },
      }));

      console.log(`Sending ${images.length} document(s) to Gemini 1.5 Pro for extraction...`);
      const result = await model.generateContent([prompt, ...imageParts]);
      const responseText = result.response.text();
      
      // Parse the JSON response
      const extractedData: ExtractedData[] = JSON.parse(responseText.trim());
      
      // Basic Error Detection: flag missing fields
      const validatedData = extractedData.map(record => {
        if (!record.studentId || !record.marks || !record.studentName) {
          record.confidenceScore = 0;
        }
        return record;
      });

      console.log(`Successfully extracted ${validatedData.length} records.`);
      
      return validatedData;

    } catch (error) {
      console.error("Failed to extract data using Gemini API:", error);
      throw new Error("Extraction failed. Please verify the API key and image format.");
    }
  }
}

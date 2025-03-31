import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseUserData, VerificationResult } from '@/types/auth';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

export async function verifyIdDocument(
  document: File,
  userData: BaseUserData
): Promise<VerificationResult> {
  try {
    const imageData = await fileToGenerativePart(document);
    
    const prompt = `Verify if this ID document matches the following information:
      - Name: ${userData.fullName}
      - Role: ${userData.role}
      - ID: ${userData.role === 'student' ? (userData as any).universityId : (userData as any).employeeId}
      
      Please analyze the document and return a JSON response with:
      {
        "isValid": boolean,
        "confidence": number (0-1),
        "mismatchedFields": string[] (if any)
      }`;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const verificationResult = JSON.parse(text);
    return verificationResult;
  } catch (error) {
    console.error('Error verifying ID:', error);
    return {
      isValid: false,
      confidence: 0,
      mismatchedFields: ['Error processing document']
    };
  }
}

async function fileToGenerativePart(file: File) {
  const data = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(data).toString('base64'),
      mimeType: file.type
    }
  };
} 
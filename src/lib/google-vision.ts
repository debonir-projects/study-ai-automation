import { ImageAnnotatorClient } from '@google-cloud/vision';
import { VerificationResult } from '@/types/id-verification';

const vision = new ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function processIdCard(imageBuffer: Buffer): Promise<VerificationResult> {
    try {
        // Perform OCR on the image
        const [result] = await vision.textDetection({
            image: { content: imageBuffer.toString('base64') },
        });

        const detections = result.textAnnotations;
        if (!detections || detections.length === 0) {
            return {
                success: false,
                confidence_score: 0,
                extracted_data: {},
                error: 'No text detected in the image',
            };
        }

        // Extract text from the image
        const fullText = detections[0].description || '';
        const lines = fullText.split('\n');

        // Initialize extracted data
        const extractedData: VerificationResult['extracted_data'] = {};

        // Process each line to extract relevant information
        lines.forEach((line) => {
            const lowerLine = line.toLowerCase();
            
            // Extract name (assuming it's in the format "Name: John Doe")
            if (lowerLine.includes('name:')) {
                extractedData.name = line.split(':')[1]?.trim();
            }
            
            // Extract student ID (assuming it's in the format "ID: 12345")
            if (lowerLine.includes('id:') || lowerLine.includes('student id:')) {
                extractedData.student_id = line.split(':')[1]?.trim();
            }
            
            // Extract college name (assuming it's in the format "College: XYZ University")
            if (lowerLine.includes('college:') || lowerLine.includes('university:')) {
                extractedData.college_name = line.split(':')[1]?.trim();
            }
        });

        // Calculate confidence score based on extracted data
        const confidenceScore = calculateConfidenceScore(extractedData);

        return {
            success: confidenceScore > 0.7, // Consider it successful if confidence is above 70%
            confidence_score: confidenceScore,
            extracted_data: extractedData,
        };
    } catch (error) {
        console.error('Error processing ID card:', error);
        return {
            success: false,
            confidence_score: 0,
            extracted_data: {},
            error: 'Failed to process ID card image',
        };
    }
}

function calculateConfidenceScore(data: VerificationResult['extracted_data']): number {
    let score = 0;
    let totalFields = 0;

    // Check each field and increment score based on presence and format
    if (data.name) {
        score += 1;
        totalFields++;
    }
    if (data.student_id) {
        score += 1;
        totalFields++;
    }
    if (data.college_name) {
        score += 1;
        totalFields++;
    }

    // Return 0 if no fields were found
    if (totalFields === 0) return 0;

    // Calculate final score as a percentage
    return score / totalFields;
} 
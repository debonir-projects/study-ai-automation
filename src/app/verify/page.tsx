import { IdCardScanner } from '@/components/id-verification/IdCardScanner';
import { VerificationResult } from '@/types/id-verification';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
    const router = useRouter();

    const handleVerificationComplete = (result: VerificationResult) => {
        if (result.success) {
            // Redirect to the appropriate channel based on college
            router.push(`/channels/${result.extracted_data.college_id}`);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Student ID Verification</h1>
            
            <div className="max-w-2xl mx-auto">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Scan Your Student ID Card
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Please position your student ID card in front of the camera.
                        Make sure the card is well-lit and all text is clearly visible.
                    </p>
                    
                    <IdCardScanner onVerificationComplete={handleVerificationComplete} />
                </div>
            </div>
        </div>
    );
} 
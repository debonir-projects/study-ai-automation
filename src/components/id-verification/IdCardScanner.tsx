import React, { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { VerificationResult } from '@/types/id-verification';

interface IdCardScannerProps {
    onVerificationComplete: (result: VerificationResult) => void;
}

export const IdCardScanner: React.FC<IdCardScannerProps> = ({ onVerificationComplete }) => {
    const { data: session } = useSession();
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startScanning = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsScanning(true);
        } catch (err) {
            setError('Failed to access camera');
            console.error(err);
        }
    };

    const stopScanning = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            setError('Failed to get canvas context');
            return;
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame on canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
            }, 'image/jpeg', 0.8);
        });

        // Convert blob to buffer
        const buffer = await blob.arrayBuffer();

        // Send image for verification
        try {
            const response = await fetch('/api/verify-id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: Buffer.from(buffer).toString('base64'),
                }),
            });

            const result: VerificationResult = await response.json();
            onVerificationComplete(result);
        } catch (err) {
            setError('Failed to verify ID card');
            console.error(err);
        }

        stopScanning();
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                {!isScanning ? (
                    <button
                        onClick={startScanning}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Start Scanning
                    </button>
                ) : (
                    <div className="space-y-4">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex space-x-4 justify-center">
                            <button
                                onClick={captureImage}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Capture
                            </button>
                            <button
                                onClick={stopScanning}
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="text-red-500 text-sm">{error}</div>
            )}
        </div>
    );
}; 
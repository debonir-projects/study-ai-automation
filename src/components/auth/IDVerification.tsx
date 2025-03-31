'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BaseUserData, VerificationResult } from '@/types/auth';
import { verifyIdDocument } from '@/lib/gemini';

interface IDVerificationProps {
  userData: BaseUserData;
  onComplete: (result: VerificationResult) => void;
}

export default function IDVerification({ userData, onComplete }: IDVerificationProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(selectedFile.type)) {
        setError('File must be JPEG, PNG, or PDF');
        return;
      }
      setFile(selectedFile);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleVerify = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyIdDocument(file, userData);
      onComplete(result);
    } catch (err) {
      setError('Failed to verify ID. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          ID Verification
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please upload your ID document for verification
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-full max-w-md h-64 border-2 border-dashed rounded-lg flex items-center justify-center ${
              preview
                ? 'border-primary-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {preview ? (
              <img
                src={preview}
                alt="ID Preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Drag and drop your ID here, or click to select
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  JPEG, PNG, or PDF up to 5MB
                </p>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Select File
          </button>
        </div>

        {error && (
          <div className="text-center text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setFile(null);
              setPreview(null);
              setError(null);
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Clear
          </button>
          <button
            onClick={handleVerify}
            disabled={!file || isVerifying}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isVerifying ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify ID'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
} 
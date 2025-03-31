'use client';

import { motion } from 'framer-motion';
import { BaseUserData, VerificationResult } from '@/types/auth';
import { saveToCSV } from '@/lib/utils';

interface ConfirmationScreenProps {
  userData: BaseUserData;
  verificationResult: VerificationResult;
}

export default function ConfirmationScreen({
  userData,
  verificationResult,
}: ConfirmationScreenProps) {
  const handleConfirm = async () => {
    try {
      await saveToCSV({
        timestamp: new Date().toISOString(),
        role: userData.role,
        name: userData.fullName,
        id: userData.role === 'student' ? (userData as any).universityId : (userData as any).employeeId,
        email: userData.email,
        phone: userData.phone,
        verified_status: verificationResult.isValid ? 'verified' : 'failed',
        confidence: verificationResult.confidence,
        mismatched_fields: verificationResult.mismatchedFields?.join(', ') || '',
      });
    } catch (error) {
      console.error('Error saving data:', error);
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
          Verification Complete
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please review your information and confirm
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            User Information
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Full Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {userData.fullName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Role
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                {userData.role}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                ID
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {userData.role === 'student'
                  ? (userData as any).universityId
                  : (userData as any).employeeId}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {userData.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Phone
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {userData.phone}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Verification Result
          </h3>
          <div className="flex items-center space-x-2">
            <div
              className={`w-4 h-4 rounded-full ${
                verificationResult.isValid
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            />
            <span
              className={`text-sm font-medium ${
                verificationResult.isValid
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {verificationResult.isValid
                ? 'ID Verified Successfully'
                : 'ID Verification Failed'}
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Confidence Score: {(verificationResult.confidence * 100).toFixed(1)}%
            </p>
            {verificationResult.mismatchedFields?.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  Mismatched Fields:
                </p>
                <ul className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {verificationResult.mismatchedFields.map((field, index) => (
                    <li key={index}>• {field}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Confirm and Save
          </button>
        </div>
      </div>
    </motion.div>
  );
} 
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, StudentData, TeacherData, AuthStep, VerificationResult } from '@/types/auth';
import RoleSelector from './RoleSelector';
import StudentForm from './StudentForm';
import TeacherForm from './TeacherForm';
import IDVerification from './IDVerification';
import ConfirmationScreen from './ConfirmationScreen';

const steps: AuthStep[] = [
  { id: 1, title: 'Select Role', description: 'Choose your role', isCompleted: false },
  { id: 2, title: 'Fill Details', description: 'Enter your information', isCompleted: false },
  { id: 3, title: 'Verify ID', description: 'Upload and verify your ID', isCompleted: false },
  { id: 4, title: 'Confirmation', description: 'Review and confirm', isCompleted: false },
];

export default function AuthFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userData, setUserData] = useState<StudentData | TeacherData | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult>()

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setCurrentStep(2);
  };

  const handleFormSubmit = (data: StudentData | TeacherData) => {
    setUserData(data);
    setCurrentStep(3);
  };

  const handleVerificationComplete = (result: VerificationResult) => {
    setVerificationResult(result);
    setCurrentStep(4);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RoleSelector onSelect={handleRoleSelect} />;
      case 2:
        return role === 'student' ? (
          <StudentForm onSubmit={handleFormSubmit} />
        ) : (
          <TeacherForm onSubmit={handleFormSubmit} />
        );
      case 3:
        return userData ? (
          <IDVerification userData={userData} onComplete={(result: VerificationResult) => handleVerificationComplete(result)} />
        ) : null;
      case 4:
        return verificationResult ? (
          <ConfirmationScreen userData={userData!} verificationResult={verificationResult} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id
                        ? 'bg-primary-500'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 
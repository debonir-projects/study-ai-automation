'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StudentData } from '@/types/auth';
import { motion } from 'framer-motion';

const studentSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  universityId: z.string().regex(/^\d{8}$/, 'University ID must be 8 digits'),
  major: z.string().min(1, 'Please select a major'),
  academicYear: z.enum(['freshman', 'sophomore', 'junior', 'senior']),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});

interface StudentFormProps {
  onSubmit: (data: StudentData) => void;
}

export default function StudentForm({ onSubmit }: StudentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentData>({
    resolver: zodResolver(studentSchema),
  });

  const majors = [
    'Computer Science',
    'Engineering',
    'Business',
    'Arts',
    'Science',
    'Humanities',
  ];

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Student Information
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Please fill in your details
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name
          </label>
          <input
            type="text"
            {...register('fullName')}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            University ID
          </label>
          <input
            type="text"
            {...register('universityId')}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.universityId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.universityId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Major
          </label>
          <select
            {...register('major')}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Select a major</option>
            {majors.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
          {errors.major && (
            <p className="mt-1 text-sm text-red-600">{errors.major.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Academic Year
          </label>
          <div className="mt-2 space-x-4">
            {['freshman', 'sophomore', 'junior', 'senior'].map((year) => (
              <label key={year} className="inline-flex items-center">
                <input
                  type="radio"
                  {...register('academicYear')}
                  value={year}
                  className="form-radio text-primary-500"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 capitalize">
                  {year}
                </span>
              </label>
            ))}
          </div>
          {errors.academicYear && (
            <p className="mt-1 text-sm text-red-600">
              {errors.academicYear.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </label>
          <input
            type="tel"
            {...register('phone')}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Continue'}
        </button>
      </div>
    </motion.form>
  );
} 
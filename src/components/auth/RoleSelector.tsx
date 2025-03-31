'use client';

import { motion } from 'framer-motion';
import { UserRole } from '@/types/auth';

interface RoleSelectorProps {
  onSelect: (role: UserRole) => void;
}

export default function RoleSelector({ onSelect }: RoleSelectorProps) {
  const roles = [
    {
      id: 'student',
      title: 'Student',
      description: 'I am a student looking to access study materials and assignments',
      icon: '🎓',
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'I am a teacher who needs to manage courses and assignments',
      icon: '👨‍🏫',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome! Please select your role
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Choose the option that best describes you
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <motion.button
            key={role.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(role.id as UserRole)}
            className="relative flex flex-col items-center p-6 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
          >
            <span className="text-4xl mb-4">{role.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {role.title}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
              {role.description}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
} 
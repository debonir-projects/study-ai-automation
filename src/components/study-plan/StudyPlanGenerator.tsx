import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiChevronUp, FiClock, FiBook } from 'react-icons/fi';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { cn } from '@/lib/utils';

interface StudyModule {
    id: string;
    title: string;
    description: string;
    duration: number; // in minutes
    progress: number;
    isExpanded: boolean;
    subtasks: {
        id: string;
        title: string;
        completed: boolean;
    }[];
}

interface StudyPlanGeneratorProps {
    modules: StudyModule[];
    onUpdateProgress: (moduleId: string, progress: number) => void;
    onToggleTask: (moduleId: string, taskId: string) => void;
}

export const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({
    modules,
    onUpdateProgress,
    onToggleTask,
}) => {
    const [expandedModule, setExpandedModule] = useState<string | null>(null);

    const toggleModule = (moduleId: string) => {
        setExpandedModule(expandedModule === moduleId ? null : moduleId);
    };

    return (
        <div className="space-y-6">
            {modules.map((module, index) => (
                <AnimatedCard
                    key={module.id}
                    priority={module.progress < 50 ? 'high' : module.progress < 80 ? 'medium' : 'low'}
                    delay={index * 0.1}
                >
                    <div className="space-y-4">
                        {/* Module Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FiBook className="w-5 h-5 text-primary-500" />
                                <h3 className="text-lg font-semibold">{module.title}</h3>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => toggleModule(module.id)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                {expandedModule === module.id ? (
                                    <FiChevronUp className="w-5 h-5" />
                                ) : (
                                    <FiChevronDown className="w-5 h-5" />
                                )}
                            </motion.button>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{module.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${module.progress}%` }}
                                    transition={{ duration: 1, ease: 'easeOut' }}
                                    className="h-full bg-primary-500"
                                />
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <FiClock className="w-4 h-4 mr-2" />
                            <span>{module.duration} minutes</span>
                        </div>

                        {/* Module Content */}
                        <AnimatePresence>
                            {expandedModule === module.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-4">
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {module.description}
                                        </p>
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Tasks</h4>
                                            {module.subtasks.map((task) => (
                                                <motion.div
                                                    key={task.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={task.completed}
                                                        onChange={() =>
                                                            onToggleTask(module.id, task.id)
                                                        }
                                                        className="rounded text-primary-500 focus:ring-primary-500"
                                                    />
                                                    <span
                                                        className={cn(
                                                            'text-sm',
                                                            task.completed &&
                                                                'line-through text-gray-400'
                                                        )}
                                                    >
                                                        {task.title}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </AnimatedCard>
            ))}
        </div>
    );
}; 
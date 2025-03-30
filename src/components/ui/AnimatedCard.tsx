import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    priority?: 'low' | 'medium' | 'high';
    delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    className,
    priority = 'low',
    delay = 0,
}) => {
    const priorityColors = {
        low: 'border-secondary-200 dark:border-secondary-800',
        medium: 'border-primary-200 dark:border-primary-800',
        high: 'border-red-200 dark:border-red-800',
    };

    const priorityAnimations = {
        low: {},
        medium: {
            scale: [1, 1.02, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
        high: {
            scale: [1, 1.02, 1],
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
            },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                type: 'spring',
                stiffness: 100,
                damping: 15,
                delay,
            }}
            whileHover={{ scale: 1.02 }}
            className={cn(
                'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2',
                priorityColors[priority],
                className
            )}
            {...priorityAnimations[priority]}
        >
            {children}
        </motion.div>
    );
}; 
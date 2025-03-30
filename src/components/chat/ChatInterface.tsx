import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSend, FiPaperclip } from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface ChatInterfaceProps {
    onSendMessage: (message: string) => Promise<void>;
    isLoading?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    onSendMessage,
    isLoading = false,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: input.trim(),
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInput('');

        try {
            await onSendMessage(input.trim());
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={cn(
                                'flex',
                                message.sender === 'user' ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div
                                className={cn(
                                    'max-w-[70%] rounded-lg p-3',
                                    message.sender === 'user'
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700'
                                )}
                            >
                                <p className="text-sm">{message.text}</p>
                                <span className="text-xs opacity-70 mt-1 block">
                                    {message.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                    <button
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => {/* Handle attachment */}}
                    >
                        <FiPaperclip className="w-5 h-5" />
                    </button>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700"
                        rows={1}
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={cn(
                            'p-2 rounded-full',
                            input.trim() && !isLoading
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-300 dark:bg-gray-600 text-gray-500'
                        )}
                    >
                        <FiSend className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Typing Indicator */}
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-2"
                >
                    <div className="flex space-x-2">
                        <motion.div
                            className="w-2 h-2 bg-primary-500 rounded-full"
                            animate={{
                                y: [0, -6, 0],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: 0,
                            }}
                        />
                        <motion.div
                            className="w-2 h-2 bg-primary-500 rounded-full"
                            animate={{
                                y: [0, -6, 0],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: 0.2,
                            }}
                        />
                        <motion.div
                            className="w-2 h-2 bg-primary-500 rounded-full"
                            animate={{
                                y: [0, -6, 0],
                            }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: 0.4,
                            }}
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
}; 
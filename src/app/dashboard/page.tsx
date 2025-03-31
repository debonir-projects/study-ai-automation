'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBook, FiCalendar, FiMessageSquare, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();

  // Mock data - replace with your actual data fetching
  const studyPlan = [
    { id: '1', title: 'Mathematics Revision', progress: 65, dueDate: '2023-12-15', priority: 'high' },
    { id: '2', title: 'Literature Essay', progress: 30, dueDate: '2023-12-18', priority: 'medium' },
  ];

  const assignments = [
    { id: '1', title: 'Linear Algebra Homework', dueDate: '2023-12-12', course: 'Mathematics' },
    { id: '2', title: 'Macbeth Analysis', dueDate: '2023-12-14', course: 'Literature' },
  ];

  const stats = [
    { label: 'Completed Tasks', value: 12, icon: <FiCheckCircle className="text-emerald-400" /> },
    { label: 'Pending Assignments', value: 5, icon: <FiAlertTriangle className="text-amber-400" /> },
  ];

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
          >
            StudyFlow AI
          </motion.h1>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Welcome back</p>
              
            </div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center"
            >
              <span className="font-medium text-sm">
                {session?.user?.name?.charAt(0) || 'S'}
              </span>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="text-3xl">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Study Plan Column */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <h2 className="flex items-center text-xl font-bold">
              <FiBook className="mr-2 text-blue-400" /> Your Study Plan
            </h2>
            
            <AnimatePresence>
              {studyPlan.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{item.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">Due {item.dueDate}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.priority === 'high' 
                        ? 'bg-red-900/50 text-red-400' 
                        : 'bg-amber-900/50 text-amber-400'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-2.5 rounded-full ${
                          item.progress > 70 ? 'bg-emerald-500' : 
                          item.progress > 40 ? 'bg-blue-500' : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Assignments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="flex items-center text-xl font-bold">
                <FiCalendar className="mr-2 text-purple-400" /> Upcoming Assignments
              </h2>
              
              <div className="mt-4 space-y-4">
                <AnimatePresence>
                  {assignments.map((assignment, index) => (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <h3 className="font-medium">{assignment.title}</h3>
                      <div className="flex justify-between mt-2 text-sm text-gray-400">
                        <span>{assignment.course}</span>
                        <span>Due {assignment.dueDate}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* AI Assistant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
            >
              <h2 className="flex items-center text-xl font-bold mb-4">
                <FiMessageSquare className="mr-2 text-blue-400" /> AI Study Assistant
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <FiMessageSquare className="text-white" />
                  </div>
                  <div className="bg-gray-700 px-4 py-3 rounded-lg max-w-[80%]">
                    <p>Hi {session?.user?.name?.split(' ')[0] || 'there'}! How can I help with your studies today?</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    Explain calculus
                  </button>
                  <button className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    Create quiz
                  </button>
                </div>
                
                <div className="relative mt-4">
                  <input
                    type="text"
                    placeholder="Ask me anything..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 hover:text-blue-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
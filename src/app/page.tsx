import React from 'react';

import './globals.css';


const Home = () => {
  return (
    <div className="container mx-auto p-4 bg-white">
      <header className="text-center my-8">
        <h1 className="text-4xl font-bold text-gray-900">AI Study Assistant</h1>
        <p className="text-lg text-gray-800">Your personalized AI-powered study companion</p>
      </header>
      <main>
        <section className="my-8">
          <h2 className="text-2xl font-semibold text-gray-900">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {features.map((feature, index) => (
              <div key={index} className="p-4 border border-gray-300 rounded-lg shadow-sm bg-gray-50">
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mt-2">{feature.title}</h3>
                <p className="text-gray-800">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="text-center my-8">
        <p className="text-gray-700">&copy; 2023 AI Study Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
};

const features = [
  {
    title: 'Automated Scheduling',
    description: 'Automatically schedule your classes, study sessions, and extracurricular activities.',
    icon: '📅',
  },
  {
    title: 'AI Tutoring',
    description: 'Get personalized tutoring sessions based on your learning style and progress.',
    icon: '🤖',
  },
  {
    title: 'Resource Management',
    description: 'Organize and manage your study materials and resources efficiently.',
    icon: '📚',
  },
  {
    title: 'Collaboration Tools',
    description: 'Collaborate with classmates and share resources seamlessly.',
    icon: '👥',
  },
];

 
export default Home;

'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getCurrentStudyPlan } from '@/lib/study-planner';
import { getUpcomingAssignments } from '@/lib/google-classroom';
import { StudyPlan, StudyModule } from '@/types/study-plan';
import { Assignment } from '@/types/assignment';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { StudyPlanGenerator } from '@/components/study-plan/StudyPlanGenerator';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [studyPlan, setStudyPlan] = useState<StudyPlan[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!session?.user?.id) return;

      try {
        const [planData, assignmentsData] = await Promise.all([
          getCurrentStudyPlan(session.user.id),
          getUpcomingAssignments(session.user.id),
        ]);

        setStudyPlan(planData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [session]);

  const handleSendMessage = async (message: string) => {
    // Implement chat functionality
    console.log('Sending message:', message);
  };

  const handleUpdateProgress = async (moduleId: string, progress: number) => {
    // Implement progress update
    console.log('Updating progress:', moduleId, progress);
  };

  const handleToggleTask = async (moduleId: string, taskId: string) => {
    // Implement task toggle
    console.log('Toggling task:', moduleId, taskId);
  };

  const mapStudyPlanToModule = (plan: StudyPlan): StudyModule => ({
    id: plan.id,
    title: plan.title,
    description: plan.description || '',
    duration: 60, // Default duration
    progress: plan.progress,
    isExpanded: false,
    subtasks: plan.tasks,
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h1>
          <a
            href="/auth/signin"
            className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Welcome, {session.user.name || 'Student'}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Study Plan Section */}
          <AnimatedCard priority="medium">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Study Plan
            </h2>
            {studyPlan.length > 0 ? (
              <StudyPlanGenerator
                modules={studyPlan.map(mapStudyPlanToModule)}
                onUpdateProgress={handleUpdateProgress}
                onToggleTask={handleToggleTask}
              />
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No study plan available. Generate one to get started!
              </p>
            )}
          </AnimatedCard>

          {/* Upcoming Assignments Section */}
          <AnimatedCard priority="high">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Upcoming Assignments
            </h2>
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {assignment.assignment_title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {assignment.description}
                    </p>
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Due: {new Date(assignment.due_date).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No upcoming assignments</p>
            )}
          </AnimatedCard>
        </div>

        {/* AI Chat Section */}
        <div className="mt-8">
          <AnimatedCard>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              AI Study Assistant
            </h2>
            <ChatInterface onSendMessage={handleSendMessage} />
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
} 
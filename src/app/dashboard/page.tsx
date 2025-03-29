'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getCurrentStudyPlan } from '@/lib/study-planner';
import { getUpcomingAssignments } from '@/lib/google-classroom';
import { StudyPlan } from '@/lib/supabase';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [studyPlan, setStudyPlan] = useState<StudyPlan[]>([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (session?.user?.id) {
        try {
          const [planData, assignmentsData] = await Promise.all([
            getCurrentStudyPlan(session.user.id),
            getUpcomingAssignments(session.user.id),
          ]);

          setStudyPlan(planData);
          setAssignments(assignmentsData);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadDashboardData();
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome, {session.user.name}!
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Study Plan Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Study Plan</h2>
            {studyPlan.length > 0 ? (
              <div className="space-y-4">
                {studyPlan.map((plan) => (
                  <div
                    key={plan.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {new Date(plan.start_date).toLocaleString()} -{' '}
                        {new Date(plan.end_date).toLocaleString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          plan.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : plan.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {plan.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No study plan available. Generate one to get started!</p>
            )}
          </div>

          {/* Upcoming Assignments Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Assignments</h2>
            {assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div
                    key={assignment.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-gray-900">{assignment.assignment_title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      Due: {new Date(assignment.due_date).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming assignments</p>
            )}
          </div>
        </div>

        {/* WhatsApp Chat Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">AI Study Assistant</h2>
          <p className="text-gray-600 mb-4">
            Need help with your studies? Chat with our AI assistant on WhatsApp!
          </p>
          <a
            href="https://wa.me/your-whatsapp-number"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Start Chat
          </a>
        </div>
      </div>
    </div>
  );
} 
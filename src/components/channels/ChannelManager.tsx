import React, { useEffect, useState } from 'react';
import { ChannelHierarchy, User } from '@/types/channel';
import { getChannelHierarchy, createChannel } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

interface ChannelManagerProps {
    collegeId: string;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({ collegeId }) => {
    const { data: session } = useSession();
    const [hierarchy, setHierarchy] = useState<ChannelHierarchy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHierarchy = async () => {
            try {
                const data = await getChannelHierarchy(collegeId);
                setHierarchy(data);
            } catch (err) {
                setError('Failed to load channel hierarchy');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchHierarchy();
    }, [collegeId]);

    const handleCreateChannel = async (
        type: 'branch' | 'subject',
        data: { name: string; branch_id?: string }
    ) => {
        try {
            await createChannel(type, {
                ...data,
                college_id: collegeId,
            });
            // Refresh hierarchy after creating channel
            const updatedHierarchy = await getChannelHierarchy(collegeId);
            setHierarchy(updatedHierarchy);
        } catch (err) {
            console.error('Failed to create channel:', err);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;
    if (!hierarchy) return <div>No data available</div>;

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4">{hierarchy.college.name}</h2>
                
                {hierarchy.branches.map(({ branch, subjects }) => (
                    <div key={branch.id} className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-semibold">{branch.name}</h3>
                            {session?.user?.role === 'admin' && (
                                <button
                                    onClick={() =>
                                        handleCreateChannel('subject', {
                                            name: 'New Subject',
                                            branch_id: branch.id,
                                        })
                                    }
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    Add Subject
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className="bg-gray-50 p-4 rounded-lg shadow-sm"
                                >
                                    <h4 className="font-medium">{subject.name}</h4>
                                    {subject.google_classroom_id && (
                                        <span className="text-sm text-gray-500">
                                            Google Classroom ID: {subject.google_classroom_id}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {session?.user?.role === 'admin' && (
                    <button
                        onClick={() =>
                            handleCreateChannel('branch', { name: 'New Branch' })
                        }
                        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Add Branch
                    </button>
                )}
            </div>
        </div>
    );
}; 
import { ChannelManager } from '@/components/channels/ChannelManager';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface ChannelPageProps {
    params: {
        collegeId: string;
    };
}

export default async function ChannelPage({ params }: ChannelPageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/signin');
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Channel Management</h1>
            <ChannelManager collegeId={params.collegeId} />
        </div>
    );
} 
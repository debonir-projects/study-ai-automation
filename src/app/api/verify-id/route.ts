import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processIdCard } from '@/lib/google-vision';
import { supabase } from '@/lib/supabase';
import { VerificationResult } from '@/types/id-verification';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { image } = await request.json();
        if (!image) {
            return NextResponse.json(
                { error: 'No image provided' },
                { status: 400 }
            );
        }

        // Process the ID card image
        const result = await processIdCard(Buffer.from(image, 'base64'));
        
        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        // Verify against database
        const { data: college } = await supabase
            .from('colleges')
            .select('id')
            .ilike('name', result.extracted_data.college_name || '')
            .single();

        if (!college) {
            return NextResponse.json({
                ...result,
                success: false,
                error: 'College not found in database',
            }, { status: 400 });
        }

        // Check if student ID exists
        const { data: existingCard } = await supabase
            .from('student_id_cards')
            .select('*')
            .eq('student_id', result.extracted_data.student_id)
            .single();

        if (existingCard) {
            // Update existing card if needed
            if (existingCard.user_id !== session.user.id) {
                await supabase
                    .from('student_id_cards')
                    .update({
                        user_id: session.user.id,
                        verification_status: true,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', existingCard.id);
            }
        } else {
            // Create new card
            await supabase.from('student_id_cards').insert([{
                user_id: session.user.id,
                student_id: result.extracted_data.student_id,
                college_id: college.id,
                full_name: result.extracted_data.name,
                image_url: image, // Store base64 image
                verification_status: true,
            }]);
        }

        // Log verification attempt
        await supabase.from('id_verification_logs').insert([{
            user_id: session.user.id,
            student_id_card_id: existingCard?.id,
            verification_status: true,
            confidence_score: result.confidence_score,
            extracted_data: result.extracted_data,
        }]);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in ID verification:', error);
        return NextResponse.json(
            {
                success: false,
                confidence_score: 0,
                extracted_data: {},
                error: 'Internal server error',
            },
            { status: 500 }
        );
    }
} 
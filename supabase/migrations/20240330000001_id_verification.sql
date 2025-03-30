-- Create student_id_cards table
CREATE TABLE student_id_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    college_id UUID REFERENCES colleges(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    verification_status BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create id_verification_logs table
CREATE TABLE id_verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_id_card_id UUID REFERENCES student_id_cards(id) ON DELETE CASCADE,
    verification_status BOOLEAN NOT NULL,
    confidence_score FLOAT NOT NULL,
    extracted_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE student_id_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE id_verification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own ID cards"
    ON student_id_cards FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all ID cards"
    ON student_id_cards FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own verification logs"
    ON id_verification_logs FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all verification logs"
    ON id_verification_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    ); 
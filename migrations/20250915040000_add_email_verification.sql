-- Add email verification fields to users table
ALTER TABLE users 
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN email_verification_token TEXT,
ADD COLUMN email_verification_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create password reset tokens table if not exists
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create index for better performance
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token) WHERE email_verification_token IS NOT NULL;

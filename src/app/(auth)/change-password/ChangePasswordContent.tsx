'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordStrengthBar from '@/components/PasswordStrengthBar';

interface ChangePasswordContentProps {
    userId: string;
}

export default function ChangePasswordContent({ userId }: ChangePasswordContentProps) {
    const [password, setPassword] = useState('');
    const [twoFACode, setTwoFACode] = useState('');
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVerifyAndChangePassword = async () => {
        setErrorMessages([]);
        setSuccessMessage(null);
        setLoading(true);

        try {
            // Step 1: Verify the 2FA code
            const verifyResponse = await fetch('/api/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: twoFACode }),
            });

            if (!verifyResponse.ok) {
                const responseData = await verifyResponse.json();
                if (responseData.errors && Array.isArray(responseData.errors)) {
                    const detailedErrors = responseData.errors.map(
                        (error: { field: string; message: string }) => error.message
                    );
                    setErrorMessages(detailedErrors);
                } else {
                    throw new Error(responseData.message || 'Failed to verify 2FA code');
                }
                return;
            }

            // Step 2: Change the password
            const changePasswordResponse = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, password }),
            });

            if (!changePasswordResponse.ok) {
                const responseData = await changePasswordResponse.json();
                if (responseData.errors && Array.isArray(responseData.errors)) {
                    setErrorMessages(responseData.errors);
                } else {
                    throw new Error(responseData.message || 'Failed to change password');
                }
                return;
            }

            setSuccessMessage('Password changed successfully! Redirecting to Sign In...');
            setTimeout(() => router.push('/signin'), 3000);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setErrorMessages([error.message || 'Something went wrong']);
            } else {
                setErrorMessages(['An unknown error occurred.']);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md w-full bg-[#2c2c2c] rounded-lg shadow-md p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Change Your Password</h1>

            {errorMessages.length > 0 && (
                <div className="text-red-500 text-sm text-center mb-4">
                    {errorMessages.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </div>
            )}
            {successMessage && (
                <p className="text-green-500 text-sm text-center mb-4">{successMessage}</p>
            )}

            <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 mb-4 rounded bg-[#3a3a3a] text-[#e0e0e0]"
            />
            <PasswordStrengthBar password={password} />
            <input
                type="text"
                placeholder="2FA Code"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                className="w-full p-2 mt-4 mb-4 rounded bg-[#3a3a3a] text-[#e0e0e0]"
            />
            <button
                onClick={handleVerifyAndChangePassword}
                disabled={loading}
                className={`w-full py-2 rounded text-[#e0e0e0] ${
                    loading
                        ? 'bg-[#5a5a5a] cursor-not-allowed'
                        : 'bg-[#3a3a3a] hover:bg-[#4a4a4a]'
                }`}
            >
                {loading ? 'Processing...' : 'Change Password'}
            </button>
        </div>
    );
}

'use client';

import { useState } from 'react';

interface Verify2FAFormProps {
    userId: string;
}

export default function Verify2FAForm({ userId }: Verify2FAFormProps) {
    const [verificationCode, setVerificationCode] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null); // Clear existing errors

        try {
            const response = await fetch('/api/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: verificationCode,
                    userId,
                }),
            });

            if (response.ok) {
                setIsVerified(true);
            } else {
                const data = await response.json();
                setErrorMessage(data.message || 'Verification failed. Please try again.');
            }
        } catch {
            setErrorMessage('An unexpected error occurred.');
        }
    };

    if (isVerified) {
        return (
            <div className="text-center">
                <p className="text-green-500 text-lg">2FA verification successful!</p>
                <button
                    onClick={() => (window.location.href = '/')}
                    className="mt-4 py-2 px-4 rounded bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0]"
                >
                    Go to Homepage
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}
            <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="w-full px-4 py-2 bg-[#2c2c2c] text-[#e0e0e0] border border-[#3d3d3d] rounded focus:ring-[#5a5a5a] focus:border-[#5a5a5a] text-center"
            />
            <button
                type="submit"
                className="w-full py-2 rounded bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e0e0e0]"
            >
                Verify Code
            </button>
        </form>
    );
}

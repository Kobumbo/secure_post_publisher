'use client';

import SignInForm from './SignInForm';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function SignInPage() {
    const [nonce, setNonce] = useState<string | null>(null);

    useEffect(() => {
        const cookies = document.cookie.split('; ');
        const nonceCookie = cookies.find((cookie) => cookie.startsWith('nonce='));
        if (nonceCookie) {
            setNonce(nonceCookie.split('=')[1]);
        }
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#1c1c1c] text-[#e0e0e0] px-4">
            <div className="max-w-md w-full bg-[#2c2c2c] rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-center mb-4">Sign In</h1>
                <p className="text-sm text-center mb-6 text-[#a0a0a0]">
                    Welcome back! Please sign in to your account.
                </p>
                <SignInForm nonce={nonce} />
                <p className="text-sm text-center mt-4 text-[#a0a0a0]">
                    Don’t have an account?{' '}
                    <Link href="/signup" className="text-[#4a90e2] hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

// app/signup/page.tsx

import SignUpForm from './SignUpForm';
import Link from 'next/link';

export default function SignupPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#1c1c1c] text-[#e0e0e0] px-4">
            <div className="max-w-md w-full bg-[#2c2c2c] rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-center mb-4">Sign Up</h1>
                <p className="text-sm text-center mb-6 text-[#a0a0a0]">
                    Please fill in the form below to create an account.
                </p>
                <SignUpForm />
                <p className="text-sm text-center mt-4 text-[#a0a0a0]">
                    Already have an account?{' '}
                    <Link href="/signin" className="text-[#4a90e2] hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';

export default function SignInForm({ nonce }: { nonce: string | null }) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message || 'Invalid email or password.');
            }

            // Redirect to the homepage or dashboard upon successful sign-in
            window.location.href = '/';
        } catch (error: unknown) {
            if (error instanceof Error) {
                setErrorMessage(error.message || 'Failed to sign in.');
            } else {
                setErrorMessage('An unknown error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessage && (
                <div
                    nonce={nonce || undefined}
                    className="text-red-500 text-sm text-center"
                    dangerouslySetInnerHTML={{
                        __html: errorMessage,
                    }}
                />
            )}

            <div>
                <label htmlFor="email" className="block text-sm mb-1">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-[#2c2c2c] text-[#e0e0e0] border border-[#3d3d3d] rounded focus:ring-[#5a5a5a] focus:border-[#5a5a5a] outline-none"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm mb-1">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-[#2c2c2c] text-[#e0e0e0] border border-[#3d3d3d] rounded focus:ring-[#5a5a5a] focus:border-[#5a5a5a] outline-none"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2 rounded text-[#e0e0e0] ${
                    isSubmitting
                        ? 'bg-[#5a5a5a] cursor-not-allowed'
                        : 'bg-[#3a3a3a] hover:bg-[#4a4a4a]'
                }`}
            >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
        </form>
    );
}

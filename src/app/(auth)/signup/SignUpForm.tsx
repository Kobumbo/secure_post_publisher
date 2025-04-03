'use client';

import { useState } from 'react';
import PasswordStrengthBar from '@/components/PasswordStrengthBar';

export default function SignUpForm() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validatePassword = (password: string) => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long.');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter.');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter.');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character.');
        }

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessages([]);
        setSuccessMessage(null);
        setIsSubmitting(true);

        // Validate password
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
            setErrorMessages(passwordErrors);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const { message } = await response.json();
                throw new Error(message || 'Something went wrong');
            }

            setSuccessMessage('Account created successfully!');
            setFormData({ name: '', email: '', password: '' });
        } catch (error: unknown) {
            if (error instanceof Error) {
                setErrorMessages([error.message || 'Something went wrong']);
            } else {
                setErrorMessages(['An unknown error occurred.']);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessages.length > 0 && (
                <div className="text-red-500 text-sm text-center">
                    {errorMessages.map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </div>
            )}
            {successMessage && (
                <p className="text-green-500 text-sm text-center">{successMessage}</p>
            )}

            <div>
                <label htmlFor="name" className="block text-sm mb-1">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-[#2c2c2c] text-[#e0e0e0] border border-[#3d3d3d] rounded focus:ring-[#5a5a5a] focus:border-[#5a5a5a] outline-none"
                />
            </div>

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
                <PasswordStrengthBar password={formData.password} />
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
                {isSubmitting ? 'Signing Up...' : 'Sign Up'}
            </button>
        </form>
    );
}

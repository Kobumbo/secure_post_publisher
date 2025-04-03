import { getUserFromSession } from '@/utils/session';
import Setup2FAForm from './Setup2FAForm';
import { redirect } from 'next/navigation';

export default async function Setup2FAPage() {
    const user = await getUserFromSession();

    // Redirect to the sign-in page if the user is not found
    if (!user) {
        redirect('/signin');
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#1c1c1c] text-[#e0e0e0] px-4">
            <div className="max-w-md w-full bg-[#2c2c2c] rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-center mb-4">Set Up 2FA</h1>
                <p className="text-sm text-center mb-6 text-[#a0a0a0]">
                    Enable Two-Factor Authentication for enhanced account security.
                </p>
                <Setup2FAForm userId={user.id} />
            </div>
        </div>
    );
}

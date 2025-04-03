import { getUserFromSession } from '@/utils/session';
import { redirect } from 'next/navigation';
import Verify2FAForm from './Verify2FAForm';

export default async function Verify2FAPage() {
    const user = await getUserFromSession();

    // Redirect to the sign-in page if the user is not found
    if (!user) {
        redirect('/signin');
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#1c1c1c] text-[#e0e0e0] px-4">
            <div className="max-w-md w-full bg-[#2c2c2c] rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-center mb-4">Verify 2FA</h1>
                <p className="text-sm text-center mb-6 text-[#a0a0a0]">
                    Enter your authentication code to complete the 2FA setup.
                </p>
                <Verify2FAForm userId={user.id} />
            </div>
        </div>
    );
}

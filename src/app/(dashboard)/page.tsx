import { redirect } from 'next/navigation';
import MainPageContent from './MainPageContent';
import { getUserFromSession } from '@/utils/session';

export default async function HomePage() {
    const user = await getUserFromSession();

    if (!user) {
        redirect('/signin');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#1c1c1c] text-[#e0e0e0] px-4">
            <div className="w-full max-w-3xl mx-auto p-4">
                <MainPageContent user={user} />
            </div>
        </div>
    );
}

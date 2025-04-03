import { redirect } from 'next/navigation';
import ChangePasswordContent from './ChangePasswordContent';
import {getUserFromSession} from "@/utils/session";

export default async function ChangePasswordPage() {
    const user = await getUserFromSession();

    if (!user) {
        redirect('/signin');
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#1c1c1c] text-[#e0e0e0] px-4">
            <ChangePasswordContent userId={user.id} />
        </div>
    );
}

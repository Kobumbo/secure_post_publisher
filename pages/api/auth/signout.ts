import { NextApiRequest, NextApiResponse } from 'next';
import { parse, serialize } from 'cookie';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const cookies = parse(req.headers.cookie || '');
    const sessionId = cookies.session_id;

    if (sessionId) {
        // Delete the session from the database
        await prisma.session.delete({
            where: { id: sessionId },
        });
    }

    // Clear the cookie
    res.setHeader(
        'Set-Cookie',
        serialize('session_id', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            expires: new Date(0), // Expire the cookie immediately
            sameSite: 'strict',
        })
    );

    return res.status(200).json({ message: 'Signed out successfully' });
}

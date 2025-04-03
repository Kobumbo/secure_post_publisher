import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(401).json({ message: 'Unauthorized: No session ID provided.' });
    }

    try {
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: { user: true },
        });

        if (!session || new Date() > session.expiresAt) {
            return res.status(401).json({ message: 'Unauthorized: Invalid or expired session.' });
        }

        return res.status(200).json({
            session: {
                is2FAVerified: session.is2FAVerified,
            },
            user: {
                is2FAEnabled: session.user.is2FAEnabled,
            },
        });
    } catch (error) {
        console.error('Error validating session:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
}

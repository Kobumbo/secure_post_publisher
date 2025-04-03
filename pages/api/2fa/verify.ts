import { NextApiRequest, NextApiResponse } from 'next';
import speakeasy from 'speakeasy';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { decrypt } from '@/utils/crypto';
import {twoFASchema2} from '@/utils/schema';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, code } = twoFASchema2.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.totpSecret) {
            return res.status(404).json({ message: 'User not found or 2FA is not enabled.' });
        }


        const decryptedSecret = decrypt(user.totpSecret);


        const verified = speakeasy.totp.verify({
            secret: decryptedSecret,
            encoding: 'base32',
            token: code,
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid 2FA code.' });
        }


        await prisma.session.updateMany({
            where: { userId },
            data: { is2FAVerified: true },
        });

        return res.status(200).json({ message: '2FA verified successfully!' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation failed',
                errors: error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }

        console.error('Error during 2FA verification:', error);
        return res.status(500).json({ message: 'An unexpected error occurred.' });
    } finally {
        await prisma.$disconnect();
    }
}

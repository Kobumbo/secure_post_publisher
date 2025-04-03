import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import {twoFASchema} from '@/utils/schema';
import speakeasy from 'speakeasy';
import { PrismaClient } from '@prisma/client';
import { encrypt } from '@/utils/crypto';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, code, secret } = twoFASchema.parse(req.body);


        const verified = speakeasy.totp.verify({
            secret,
            encoding: 'base32',
            token: code,
        });

        if (!verified) {
            return res.status(400).json({ message: 'Invalid 2FA code' });
        }

        // Encrypt the TOTP secret
        const encryptedSecret = encrypt(secret);

        // Enable 2FA for the user and store the encrypted secret
        await prisma.user.update({
            where: { id: userId },
            data: { is2FAEnabled: true, totpSecret: encryptedSecret },
        });

        // Update the session to set is2FAVerified to true
        await prisma.session.updateMany({
            where: { userId },
            data: { is2FAVerified: true },
        });

        return res.status(200).json({ message: '2FA verified and setup complete!' });
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
        return res.status(500).json({ message: 'An unexpected error occurred' });
    } finally {
        await prisma.$disconnect();
    }
}

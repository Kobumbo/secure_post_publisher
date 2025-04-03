import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { changePasswordSchema } from '@/utils/schema';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, password } = changePasswordSchema.parse(req.body);

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            return res.status(400).json({ message: 'New password cannot be the same as the current password.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        // Remove all active sessions for the user
        await prisma.session.deleteMany({
            where: { userId },
        });

        return res.status(200).json({ message: 'Password changed successfully, and sessions cleared.' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res
                .status(400)
                .json({ message: 'Validation error', errors: error.errors.map((e) => e.message) });
        }

        console.error('Error changing password:', error);
        return res.status(500).json({ message: 'Something went wrong' });
    } finally {
        await prisma.$disconnect();
    }
}

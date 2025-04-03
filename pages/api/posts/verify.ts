// pages/api/posts/verify.ts
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'POST') {
            const { postId } = req.body;

            if (!postId) {
                return res.status(400).json({ error: 'Post ID is required.' });
            }

            const post = await prisma.post.findUnique({
                where: { id: postId },
                include: { user: true },
            });

            if (!post) return res.status(404).json({ error: 'Post not found.' });
            if (!post.signature) return res.status(400).json({ error: 'Post is not signed.' });

            const dataToVerify = Buffer.from(
                JSON.stringify({
                    message: post.message,
                    image: post.image || '',
                })
            );

            const isValid = crypto.verify(
                'sha256',
                dataToVerify,
                { key: post.user.publicKey, padding: crypto.constants.RSA_PKCS1_PADDING },
                Buffer.from(post.signature, 'base64')
            );

            return res.status(200).json({ valid: isValid });
        } else {
            res.setHeader('Allow', ['POST']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        console.error('Error verifying signature:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}
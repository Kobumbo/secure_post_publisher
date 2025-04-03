import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { sanitizeInput } from '@/utils/sanitize';
import { postSchema } from '@/utils/schema';
import { decryptWithPassword } from '@/utils/crypto';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'POST') {
            const parsedData = postSchema.safeParse(req.body);
            if (!parsedData.success) {
                const errors = parsedData.error.errors.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));
                return res.status(400).json({ errors });
            }

            const { userId, message, image } = parsedData.data;
            const sanitizedMessage = await sanitizeInput(message);

            const post = await prisma.post.create({
                data: {
                    userId,
                    message: sanitizedMessage,
                    image: image || null,
                },
                include: {
                    user: { select: { name: true } },
                },
            });

            return res.status(201).json(post);
        } else if (req.method === 'GET') {
            const skip = parseInt(Array.isArray(req.query.skip) ? req.query.skip[0] : req.query.skip || '0', 10);
            const take = parseInt(Array.isArray(req.query.take) ? req.query.take[0] : req.query.take || '10', 10);

            if (isNaN(skip) || isNaN(take)) {
                return res.status(400).json({ error: 'Invalid pagination parameters.' });
            }

            const posts = await prisma.post.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true, 
                        },
                    },
                },
            });


            return res.status(200).json(posts);
        } else if (req.method === 'PUT') {
            // Signing the post
            const { postId, password } = req.body;

            if (!postId || !password) {
                return res.status(400).json({ error: 'Post ID and password are required.' });
            }

            const post = await prisma.post.findUnique({ where: { id: postId } });
            if (!post) return res.status(404).json({ error: 'Post not found.' });

            const user = await prisma.user.findUnique({ where: { id: post.userId } });
            if (!user) return res.status(404).json({ error: 'User not found.' });

            const privateKey = decryptWithPassword(user.encryptedPrivateKey, password);

            const dataToSign = Buffer.from(
                JSON.stringify({
                    message: post.message,
                    image: post.image || '',
                })
            );

            const signature = crypto.sign('sha256', dataToSign, { key: privateKey });

            const updatedPost = await prisma.post.update({
                where: { id: postId },
                data: { signature: signature.toString('base64') },
            });

            return res.status(200).json({ message: 'Post signed successfully.', post: updatedPost });
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            return res.status(405).json({ error: `Method ${req.method} not allowed` });
        }
    } catch (error) {
        console.error('Error in API handler:', error);
        return res.status(500).json({ error: 'Internal server error' });
    } finally {
        await prisma.$disconnect();
    }
}

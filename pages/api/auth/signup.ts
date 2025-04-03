import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { signupSchema } from '@/utils/schema';
import { z } from 'zod';
import { generateKeyPairSync } from 'crypto';
import {encrypt, encryptWithPassword} from '@/utils/crypto';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const validatedData = signupSchema.parse(req.body);

        const { name, email, password } = validatedData;

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate public and private key pair
        const { publicKey, privateKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        const encryptedPrivateKey = encryptWithPassword(privateKey, password);


        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword, 
                publicKey,
                encryptedPrivateKey,
            },
        });


        return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors.map((err) => err.message).join(', ') });
        }

        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Something went wrong' });
    } finally {
        await prisma.$disconnect();
    }
}

import { NextApiRequest, NextApiResponse } from 'next';
import speakeasy from 'speakeasy';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
        const secret = speakeasy.generateSecret({ length: 10 });

        res.status(200).json({
            otpauthUrl: secret.otpauth_url,
            secret: secret.base32,
        });
    } catch (error) {
        console.error('Error generating 2FA secret:', error);
        res.status(500).json({ message: 'Failed to generate 2FA secret.' });
    }
}

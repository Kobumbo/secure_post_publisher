import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { serialize } from "cookie";
import redis from "@/utils/redisClient";
import { signinSchema } from "@/utils/schema";
import { z } from "zod";

const prisma = new PrismaClient();

// Constants for blocking
const MAX_ATTEMPTS = 5; // Maximum allowed failed login attempts
const BLOCK_DURATION = 300; // Block duration in seconds
const DELAY_TIME = 500;

// Function to add delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // 500ms delay
        await delay(DELAY_TIME);
        console.log(`Adding ${DELAY_TIME}ms delay.`);

        const validatedData = signinSchema.parse(req.body);
        const { email, password } = validatedData;

        const redisKey = email;

        const failedAttempts = await redis.get(redisKey);

        if (failedAttempts && Number(failedAttempts) >= MAX_ATTEMPTS) {
            const timeLeft = await redis.ttl(redisKey);
            return res.status(403).json({
                message: `Account is locked. Try again in ${timeLeft} seconds.`,
            });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            const updatedFailedAttempts = await redis.incr(redisKey);

            if (updatedFailedAttempts === 1) {
                await redis.expire(redisKey, BLOCK_DURATION);
            }

            if (updatedFailedAttempts >= MAX_ATTEMPTS) {
                await redis.expire(redisKey, BLOCK_DURATION); // Reset expiration
                return res.status(403).json({
                    message: `Account is locked. Try again in ${BLOCK_DURATION} seconds.`,
                });
            }

            const attemptsLeft = MAX_ATTEMPTS - updatedFailedAttempts;
            return res.status(401).json({
                message: `Invalid email or password. ${attemptsLeft} attempt(s) left.`,
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            const updatedFailedAttempts = await redis.incr(redisKey);

            if (updatedFailedAttempts === 1) {
                await redis.expire(redisKey, BLOCK_DURATION);
            }

            if (updatedFailedAttempts >= MAX_ATTEMPTS) {
                await redis.expire(redisKey, BLOCK_DURATION); // Reset expiration
                return res.status(403).json({
                    message: `Account is locked. Try again in ${BLOCK_DURATION} seconds.`,
                });
            }

            const attemptsLeft = MAX_ATTEMPTS - updatedFailedAttempts;
            return res.status(401).json({
                message: `Invalid email or password. ${attemptsLeft} attempt(s) left.`,
            });
        }

        // On successful login, reset attempts in Redis
        await redis.del(redisKey);

        // Create a session
        const session = await prisma.session.create({
            data: {
                userId: user.id,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
            },
        });

        // Set the session ID in a cookie
        res.setHeader(
            "Set-Cookie",
            serialize("session_id", session.id, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24, // 24 hours
                sameSite: "strict",
            })
        );

        return res.status(200).json({
            message: "Sign in successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.errors.map((err) => err.message).join(", ") });
        }

        console.error("Sign In Error:", error);
        return res.status(500).json({ message: "Something went wrong. Please try again." });
    } finally {
        await prisma.$disconnect();
    }
}

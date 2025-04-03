import { z } from 'zod';

export const signupSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Name is required" })
        .refine((val) => !/[^a-zA-Z\s]/.test(val), { message: "Name must not contain special characters or numbers" }),
    email: z
        .string()
        .email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .refine((val) => !/password/i.test(val), { message: "Password must not contain the word 'password'" })
        .refine((val) => /[A-Z]/.test(val), { message: "Password must contain at least one uppercase letter" })
        .refine((val) => /[a-z]/.test(val), { message: "Password must contain at least one lowercase letter" })
        .refine((val) => /[0-9]/.test(val), { message: "Password must contain at least one digit" })
        .refine((val) => /[!@#$%^&*_~]/.test(val), { message: "Password must contain at least one special character" }),
});

export type SignupInput = z.infer<typeof signupSchema>;

// Schema for validating signin input
export const signinSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email address" }) // Validates email format
        .refine((val) => /^[^\s]+@[^\s]+\.[^\s]+$/.test(val), {
            message: "Email contains invalid characters",
        }),
    password: z
        .string()
        .refine((val) => /^[a-zA-Z0-9!@#$%^&*_~]+$/.test(val), {
            message: "Password contains invalid characters. Only letters, numbers, and !@#$%^&* are allowed.",
        }),
});


// Type definition for signin input
export type SigninInput = z.infer<typeof signinSchema>;


// Schema for validating 2FA setup and verification
export const twoFASchema = z.object({
    userId: z
        .string()
        .uuid({ message: "User ID must be a valid UUID" }), // Validate UUID format
    code: z
        .string()
        .length(6, { message: "2FA code must be exactly 6 digits" })
        .refine((val) => /^[0-9]+$/.test(val), { message: "2FA code must contain only digits" }),
    secret: z
        .string()
        .length(16, { message: "Secret must be 16 characters long" })
});


// Type definition for 2FA input
export type TwoFAInput = z.infer<typeof twoFASchema>;

// Schema to validate request input
export const twoFASchema2 = z.object({
    userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
    code: z
        .string()
        .length(6, { message: "2FA code must be exactly 6 digits" })
        .refine((val) => /^[0-9]+$/.test(val), { message: "2FA code must contain only digits" }),
});

export type TwoFAInput2 = z.infer<typeof twoFASchema2>;

export const changePasswordSchema = z.object({
    userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
    password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters long' })
        .refine((val) => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
        .refine((val) => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter' })
        .refine((val) => /[0-9]/.test(val), { message: 'Password must contain at least one digit' })
        .refine((val) => /[!@#$%^&*_~]/.test(val), { message: 'Password must contain at least one special character' }),
});

export type changePassword = z.infer<typeof changePasswordSchema>;

export const postSchema = z.object({
    userId: z
        .string()
        .uuid({ message: 'Invalid User ID. Please ensure it is a valid UUID.' }),
    message: z
        .string()
        .min(1, { message: 'The message cannot be empty. Please write something.' })
        .max(1000, { message: 'The message is too long. It cannot exceed 1000 characters.' })
        .refine((val) => /^[a-zA-Z0-9 .,!?'"()\-*~_<>\/;]*$/.test(val), {
            message: 'The message contains invalid characters. Only letters, numbers, spaces, and basic punctuation (.,!?\'"()-) are allowed.',
        }),
    image: z
        .string()
        .url({ message: 'The image URL is invalid. Please provide a valid URL.' })
        .nullable()
        .optional(),
});


export type PostInput = z.infer<typeof postSchema>;
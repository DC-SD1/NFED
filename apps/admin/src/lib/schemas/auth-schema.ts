import {z} from "zod";

export const AuthSchema = z.object({
    email: z.string({required_error: "Enter your email address."})
        .email({ message: "Enter a valid email address" })
        .refine(data => data.trim() !== '', {
            message: 'Email field cannot be empty',
        }).refine(
            (val) => val.toLowerCase().endsWith("@completefarmer.com"),
            { message: "Email must be a complete farmer email." }
        ),
});

export type AuthData = z.infer<typeof AuthSchema>;
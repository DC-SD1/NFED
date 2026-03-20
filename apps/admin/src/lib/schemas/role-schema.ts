import {z} from "zod";

export const EditRoleSchema = z.object({
    role: z.string({required_error: "Select a role."})
        .refine(data => data.trim() !== '', {
            message: 'Role field cannot be empty',
        }),
});

export type EditRoleData = z.infer<typeof EditRoleSchema>;
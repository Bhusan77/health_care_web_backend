import z from "zod";
import { UserSchema } from "../types/user.type";
// re-use UserSchema from types
export const CreateUserDTO = UserSchema.pick(
    {
        email: true,
        username: true,
        password: true,
        profile:true,
    }
)
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const UpdateUserDTO = UserSchema.pick({
    username: true,
    profile: true,
})
.partial()
.merge(
    z.object({
        password: z.string().optional(),
    })
);

export type UpdateUserDTO = z.infer<typeof UpdateUserDTO>;
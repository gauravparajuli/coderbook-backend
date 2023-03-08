import { Schema, model } from 'mongoose'

export interface IUser {
    name: string
    email: string
    password: string
    gravatar?: string
}

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        gravatar: {
            type: String,
        },
    },
    { timestamps: true }
)

export default model('User', userSchema)

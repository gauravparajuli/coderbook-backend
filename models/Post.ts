import { Schema, model } from 'mongoose'

const postSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        name: {
            type: String,
        },
        gravatar: {
            type: String,
        },
        likes: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
            },
        ],
        comments: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                text: {
                    type: String,
                    required: true,
                },
                name: {
                    type: String,
                },
                gravatar: {
                    type: String,
                },
                date: {
                    type: Date,
                    deafult: Date.now(),
                },
            },
        ],
    },
    { timestamps: true }
)

export default model('Post', postSchema)

import { Schema, model, Document } from 'mongoose'

export interface IExperience extends Schema.Types.Subdocument {
    title: string
    company: string
    location?: string
    from: Date
    to?: Date
    current?: boolean
    description?: string
}

export interface IEducation extends Document {
    school: string
    degree: string
    fieldOfStudy: string
    from: Date
    to?: Date
    current?: boolean
    description?: string
}

export interface IProfile extends Document {
    user: string
    company?: string
    website?: string
    location?: string
    bio?: string
    status: string
    githubUsername?: string
    skills: string | [string]
    social?: {
        youtube?: string
        facebook?: string
        twitter?: string
        instagram?: string
        linkedIn?: string
    }
    experience?: [IExperience]
    education?: [IEducation]
}

const profileSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        company: {
            type: String,
        },
        website: {
            type: String,
        },
        location: {
            type: String,
        },
        status: {
            type: String,
            required: true,
        },
        skills: {
            type: [String],
            required: true,
        },
        bio: {
            type: String,
        },
        githubUsername: {
            type: String,
        },
        experience: [
            {
                title: { type: String, required: true },
                company: { type: String, required: true },
                location: { type: String },
                from: { type: Date, required: true },
                to: { type: Date },
                current: {
                    type: Boolean,
                    default: false,
                },
                description: {
                    type: String,
                },
            },
        ],
        education: [
            {
                school: { type: String, required: true },
                degree: { type: String, required: true },
                fieldOfStudy: { type: String, required: true },
                from: { type: Date, required: true },
                to: { type: Date },
                current: {
                    type: Boolean,
                    default: false,
                },
                description: {
                    type: String,
                },
            },
        ],
        social: [
            {
                youtube: {
                    type: String,
                },
                twitter: {
                    type: String,
                },
                facebook: {
                    type: String,
                },
                linkedIn: {
                    type: String,
                },
                instagram: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true }
)

export default model('Profile', profileSchema)

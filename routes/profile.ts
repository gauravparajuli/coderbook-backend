import { Router, Request, Response, NextFunction } from 'express'
import isAuthenticated from '../middlewares/is-authenticated'
import { userProperty } from '../middlewares/is-authenticated'
import { check, validationResult } from 'express-validator'
import Profile from '../models/Profile'
import User from '../models/User'

const router = Router()

interface profile {
    user: string
    company?: string
    website?: string
    location?: string
    bio?: string
    status: string
    githubUsername?: string
    skills: string
    social?: {
        youtube?: string
        facebook?: string
        twitter?: string
        instagram?: string
        linkedIn?: string
    }
}

// @route      GET api/profile
// @desc       Test route
// @access     Public
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'profile route working' })
})

// @route      GET api/profile/i
// @desc       get currently authenticated user profile
// @access     Private
router.get(
    '/i',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        try {
            const profile = await Profile.findOne({
                user: req.user!.id,
            }).populate('User', ['name', 'avatar'])
            // console.log(profile)

            if (!profile) {
                res.status(400).json({
                    msg: 'There is no profile for this user',
                })
            }

            res.status(200).json(profile)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

// @route      PUT api/profile/
// @desc       Create or update user profile
// @access     Private
router.put(
    '/',
    isAuthenticated,
    [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty(),
    ],
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubUsername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedIn,
        } = req.body

        // build profile fields
        const profileFields = {} as profile
        profileFields.user = req.user!.id
        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (githubUsername) profileFields.githubUsername = githubUsername
        if (skills)
            profileFields.skills = skills
                .split(',')
                .map((skill: string) => skill.trim().toUpperCase())

        // build social fields
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube
        if (facebook) profileFields.social.facebook = facebook
        if (twitter) profileFields.social.twitter = twitter
        if (instagram) profileFields.social.instagram = instagram
        if (linkedIn) profileFields.social.linkedIn = linkedIn

        try {
            let profile = await Profile.findOne({ user: req.user?.id })

            // if a profile already exits, update
            if (profile) {
                profile = await Profile.findOneAndUpdate(
                    { user: req.user!.id },
                    { $set: profileFields },
                    { new: true }
                )
                return res.status(200).json(profile)
            }

            // create a new profile
            profile = new Profile(profileFields)
            await profile.save()

            console.log(profileFields)
            res.status(201).json(profile)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

export default router

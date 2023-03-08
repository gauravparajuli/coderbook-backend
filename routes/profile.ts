import { Router, Request, Response, NextFunction } from 'express'
import isAuthenticated from '../middlewares/is-authenticated'
import { userProperty } from '../middlewares/is-authenticated'
import { check, validationResult } from 'express-validator'
import Profile, { IProfile, IExperience } from '../models/Profile'
import User from '../models/User'
import axios from 'axios'

const router = Router()

// @route      GET api/profile
// @desc       Get all profiles
// @access     Public
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profiles = await Profile.find().populate('user', [
            'name',
            'gravatar',
        ])
        res.status(200).json(profiles)
    } catch (err: any) {
        console.log(err.message)
        res.status(500).send('Internal server error')
    }
})

// @route      GET api/profile/user/:userId
// @desc       Get profile by user id
// @access     Public
router.get(
    '/user/:userId',
    async (req: Request, res: Response, next: NextFunction) => {
        const { userId } = req.params
        try {
            const profile = await Profile.findOne({ user: userId }).populate(
                'user',
                ['name', 'gravatar']
            )

            if (!profile)
                return res.status(404).json({ msg: 'Profile not found' })

            res.status(200).json(profile)
        } catch (err: any) {
            console.log(err.message)
            if (err.kind == 'ObjectId')
                return res.status(404).json({ msg: 'Profile not found' })
            res.status(500).send('Internal server error')
        }
    }
)

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
            }).populate('user', ['name', 'gravatar'])
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
        const profileFields = {} as IProfile
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

            res.status(201).json(profile)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

// @route      DELETE api/profile/
// @desc       delete user, profile and posts
// @access     Private
router.delete(
    '/',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        try {
            // remove profile
            await Profile.findOneAndRemove({ user: req.user!.id })

            // remove posts

            // remove user
            await User.findOneAndRemove({ _id: req.user!.id })

            res.status(204).send()
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

// @route      PUT api/profile/experience
// @desc       create/update profile experience
// @access     Private
router.put(
    '/experience',
    isAuthenticated,
    [
        check('title', 'Title is required').not().isEmpty(),
        check('company', 'Company is required').not().isEmpty(),
        check('from', 'From is required').not().isEmpty(),
    ],
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { title, company, location, from, to, current, description } =
            req.body

        const newExperience = {
            title,
            company,
            location,
            from,
            to,
            current,
            description,
        }

        try {
            const profile = await Profile.findOne({ user: req.user!.id })
            if (!profile)
                return res.status(404).json({ message: 'Profile not found' })

            profile.experience.unshift(newExperience)
            await profile.save()

            res.status(201).json(profile)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

// @route      DELETE api/profile/experience/:expId
// @desc       delete profile experience
// @access     Private
router.delete(
    '/experience/:expId',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const { expId } = req.params
        try {
            await Profile.findOneAndUpdate(
                { user: req.user!.id },
                { $pull: { experience: { _id: expId } } }
            )
            res.status(204).json()
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

// @route      DELETE api/profile/education/:eduId
// @desc       delete profile education
// @access     Private
router.delete(
    '/education/:eduId',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const { eduId } = req.params
        try {
            await Profile.findOneAndUpdate(
                { user: req.user!.id },
                { $pull: { education: { _id: eduId } } }
            )
            res.status(204).json()
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

// @route      PUT api/profile/education
// @desc       create/update profile education
// @access     Private
router.put(
    '/education',
    isAuthenticated,
    [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldOfStudy', 'Field of Study is required').not().isEmpty(),
        check('from', 'From is required').not().isEmpty(),
    ],
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { school, degree, fieldOfStudy, from, to, current, description } =
            req.body

        const newEducation = {
            school,
            degree,
            fieldOfStudy,
            from,
            to,
            current,
            description,
        }

        try {
            const profile = await Profile.findOne({ user: req.user!.id })
            if (!profile)
                return res.status(404).json({ message: 'Profile not found' })

            profile.education.unshift(newEducation)
            await profile.save()

            res.status(201).json(profile)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

// @route      GET api/profile/github/:username
// @desc       get user repos from github
// @access     Public
router.get(
    '/github/:username',
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const { username } = req.params
        try {
            const { data, status, statusText } = await axios({
                method: 'get',
                url: `https://api.github.com/users/${username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_SECRET_KEY}`,
                headers: {
                    'user-agent': 'node.js',
                },
            })
            if (status !== 200)
                return res
                    .status(404)
                    .json({ msg: 'Github profile was not found' })

            res.status(200).json(data)
        } catch (err: any) {
            if (err.response.status === 404)
                return res
                    .status(404)
                    .json({ msg: 'Github profile was not found' })
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

export default router

import { Router, Request, Response, NextFunction } from 'express'
import isAuthenticated from '../middlewares/is-authenticated'
import { userProperty } from '../middlewares/is-authenticated'
import { check, validationResult } from 'express-validator'
import Post from '../models/Post'
import Profile from '../models/Profile'
import User from '../models/User'

const router = Router()

// @route      POST api/posts
// @desc       Create new post
// @access     Private
router.post(
    '/',
    isAuthenticated,
    [check('text', 'Text is required').not().isEmpty()],
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const user = await User.findById(req.user!.id).select('-password')

            if (!user) return res.status(404).json({ msg: 'User not found' })

            const newPost = new Post({
                text: req.body.text,
                name: user.name,
                gravatar: user.gravatar,
                user: req.user!.id,
            })

            await newPost.save()
            res.status(201).json(newPost)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

export default router

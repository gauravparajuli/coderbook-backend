import { Router, Request, Response, NextFunction } from 'express'
import isAuthenticated from '../middlewares/is-authenticated'
import { userProperty } from '../middlewares/is-authenticated'
import Profile from '../models/Profile'
import User from '../models/User'

const router = Router()

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

export default router

import { Router, Request, Response, NextFunction } from 'express'
import isAuthenticated from '../middlewares/is-authenticated'
import { userProperty } from '../middlewares/is-authenticated'
import User from '../models/User'

const router = Router()

// @route      GET api/auth
// @desc       Get details of authenticated user
// @access     Private
router.get(
    '/',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const { id } = req.user!
        try {
            const user = await User.findById(id).select('-password')
            res.status(200).json(user)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

export default router

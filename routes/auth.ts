import { Router, Request, Response, NextFunction } from 'express'
import isAuthenticated from '../middlewares/is-authenticated'
import { userProperty } from '../middlewares/is-authenticated'

const router = Router()

// @route      GET api/auth
// @desc       Get details of authenticated user
// @access     Private
router.get(
    '/',
    isAuthenticated,
    (req: Request & userProperty, res: Response, next: NextFunction) => {
        res.status(200).json({ message: 'auth route working' })
    }
)

export default router

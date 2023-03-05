import { Router, Request, Response, NextFunction } from 'express'
import isAuthenticated from '../middlewares/is-authenticated'
import { userProperty } from '../middlewares/is-authenticated'
import User from '../models/User'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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

// @route      POST api/auth
// @desc       Authenticate user
// @access     Public
router.post(
    '/',
    [
        check('email', 'Email is required').isEmail(),
        check('password', 'Password is required').exists(),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body

        try {
            // see if user exists
            let user = await User.findOne({ email })
            if (!user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid email or password' }] })
            }

            // check if password matches
            if (!(await bcrypt.compare(password, user.password))) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'Invalid email or password' }] })
            }

            // send json web token
            const payload = {
                user: {
                    id: user.id,
                },
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET_KEY!, {
                expiresIn: 3600 * 24 * 7,
            })

            res.status(200).json({ token })
        } catch (err: any) {
            console.error(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

export default router

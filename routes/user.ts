import { Router, Request, Response, NextFunction } from 'express'
import { check, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import gravatar from 'gravatar'
import User from '../models/User'

const router = Router()

// @route      POST api/users
// @desc       Register user
// @access     Public
router.post(
    '/',
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 }),
    ],
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, email, password } = req.body

        try {
            // see if user exists
            let user = await User.findOne({ email })
            if (user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User alaready exists' }] })
            }

            // get user gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm',
            })

            user = new User({ name, email, password, avatar })

            // encrypt user password
            const salt = await bcrypt.genSalt(7)
            user.password = await bcrypt.hash(password, salt)
            await user.save()

            // send json web token

            res.status(200).json({ message: 'user registered' })
        } catch (err: any) {
            console.error(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

export default router

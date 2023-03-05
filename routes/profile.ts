import { Router, Request, Response, NextFunction } from 'express'

const router = Router()

// @route      GET api/profile
// @desc       Test route
// @access     Public
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'profile route working' })
})

export default router

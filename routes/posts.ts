import { Router, Request, Response, NextFunction } from 'express'

const router = Router()

// @route      GET api/posts
// @desc       Test route
// @access     Public
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: 'posts route working' })
})

export default router

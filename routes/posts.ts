import { Router, Request, Response, NextFunction } from 'express'
import isAuthenticated from '../middlewares/is-authenticated'
import { userProperty } from '../middlewares/is-authenticated'
import { check, validationResult } from 'express-validator'
import Post from '../models/Post'
import Profile from '../models/Profile'
import User from '../models/User'
import { Types } from 'mongoose'

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

// @route      GET api/posts
// @desc       Get all posts
// @access     Private
router.get(
    '/',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        try {
            const posts = await Post.find().sort({ createdAt: -1 })
            res.status(200).json(posts)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

// @route      GET api/posts/:postId
// @desc       Get a post by it's id
// @access     Private
router.get(
    '/:postId',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const { postId } = req.params
        try {
            const post = await Post.findById(postId)

            if (!post) return res.status(404).json({ msg: 'Post not found' })
            res.status(200).json(post)
        } catch (err: any) {
            console.log(err.message)
            if (err.kind === 'ObjectId')
                return res.status(404).json({ msg: 'Post not found' })
            res.status(500).send('Internal server error')
        }
    }
)

// @route      DELETE api/posts/:postId
// @desc       Delete a post by it's id
// @access     Private
router.delete(
    '/:postId',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const { postId } = req.params
        try {
            const post = await Post.findOneAndRemove({
                _id: postId,
                user: req.user!.id,
            })

            if (!post) return res.status(404).json({ msg: 'Post not found' })

            res.status(204).send()
        } catch (err: any) {
            console.log(err.message)
            if (err.kind === 'ObjectId')
                return res.status(404).json({ msg: 'Post not found' })
            res.status(500).send('Internal server error')
        }
    }
)

// @route      PUT api/posts/like/:postId
// @desc       Like a post
// @access     Private
router.put(
    '/like/:postId',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const { postId } = req.params
        try {
            const post = await Post.findById(postId)

            if (!post) return res.status(404).json({ msg: 'Post not found' })

            // check if the post has  already been liked
            if (
                post.likes.filter(
                    (like) => like.user!.toString() === req.user!.id
                ).length > 0
            )
                return res.status(400).json({ msg: 'Post already liked' })

            post.likes.unshift({ user: new Types.ObjectId(req.user!.id) })
            await post.save()
            res.status(201).json(post.likes)
        } catch (err: any) {
            console.log(err.message)
            if (err.kind === 'ObjectId')
                return res.status(404).json({ msg: 'Post not found' })
            res.status(500).send('Internal server error')
        }
    }
)

// @route      PUT api/posts/unlike/:postId
// @desc       Unlike a post
// @access     Private
router.put(
    '/unlike/:postId',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        const { postId } = req.params
        try {
            const post = await Post.findById(postId)

            if (!post) return res.status(404).json({ msg: 'Post not found' })

            post.likes = post.likes.filter(
                (like) => like.user!.toString() !== req.user!.id
            )
            await post.save()
            res.status(200).json(post.likes)
        } catch (err: any) {
            console.log(err.message)
            if (err.kind === 'ObjectId')
                return res.status(404).json({ msg: 'Post not found' })
            res.status(500).send('Internal server error')
        }
    }
)

// @route      POST api/posts/comment/:postId
// @desc       Create comment on post
// @access     Private
router.post(
    '/comment/:postId',
    isAuthenticated,
    [check('text', 'Text is required').not().isEmpty()],
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const user = await User.findById(req.user!.id).select('-password')
            const post = await Post.findById(req.params.postId)

            if (!user) return res.status(404).json({ msg: 'User not found' })
            if (!post) return res.status(404).json({ msg: 'Post not found' })

            const newComment = {
                text: req.body.text,
                name: user.name,
                gravatar: user.gravatar,
                user: user.id,
            }

            post.comments.unshift(newComment)
            await post.save()
            res.status(201).json(post.comments)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

// @route      DELETE api/posts/comment/:postId/:commentId
// @desc       Delete comment from post
// @access     Private
router.post(
    '/comment/:postId/:commentId',
    isAuthenticated,
    async (req: Request & userProperty, res: Response, next: NextFunction) => {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() })
            }

            const user = await User.findById(req.user!.id).select('-password')
            const post = await Post.findById(req.params.postId)

            if (!user) return res.status(404).json({ msg: 'User not found' })
            if (!post) return res.status(404).json({ msg: 'Post not found' })

            const newComment = {
                text: req.body.text,
                name: user.name,
                gravatar: user.gravatar,
                user: user.id,
            }

            post.comments.unshift(newComment)
            await post.save()
            res.status(201).json(post.comments)
        } catch (err: any) {
            console.log(err.message)
            res.status(500).send('Internal server error')
        }
    }
)

export default router

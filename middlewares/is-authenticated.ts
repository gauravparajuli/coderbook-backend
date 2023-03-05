import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'

dotenv.config()

const secretKey = process.env.JWT_SECRET_KEY!

export interface userProperty {
    user?: {
        id: string
    }
}

interface JwtPayload {
    user: {
        id: string
    }
}

const isAuthenticated = (
    req: Request & userProperty,
    res: Response,
    next: NextFunction
) => {
    const authorization = req.header('Authorization')
    const token = authorization ? authorization!.split(' ')[1] : undefined

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' })
    }

    // verify token
    try {
        const { user } = jwt.verify(token, secretKey) as JwtPayload
        req.user = user
        next()
    } catch (err: any) {
        console.log(err.message)
        res.status(401).json({ msg: 'Invalid token' })
    }
}

export default isAuthenticated

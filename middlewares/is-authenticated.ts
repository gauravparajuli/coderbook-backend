import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

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
    const token = req.header('Authorization')!.split(' ')[1]

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' })
    }

    // verify token
    try {
        const decoded = jwt.verify(token, secretKey) as JwtPayload
        const { user } = decoded
        req.user = user
        next()
    } catch {
        res.status(401).json({ msg: 'Invalid token' })
    }
}

export default isAuthenticated

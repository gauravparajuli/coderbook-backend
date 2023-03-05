import express, { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

// import routes here
import userRoutes from './routes/user'
import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import profileRoutes from './routes/profile'

// load env variables
dotenv.config()

const app = express()

// register middlewares here
app.use(express.json())

// register routes here
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/profile', profileRoutes)

const PORT = process.env.PORT || 8000
const MONGO_URI = process.env.MONGO_URI

const runServer = async () => {
    try {
        await mongoose.connect(MONGO_URI!)
        console.log('connected to mogodb')
        app.listen(PORT, () => {
            console.log(`Server running at ${PORT}`)
        })
    } catch (err: any) {
        console.log(err.message)
        process.exit(1) // exit the program
    }
}

runServer()

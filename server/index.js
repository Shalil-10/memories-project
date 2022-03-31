import express from 'express'
//import bodyParser from 'body-parser'
import cors from 'cors'
//import connectToMongo from './db.js'
import postRoutes from './routes/posts.js'
import userRoutes from './routes/users.js'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

const app = express()
dotenv.config()
// app.use(express.json({ limit: "30mb", extended: true }))
// app.use(bodyParser.json({ limit: '30mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(express.json({ limit: '30mb' }))
app.use(cors())

//Routes
app.get('/', (req, res) => {
    res.send("Hello to memories project")
})
app.use('/posts', postRoutes)
app.use('/user', userRoutes)


const PORT = process.env.PORT || 5000

const connectToMongo = async () => {
    try {
        //connect DB
        await mongoose.connect(process.env.CONNECTION_URL)
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }

}

connectToMongo()









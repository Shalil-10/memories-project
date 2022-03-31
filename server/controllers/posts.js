import mongoose from "mongoose"
import PostMessage from "../models/postMessage.js"

export const getPosts = async (req, res) => {
    const {page} = req.query
    try {
        const LIMIT = 6
        const startIndex = (Number(page) - 1) * LIMIT   //eg: page=2 -> starting index = 8  //req.query makes it string so conversion
        const total = await PostMessage.countDocuments({})

        const posts = await PostMessage.find().sort({_id: -1}).limit(LIMIT).skip(startIndex)    //first: sort in desc manner to get new post, then limit the posts, and then skip the posts (because we dont want to fetch the same posts again)
        
        res.status(200).json({data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)}) 
        // res.status(200).json({ posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT}) 
    
    } catch (error) {
        res.status(404).json({ message: error.message })
    }
}

//QUERY => /posts?page=1 -> page = 1
//PARAMS => /posts/12 -> id = 12

export const getPostsBySearch = async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        const title = new RegExp(searchQuery, "i");         // i == 'test' 'Test'

        const posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]});

        res.json( posts );
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}

export const getPost = async (req, res) => { 
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);

        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}





// export const createPost = async (res, req) => {
//     const { title, message, selectedFile, creator, tags } = req.body
//     const newPostMessage = new PostMessage({ title, message, selectedFile, creator, tags })
//     try {
//         await newPostMessage.save()
//         res.status(201).json(newPostMessage)
//     } catch (error) {
//         res.status(409).json({message: error.message})
//     }
// }
// export const createPost = async (req, res) => {
//     const post = req.body;
//     const newPost = new PostMessage(post);
//     try {
//         res.status(201).json(newPost)
//         await newPost.save();
//     } catch (error){
//         res.status(409).json({message: error.message})
//     }
// }
export const createPost = async (req, res) => {
    const post = req.body
    try {
        const newPostMessage = await PostMessage.create({ ...post, creator: req.userId, createdAt: new Date().toISOString() })
        res.status(201).json(newPostMessage)
    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}



export const updatePost = async (req, res) => {
    try {
        const { id } = req.params
        const post = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send('No post with that id')
        }
        const updatedPost = await PostMessage.findByIdAndUpdate(id, { ...post, _id: id }, { new: true })      //mongoose has => _id
        res.json(updatedPost)

    } catch (error) {
        res.status(409).json({ message: error.message })
    }
}

export const deletePost = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id')

    const deletedPost = await PostMessage.findByIdAndDelete(id)

    res.json(deletedPost)
}

export const likePost = async (req, res) => {
    const { id } = req.params

    if (!req.userId) return res.json({ message: 'Unauthenticated' })

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id')

    const post = await PostMessage.findById(id)

    const index = post.likes.findIndex((id) => id === String(req.userId))
    //The findIndex() method returns the index of the first element in the array that satisfies the provided testing function. Otherwise, it returns -1

    if (index === -1) {
        //like the post
        post.likes.push(req.userId)
    } else {
        post.likes = post.likes.filter((id) => id !== String(req.userId)) // we will filter all the other likes apart from the current user
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })

    res.status(200).json(updatedPost)

}
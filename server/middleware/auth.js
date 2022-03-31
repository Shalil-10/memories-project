import jwt from 'jsonwebtoken'

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const isCustomAuth = token.length < 500

        let decodedData

        if(token && isCustomAuth){
            decodedData = jwt.verify(token, 'test')    //custom auth token 
            req.userId = decodedData?.id
        }else{
            decodedData = jwt.decode(token)            // google O Auth
            req.userId = decodedData?.sub
        }
        next()
    } catch (error) {
        console.log(error)
    }
}

export default auth
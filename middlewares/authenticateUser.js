import jwt from 'jsonwebtoken'

export const authUser = async (req,res,next)=>{
    try {
        const { token } = req.cookies
        if(!token){
            return res.status(402).json({message:"User not authorised"})
        }

        const tokenVerified = await jwt.verify(token,process.env.JWT_SEC_KEY)
        if(!tokenVerified){
            return res.status(402).json({message:"User token not verified"})
        }
        // console.log(tokenVerified,'---verified token---')
        req.user=tokenVerified

        next()

    } catch (error) {
        return res.status(400).json({message:"User authorisation failed"})
    }
    
}

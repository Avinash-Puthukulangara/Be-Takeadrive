import jwt from 'jsonwebtoken'

export const authDealer = async (req,res,next)=>{
    try {
        const { token } = req.cookies
        if(!token){
            return res.status(402).json({message:"Dealer not authorised"})
        }

        const tokenVerified = await jwt.verify(token,process.env.JWT_SEC_KEY)
        if(!tokenVerified){
            return res.status(402).json({message:"Dealer token not verified"})
        }
        
        
        if(tokenVerified.role!=='dealer' && tokenVerified.role!== 'admin'){
            return res.status(402).json({message:"Not authorised"})
        }
        req.user=tokenVerified

        next()

    } catch (error) {
        return res.status(400).json({message:"User authorisation failed"})
    }
    
}

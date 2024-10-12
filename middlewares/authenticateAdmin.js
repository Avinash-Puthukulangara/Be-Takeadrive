import jwt from 'jsonwebtoken'

export const authAdmin = async (req,res,next)=>{
    try {
                const { token } = req.cookies;

                if (!token) {
                    return res.status(401).json({ message: "Admin token not found" });
                }
        
                const tokenVerified = jwt.verify(token, process.env.JWT_SEC_KEY);
                if (!tokenVerified) {
                    return res.status(401).json({ message: "Admin token not verified" });
                }
        
                if (tokenVerified.role !== 'admin') {
                    return res.status(403).json({ message: "Error in admin authorization" });
                }
        
                req.user = tokenVerified;
                next();

    } catch (error) {
        console.error("Authorization Error:", error);
        return res.status(400).json({ message: "Admin authorization failed" });
    }

    
}

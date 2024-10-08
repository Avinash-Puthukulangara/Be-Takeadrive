import jwt from 'jsonwebtoken'

export const generatetoken = (id, role) => {
    const token = jwt.sign({ id: id, role:role || 'user'}, process.env.JWT_SEC_KEY)
    return token
}
import jwt from 'jsonwebtoken'
import Dealer from '../models/dealerModel.js'

export const generateToken = (id, role) => {
    const token = jwt.sign({ id: id, role:role || 'user'}, process.env.JWT_SEC_KEY, { expiresIn: "1d"})
    return token
}

export const adminToken = (id, role) => {
    const token = jwt.sign({ id: id, role: role }, process.env.JWT_SEC_KEY, { expiresIn: "1d"})
    return token
}
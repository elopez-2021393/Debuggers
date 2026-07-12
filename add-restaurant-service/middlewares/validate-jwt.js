import jwt from 'jsonwebtoken';

export const validateJWT = (req, res, next) => {

    const token =
        req.header('x-token') ||
        req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No se proporcionó un token'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        });
        
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido',
            detail: error.message
        });
    }
};
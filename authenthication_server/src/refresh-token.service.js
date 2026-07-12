import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import RefreshToken from './refresh-token.model.js';

export const hashToken = (rawToken) => {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
};

const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id || user.id,
            username: user.username,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '15m',
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
        }
    );
};

export const createRefreshToken = async (userId, familyId = null) => {
    // 32 bytes aleatorios → hex (equivalente a RandomNumberGenerator.GetBytes(32))
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const famId = familyId ?? uuidv4();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días

    await RefreshToken.create({
        tokenHash,
        userId,
        familyId: famId,
        expiresAt,
    });

    return { rawToken, familyId: famId };
};

export const rotateRefreshToken = async (rawToken) => {
    const tokenHash = hashToken(rawToken);

    const token = await RefreshToken.findOne({ tokenHash }).populate('userId');

    if (!token) {
        const err = new Error('Refresh token inválido');
        err.statusCode = 401;
        throw err;
    }

    if (token.isExpired) {
        await RefreshToken.findByIdAndUpdate(token._id, { revokedAt: new Date() });
        const err = new Error('Refresh token expirado');
        err.statusCode = 401;
        throw err;
    }

    if (token.isRevoked) {
        await RefreshToken.updateMany(
            { familyId: token.familyId },
            { revokedAt: new Date() }
        );
        const err = new Error('Sesión comprometida. Por favor inicia sesión nuevamente.');
        err.statusCode = 401;
        throw err;
    }

    await RefreshToken.findByIdAndUpdate(token._id, { revokedAt: new Date() });

    const user = token.userId;

    const { rawToken: newRawToken } = await createRefreshToken(
        user._id.toString(),
        token.familyId
    );

    const accessToken = generateAccessToken(user);//genera el accesToken

    const userDetails = {
        _id: user._id,
        firstName: user.firstName,
        surname: user.surname,
        email: user.email,
        username: user.username,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
    };

    return {
        accessToken,
        refreshToken: newRawToken,
        expiresIn: 900,
        userDetails,
    };
};

export const revokeRefreshToken = async (rawToken) => {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    await RefreshToken.findOneAndUpdate(
        { tokenHash, revokedAt: null },
        { revokedAt: new Date() }
    );
};

export const revokeAllUserTokens = async (userId) => {
    await RefreshToken.updateMany(
        { userId, revokedAt: null },
        { revokedAt: new Date() }
    );
};

import { rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens, } from './refresh-token.service.js';

export const refreshTokenController = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token es requerido',
                error: 'MISSING_REFRESH_TOKEN',
            });
        }

        const result = await rotateRefreshToken(refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Token renovado exitosamente',
            data: result,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
            userDetails: result.userDetails,
        });
    } catch (err) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || 'Error al renovar el token',
            error: 'REFRESH_FAILED',
        });
    }
};

export const logoutController = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        await revokeRefreshToken(refreshToken);

        return res.status(200).json({
            success: true,
            message: 'Sesión cerrada exitosamente',
        });
    } catch (err) {
        return res.status(200).json({
            success: true,
            message: 'Sesión cerrada',
        });
    }
};

export const logoutAllController = async (req, res) => {
    try {
        await revokeAllUserTokens(req.user.id);

        return res.status(200).json({
            success: true,
            message: 'Sesión cerrada en todos los dispositivos',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error al cerrar sesiones',
            error: err.message,
        });
    }
};

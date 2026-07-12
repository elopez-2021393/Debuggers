import { createUserRecord, registerUserRecord, activateUserAccount, loginUser, changePassword, requestPasswordReset, resetPassword, updateProfileRecord, getAllUsersRecord, getUserByIdRecord, toggleUserStatusRecord, deleteUserRecord } from "./user.services.js";
import { createRefreshToken } from './refresh-token.service.js';
import jwt from 'jsonwebtoken';

export const createUser = async (req, res) => {
    try {
        const user = await createUserRecord({
            userData: req.body
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente. Se ha enviado un correo de activación.',
            data: user
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar el usuario',
            error: e.message
        });
    }//try-catch
};//crearUsuario

//Auto-registro público de clientes
export const registerUser = async (req, res) => {
    try {
        const user = await registerUserRecord({
            userData: req.body
        });

        res.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente. Se ha enviado un correo de activación.',
            data: user
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al crear la cuenta',
            error: e.message
        });
    }//try-catch
};//registerUser

export const activateAccount = async (req, res) => {
    try {
        const { token } = req.params;

        await activateUserAccount(token);

        res.status(200).json({
            success: true,
            message: 'Cuenta activada exitosamente. Ya puedes iniciar sesión.'
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: 'Error al activar la cuenta',
            error: e.message
        });
    }//try-catch
};//activar cuenta

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await loginUser(username, password);

        //Access token
        const accessToken = jwt.sign(
            {
                id: user._id,
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

        //Refresh token
        const { rawToken: refreshToken } = await createRefreshToken(
            user._id.toString()
        );

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                user,
                token: accessToken,
                accessToken,
                refreshToken,
                expiresIn: 900,
            },
        });
    } catch (e) {
        res.status(401).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: e.message,
        });
    }
};


export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        await changePassword(userId, currentPassword, newPassword);

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: 'Error al cambiar la contraseña',
            error: e.message
        });
    }//try-catch
};//update

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const result = await requestPasswordReset(email);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: 'Error al procesar la solicitud',
            error: e.message
        });
    }
};//forgotPassword

export const resetPasswordController = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const result = await resetPassword(token, newPassword);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: 'Error al restablecer la contraseña',
            error: e.message
        });
    }
};//reset

//Edición de perfil propio
export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await updateProfileRecord(userId, req.body);

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: user
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al actualizar el perfil',
            error: e.message
        });
    }//try-catch
};//updateProfile

//Gestión completa de usuarios
export const getUsers = async (req, res) => {
    try {
        const users = await getAllUsersRecord();

        res.status(200).json({
            success: true,
            total: users.length,
            data: users
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los usuarios',
            error: e.message
        });
    }//try-catch
};//getUsers

export const getUserById = async (req, res) => {//Obtener un usaurio (admin)
    try {
        const user = await getUserByIdRecord(req.params.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al obtener el usuario',
            error: e.message
        });
    }//try-catch
};//getUserById

export const toggleUserStatus = async (req, res) => {//Activar desactivar uusuario
    try {
        const user = await toggleUserStatusRecord(req.params.id);

        res.status(200).json({
            success: true,
            message: `Usuario ${user.isActive ? 'activado' : 'desactivado'} exitosamente`,
            data: user
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al cambiar el estado del usuario',
            error: e.message
        });
    }//try-catch
};//toggleUserStatus

export const deleteUser = async (req, res) => {
    try {
        const result = await deleteUserRecord(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente',
            data: result
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al eliminar el usuario',
            error: e.message
        });
    }
};
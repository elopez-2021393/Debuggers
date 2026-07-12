import nodemailer from 'nodemailer';

const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER o EMAIL_PASS no están configurados en .env');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const sendActivationEmail = async (email, token, firstName) => {
    const activationLink = `${process.env.FRONTEND_URL || 'http://localhost:3013/debuggersEatsAdmin/v1/auth'}/activate/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Activa tu cuenta - Debuggers Eats',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">¡Bienvenido a Debuggers Eats, ${firstName}!</h2>
                <p>Tu cuenta ha sido creada exitosamente. Para activarla y poder acceder a todos los servicios, haz clic en el siguiente enlace:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${activationLink}" 
                        style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Activar mi cuenta
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="color: #007bff; word-break: break-all;">${activationLink}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
            </div>
        `
    };

    try {
        const transporter = createTransporter();
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw new Error('Error al enviar el correo de activación');
    }
};

export const sendWelcomeEmail = async (email, firstName, username) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Bienvenido a Debuggers Eats - Tu cuenta ha sido creada',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">¡Hola ${firstName}!</h2>
                <p>Tu cuenta en Debuggers Eats ha sido creada exitosamente por un administrador.</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Tu nombre de usuario:</h3>
                    <p><strong>${username}</strong></p>
                    <p style="color: #666;">Tu administrador te proporcionará tu contraseña de acceso.</p>
                </div>
                
                <p>Recibirás otro correo con un enlace para activar tu cuenta. Una vez activada, podrás iniciar sesión con las credenciales que te proporcione tu administrador.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">Este es un correo automático, por favor no respondas.</p>
            </div>
        `
    };

    try {
        const transporter = createTransporter();
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error al enviar email de bienvenida:', error);
    }
};

export const sendPasswordResetEmail = async (email, token, username) => {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Recuperación de contraseña - Debuggers Eats',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Hola ${username},</h2>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Debuggers Eats.</p>
                
                <p>Si no realizaste esta solicitud, puedes ignorar este correo de forma segura.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" 
                    style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Restablecer mi contraseña
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="color: #007bff; word-break: break-all;">${resetLink}</p>
                
                <p style="color: #d9534f;"><strong>Este enlace expirará en 1 hora por seguridad.</strong></p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">Si no solicitaste restablecer tu contraseña, ignora este correo. Tu contraseña permanecerá sin cambios.</p>
            </div>
        `
    };

    try {
        const transporter = createTransporter();
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error al enviar email de reset:', error);
        throw new Error('Error al enviar el correo de recuperación');
    }
};

export const sendPasswordChangedEmail = async (email, firstName) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Tu contraseña ha sido cambiada - Debuggers Eats',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Hola ${firstName},</h2>
                <p>Te confirmamos que tu contraseña ha sido cambiada exitosamente.</p>
                
                <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #155724;">Tu contraseña se actualizó el día ${new Date().toLocaleString('es-ES')}</p>
                </div>
                
                <p style="color: #d9534f;"><strong> Si no realizaste este cambio:</strong></p>
                <p>Por favor, contacta inmediatamente con nuestro equipo de soporte.</p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #999; font-size: 12px;">Este es un correo automático de seguridad.</p>
            </div>
        `
    };

    try {
        const transporter = createTransporter();
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error al enviar email de confirmación:', error);
    }
};
import mongoose, { mongo } from "mongoose";

export const dbConnection = async()=>{
    try{
        mongoose.connection.on('error', ()=>{
            console.error(`Mongo DB | Error de conexión`);
            mongoose.disconnect();
        });
        mongoose.connection.on('connecting', ()=>{
            console.log(`Mongo DB | Intentando conectar a Mongo DB...`);
        });
        mongoose.connection.on('connected', ()=>{
            console.log(`Mongo DB | Conectado a Mongo DB`);
        });
        mongoose.connection.on('open', ()=>{
            console.log(`Mongo DB | Conectado a la base de datos de Debuggers Eats`);
        });
        mongoose.connection.on('reconnected', ()=>{
            console.log(`Mongo DB | Reconectando a Mongo DB...`);
        });
        mongoose.connection.on('disconnected', ()=>{
            console.log(`Mongo DB | Desconectado de mongo DB`);
        });
        await mongoose.connect(process.env.URI_MONGODB, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10,
        });
    }catch(e){
        console.error(`Debuggers Eats - Error al conectar a la base de datos: ${e.message}, cerrando conexión a Mongo DB...`);
        process.exit(1);
    }//try-catch
}//dbConnection

const graceFulShutdown = async(signal)=>{
    console.log(`Mongo DB | Señal recibida de ${signal}, cerrando conexión a Mongo DB...`);
    try{
        await mongoose.disconnect();
        process.exit(0);
    }catch(e){
        console.error(`Mongo DB | Error durante el cierre de la conexión: ${e.message}`);
        process.exit(1);
    }//try-cath
}//graceFulShutdown

process.on('SIGINT', ()=>graceFulShutdown('SIGINT'));
process.on('SIGTERM', ()=> graceFulShutdown('SIGTERM'));
process.on('SIGUSR2', ()=> graceFulShutdown('SIGUSR2'));
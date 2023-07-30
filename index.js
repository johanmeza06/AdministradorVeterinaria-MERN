import express from 'express';
import dotenv from 'dotenv/config';
import cors from 'cors';
import connectDB from './config/db.js';
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';


const app = express();
// middleware para poder usar json en el body
app.use(express.json());

connectDB();

const dominiosPermitidos = [process.env.FRONTEND_URL];
const corsOptions = {
    origin: function(origin,callback){
        // esto valida que los dominios permitidos sean los que estan en el array
        if (dominiosPermitidos.indexOf(origin) !== -1){
            // el origen del request esta permitido
            callback(null,true)
        }else{
            callback(new Error('Dominio no permitido por CORS'))
        }
    }
}
app.use(cors(corsOptions)) || app.use(cors({
    origin: process.env.FRONTEND_URL
   }));

app.use('/api/veterinarios', veterinarioRoutes)
app.use('/api/pacientes', pacienteRoutes)


const PORT = process.env.PORT || 4000;
// listen para resgistrar el puerto del servidor
app.listen(PORT,(req,res)=>{
    console.log(`Server is running on port ${PORT}`)
});
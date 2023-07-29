import jwt from "jsonwebtoken";
import Veterinario from "../models/Veterinario.js";

const checkAuth = async (req, res, next) => {
    let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.veterinario = await Veterinario.findById(decoded.id).select('-password -token -confirmed');
        return next();
    } catch (error) {
        const e = new Error("Token no valido");
        return res.status(403).json({ msg: e.message });
    }
  }
  // si no existe el token en el header de la peticion se verifica si existe en el body de la peticion 
    if (!token){
        const error = new Error("Token no valido o inexistente");
        res.status(403).json({ msg: error.message });
    }
  next();
};

export default checkAuth;

// es la creacion de un middleware propio, para poder reutilizarlo en cualquier ruta que necesitemos y asi autenticar al usuario

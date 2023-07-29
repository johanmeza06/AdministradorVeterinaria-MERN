import generarJWT from "../helpers/generarJWT.js";
import Veterinario from "../models/Veterinario.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

const registrar = async (req, res) => {
  // revisar si un usuario esta duplicado
  const { email, nombre } = req.body;
  const existeUsuario = await Veterinario.findOne({ email });
  if (existeUsuario) {
    const error = new Error("El usuario ya esta registrado");
    return res.status(400).json({ msg: error.message });
  }
  try {
    // guardar nuevo veterinario
    const veterinario = new Veterinario(req.body);
    const veterinarioRegistrado = await veterinario.save();

    // Enviar el email
    emailRegistro({ email, nombre, token: veterinario.token });

    res.json(veterinarioRegistrado);
  } catch (error) {
    console.log(error);
  }
};

const perfil = (req, res) => {
  const { veterinario } = req;
  res.json(veterinario);
};

const confirmar = async (req, res) => {
  // siempre que se solicite un parametro dinamico, se va a utilizar req.params
  const { token } = req.params;
  // findOne es una consulta que se le hace a la base de datos en mongose para encontrar un registro
  const usuarioConfirmar = await Veterinario.findOne({ token });
  if (!usuarioConfirmar) {
    const error = new Error("token no valido");
    return res.status(404).json({ msg: error.message });
  }

  try {
    usuarioConfirmar.token = null;
    usuarioConfirmar.confirmed = true;
    await usuarioConfirmar.save();
    res.json({ msg: "usuario confirmado correctamente" });
  } catch (error) {
    console.log(error);
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;
  // comprobar si el usuario existe
  const usuario = await Veterinario.findOne({ email });

  if (!usuario) {
    const error = new Error("usuario no existe");
    return res.status(403).json({ msg: error.message });
  }
  // comprobar si el usuario esta confirmado o no
  if (!usuario.confirmed) {
    const error = new Error("tu cuenta no ha sido confirmada");
    return res.status(403).json({ msg: error.message });
  }
  // Autenticar el usuario
  // Revisar el password
  if (await usuario.comprobarPassword(password)) {
    // autenticar
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      web: usuario.web,
      telefono: usuario.telefono,
      token: generarJWT(usuario.id),
    });
  } else {
    const error = new Error("El password es incorrecto");
    return res.status(403).json({ msg: error.message });
  }
};

const olvidePassword = async (req, res) => {
  const { email } = req.body;
  const existeVeterinario = await Veterinario.findOne({ email });
  if (!existeVeterinario) {
    const error = new Error("El usuario no existe");
    return res.status(400).json({ msg: error.message });
  }

  // en caso de que existe debemos enviar un correo electronico con el token

  try {
    existeVeterinario.token = generarId();
    await existeVeterinario.save();

    //Enviar email con instrucciones para reestablecer el password
    emailOlvidePassword({
      email,
      nombre: existeVeterinario.nombre,
      token: existeVeterinario.token,
    });

    res.json({ msg: "Se envio un email para reestablecer tu contraseña" });
  } catch (error) {
    console.log(error);
  }
};
const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const tokenValido = await Veterinario.findOne({ token });
  if (tokenValido) {
    res.json({ msg: "El token es valido  y el usario existe" });
  } else {
    const error = new Error("El token no es valido");
    return res.status(400).json({ msg: error.message });
  }
};
const nuevoPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const veterinario = await Veterinario.findOne({ token });
  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }
  try {
    // una vez el usuario cambie su password, debemos eliminar el token
    veterinario.token = null;
    veterinario.password = password;
    await veterinario.save();
    res.json({ msg: "El password se actualizo correctamente" });
  } catch (error) {
    console.log(error);
  }
};
// funcion para actualizar el perfil
const actualizarPerfil = async (req, res) => {
  //Obtener el id del veterinario que vamos a editar en la base de datos
  const veterinario = await Veterinario.findById(req.params.id);
  if (!veterinario) {
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }
  const { email } = req.body;
  if (veterinario.email !== req.body.email) {
    const existeEmail = await Veterinario.findOne({ email });
    if (existeEmail) {
      const error = new Error("El email ya esta registrado");
      return res.status(400).json({ msg: error.message });
    }
  }
  try {
    veterinario.nombre = req.body.nombre;
    veterinario.email = req.body.email;
    veterinario.web = req.body.web;
    veterinario.telefono = req.body.telefono;

    const veterinarioActualizado = await veterinario.save();
    res.json(veterinarioActualizado);
  } catch (error) {
    console.log(error);
  }
};

// actualiza el password dentro de la sesion de un veterinario
const actualizarPassword = async (req, res) => {
  // leer datos
  const {id}= req.veterinario;
  const { pwd_actual, pwd_nuevo } = req.body;
  // comprobar que el veterinario exista
  const veterinario = await Veterinario.findById(id);
  if(!veterinario){
    const error = new Error("Hubo un error");
    return res.status(400).json({ msg: error.message });
  }
  // comprobar su password
  if(await veterinario.comprobarPassword(pwd_actual)){
    // almacenar el nuevo password
    veterinario.password = pwd_nuevo;
    await veterinario.save();
    res.json({msg: "Password actualizado correctamente"})
  }else{
    const error = new Error("El Password Actual es incorrecto");
    return res.status(400).json({ msg: error.message });
  }
  // almacenar el nuevo password
}
export {
  registrar,
  perfil,
  confirmar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  actualizarPerfil,
  actualizarPassword
};

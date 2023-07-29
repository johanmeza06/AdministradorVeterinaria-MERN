import nodemailer from "nodemailer";

const emailOlvidePassword = async (datos) => {
    // configurar el transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;
  // enviar el email
  const info = await transporter.sendMail({
    from: "APV - Administrador de Pacientes de Veterinaria",
    to: email,
    subject: "Reestablece tu Password",
    text: "Reestablece tu Password",
    html: `<p> Hola: ${nombre}, has solicitado reestablecer tu password.</p>
            <p>sigue el siguiente enlace para generar un nuevo password:
            <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer password</a></p>

            <p>Si tu no creaste esta cuenta puedes ignorar este mensaje</p>
        `,
  });
  console.log("Mensaje Enviado: %s", info.messageId);
};
export default emailOlvidePassword;
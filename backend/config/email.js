const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   process.env.EMAIL_PORT,
  secure: false,          // false = port 587 (TLS), true = port 465 (SSL)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Fonction pour envoyer l'email d'activation
const sendActivationEmail = async (email, firstname, activationToken) => {
  const activationUrl = `${process.env.FRONTEND_URL}/activate/${activationToken}`

  const mailOptions = {
    from:    `"Plateforme Recrutement" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: 'Activation de votre compte',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour ${firstname} !</h2>
        <p>Merci de vous être inscrit sur notre plateforme de recrutement.</p>
        <p>Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
        <a href="${activationUrl}" 
           style="
             display: inline-block;
             padding: 12px 24px;
             background-color: #4F46E5;
             color: white;
             text-decoration: none;
             border-radius: 6px;
             margin: 16px 0;
           ">
          Activer mon compte
        </a>
        <p>Ou copie ce lien dans ton navigateur :</p>
        <p style="color: #6B7280;">${activationUrl}</p>
        <p>Ce lien expire dans <strong>24 heures</strong>.</p>
        <hr/>
        <p style="color: #9CA3AF; font-size: 12px;">
          Si vous n'avez pas créé de compte, ignorez cet email.
        </p>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}
const sendInvitationEmail = async (email, firstname, jobTitle) => {
  const mailOptions = {
    from:    `"Plateforme Recrutement" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `Invitation à postuler — ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Bonjour ${firstname} !</h2>
        <p>Un recruteur vous invite à postuler pour le poste :</p>
        <h3 style="color: #4F46E5;">${jobTitle}</h3>
        <p>Connectez-vous à votre espace candidat pour consulter et répondre à cette invitation.</p>
        <a href="${process.env.FRONTEND_URL}/invitations"
           style="
             display: inline-block;
             padding: 12px 24px;
             background-color: #4F46E5;
             color: white;
             text-decoration: none;
             border-radius: 6px;
             margin: 16px 0;
           ">
          Voir l'invitation
        </a>
      </div>
    `
  }

  await transporter.sendMail(mailOptions)
}
module.exports = { sendActivationEmail, sendInvitationEmail }
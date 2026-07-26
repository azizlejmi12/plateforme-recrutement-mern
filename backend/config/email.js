const nodemailer = require('nodemailer')

const hasValidSmtpConfig = () => {
  return Boolean(
    process.env.EMAIL_HOST &&
    process.env.EMAIL_HOST !== 'smtp.example.com' &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  )
}

const transporter = hasValidSmtpConfig()
  ? nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  : null

// Fonction pour envoyer l'email d'activation
const sendActivationEmail = async (email, firstname, activationToken) => {
  const activationUrl = `${process.env.FRONTEND_URL}/activate/${activationToken}`

  if (!transporter) {
    console.log('[EMAIL] Config SMTP manquante ou invalide. Lien d\'activation:', activationUrl)
    return false
  }

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

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (err) {
    console.error('[EMAIL] Erreur envoi activation:', err.message)
    console.log('[EMAIL] Lien d\'activation de secours:', activationUrl)
    return false
  }
}
const sendInvitationEmail = async (email, firstname, jobTitle) => {
  if (!transporter) {
    console.log('[EMAIL] Config SMTP manquante ou invalide. Invitation non envoyée.')
    return false
  }

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

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (err) {
    console.error('[EMAIL] Erreur envoi invitation:', err.message)
    return false
  }
}
module.exports = { sendActivationEmail, sendInvitationEmail }
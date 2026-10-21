
import { Resend } from "resend";

/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

let resendClient = null;

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is missing. Configure Resend in server/.env."
    );
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getLoginUrl = () => {
  const baseUrl = (
    process.env.CLIENT_URL || "http://localhost:5173"
  ).replace(/\/+$/, "");

  return `${baseUrl}/login`;
};

/*
|--------------------------------------------------------------------------
| New User Credentials Email
|--------------------------------------------------------------------------
*/

export const sendNewUserCredentialsEmail = async ({
  fullName,
  email,
  password,
  role,
}) => {
  if (!fullName || !email || !password) {
    throw new Error(
      "Full name, email, and temporary password are required."
    );
  }

  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!from) {
    throw new Error(
      "RESEND_FROM_EMAIL is missing. Configure a verified sender."
    );
  }

  const resend = getResendClient();

  const loginUrl = getLoginUrl();

  const roleLabel =
    role === "SUPER_ADMIN" ? "Super Admin" : "Owner";

  const safeName = escapeHtml(fullName);
  const safeEmail = escapeHtml(email);
  const safePassword = escapeHtml(password);
  const safeRole = escapeHtml(roleLabel);
  const safeLoginUrl = escapeHtml(loginUrl);

  const text = [
    `Hello ${fullName},`,
    "",
    "Welcome to Tempest Leads CRM!",
    "",
    "Your account has been created.",
    "",
    `Name: ${fullName}`,
    `Role: ${roleLabel}`,
    `Email: ${email}`,
    `Temporary Password: ${password}`,
    "",
    `Login URL: ${loginUrl}`,
    "",
    "Please change your temporary password after signing in.",
    "Do not share your credentials with anyone.",
    "",
    "Regards,",
    "Tempest Leads Team",
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>

      <body style="
        margin:0;
        padding:32px 16px;
        background:#f3f6fc;
        font-family:Arial,Helvetica,sans-serif;
        color:#172849;
      ">
        <div style="
          max-width:560px;
          margin:0 auto;
          background:#ffffff;
          border:1px solid #e4eaf5;
          border-radius:18px;
          overflow:hidden;
        ">
          <div style="
            padding:28px 30px;
            background:#1769f4;
            color:#ffffff;
          ">
            <h1 style="
              margin:0;
              font-size:25px;
              font-weight:700;
            ">
              Tempest Leads
            </h1>

            <p style="
              margin:9px 0 0;
              font-size:14px;
              line-height:1.6;
            ">
              Your CRM account is ready
            </p>
          </div>

          <div style="padding:30px;">
            <h2 style="
              margin:0 0 16px;
              font-size:21px;
            ">
              Welcome, ${safeName}!
            </h2>

            <p style="
              font-size:14px;
              line-height:1.8;
            ">
              Your Tempest Leads account has been
              successfully created. Use the credentials
              below to sign in.
            </p>

            <div style="
              margin-top:22px;
              padding:20px;
              background:#f5f8ff;
              border:1px solid #e1e8f7;
              border-radius:12px;
            ">
              <p style="font-size:14px;">
                <strong>Role:</strong> ${safeRole}
              </p>

              <p style="font-size:14px;">
                <strong>Email:</strong> ${safeEmail}
              </p>

              <p style="
                margin-bottom:8px;
                font-size:14px;
              ">
                <strong>Temporary Password:</strong>
              </p>

              <p style="
                margin:0;
                font-family:monospace;
                font-size:17px;
                font-weight:700;
                overflow-wrap:anywhere;
              ">
                ${safePassword}
              </p>
            </div>

            <div style="margin-top:28px;">
              <a
                href="${safeLoginUrl}"
                style="
                  display:inline-block;
                  padding:14px 24px;
                  background:#1769f4;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:10px;
                  font-size:14px;
                  font-weight:700;
                "
              >
                Login to Tempest Leads
              </a>
            </div>

            <p style="
              margin-top:26px;
              font-size:13px;
              line-height:1.8;
              color:#64748b;
            ">
              For security, please change your temporary
              password after signing in. Never share
              your password with anyone.
            </p>
          </div>

          <div style="
            padding:18px 30px;
            border-top:1px solid #e4eaf5;
            background:#f8faff;
            font-size:12px;
            color:#64748b;
            text-align:center;
          ">
            Tempest Leads CRM
          </div>
        </div>
      </body>
    </html>
  `;

  /*
  |--------------------------------------------------------------------------
  | Send Email Through Resend
  |--------------------------------------------------------------------------
  */

  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject: "Welcome to Tempest Leads - Your Login Credentials",
    text,
    html,
  });

  /*
  |--------------------------------------------------------------------------
  | Handle Resend API Errors
  |--------------------------------------------------------------------------
  |
  | Resend may return an error object without throwing.
  | We must check it explicitly.
  |--------------------------------------------------------------------------
  */

  if (error) {
    const mailError = new Error(
      "Resend could not accept the welcome email."
    );

    mailError.code = error.name || "RESEND_SEND_FAILED";
    mailError.statusCode = error.statusCode;

    throw mailError;
  }

  if (!data?.id) {
    throw new Error(
      "Resend did not return an email ID."
    );
  }

  return {
    accepted: true,
    emailId: data.id,
  };
};

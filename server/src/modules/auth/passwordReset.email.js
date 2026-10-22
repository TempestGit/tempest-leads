
import { Resend } from "resend";

let resendClient;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getClient = () => {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
};

export const sendPasswordResetEmail = async ({
  fullName,
  email,
  token,
}) => {
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  const clientUrl = (
    process.env.CLIENT_URL || "http://localhost:5173"
  ).replace(/\/+$/, "");

  const resetUrl =
    `${clientUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const safeName = escapeHtml(fullName);
  const safeUrl = escapeHtml(resetUrl);

  const text = [
    `Hello ${fullName},`,
    "",
    "We received a request to reset your Tempest Leads password.",
    "",
    "Use this link to choose a new password:",
    resetUrl,
    "",
    "This link expires in 15 minutes and can only be used once.",
    "",
    "If you did not request a password reset, you can ignore this email.",
    "",
    "Tempest Leads Team",
  ].join("\n");

  const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0;padding:32px 16px;background:#f3f6fc;font-family:Arial,Helvetica,sans-serif;color:#172849;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4eaf5;border-radius:18px;overflow:hidden;">
          <div style="padding:28px 30px;background:#1769f4;color:#ffffff;">
            <h1 style="margin:0;font-size:25px;">Tempest Leads</h1>
            <p style="margin:9px 0 0;font-size:14px;">Secure Password Reset</p>
          </div>
          <div style="padding:30px;">
            <h2 style="font-size:21px;">Hello, ${safeName}</h2>
            <p style="font-size:14px;line-height:1.8;">
              We received a request to reset your Tempest Leads password.
              Select the button below to create a new password.
            </p>
            <p style="margin:30px 0;">
              <a href="${safeUrl}"
                 style="display:inline-block;padding:14px 24px;background:#1769f4;color:#ffffff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;">
                Reset My Password
              </a>
            </p>
            <p style="font-size:13px;line-height:1.8;color:#64748b;">
              This link expires in 15 minutes and works only once.
              If you did not request a reset, ignore this email.
            </p>
          </div>
          <div style="padding:18px 30px;background:#f8faff;text-align:center;font-size:12px;color:#64748b;">
            Tempest Leads CRM
          </div>
        </div>
      </body>
    </html>
  `;

  const { data, error } = await getClient().emails.send({
    from,
    to: [email],
    subject: "Reset Your Tempest Leads Password",
    text,
    html,
  });

  if (error || !data?.id) {
    throw new Error(
      "Resend could not accept the password reset email."
    );
  }

  return { accepted: true, emailId: data.id };
};

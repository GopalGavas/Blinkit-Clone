const verifyEmailTemplate = ({ name, url }) => {
  return `
    <div style="font-family: Arial, sans-serif;">
      <p>Dear ${name},</p>

      <p>Thank you for registering with Blinkit.</p>

      <a 
        href="${url}"
        style="
          color: black;
          background: orange;
          margin-top: 10px;
          padding: 12px 20px;
          display: inline-block;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        "
      >
        Verify Email
      </a>

      <p style="margin-top: 20px;">
        If you did not create this account, please ignore this email.
      </p>
    </div>
  `;
};

export default verifyEmailTemplate;

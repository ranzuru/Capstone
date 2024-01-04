import postmark from 'postmark';

export const sendEmail = async (to, subject, htmlBody) => {
  try {
    const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
    const response = await client.sendEmail({
      From: process.env.EMAIL_SENDER_ADDRESS,
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
    });
    console.log('Email sent:', response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export const sendEmailWithTemplate = async (to, templateId, templateModel) => {
  try {
    const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
    const response = await client.sendEmailWithTemplate({
      From: process.env.EMAIL_SENDER_ADDRESS,
      To: to,
      TemplateId: templateId,
      TemplateModel: templateModel,
    });
    console.log('Email sent with template:', response);
  } catch (error) {
    console.error('Error sending email with template:', error);
  }
};

export const sendResetPasswordEmail = async (to, resetUrl) => {
  try {
    const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
    const response = await client.sendEmailWithTemplate({
      From: process.env.EMAIL_SENDER_ADDRESS,
      To: to,
      TemplateAlias: 'code-your-own-2',
      TemplateModel: {
        reset_password_url: resetUrl,
      },
    });
    console.log('Password reset email sent with template:', response);
  } catch (error) {
    console.error('Error sending password reset email with template:', error);
  }
};

export const sendOtpEmail = async (to, otpCode) => {
  try {
    const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
    await client.sendEmailWithTemplate({
      From: process.env.EMAIL_SENDER_ADDRESS,
      To: to,
      TemplateAlias: 'code-your-own-1',
      TemplateModel: {
        otp: otpCode,
      },
    });
  } catch (error) {
    console.error('Error sending OTP email with template:', error);
  }
};

export const testPostmarkToken = async () => {
  try {
    const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);
    const response = await client.sendEmail({
      From: process.env.EMAIL_SENDER_ADDRESS,
      To: 'sucroze161@gmail.com',
      Subject: 'Test Email',
      TextBody: 'This is a test email to verify Postmark server token.',
    });

    console.log('Test email sent, check your inbox. Response:', response);
    return true;
  } catch (error) {
    console.error('Error sending test email:', error);
    return false;
  }
};

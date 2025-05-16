interface EmailParams {
  to: string;
  subject: string;
  template: 'contact' | 'request-data';
  data: Record<string, unknown>;
}

const MAILCHANNELS_API = 'https://api.mailchannels.net/tx/v1/send';

export const sendEmail = async ({ to, subject, template, data }: EmailParams) => {
  const emailData = {
    to,
    subject,
    from: {
      email: 'noreply@deephandai.com',
      name: 'DeepHand'
    },
    text: generateEmailText(template, data),
  };

  try {
    const response = await fetch(MAILCHANNELS_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${MAILCHANNELS_API_KEY}`
      },
      body: JSON.stringify(emailData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

function generateEmailText(template: string, data: Record<string, unknown>): string {
  switch (template) {
    case 'contact':
      return `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Message: ${data.message}
      `.trim();

    case 'request-data':
      return `
New Data Request

Full Name: ${data.fullName}
Company: ${data.companyName || 'N/A'}
Work Email: ${data.workEmail}
Data Type: ${data.dataType}
Data Amount: ${data.dataAmount}
Deadline: ${data.deadline}
Additional Details: ${data.additionalDetails || 'N/A'}
      `.trim();

    default:
      throw new Error('Invalid email template');
  }
}
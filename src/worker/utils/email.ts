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
Organization: ${data.organization || 'N/A'}
Email: ${data.email}
Message: ${data.message}
      `.trim();

    case 'request-data':
      const dataTypes = Array.isArray(data.dataType) ? data.dataType.join(', ') : data.dataType;
      return `
New Data Request

Name: ${data.name}
Organization: ${data.organization || 'N/A'}
Email: ${data.email}
Background and Purpose: ${data.backgroundPurpose}
Data Type: ${dataTypes}
Data Details: ${data.dataDetails || 'N/A'}
Data Volume: ${data.dataVolume}
Deadline: ${data.deadline}
Budget: ${data.budget}
Other Requirements: ${data.otherRequirements || 'N/A'}
      `.trim();

    default:
      throw new Error('Invalid email template');
  }
}
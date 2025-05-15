export const validateRecaptcha = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const result = await response.json();
    return result.success && result.score >= 0.5;
  } catch (error) {
    console.error('reCAPTCHA validation error:', error);
    return false;
  }
};
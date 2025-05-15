import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/security';
import { rateLimit } from './middleware/rateLimit';
import { sanitizeInput } from './utils/sanitize';
import { validateContactForm, validateRequestForm } from './utils/validation';
import { sendEmail } from './utils/email';

const app = new Hono();

// Security headers
app.use('*', secureHeaders());

// CORS configuration
app.use('*', cors({
  origin: 'https://deephand.pages.dev',
  allowMethods: ['POST'],
  maxAge: 86400,
}));

// Rate limiting
app.use('*', rateLimit());

// Contact form handler
app.post('/api/contact', async (c) => {
  try {
    const data = await c.req.json();
    
    // Validate form data
    const validatedData = validateContactForm(sanitizeInput(data));
    if (!validatedData.success) {
      return c.json({ error: validatedData.error }, 400);
    }

    // Send email
    await sendEmail({
      to: c.env.CONTACT_EMAIL,
      subject: 'New Contact Form Submission',
      template: 'contact',
      data: validatedData.data,
    });

    // Store submission in R2
    await c.env.FORM_STORAGE.put(
      `contact/${Date.now()}.json`,
      JSON.stringify(validatedData.data)
    );

    // Log analytics
    await c.env.ANALYTICS.writeDataPoint({
      blobs: ['contact_form_submission'],
      doubles: [1],
      indexes: ['success'],
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Request data form handler
app.post('/api/request-data', async (c) => {
  try {
    const data = await c.req.json();
    
    // Validate form data
    const validatedData = validateRequestForm(sanitizeInput(data));
    if (!validatedData.success) {
      return c.json({ error: validatedData.error }, 400);
    }

    // Send email
    await sendEmail({
      to: c.env.CONTACT_EMAIL,
      subject: 'New Data Request',
      template: 'request-data',
      data: validatedData.data,
    });

    // Store submission in R2
    await c.env.FORM_STORAGE.put(
      `request/${Date.now()}.json`,
      JSON.stringify(validatedData.data)
    );

    // Log analytics
    await c.env.ANALYTICS.writeDataPoint({
      blobs: ['data_request_submission'],
      doubles: [1],
      indexes: ['success'],
    });

    return c.json({ success: true });
  } catch (error) {
    console.error('Request form error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default app;
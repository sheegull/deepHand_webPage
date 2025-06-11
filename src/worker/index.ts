import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { rateLimit } from "./middleware/rateLimit";
import { sanitizeInput } from "./utils/sanitize";
import { validateContactForm, validateRequestForm } from "./utils/validation";
import { sendEmail } from "./utils/email";
import { createMimeMessage } from "mimetext";

interface Env {
  CONTACT_EMAIL: string;
  MAX_REQUESTS_PER_HOUR: string;
  FORM_STORAGE: R2Bucket;
  FORM_ANALYTICS: AnalyticsEngineDataset;
  IP_RATE_LIMITER: KVNamespace;
  NOTIFY: SendEmail;
}

const app = new Hono<{ Bindings: Env }>();

// Security headers
app.use("*", secureHeaders());

// CORS configuration
app.use(
  "*",
  cors({
    origin: ["https://deephand.pages.dev", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
    allowMethods: ["POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  })
);

// Rate limiting
app.use("*", rateLimit());

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`);
  return c.json(
    {
      error: "Internal server error",
      message: err.message,
    },
    500
  );
});

// Contact form handler
app.post("/api/contact", async (c) => {
  try {
    // Parse & validate
    const data = await c.req.json();
    const sanitized = sanitizeInput(data);
    const { success, data: valid, error } = validateContactForm(sanitized);
    if (!success) {
      return c.json({ error: "Validation failed", details: error }, 400);
    }

    // Send email notification (production only)
    if (c.env.NOTIFY) {
      try {
        const message = {
          from: { email: "noreply@deephandai.com", name: "DeepHand" },
          to: [{ email: c.env.CONTACT_EMAIL }],
          subject: "新しいお問い合わせ - DeepHand",
          content: [{
            type: "text/plain",
            value: `お名前: ${valid.name}\nご所属: ${valid.organization || 'N/A'}\nメールアドレス: ${valid.email}\nお問い合わせ内容: ${valid.message}`
          }]
        };
        
        await c.env.NOTIFY.send(message);
      } catch (err) {
        console.log("Email sending failed (development mode):", err);
      }
    } else {
      console.log("=== 📧 EMAIL WOULD BE SENT (DEVELOPMENT MODE) ===");
      console.log("To:", c.env.CONTACT_EMAIL || "yogoism@gmail.com");
      console.log("From: noreply@deephandai.com");
      console.log("Subject: 新しいお問い合わせ - DeepHand");
      console.log("Content:");
      console.log(`お名前: ${valid.name}`);
      console.log(`ご所属: ${valid.organization || 'N/A'}`);
      console.log(`メールアドレス: ${valid.email}`);
      console.log(`お問い合わせ内容: ${valid.message}`);
      console.log("================================================");
    }

    // Store in R2 (production only)
    if (c.env.FORM_STORAGE) {
      try {
        const timestamp = Date.now();
        await c.env.FORM_STORAGE.put(
          `contact/${timestamp}.json`,
          JSON.stringify({
            ...valid,
            timestamp,
            type: 'contact'
          })
        );
      } catch (err) {
        console.log("R2 storage failed (development mode):", err);
      }
    } else {
      console.log("Data would be stored:", { ...valid, type: 'contact' });
    }

    // Log analytics (production only)
    if (c.env.FORM_ANALYTICS) {
      try {
        c.env.FORM_ANALYTICS.writeDataPoint({
          blobs: ["contact_form_submission"],
          doubles: [1],
          indexes: ["success"]
        });
      } catch (err) {
        console.log("Analytics failed (development mode):", err);
      }
    } else {
      console.log("Analytics would be logged: contact_form_submission");
    }

    return c.json({ success: true, message: "お問い合わせを受け付けました" });
  } catch (err: any) {
    console.error("Contact form error:", err);
    return c.json({ error: "送信に失敗しました", details: err.message }, 500);
  }
});

// Request-data form handler
app.post("/api/request-data", async (c) => {
  try {
    const data = await c.req.json();
    const sanitized = sanitizeInput(data);
    const { success, data: valid, error } = validateRequestForm(sanitized);
    if (!success) {
      return c.json({ error: "Validation failed", details: error }, 400);
    }

    // Format data types for email
    const dataTypes = Array.isArray(valid.dataType) ? valid.dataType.join(', ') : valid.dataType;
    
    // Send email notification (production only)
    if (c.env.NOTIFY) {
      try {
        const message = {
          from: { email: "noreply@deephandai.com", name: "DeepHand" },
          to: [{ email: c.env.CONTACT_EMAIL }],
          subject: "新しいデータリクエスト - DeepHand",
          content: [{
            type: "text/plain",
            value: `お名前: ${valid.name}\nご所属: ${valid.organization || 'N/A'}\nメールアドレス: ${valid.email}\nご依頼の背景や目的: ${valid.backgroundPurpose}\n必要なデータ種別: ${dataTypes}\nデータの詳細: ${valid.dataDetails || 'N/A'}\n必要なデータ量: ${valid.dataVolume}\nご希望の納期: ${valid.deadline}\nご予算目安: ${valid.budget}\nその他、詳細やご要望: ${valid.otherRequirements || 'N/A'}`
          }]
        };
        
        await c.env.NOTIFY.send(message);
      } catch (err) {
        console.log("Email sending failed (development mode):", err);
      }
    } else {
      console.log("=== 📧 DATA REQUEST EMAIL WOULD BE SENT (DEVELOPMENT MODE) ===");
      console.log("To:", c.env.CONTACT_EMAIL || "yogoism@gmail.com");
      console.log("From: noreply@deephandai.com");
      console.log("Subject: 新しいデータリクエスト - DeepHand");
      console.log("Content:");
      console.log(`お名前: ${valid.name}`);
      console.log(`ご所属: ${valid.organization || 'N/A'}`);
      console.log(`メールアドレス: ${valid.email}`);
      console.log(`ご依頼の背景や目的: ${valid.backgroundPurpose}`);
      console.log(`必要なデータ種別: ${dataTypes}`);
      console.log(`データの詳細: ${valid.dataDetails || 'N/A'}`);
      console.log(`必要なデータ量: ${valid.dataVolume}`);
      console.log(`ご希望の納期: ${valid.deadline}`);
      console.log(`ご予算目安: ${valid.budget}`);
      console.log(`その他、詳細やご要望: ${valid.otherRequirements || 'N/A'}`);
      console.log("==============================================================");
    }

    // Store in R2 (production only)
    if (c.env.FORM_STORAGE) {
      try {
        const timestamp = Date.now();
        await c.env.FORM_STORAGE.put(
          `request/${timestamp}.json`,
          JSON.stringify({
            ...valid,
            timestamp,
            type: 'request'
          })
        );
      } catch (err) {
        console.log("R2 storage failed (development mode):", err);
      }
    } else {
      console.log("Data would be stored:", { ...valid, type: 'request' });
    }

    // Log analytics (production only)
    if (c.env.FORM_ANALYTICS) {
      try {
        c.env.FORM_ANALYTICS.writeDataPoint({
          blobs: ["data_request_submission"],
          doubles: [1],
          indexes: ["success"]
        });
      } catch (err) {
        console.log("Analytics failed (development mode):", err);
      }
    } else {
      console.log("Analytics would be logged: data_request_submission");
    }

    return c.json({ success: true, message: "データリクエストを受け付けました" });
  } catch (err: any) {
    console.error("Data request form error:", err);
    return c.json({ error: "送信に失敗しました", details: err.message }, 500);
  }
});

export default app;

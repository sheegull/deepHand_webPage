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
  FORM_STORAGE: R2Bucket;
  ANALYTICS: AnalyticsEngine;
  NOTIFY: EmailDispatcher; // Email Workers binding
  // …plus any KV / other bindings…
}

const app = new Hono<{}, Env>();

// Security headers
app.use("*", secureHeaders());

// CORS configuration
app.use(
  "*",
  cors({
    origin: ["https://deephand.pages.dev", "http://localhost:5173"],
    allowMethods: ["POST"],
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
    const { success, data: valid, error } = validateContactForm(sanitizeInput(data));
    if (!success) {
      return c.json({ error }, 400);
    }

    // ——— Email notification ———
    const msg = createMimeMessage();
    msg.setSender({ addr: "noreply@yourdomain.com" });
    msg.setSubject("【DeepHand】新しいお問い合わせを受信しました");
    msg.setMessage(
      `名前: ${valid.name}\n` + `メール: ${valid.email}\n` + `メッセージ:\n${valid.message}`,
      "text/plain"
    );
    await c.env.NOTIFY.send(msg);
    // ——————————————————————

    // R2 に保存
    await c.env.FORM_STORAGE.put(`contact/${Date.now()}.json`, JSON.stringify(valid));

    // Analytics
    await c.env.ANALYTICS.writeDataPoint({
      blobs: ["contact_form_submission"],
      doubles: [1],
      indexes: ["success"],
    });

    return c.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return c.json({ error: err.message }, 500);
  }
});

// Request-data form handler
app.post("/api/request-data", async (c) => {
  try {
    const data = await c.req.json();
    const { success, data: valid, error } = validateRequestForm(sanitizeInput(data));
    if (!success) {
      return c.json({ error }, 400);
    }

    // ——— Email notification ———
    const msg = createMimeMessage();
    msg.setSender({ addr: "noreply@yourdomain.com" });
    msg.setSubject("【DeepHand】新しいデータリクエストを受信しました");
    msg.setMessage(
      `お名前: ${valid.fullName}\n` +
        `会社名: ${valid.companyName || "（未入力）"}\n` +
        `メール: ${valid.workEmail}\n` +
        `データ量: ${valid.dataAmount}\n` +
        `納期: ${valid.deadline}\n` +
        `データ種別:\n${valid.dataType}\n` +
        `その他詳細:\n${valid.additionalDetails || "なし"}`,
      "text/plain"
    );
    await c.env.NOTIFY.send(msg);
    // ——————————————————————

    await c.env.FORM_STORAGE.put(`request/${Date.now()}.json`, JSON.stringify(valid));

    await c.env.ANALYTICS.writeDataPoint({
      blobs: ["data_request_submission"],
      doubles: [1],
      indexes: ["success"],
    });

    return c.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return c.json({ error: err.message }, 500);
  }
});

export default app;

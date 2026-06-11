import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import {
  handleHyperPayWebhook, handleSepaWebhook, handlePayomenticWebhook,
  handle2CheckoutWebhook, handlePayPalWebhook, handleAlipayWebhook,
  handleWeChatPayWebhook, handleTelrWebhook, handleAmexWebhook, handleGenericWebhook,
} from "../webhookHandlers";
import { handleStripeWebhook } from "../stripeWebhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ⚠️ Stripe webhook MUST use raw body BEFORE express.json()
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Storage proxy for /manus-storage/* paths
  registerStorageProxy(app);
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ===== Payment Gateway Webhooks =====
  const wh = (fn: (b: any) => Promise<void>) => async (req: express.Request, res: express.Response) => {
    try { await fn(req.body); res.json({ success: true }); }
    catch (e) { console.error("Webhook error:", e); res.status(500).json({ error: "Webhook failed" }); }
  };
  app.post("/api/webhooks/hyperpay", wh(handleHyperPayWebhook));
  app.post("/api/webhooks/sepa", wh(handleSepaWebhook));
  app.post("/api/webhooks/payomentic", wh(handlePayomenticWebhook));
  app.post("/api/webhooks/2checkout", wh(handle2CheckoutWebhook));
  app.post("/api/webhooks/paypal", wh(handlePayPalWebhook));
  app.post("/api/webhooks/alipay", wh(handleAlipayWebhook));
  app.post("/api/webhooks/wechatpay", wh(handleWeChatPayWebhook));
  app.post("/api/webhooks/telr", wh(handleTelrWebhook));
  app.post("/api/webhooks/amex", wh(handleAmexWebhook));
  app.post("/api/webhooks/generic", wh(handleGenericWebhook));
  // ===== End Webhooks =====

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

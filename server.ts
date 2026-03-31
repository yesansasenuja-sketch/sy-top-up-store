import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json" with { type: "json" };

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore(admin.app(), firebaseConfig.firestoreDatabaseId);
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // PayHere Webhook Handler
  app.post("/api/payhere/notify", async (req, res) => {
    const { 
      merchant_id, 
      order_id, 
      payhere_amount, 
      payhere_currency, 
      status_code, 
      md5sig, 
      custom_1, // uid
      custom_2, // packageId
      payment_id 
    } = req.body;

    console.log(`Received PayHere notification: order_id=${order_id}, status_code=${status_code}`);

    // status_code 2 means success
    if (status_code === "2") {
      const uid = custom_1;
      const packageId = custom_2;
      const amount = parseFloat(payhere_amount);
      const transactionId = payment_id;

      try {
        // 1. Save Payment
        const paymentRef = db.collection("payments").doc(transactionId);
        await paymentRef.set({
          id: transactionId,
          uid,
          amount,
          transactionId,
          date: new Date().toISOString(),
          orderId: order_id
        });

        // 2. Get Package Details
        const packageRef = db.collection("packages").doc(packageId);
        const packageDoc = await packageRef.get();
        
        if (!packageDoc.exists) {
          console.error(`Package ${packageId} not found`);
          return res.status(404).send("Package not found");
        }

        const pkg = packageDoc.data();
        const days = pkg?.days || 30;

        // 3. Expire old subscriptions for this user
        const oldSubsQuery = db.collection("subscriptions")
          .where("uid", "==", uid)
          .where("status", "==", "active");
        
        const oldSubsSnapshot = await oldSubsQuery.get();
        const batch = db.batch();
        oldSubsSnapshot.forEach(doc => {
          batch.update(doc.ref, { status: "expired" });
        });
        await batch.commit();

        // 4. Create New Subscription
        const subId = `SUB-${Date.now()}`;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + days);

        await db.collection("subscriptions").doc(subId).set({
          id: subId,
          uid,
          packageId,
          endDate: endDate.toISOString(),
          status: "active",
          createdAt: new Date().toISOString()
        });

        console.log(`Successfully processed subscription for user ${uid}. Package: ${packageId}`);
        res.status(200).send("OK");
      } catch (err) {
        console.error("PayHere webhook processing error:", err);
        res.status(500).send("Internal error");
      }
    } else {
      res.status(200).send("Ignored status");
    }
  });

  // CPA Postback Endpoint
  // Example: /api/postback/cpagrip?uid=USER_ID&reward=0.50&status=1
  app.get("/api/postback/cpagrip", async (req, res) => {
    const { uid, reward, status, secret } = req.query;

    console.log(`Received postback: uid=${uid}, reward=${reward}, status=${status}`);

    // Basic validation (In production, you'd check a secret key or IP whitelist)
    if (!uid || !reward) {
      return res.status(400).send("Missing parameters");
    }

    // Status 1 usually means completed in many CPA networks
    if (status && status !== "1") {
      return res.status(200).send("Ignored status");
    }

    try {
      const userRef = db.collection("users").doc(uid as string);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        console.error(`User ${uid} not found for postback`);
        return res.status(404).send("User not found");
      }

      const currentBalance = userDoc.data()?.walletBalance || 0;
      const rewardAmount = parseFloat(reward as string);

      await userRef.update({
        walletBalance: currentBalance + rewardAmount,
        lastEarned: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Successfully updated balance for user ${uid}. Added: ${rewardAmount}`);
      res.status(200).send("OK");
    } catch (err) {
      console.error("Postback processing error:", err);
      res.status(500).send("Internal error");
    }
  });

  app.post("/api/send-confirmation", async (req, res) => {
    const { email, orderDetails } = req.body;

    if (!email || !orderDetails) {
      return res.status(400).json({ error: "Missing email or order details" });
    }

    if (!resend) {
      console.warn("RESEND_API_KEY is not set. Skipping email sending.");
      return res.status(200).json({ 
        success: true, 
        message: "Email sending skipped (API key not configured).",
        simulated: true 
      });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: "DiamondBoost <onboarding@resend.dev>",
        to: [email],
        subject: "Order Confirmation - DiamondBoost",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #080c11; color: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #00f2ff20;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #00f2ff; margin: 0; font-size: 24px; letter-spacing: -1px;">DIAMONDBOOST</h1>
              <p style="color: #ffffff50; font-size: 14px;">Order Confirmation</p>
            </div>
            
            <div style="background: #0f172a; padding: 30px; border-radius: 16px; border: 1px solid #ffffff05;">
              <h2 style="font-size: 18px; margin-top: 0;">Order Summary</h2>
              <div style="border-bottom: 1px solid #ffffff05; padding: 10px 0; display: flex; justify-content: space-between;">
                <span style="color: #ffffff50;">Transaction ID</span>
                <span style="font-family: monospace;">#DB-92837465</span>
              </div>
              <div style="border-bottom: 1px solid #ffffff05; padding: 10px 0; display: flex; justify-content: space-between;">
                <span style="color: #ffffff50;">Amount</span>
                <span style="color: #00f2ff; font-weight: bold;">${orderDetails.amount} Diamonds</span>
              </div>
              <div style="border-bottom: 1px solid #ffffff05; padding: 10px 0; display: flex; justify-content: space-between;">
                <span style="color: #ffffff50;">Player ID</span>
                <span style="font-weight: bold;">${orderDetails.playerId}</span>
              </div>
              <div style="padding: 10px 0; display: flex; justify-content: space-between;">
                <span style="color: #ffffff50;">Status</span>
                <span style="color: #22c55e; font-weight: bold;">Processing</span>
              </div>
            </div>
            
            <p style="text-align: center; color: #ffffff50; font-size: 12px; margin-top: 30px;">
              If you have any questions, please contact our support team.
            </p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend error:", error);
        return res.status(500).json({ error: error.message });
      }

      res.json({ success: true, data });
    } catch (err) {
      console.error("Server error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

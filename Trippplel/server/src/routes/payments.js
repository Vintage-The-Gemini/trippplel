const express = require("express");
const router = express.Router();
const axios = require("axios");
const prisma = require("../lib/prisma");

const PESAPAL_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/pesapalv3";

async function getPesapalToken() {
  const response = await axios.post(
    `${PESAPAL_BASE_URL}/api/Auth/RequestToken`,
    {
      consumer_key: process.env.PESAPAL_CONSUMER_KEY,
      consumer_secret: process.env.PESAPAL_CONSUMER_SECRET,
    },
    { headers: { "Content-Type": "application/json", Accept: "application/json" } }
  );
  return response.data.token;
}

async function registerIPN(token) {
  const ipnUrl = `${process.env.SERVER_URL}/api/payments/ipn`;
  const response = await axios.post(
    `${PESAPAL_BASE_URL}/api/URLSetup/RegisterIPN`,
    { url: ipnUrl, ipn_notification_type: "POST" },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return response.data.ipn_id;
}

// POST /api/payments/initiate
router.post("/initiate", async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const token = await getPesapalToken();
    const ipnId = await registerIPN(token);

    const addr = order.shippingAddress;
    const nameParts = (addr.fullName || "").split(" ");
    const firstName = nameParts[0] || "Customer";
    const lastName = nameParts.slice(1).join(" ") || "";

    const response = await axios.post(
      `${PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest`,
      {
        id: orderId,
        currency: "KES",
        amount: order.total,
        description: `Order ${orderId.slice(-8).toUpperCase()}`,
        callback_url: `${process.env.CLIENT_URL}/orders/${orderId}`,
        notification_id: ipnId,
        billing_address: {
          email_address: order.email,
          phone_number: addr.phone,
          first_name: firstName,
          last_name: lastName,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const { order_tracking_id, redirect_url } = response.data;
    await prisma.order.update({
      where: { id: orderId },
      data: { pesapalTrackingId: order_tracking_id },
    });

    res.json({ redirectUrl: redirect_url });
  } catch (err) {
    console.error("Pesapal initiate error:", err.response?.data || err.message);
    res.status(500).json({ message: "Payment initiation failed" });
  }
});

// POST /api/payments/ipn
router.post("/ipn", async (req, res) => {
  try {
    const { OrderTrackingId, OrderMerchantReference } = req.body;
    const token = await getPesapalToken();

    const statusRes = await axios.get(
      `${PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } }
    );

    if (statusRes.data.payment_status_description === "COMPLETED") {
      await prisma.order.update({
        where: { id: OrderMerchantReference },
        data: {
          status: "paid",
          isPaid: true,
          paidAt: new Date(),
          pesapalTrackingId: OrderTrackingId,
        },
      });
    }

    res.json({
      orderNotificationType: "IPNCHANGE",
      orderTrackingId: OrderTrackingId,
      orderMerchantReference: OrderMerchantReference,
      status: "200",
    });
  } catch (err) {
    console.error("IPN error:", err.response?.data || err.message);
    res.status(500).json({ message: "IPN processing failed" });
  }
});

// GET /api/payments/status/:orderId
router.get("/status/:orderId", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      select: { isPaid: true, status: true, pesapalTrackingId: true },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ isPaid: order.isPaid, status: order.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

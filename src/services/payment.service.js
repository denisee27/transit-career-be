import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";
import prisma from "../lib/db.js";
import { NotFoundError } from "../errors/httpErrors.js";

const PREMIUM_PRICE_IDR = 20000;
const PAYMENT_EXPIRY_MINUTES = 15;
const PREMIUM_DURATION_DAYS = 30;

export async function createPayment(userId) {
  const orderId = `TC-${userId.slice(0, 8).toUpperCase()}-${Date.now()}`;
  const expiresAt = new Date(Date.now() + PAYMENT_EXPIRY_MINUTES * 60 * 1000);

  // Mock QRIS data string (replace with Midtrans QRIS in production)
  const qrisPayload = `00020101021226590014ID.CO.BCA.WWW011893600914300017572702150001${orderId}52045811530336054052000055802ID5915TransitCareer6015Jakarta Selatan61051234062070703A016304ABCD`;
  const qrisCode = await QRCode.toDataURL(qrisPayload);

  const payment = await prisma.payment.create({
    data: { userId, amount: PREMIUM_PRICE_IDR, currency: "IDR", orderId, qrisCode, expiresAt },
  });

  return { paymentId: payment.id, orderId, qrisCode, expiresAt, amount: PREMIUM_PRICE_IDR };
}

export async function handleWebhook(payload) {
  const { order_id, transaction_status, fraud_status } = payload;

  const payment = await prisma.payment.findUnique({ where: { orderId: order_id } });
  if (!payment) throw new NotFoundError("Payment not found");

  const isSuccess =
    transaction_status === "settlement" ||
    (transaction_status === "capture" && fraud_status === "accept");

  if (isSuccess && payment.status === "PENDING") {
    const premiumExpiresAt = new Date(
      Date.now() + PREMIUM_DURATION_DAYS * 24 * 60 * 60 * 1000
    );

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCESS", paidAt: new Date() },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: { tier: "PREMIUM", premiumExpiresAt },
      }),
    ]);
  } else if (["expire", "cancel", "deny"].includes(transaction_status)) {
    const status = transaction_status === "expire" ? "EXPIRED" : "FAILED";
    await prisma.payment.update({ where: { id: payment.id }, data: { status } });
  }

  return { received: true };
}

export async function getPaymentStatus(paymentId, userId) {
  const payment = await prisma.payment.findFirst({ where: { id: paymentId, userId } });
  if (!payment) throw new NotFoundError("Payment not found");

  if (payment.status === "PENDING" && payment.expiresAt && payment.expiresAt < new Date()) {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "EXPIRED" } });
    payment.status = "EXPIRED";
  }

  return payment;
}

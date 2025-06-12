const functions = require("firebase-functions");
const axios = require("axios");

// Set your Paystack secret key
const PAYSTACK_SECRET_KEY = functions.config().paystack.secret_key;

exports.verifyPayment = functions.https.onCall(
  async (data: any, context: any) => {
    try {
      // Extract reference from the request
      const { reference } = data;

      if (!reference) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Reference is required"
        );
      }

      // Call Paystack verification API
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { data: paymentData } = response.data;

      // Return verification result
      return {
        success: true,
        status: paymentData.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        reference: paymentData.reference,
        customer: paymentData.customer,
        paid_at: paymentData.paid_at,
        channel: paymentData.channel,
      };
    } catch (error: any) {
      console.error("Payment verification error:", error);

      // Handle Paystack API errors
      if (error.response) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          `Paystack API error: ${error.response.data.message}`
        );
      }

      // Handle other errors
      throw new functions.https.HttpsError(
        "internal",
        "Payment verification failed"
      );
    }
  }
);

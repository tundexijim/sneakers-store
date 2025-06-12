const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const axios = require("axios");

// Set your Paystack secret key
const paystackSecretKey = defineSecret("PAYSTACK_SECRET_KEY");

exports.verifyPayment = onCall(
  // Specify which secrets this function needs
  { secrets: [paystackSecretKey] },
  async (request: any) => {
    try {
      // Extract reference from the request
      const { reference } = request.data;

      if (!reference) {
        throw new HttpsError("invalid-argument", "Reference is required");
      }
      const secretKey = paystackSecretKey.value();
      // Call Paystack verification API
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${secretKey}`,
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
        throw new HttpsError(
          "failed-precondition",
          `Paystack API error: ${error.response.data.message}`
        );
      }

      // Handle other errors
      throw new HttpsError("internal", "Payment verification failed");
    }
  }
);

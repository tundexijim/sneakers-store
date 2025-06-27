interface PaystackOptions {
  email: string;
  amount: number; // in kobo (e.g. 5000 NGN = 500000)
  reference: string;
  metadata?: any;
  currency?: string; // Make currency configurable
  onSuccess: (response: PaystackResponse) => void;
  onClose: () => void;
}

// Define a type for the Paystack response
export interface PaystackResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
  [key: string]: any; // For any other properties
}

// Define a type for the PaystackPop object
interface PaystackPopInterface {
  setup: (options: any) => { openIframe: () => void };
}

/**
 * Initializes and opens a Paystack payment iframe
 * @throws Error if PaystackPop is not available in the window object
 */
export const payWithPaystack = ({
  email,
  amount,
  reference,
  metadata,
  currency = "NGN", // Default to NGN but allow override
  onSuccess,
  onClose,
}: PaystackOptions): void => {
  try {
    // Check if PaystackPop is available
    const PaystackPop = (window as any).PaystackPop as
      | PaystackPopInterface
      | undefined;

    if (!PaystackPop) {
      console.error(
        "Paystack script not loaded. Make sure to include the Paystack script in your HTML."
      );
      return;
    }

    // Get the public key from environment variables
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!publicKey) {
      console.error("Paystack public key not found in environment variables.");
      return;
    }

    const handler = PaystackPop.setup({
      key: publicKey,
      email,
      amount,
      currency,
      ref: reference,
      metadata: metadata || {},
      callback: function (response: PaystackResponse) {
        onSuccess(response);
      },
      onClose: function () {
        onClose();
      },
    });

    handler.openIframe();
  } catch (error) {
    console.error("Error initializing Paystack:", error);
    // You might want to notify the user or implement a fallback here
  }
};

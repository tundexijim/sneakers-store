// First install: npm install react-paystack
import dynamic from "next/dynamic";

const PaystackButton = dynamic(
  () => import("react-paystack").then((mod) => mod.PaystackButton),
  { ssr: false }
);

interface PaystackOptions {
  email: string;
  amount: number; // in kobo (e.g. 5000 NGN = 500000)
  reference: string;
  metadata?: any;
  currency?: string;
  onSuccess: (response: PaystackResponse) => void;
  onClose: () => void;
}

export interface PaystackResponse {
  reference: string;
  trans: string;
  status: string;
  message: string;
  transaction: string;
  trxref: string;
  [key: string]: any;
}

/**
 * PaystackButton Component with custom styling and props
 */
export interface PaystackButtonComponentProps extends PaystackOptions {
  text?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const PaystackButtonComponent: React.FC<
  PaystackButtonComponentProps
> = ({
  email,
  amount,
  reference,
  metadata,
  currency = "NGN",
  onSuccess,
  onClose,
  text = "Pay Now",
  className = "",
  disabled = false,
  children,
}) => {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  if (!publicKey) {
    console.error("Paystack public key not found in environment variables.");
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-600 text-sm">
        Payment Unavailable
      </div>
    );
  }

  const componentProps = {
    email,
    amount,
    publicKey,
    currency,
    reference,
    metadata: metadata || {},
    text,
    onSuccess,
    onClose,
    className,
    disabled,
  };

  return <PaystackButton {...componentProps}>{children}</PaystackButton>;
};

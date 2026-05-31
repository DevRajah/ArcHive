import crypto from "crypto";

export const verifyGitHubSignature = ({
  payload,
  signature,
  secret,
}: {
  payload: string;
  signature?: string;
  secret?: string;
}) => {
  if (!secret) {
    return {
      valid: false,
      reason: "Webhook secret is not configured",
    };
  }

  if (!signature) {
    return {
      valid: false,
      reason: "Missing x-hub-signature-256 header",
    };
  }

  const expectedSignature =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length) {
    return {
      valid: false,
      reason: "Signature length mismatch",
    };
  }

  const valid = crypto.timingSafeEqual(received, expected);

  return {
    valid,
    reason: valid ? "Signature verified" : "Invalid webhook signature",
  };
};
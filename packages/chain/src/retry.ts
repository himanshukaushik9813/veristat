/**
 * Public testnet RPCs sit behind load balancers whose nodes disagree about the
 * head by a few blocks, so fresh-block reads intermittently fail with
 * "block is out of range" or empty contract data. These are valid RPC
 * responses, not transport errors, so viem's built-in retry doesn't cover
 * them — retry with backoff at the call site instead.
 */
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3, baseDelayMs = 700): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, baseDelayMs * (i + 1)));
    }
  }
  throw lastErr;
}

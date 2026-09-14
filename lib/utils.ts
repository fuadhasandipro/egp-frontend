export function extractErrorMessage(err: any, fallback: string = 'An error occurred'): string {
  if (!err) return fallback;
  const msg = err.response?.data?.message ?? err.response?.data ?? err.message;
  if (typeof msg === 'string') return msg;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'object' && msg !== null) {
    if (typeof msg.message === 'string') return msg.message;
    if (Array.isArray(msg.message)) return msg.message.join(', ');
    if (typeof msg.error === 'string') return msg.error;
    try {
      return JSON.stringify(msg);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export const retryAsync = async <T>(fn: () => Promise<T>, retries = 3, delay = 200): Promise<T> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt >= retries) throw err;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }
  throw new Error('Retry attempts exhausted');
};
export function getErrorMessage(error: unknown): string {
  // Handle Axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: unknown; statusText?: string } };

    // Try to get message from response data
    if (axiosError.response?.data) {
      const data = axiosError.response.data as Record<string, unknown>;

      // Handle different response formats
      if (typeof data === 'string') return data;
      if (data.message && typeof data.message === 'string') return data.message;
      if (data.detail && typeof data.detail === 'string') return data.detail;
      if (data.default && typeof data.default === 'string') return data.default;
      if (data.error && typeof data.error === 'string') return data.error;
    }

    // Fallback to status text
    return axiosError.response?.statusText || 'An error occurred';
  }

  // Handle generic errors
  if (error instanceof Error) return error.message;
  return 'An error occurred';
}

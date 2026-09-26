const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function generate(invoiceData: any): Promise<Blob> {
  const response = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(invoiceData)
  });

  if (!response.ok) {
    throw new Error('Failed to generate invoice');
  }

  return response.blob();
}
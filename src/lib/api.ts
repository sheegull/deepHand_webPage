// API configuration
const getApiBaseUrl = (): string => {
  // Check if there's a custom API URL set via environment variable
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development environment (localhost)
  if (import.meta.env.DEV || window.location.hostname === 'localhost') {
    return 'http://localhost:8787';
  }
  
  // Production environment
  return 'https://deephand-forms-production.sheegull.workers.dev';
};

export const API_ENDPOINTS = {
  contact: `${getApiBaseUrl()}/api/contact`,
  requestData: `${getApiBaseUrl()}/api/request-data`,
} as const;

// Helper function for API calls with error handling
export const apiCall = async (url: string, data: any) => {
  console.log('🚀 API Call:', { url, data });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('📡 Response Status:', response.status, response.statusText);
    console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API Error:', { status: response.status, errorData });
      
      // Enhanced error messages for common issues
      if (response.status === 429) {
        throw new Error('リクエスト数が上限に達しました。しばらく時間をおいてから再度お試しください。');
      } else if (response.status === 403) {
        throw new Error('アクセスが拒否されました。');
      } else if (response.status >= 500) {
        throw new Error('サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください。');
      }
      
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ API Success:', result);
    return result;
    
  } catch (error) {
    console.error('🔥 API Call Failed:', error);
    throw error;
  }
};
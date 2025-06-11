type NavigationEvent = {
  from: string;
  to: string;
  element: string;
  timestamp: number;
};

export const logNavigation = async (event: NavigationEvent) => {
  // Simple client-side navigation logging
  // Analytics are handled by Cloudflare Workers backend
  console.log('Navigation event:', {
    from: event.from,
    to: event.to,
    element: event.element,
    timestamp: new Date(event.timestamp).toISOString(),
  });
};
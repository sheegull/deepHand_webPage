type NavigationEvent = {
  from: string;
  to: string;
  element: string;
  timestamp: number;
};

export const logNavigation = async (event: NavigationEvent) => {
  try {
    await fetch('https://deephand-forms.workers.dev/api/analytics/navigation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (error) {
    console.error('Failed to log navigation event:', error);
  }
};
'use client';

import Script from 'next/script';

export function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

// Event tracking utilities
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Common event tracking functions
export const analytics = {
  // Page views
  trackPageView: (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_path: url,
      });
    }
  },

  // User events
  trackSignup: (method: string) => trackEvent('sign_up', 'engagement', method),
  trackLogin: (method: string) => trackEvent('login', 'engagement', method),
  
  // Learning events
  trackTopicStart: (topicId: string) => trackEvent('topic_start', 'learning', topicId),
  trackTopicComplete: (topicId: string, timeSpent: number) => 
    trackEvent('topic_complete', 'learning', topicId, timeSpent),
  trackQuizComplete: (quizId: string, score: number) => 
    trackEvent('quiz_complete', 'learning', quizId, score),
  
  // AI Mentor events
  trackAIInteraction: (type: string) => trackEvent('ai_interaction', 'ai_mentor', type),
  
  // Productivity events
  trackProductivitySession: (duration: number) => 
    trackEvent('productivity_session', 'productivity', 'session', duration),
  
  // Error events
  trackError: (error: string, fatal: boolean = false) => 
    trackEvent('exception', 'error', error, fatal ? 1 : 0),
};

// TypeScript global declaration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

/**
 * Session timeout hook for admin portal
 * Monitors user activity and warns before session expiry
 * 
 * @param timeoutMinutes - Minutes of inactivity before timeout (default: 24 hours = 1440 min)
 * @param warningMinutes - Minutes before timeout to show warning (default: 5 min)
 */
export function useSessionTimeout(
  timeoutMinutes = 1440, // 24 hours
  warningMinutes = 5
) {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(warningMinutes * 60); // seconds
  
  useEffect(() => {
    const supabase = createClient();
    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;
    
    // Reset timeout on user activity
    const resetTimeout = () => {
      // Clear existing timers
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      clearInterval(countdownInterval);
      setShowWarning(false);
      
      // Set warning timer (shows warning X minutes before logout)
      warningId = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(warningMinutes * 60);
        
        // Start countdown
        countdownInterval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              // Time's up - logout
              handleLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        // Show toast notification
        toast.warning('Session will expire soon', {
          description: `You'll be logged out in ${warningMinutes} minutes due to inactivity.`,
          action: {
            label: 'Stay Logged In',
            onClick: () => {
              resetTimeout();
              toast.success('Session extended');
            },
          },
          duration: 10000,
        });
      }, (timeoutMinutes - warningMinutes) * 60 * 1000);
      
      // Set logout timer
      timeoutId = setTimeout(() => {
        handleLogout();
      }, timeoutMinutes * 60 * 1000);
    };
    
    // Logout and redirect
    const handleLogout = async () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      clearInterval(countdownInterval);
      
      await supabase.auth.signOut();
      
      toast.error('Session expired', {
        description: 'You have been logged out due to inactivity.',
      });
      
      router.push('/admin/login');
    };
    
    // Activity events to monitor
    const activityEvents = [
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];
    
    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, resetTimeout, { passive: true });
    });
    
    // Initialize timeout
    resetTimeout();
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningId);
      clearInterval(countdownInterval);
      activityEvents.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [timeoutMinutes, warningMinutes, router]);
  
  return {
    showWarning,
    timeLeft,
    extendSession: () => setShowWarning(false),
  };
}


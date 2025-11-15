'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login selector so users can choose their account type
    router.replace('/login/selector');
  }, [router]);

  return null;
}

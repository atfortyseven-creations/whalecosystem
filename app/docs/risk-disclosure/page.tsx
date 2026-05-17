"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/docs/legal/risk-disclosure');
  }, [router]);
  return null;
}

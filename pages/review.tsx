import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ReviewRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/pipeline'); }, [router]);
  return null;
}

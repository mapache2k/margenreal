import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function EmailsRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/pipeline'); }, [router]);
  return null;
}

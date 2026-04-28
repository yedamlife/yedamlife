'use client';

import { useEffect, useRef } from 'react';

export function NoticeViewTracker({ id }: { id: number | string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const key = `notice-viewed-${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    fetch(`/api/v1/notices/${id}/view`, { method: 'POST', keepalive: true }).catch(
      () => {},
    );
  }, [id]);

  return null;
}

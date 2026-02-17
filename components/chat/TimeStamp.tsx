"use client";

import { useEffect, useState } from "react";

interface TimeStampProps {
  timestamp: Date;
  className?: string;
}

export function TimeStamp({ timestamp, className }: TimeStampProps) {
  const [mounted, setMounted] = useState(false);

  // Only render after component mounts (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, show nothing (or a placeholder)
  if (!mounted) {
    return <span className={className}>--:--:--</span>;
  }

  // After mount (client-side), show actual time
  return <span className={className}>{timestamp.toLocaleTimeString()}</span>;
}

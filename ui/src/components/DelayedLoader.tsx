import { useEffect, useState } from "react";

export function DelayedLoader() {
  const [showLoading, setShowLoading] = useState(false);
  useEffect(() => {
    const handle = setTimeout(() => {
      setShowLoading(true);
    }, 300);
    return () => {
      clearTimeout(handle);
    };
  }, []);
  if (!showLoading) {
    return null;
  }
  return <div>loading...</div>;
}

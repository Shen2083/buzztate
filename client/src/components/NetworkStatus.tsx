import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBackOnline, setShowBackOnline] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      setShowBackOnline(true);
      setTimeout(() => setShowBackOnline(false), 3000);
    };
    const goOffline = () => {
      setIsOnline(false);
      setShowBackOnline(false);
    };

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (isOnline && !showBackOnline) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] text-center py-2 px-4 text-sm font-medium transition-all ${
        isOnline
          ? "bg-green-600 text-white"
          : "bg-yellow-500 text-black"
      }`}
    >
      {isOnline ? (
        <span className="flex items-center justify-center gap-2">
          <Wifi size={14} /> Back online
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <WifiOff size={14} /> You appear to be offline. Some features may not work until you're reconnected.
        </span>
      )}
    </div>
  );
}

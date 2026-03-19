import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getConsent, setConsent, type ConsentChoice } from "@/lib/cookieConsent";
import { Link } from "wouter";

export default function CookieConsent() {
  const [visible, setVisible] = useState(() => getConsent() === null);

  const handleChoice = (choice: ConsentChoice) => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 inset-x-0 z-[90] border-t border-border bg-card/95 backdrop-blur-md p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-muted-foreground flex-1">
              We use cookies to analyze site usage and improve your experience.
              Essential cookies are always active.{" "}
              <Link href="/privacy" className="underline hover:text-foreground">
                Privacy Policy
              </Link>
            </p>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => handleChoice("rejected")}>
                Reject
              </Button>
              <Button size="sm" onClick={() => handleChoice("accepted")}>
                Accept All
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

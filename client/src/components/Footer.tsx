import { Link } from "wouter";

/**
 * Shared footer displayed on every page.
 * Accepts an optional `minimal` prop for the app/auth pages
 * where we only want the legal links row.
 */
export default function Footer({ minimal = false }: { minimal?: boolean }) {
  return (
    <footer className="w-full border-t border-gray-800 bg-black text-center py-6 px-6 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
          <span className="text-gray-700">|</span>
          <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          <span className="text-gray-700">|</span>
          <a href="mailto:teamz@buzztate.com" className="hover:text-gray-300 transition-colors">teamz@buzztate.com</a>
        </div>
        <p className="text-xs text-gray-600">&copy; 2026 Buzztate. All rights reserved.</p>
      </div>
    </footer>
  );
}

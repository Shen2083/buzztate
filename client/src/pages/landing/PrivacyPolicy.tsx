import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      {/* Nav */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">⚡</span>
            <span className="font-bold text-lg tracking-tight">Buzztate</span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-grow w-full max-w-[720px] mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <article className="legal-content">
          <h1>Privacy Policy</h1>
          <p className="legal-meta"><strong>Buzztate for Sellers</strong><br />Last updated: 11 March 2026</p>

          <h2>1. Who we are</h2>
          <p>Buzztate ("we", "us", "our") provides an e-commerce listing localization service at buzztate.com. We are based in the United Kingdom.</p>
          <p>Contact: <a href="mailto:teamz@buzztate.com">teamz@buzztate.com</a></p>

          <h2>2. What data we collect</h2>

          <h3>Account data</h3>
          <p>When you create an account, we collect your email address and a hashed password (via our authentication provider, Supabase). We do not store your password in plain text.</p>

          <h3>Product listing data</h3>
          <p>When you upload files (.csv, .xlsx, .tsv) for localization, we process the contents of those files to provide the service. This typically includes product titles, descriptions, bullet points, keywords, SKUs, prices, and other listing fields.</p>

          <h3>Payment data</h3>
          <p>When you subscribe to Buzztate Plus, your payment is processed by Stripe. We store your Stripe customer ID and subscription status. We do not store your credit card number, CVV, or full card details — these are handled entirely by Stripe under their own <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</p>

          <h3>Usage data</h3>
          <p>We collect basic usage information: number of localizations performed, marketplaces selected, and timestamps. This helps us improve the service and enforce plan limits.</p>

          <h3>Technical data</h3>
          <p>We collect standard web server logs including IP address, browser type, and referring URL. We use cookies only for authentication (keeping you logged in) and do not use tracking cookies or third-party advertising cookies.</p>

          <h2>3. How we use your data</h2>
          <p>We use your data for the following purposes only:</p>
          <ul>
            <li><strong>Providing the service:</strong> Your uploaded listings are sent to our AI localization engine (currently powered by OpenAI's API) to generate translations and localizations. Listing data is sent to OpenAI solely for the purpose of generating your localized output.</li>
            <li><strong>Account management:</strong> Your email address is used for authentication, password resets, and essential service communications (e.g., billing confirmations, service disruptions).</li>
            <li><strong>Payment processing:</strong> Your Stripe customer ID is used to manage your subscription, process payments, and handle cancellations.</li>
            <li><strong>Service improvement:</strong> Aggregated, anonymised usage data (e.g., most popular marketplaces, average batch size) helps us prioritise new features. We do not use your individual listing content for this purpose.</li>
          </ul>

          <h2>4. Third-party processors</h2>
          <p>We use the following third-party services to operate Buzztate:</p>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Purpose</th>
                  <th>Data shared</th>
                  <th>Privacy policy</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Supabase</td>
                  <td>Authentication and database</td>
                  <td>Email, hashed password, account data</td>
                  <td><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a></td>
                </tr>
                <tr>
                  <td>OpenAI</td>
                  <td>AI-powered localization</td>
                  <td>Product listing text (title, description, bullet points, keywords)</td>
                  <td><a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer">openai.com/privacy</a></td>
                </tr>
                <tr>
                  <td>Stripe</td>
                  <td>Payment processing</td>
                  <td>Email, payment method, billing address</td>
                  <td><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></td>
                </tr>
                <tr>
                  <td>Vercel</td>
                  <td>Website hosting</td>
                  <td>IP address, browser information (server logs)</td>
                  <td><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">vercel.com/legal/privacy-policy</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <p><strong>Important note on OpenAI:</strong> Product listing content sent to OpenAI for localization is processed under OpenAI's API terms. As of our last review, OpenAI does not use API inputs to train its models. However, we recommend reviewing OpenAI's current <a href="https://openai.com/policies" target="_blank" rel="noopener noreferrer">data usage policy</a> for the most up-to-date information.</p>

          <h2>5. Data retention</h2>
          <ul>
            <li><strong>Account data:</strong> Retained for as long as your account is active. Deleted within 30 days of account deletion.</li>
            <li><strong>Uploaded listing files:</strong> Processed in memory during localization and not stored on our servers after the localized output is delivered to your browser. We do not retain copies of your uploaded files.</li>
            <li><strong>Localized output:</strong> Generated client-side in your browser. We do not store copies of your localized output files.</li>
            <li><strong>Payment records:</strong> Retained for 7 years as required by UK tax and accounting regulations.</li>
            <li><strong>Usage logs:</strong> Retained for 12 months, then deleted.</li>
          </ul>

          <h2>6. Your rights under UK GDPR</h2>
          <p>Under the UK General Data Protection Regulation, you have the right to:</p>
          <ul>
            <li><strong>Access</strong> the personal data we hold about you</li>
            <li><strong>Rectify</strong> inaccurate personal data</li>
            <li><strong>Erase</strong> your personal data ("right to be forgotten")</li>
            <li><strong>Restrict</strong> processing of your personal data</li>
            <li><strong>Data portability</strong> — receive your data in a structured, machine-readable format</li>
            <li><strong>Object</strong> to processing based on legitimate interests</li>
            <li><strong>Withdraw consent</strong> at any time where processing is based on consent</li>
          </ul>
          <p>To exercise any of these rights, email <a href="mailto:teamz@buzztate.com">teamz@buzztate.com</a>. We will respond within 30 days.</p>

          <h2>7. Data security</h2>
          <p>We implement appropriate technical measures to protect your data, including: encrypted connections (HTTPS/TLS) for all data in transit, encrypted data at rest in our database, authentication via secure token-based sessions, and access controls limiting data access to essential services only.</p>

          <h2>8. International transfers</h2>
          <p>Your data may be processed outside the UK by our third-party providers (OpenAI and Vercel operate primarily in the United States, Supabase may process data in the EU or US). These transfers are covered by appropriate safeguards including Standard Contractual Clauses and adequacy decisions where applicable.</p>

          <h2>9. Children</h2>
          <p>Buzztate is a business tool designed for e-commerce professionals. We do not knowingly collect data from anyone under 18 years of age. If you believe we have inadvertently collected such data, please contact us immediately.</p>

          <h2>10. Changes to this policy</h2>
          <p>We may update this policy from time to time. Material changes will be communicated via email to registered users. The "Last updated" date at the top of this page indicates the most recent revision.</p>

          <h2>11. Complaints</h2>
          <p>If you are unhappy with how we handle your data, you have the right to lodge a complaint with the Information Commissioner's Office (ICO):</p>
          <p>Website: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a><br />Phone: 0303 123 1113</p>

          <h2>12. Contact</h2>
          <p>For any privacy-related questions or requests:</p>
          <p>Email: <a href="mailto:teamz@buzztate.com">teamz@buzztate.com</a></p>
        </article>
      </div>

      <Footer />
    </div>
  );
}

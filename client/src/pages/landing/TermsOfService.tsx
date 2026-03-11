import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function TermsOfService() {
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
          <h1>Terms of Service</h1>
          <p className="legal-meta"><strong>Buzztate for Sellers</strong><br />Last updated: 11 March 2026</p>

          <h2>1. Introduction</h2>
          <p>These Terms of Service ("Terms") govern your use of Buzztate ("the Service"), an e-commerce listing localization platform available at buzztate.com. By creating an account or using the Service, you agree to these Terms.</p>
          <p>If you do not agree, please do not use the Service.</p>

          <h2>2. The Service</h2>
          <p>Buzztate provides AI-powered localization of e-commerce product listings. You upload product listing files, select target marketplaces and languages, and receive localized output files formatted for those marketplaces.</p>
          <p>The Service currently supports input from Amazon Seller Central, Shopify, and Etsy, and generates output for Amazon Germany, France, Spain, Italy, and Japan, as well as Shopify and Etsy in supported languages.</p>

          <h2>3. Accounts</h2>
          <p>You must create an account to use the Service. You are responsible for maintaining the security of your account credentials and for all activity under your account. You must provide a valid email address and accurate information.</p>
          <p>You must be at least 18 years old to use the Service.</p>

          <h2>4. Plans and payment</h2>

          <h3>Free plan</h3>
          <p>The Free plan allows up to 5 listing localizations per month into 1 marketplace. No payment is required.</p>

          <h3>Plus plan ($49/month)</h3>
          <p>The Plus plan provides unlimited listing localizations (up to 200 per batch) across all supported marketplaces. Payment is processed monthly via Stripe.</p>

          <h3>Billing</h3>
          <p>Plus subscriptions are billed monthly from the date of subscription. You authorise us to charge your payment method on a recurring basis until you cancel.</p>

          <h3>Cancellation</h3>
          <p>You may cancel your Plus subscription at any time through the Stripe Customer Portal (accessible via "Manage Subscription" in the app). Upon cancellation, you retain Plus access until the end of your current billing period. After that, your account reverts to the Free plan.</p>

          <h3>Refunds</h3>
          <p>We do not offer refunds for partial billing periods. If you experience a technical issue that prevents you from using the Service, contact <a href="mailto:support@buzztate.com">support@buzztate.com</a> and we will assess on a case-by-case basis.</p>

          <h3>Price changes</h3>
          <p>We may change our pricing with 30 days' notice. Price changes do not apply to the current billing period. Continued use after a price change constitutes acceptance of the new pricing.</p>

          <h2>5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Upload content that infringes third-party intellectual property rights</li>
            <li>Upload content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
            <li>Attempt to reverse-engineer, decompile, or extract the underlying AI models or algorithms</li>
            <li>Use the Service to generate content that violates the terms of service of any target marketplace (Amazon, Shopify, Etsy)</li>
            <li>Use automated tools (bots, scrapers) to access the Service beyond normal usage patterns</li>
            <li>Share your account credentials with third parties or resell access to the Service</li>
            <li>Attempt to circumvent plan limits, rate limits, or security measures</li>
          </ul>
          <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>

          <h2>6. Your content</h2>

          <h3>Ownership</h3>
          <p>You retain full ownership of all content you upload to Buzztate ("Your Content"). You also retain full ownership of all localized output generated from Your Content.</p>
          <p>We do not claim any intellectual property rights over Your Content or the localized output.</p>

          <h3>Licence to us</h3>
          <p>By uploading content, you grant us a limited, non-exclusive licence to process Your Content solely for the purpose of providing the Service — specifically, to send listing text to our AI localization engine and return the localized results to you. This licence terminates when your content is processed and delivered.</p>

          <h3>No storage</h3>
          <p>We process uploaded files in memory during localization. We do not retain copies of your uploaded files or localized output after delivery. Localized files are generated in your browser.</p>

          <h2>7. AI-generated output</h2>

          <h3>Quality</h3>
          <p>The Service uses AI language models to generate localizations. While we implement marketplace-specific rules, character limit checks, and quality flags, AI-generated content may contain errors, inaccuracies, or culturally inappropriate translations.</p>
          <p><strong>You are responsible for reviewing all localized output before uploading it to any marketplace.</strong> We strongly recommend having a native speaker review localized listings for high-value products or markets critical to your business.</p>

          <h3>No guarantee of marketplace compliance</h3>
          <p>Buzztate helps you create marketplace-formatted files, but we do not guarantee that localized listings will comply with the specific policies of Amazon, Shopify, Etsy, or any other platform. Marketplace policies change frequently and vary by category, region, and product type. You are responsible for ensuring your listings comply with each platform's current requirements.</p>

          <h3>No guarantee of sales performance</h3>
          <p>We do not guarantee that localized listings will result in increased sales, improved search rankings, or better conversion rates on any marketplace.</p>

          <h2>8. Third-party services</h2>
          <p>The Service relies on third-party providers including OpenAI (AI localization), Supabase (authentication and data storage), Stripe (payment processing), and Vercel (hosting). Your use of the Service is also subject to the terms and policies of these providers.</p>
          <p>We are not responsible for outages, changes, or failures of third-party services, though we will make reasonable efforts to communicate any service disruptions.</p>

          <h2>9. Intellectual property</h2>
          <p>The Buzztate name, logo, website design, and underlying technology are owned by us and protected by applicable intellectual property laws. These Terms do not grant you any rights to use our branding or technology beyond normal use of the Service.</p>

          <h2>10. Limitation of liability</h2>
          <p>To the maximum extent permitted by law:</p>
          <ul>
            <li>The Service is provided "as is" and "as available" without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
            <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.</li>
            <li>Our total liability for any claim arising from these Terms or your use of the Service is limited to the amount you paid us in the 12 months preceding the claim, or £100, whichever is greater.</li>
            <li>We are not liable for any losses arising from errors in AI-generated translations, including but not limited to: lost sales, marketplace penalties, listing removals, account suspensions, or reputational harm.</li>
          </ul>
          <p>Nothing in these Terms excludes or limits our liability for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded by law.</p>

          <h2>11. Indemnification</h2>
          <p>You agree to indemnify and hold us harmless from any claims, damages, or expenses (including reasonable legal fees) arising from: your use of the Service, content you upload, your violation of these Terms, or your violation of any third-party rights including marketplace terms of service.</p>

          <h2>12. Termination</h2>

          <h3>By you</h3>
          <p>You may stop using the Service and delete your account at any time by contacting <a href="mailto:support@buzztate.com">support@buzztate.com</a>.</p>

          <h3>By us</h3>
          <p>We may suspend or terminate your access to the Service at any time if you violate these Terms, if required by law, or if we discontinue the Service. We will provide reasonable notice where possible.</p>

          <h3>Effect of termination</h3>
          <p>Upon termination, your right to use the Service ceases immediately. We will delete your account data within 30 days, except where retention is required by law (e.g., payment records for tax purposes).</p>

          <h2>13. Changes to these Terms</h2>
          <p>We may update these Terms from time to time. Material changes will be communicated via email to registered users at least 14 days before taking effect. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.</p>

          <h2>14. Governing law</h2>
          <p>These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms or your use of the Service will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

          <h2>15. Severability</h2>
          <p>If any provision of these Terms is found to be unenforceable, the remaining provisions continue in full force and effect.</p>

          <h2>16. Entire agreement</h2>
          <p>These Terms, together with our <Link href="/privacy" className="text-yellow-400 hover:underline">Privacy Policy</Link>, constitute the entire agreement between you and Buzztate regarding your use of the Service.</p>

          <h2>17. Contact</h2>
          <p>For questions about these Terms:</p>
          <p>Email: <a href="mailto:support@buzztate.com">support@buzztate.com</a></p>
        </article>
      </div>

      <Footer />
    </div>
  );
}

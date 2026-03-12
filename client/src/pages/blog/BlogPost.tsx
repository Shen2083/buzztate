import { Link, useRoute } from "wouter";
import { BLOG_POSTS } from "./blogData";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link href="/blog" className="text-yellow-400 hover:underline">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Nav */}
      <nav className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <span className="text-2xl md:text-3xl">⚡</span>
              <span className="font-bold text-lg md:text-xl tracking-tight">Buzztate</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Blog</Link>
            <Link href="/auth?mode=login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Log In</Link>
          </div>
        </div>
      </nav>

      {/* JSON-LD: Article */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.date,
            dateModified: post.updated || post.date,
            author: { "@type": "Organization", name: "Buzztate" },
            publisher: { "@type": "Organization", name: "Buzztate" },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://buzztate.com/blog/${post.slug}`,
            },
          }),
        }}
      />

      {/* JSON-LD: FAQ (if post has FAQ section) */}
      {post.faqs && post.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: post.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: faq.answer,
                },
              })),
            }),
          }}
        />
      )}

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-yellow-400 transition-colors mb-6 inline-block">
          &larr; Back to Blog
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <time>{post.date}</time>
            {post.updated && post.updated !== post.date && (
              <span>· Updated {post.updated}</span>
            )}
          </div>
        </header>

        <div
          className="prose prose-invert prose-yellow max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-li:text-gray-300
            prose-a:text-yellow-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-table:border-gray-800
            prose-th:border-gray-700 prose-th:text-gray-300 prose-th:bg-gray-900/50 prose-th:px-4 prose-th:py-2
            prose-td:border-gray-800 prose-td:px-4 prose-td:py-2
            prose-blockquote:border-yellow-400/40 prose-blockquote:text-gray-400
            prose-code:text-yellow-400 prose-code:bg-gray-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Buzztate. All rights reserved.</p>
      </footer>
    </div>
  );
}

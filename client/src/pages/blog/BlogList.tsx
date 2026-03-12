import { Link } from "wouter";
import type { BlogPost } from "@/lib/blog";

// This will be replaced at build time by the prerender script.
// For client-side navigation, we import the static blog data.
import { BLOG_POSTS } from "./blogData";

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group block border border-gray-800 rounded-xl p-6 hover:border-yellow-400/40 transition-colors cursor-pointer">
        <time className="text-xs text-gray-500 font-mono">{post.date}</time>
        <h2 className="text-xl font-bold text-white mt-2 mb-3 group-hover:text-yellow-400 transition-colors leading-tight">
          {post.title}
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed">{post.excerpt}</p>
        <span className="inline-block mt-4 text-yellow-400 text-sm font-semibold">
          Read more &rarr;
        </span>
      </article>
    </Link>
  );
}

export default function BlogList() {
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
            <Link href="/blog" className="text-sm font-medium text-yellow-400">Blog</Link>
            <Link href="/auth?mode=login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Log In</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Blog</h1>
        <p className="text-gray-400 mb-12 text-lg">Guides, tips, and insights for e-commerce sellers expanding internationally.</p>

        <div className="grid gap-6">
          {BLOG_POSTS.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Buzztate. All rights reserved.</p>
      </footer>
    </div>
  );
}

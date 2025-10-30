"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ArrowUp,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImage: string;
  viewCount: number;
  createdAt: string;
  category?: { name: string };
  tags: { name: string }[];
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [params.slug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadPost = async () => {
    try {
      const res = await fetch(`/api/posts/${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      } else {
        alert("文章不存在");
        router.push("/blog");
      }
    } catch (error) {
      console.error("加载文章失败:", error);
      alert("加载文章失败");
      router.push("/blog");
    } finally {
      setLoading(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">文章不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="container mx-auto px-4 pt-8">
        <div className="max-w-4xl mx-auto">
          {/* Cover Image */}
          <div className="relative h-[400px] md:h-[480px] w-full overflow-hidden rounded-2xl mb-8">
            {post.coverImage && (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>

          {/* Article Info */}
          <div className="mb-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount} 次阅读</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {post.category && (
                <Badge className="bg-blue-500 hover:bg-blue-600 text-base px-3 py-1.5">
                  {post.category.name}
                </Badge>
              )}
              {post.tags?.map((tag) => (
                <span key={tag.name} className="text-primary text-sm">
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-8 pb-12 max-w-4xl">
        {/* Description Quote */}
        {post.description && (
          <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-r-lg mb-8">
            <p className="text-base leading-relaxed text-muted-foreground italic">
              {post.description}
            </p>
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg dark:prose-invert max-w-none mb-12 markdown-content">
          <ReactMarkdown
            className="text-gray-800 dark:text-gray-200"
            components={{
              // 自定义组件样式
              h1: ({ node, ...props }) => (
                <h1 className="text-4xl font-bold mt-8 mb-6" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-3xl font-bold mt-12 mb-6" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-2xl font-semibold mt-8 mb-4" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-xl font-semibold mt-6 mb-3" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="my-4 text-base leading-relaxed" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside my-4 space-y-2" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="ml-4" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-6 italic bg-blue-50 dark:bg-blue-900/20" {...props} />
              ),
              code: ({ node, inline, ...props }: any) =>
                inline ? (
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono" {...props} />
                ) : (
                  <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto font-mono text-sm" {...props} />
                ),
              pre: ({ node, ...props }) => (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4 overflow-x-auto" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-blue-500 hover:text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img className="max-w-full h-auto rounded-lg my-6 shadow-md" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-6">
                  <table className="min-w-full border-collapse" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left font-semibold" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props} />
              ),
              hr: ({ node, ...props }) => (
                <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700" {...props} />
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </article>

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex items-center gap-2 mb-8">
            <MessageCircle className="h-5 w-5" />
            <h2 className="text-2xl font-bold">评论 (0)</h2>
          </div>

          {/* Comment Form */}
          <div className="bg-muted/30 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="昵称（可选）"
                className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="email"
                placeholder="邮箱（可选，不会公开）"
                className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <textarea
              placeholder="写下你的评论..."
              rows={4}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none mb-4"
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                支持回复和表情，请文明评论
              </span>
              <Button className="bg-blue-500 hover:bg-blue-600">
                发表评论
              </Button>
            </div>
          </div>

          {/* Empty Comments State */}
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              还没有评论，来发表第一条评论吧！
            </p>
          </div>
        </div>
      </div>

      {/* Fixed Action Buttons - Right Side Center */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
        <button className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg hover:shadow-xl transition-all">
          <Heart className="h-5 w-5 mb-0.5" />
          <span className="text-xs">2</span>
        </button>
        <button className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg hover:shadow-xl transition-all">
          <MessageCircle className="h-5 w-5 mb-0.5" />
          <span className="text-xs">0</span>
        </button>
        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg hover:shadow-xl transition-all">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Scroll to Top Button - Bottom Right */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-6 bottom-6 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all z-50"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}


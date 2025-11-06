"use client";

import { useState, useEffect, useRef } from "react";
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

type TocItem = { id: string; text: string; level: number };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function BlogDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [mdTheme, setMdTheme] = useState<string>("mweb-default");
  const loadingRef = useRef(false);
  const currentSlugRef = useRef<string | null>(null);

  useEffect(() => {
    // 防止重复请求（React 严格模式下 useEffect 可能执行两次）
    // 如果 slug 没变且正在加载，跳过
    if (currentSlugRef.current === params.slug && loadingRef.current) {
      return;
    }

    // 更新当前 slug
    currentSlugRef.current = params.slug;
    loadingRef.current = true;

    loadPost().finally(() => {
      loadingRef.current = false;
    });
  }, [params.slug]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 读取保存的主题
  useEffect(() => {
    try {
      const saved = localStorage.getItem('markdown-theme');
      if (saved) setMdTheme(saved);
    } catch { }
  }, []);

  // 动态加载主题 CSS（限制作用域到 #markdown）
  useEffect(() => {
    const styleId = 'markdown-theme-stylesheet';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    // 移除旧的主题
    if (styleElement) {
      styleElement.remove();
    }

    // 加载新主题（如果不是默认主题）
    if (mdTheme && mdTheme !== 'mweb-default') {
      // 判断是浅色还是深色主题
      const darkThemes = ['ayu-mirage', 'charcoal', 'cobalt', 'dark-graphite', 'dieci',
        'dracula', 'gotham', 'lighthouse', 'nord', 'panic',
        'solarized-dark', 'toothpaste'];
      const themeName = mdTheme.replace('mweb-', '');
      const isDark = darkThemes.includes(themeName);
      const themePath = isDark
        ? `/static/dark/mweb-${themeName}.css`
        : `/static/light/mweb-${themeName}.css`;

      // 使用 fetch 获取 CSS 内容，然后处理并限制作用域
      fetch(themePath)
        .then(res => res.text())
        .then(cssText => {
          // 更完善的 CSS 作用域处理函数
          function scopeCSS(css: string): string {
            // 1. 先替换所有 .markdown-body 为 #markdown
            css = css.replace(/\.markdown-body/g, '#markdown');

            // 2. 移除全局样式规则（:root, body, html, * 等）
            const globalPatterns = [
              /:root\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g,
              /body\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g,
              /html\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g,
              /\*\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g,
            ];
            globalPatterns.forEach(pattern => {
              css = css.replace(pattern, '/* global rule removed */');
            });

            // 3. 处理嵌套的 @ 规则（递归处理）
            function processAtRules(text: string, depth = 0): string {
              const atRuleRegex = /(@[^{]+)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
              return text.replace(atRuleRegex, (match, atRule, content) => {
                // 保留 @charset, @import
                if (atRule.trim().match(/^@(charset|import)/)) {
                  return match;
                }
                // 递归处理内容
                const processedContent = processSelectors(content);
                return `${atRule}{${processedContent}}`;
              });
            }

            // 4. 处理选择器：给所有非全局选择器加上 #markdown 前缀
            function processSelectors(text: string): string {
              // 先处理 @ 规则
              text = processAtRules(text);

              // 匹配 CSS 规则：选择器 { 内容 }
              // 使用更精确的匹配，处理嵌套的大括号
              const ruleRegex = /([^{}@]+?)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;

              return text.replace(ruleRegex, (match, selector, content) => {
                const trimmed = selector.trim();

                // 跳过空选择器
                if (!trimmed) return match;

                // 跳过已经是 #markdown 开头的
                if (trimmed.startsWith('#markdown')) return match;

                // 跳过 @ 规则（应该已经被处理）
                if (trimmed.startsWith('@')) return match;

                // 移除全局选择器（body, html, :root, * 等）
                const globalRegex = /^(body|html|:root|\*)(\s|,|$)/;
                if (globalRegex.test(trimmed)) {
                  return '/* global selector removed */';
                }

                // 递归处理内容中的选择器
                const processedContent = processSelectors(content);

                // 在选择器前加上 #markdown
                return `#markdown ${trimmed} {${processedContent}}`;
              });
            }

            // 先处理 @ 规则，再处理普通选择器
            css = processAtRules(css);
            css = processSelectors(css);

            return css;
          }

          const scopedCss = scopeCSS(cssText);

          // 创建 style 标签并插入处理后的 CSS
          styleElement = document.createElement('style');
          styleElement.id = styleId;
          styleElement.textContent = scopedCss;
          document.head.appendChild(styleElement);
        })
        .catch(err => {
          console.error('加载主题失败:', err);
        });
    }

    return () => {
      // 清理
      const oldStyle = document.getElementById(styleId);
      if (oldStyle) oldStyle.remove();
    };
  }, [mdTheme]);

  const onChangeTheme = (value: string) => {
    setMdTheme(value);
    try { localStorage.setItem('markdown-theme', value); } catch { }
  };

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

  // 根据已渲染的 markdown 生成 TOC，并为标题添加 id
  useEffect(() => {
    if (!post) return;
    const container = document.getElementById("markdown");
    if (!container) return;

    const headings = Array.from(
      container.querySelectorAll<HTMLHeadingElement>("h1, h2, h3")
    );

    const items: TocItem[] = [];
    headings.forEach((h) => {
      const text = h.textContent?.trim() || "";
      if (!text) return;
      const id = slugify(text);
      h.id = id;
      const level = h.tagName === "H1" ? 1 : h.tagName === "H2" ? 2 : 3;
      items.push({ id, text, level });
    });
    setToc(items);
  }, [post]);

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
        <div className="max-w-6xl mx-auto">
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

      {/* Content with TOC */}
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-8 max-w-6xl mx-auto">
          {/* Article */}
          <div className="min-w-0">
            {/* Description Quote */}
            {post.description && (
              <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-r-lg mb-8">
                <p className="text-base leading-relaxed text-muted-foreground italic">
                  {post.description}
                </p>
              </div>
            )}

            {/* Article Content */}
            <div id="markdown" className="mb-12">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
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

          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 border rounded-xl p-4 bg-muted/30">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="font-semibold">目录</div>
                <select
                  className="text-xs px-2 py-1 rounded border bg-background"
                  value={mdTheme}
                  onChange={(e) => onChangeTheme(e.target.value)}
                >
                  <optgroup label="浅色主题">
                    <option value="mweb-default">默认</option>
                    <option value="mweb-bear-default">Bear</option>
                    <option value="mweb-typo">Typo</option>
                    <option value="mweb-vue">Vue</option>
                    <option value="mweb-indigo">Indigo</option>
                    <option value="mweb-lark">Lark</option>
                    <option value="mweb-ayu">Ayu</option>
                    <option value="mweb-solarized-light">Solarized Light</option>
                    <option value="mweb-contrast">Contrast</option>
                    <option value="mweb-smartblue">Smart Blue</option>
                    <option value="mweb-gandalf">Gandalf</option>
                  </optgroup>
                  <optgroup label="深色主题">
                    <option value="mweb-nord">Nord</option>
                    <option value="mweb-dracula">Dracula</option>
                    <option value="mweb-ayu-mirage">Ayu Mirage</option>
                    <option value="mweb-solarized-dark">Solarized Dark</option>
                    <option value="mweb-charcoal">Charcoal</option>
                    <option value="mweb-cobalt">Cobalt</option>
                    <option value="mweb-gotham">Gotham</option>
                    <option value="mweb-lighthouse">Lighthouse</option>
                  </optgroup>
                </select>
              </div>
              <nav className="space-y-1 text-sm">
                {toc.length === 0 && (
                  <div className="text-muted-foreground">无标题</div>
                )}
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={`block py-1 hover:text-primary ${item.level === 1
                      ? "pl-1"
                      : item.level === 2
                        ? "pl-4"
                        : "pl-7"
                      }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
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


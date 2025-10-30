"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// 所有文章数据
const allArticles = [
  {
    id: "allinssl-auto-cert",
    type: "post",
    title: "使用 AllinSSL 自动续订证书",
    description: "AllinSSL 是一款自动续订 SSL 证书的工具，旨在简化证书管理流程...",
    url: "/blog/allinssl-auto-cert",
  },
  {
    id: "nest-github-2fa",
    type: "post",
    title: "Nest 实现类github 2FA 认证",
    description: "本文介绍了如何使用 Nest.js 框架实现类似 GitHub 的双因素认证（2FA）功能...",
    url: "/blog/nest-github-2fa",
  },
  {
    id: "personal-website",
    type: "post",
    title: "使用宝塔面板部署个人网站",
    description: "本文介绍了如何使用宝塔面板来部署个人网站...",
    url: "/blog/personal-website",
  },
  {
    id: "udp-tcp-protocol",
    type: "post",
    title: "UDP和TCP详解",
    description: "本文详细解析了网络传输中的两种核心协议...",
    url: "/blog/udp-tcp-protocol",
  },
];

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  // 实时搜索
  useEffect(() => {
    if (query.trim()) {
      const filtered = allArticles.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="container mx-auto px-4 pt-20 max-w-3xl">
        <div
          className="bg-background rounded-2xl shadow-2xl border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-6 border-b">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索文章/随记/图库..."
                className="w-full pl-12 pr-12 py-4 text-lg bg-transparent border-0 focus:outline-none focus:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {/* ESC hint */}
            <div className="flex items-center justify-end text-sm text-muted-foreground mt-2">
              <span>ESC 关闭</span>
            </div>
          </div>

          {/* Search Results */}
          <div className="max-h-[60vh] overflow-y-auto p-6">
            {query ? (
              <div>
                {/* Results Header */}
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">
                    文章 ({results.length})
                  </h2>
                </div>

                {/* Results List */}
                {results.length > 0 ? (
                  <div className="space-y-2">
                    {results.map((item) => (
                      <Link
                        key={item.id}
                        href={item.url}
                        onClick={onClose}
                      >
                        <Card className="hover:shadow-md transition-all hover:border-primary/50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Search className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">未找到相关内容</h3>
                    <p className="text-muted-foreground">
                      尝试使用不同的关键词搜索
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">输入关键词开始搜索</h3>
                <p className="text-muted-foreground text-sm">
                  搜索博客文章、随记和图库内容
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


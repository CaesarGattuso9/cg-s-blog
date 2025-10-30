"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

// 文章数据接口
interface Article {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  category?: { name: string };
  tags: { name: string }[];
  createdAt: string;
  viewCount: number;
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从API获取文章数据
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.posts || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("加载文章失败:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 flex items-center justify-center">
        <div className="text-lg text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Page Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          文章
        </h1>
        <p className="text-lg text-muted-foreground">
          记录生活，分享思考，探索世界
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="flex justify-center gap-2">
          <Badge
            variant="default"
            className="cursor-pointer px-6 py-2 text-base"
          >
            全部 {articles.length}
          </Badge>
          <Badge
            variant="outline"
            className="cursor-pointer hover:bg-secondary px-6 py-2 text-base"
          >
            技术 {articles.filter(a => a.category?.name === "技术").length}
          </Badge>
        </div>
        <div className="text-center mt-4 text-sm text-muted-foreground">
          {articles.length} 篇文章
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="group">
              <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden">
                {/* Cover Image */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    {article.category && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        {article.category.name}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {article.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md"
                      >
                        /{tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>📅 {new Date(article.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{article.viewCount}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* End Message */}
      <div className="text-center mt-12 text-muted-foreground">
        没有更多了
      </div>
    </div>
  );
}

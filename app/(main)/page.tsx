import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen, Camera, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              <span>欢迎来到我的个人空间</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              记录生活 · 分享技术
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              探索技术的魅力，记录生活的点滴，
              用镜头捕捉美好瞬间
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/blog">
                  阅读博客
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/moments">浏览随记</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 装饰性背景 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">内容分类</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/blog" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>技术博客</CardTitle>
                  <CardDescription>
                    分享编程技术、开发经验和学习笔记
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/moments" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>生活随记</CardTitle>
                  <CardDescription>
                    记录日常生活、想法和感悟的碎片
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/gallery" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <CardTitle>摄影图库</CardTitle>
                  <CardDescription>
                    用镜头记录世界的美好瞬间
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/guestbook" className="group">
              <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle>留言板</CardTitle>
                  <CardDescription>
                    欢迎留下你的足迹和想说的话
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">最新文章</h2>
            <Button variant="ghost" asChild>
              <Link href="/blog">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 示例文章卡片 */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30" />
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">Next.js</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                  </div>
                  <CardTitle className="line-clamp-2">
                    示例博客文章标题 {i}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    这是一篇示例文章的描述，展示博客文章的基本布局和样式...
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>2024-01-01</span>
                    <span>5 分钟阅读</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Moments */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">最新随记</h2>
            <Button variant="ghost" asChild>
              <Link href="/moments">
                查看全部
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground mb-4">
                    这是一条示例随记内容，记录生活中的小事和想法。
                    可以包含文字、图片等多种形式的内容... 🌟
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>2024-01-0{i}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


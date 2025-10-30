"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Calendar, Image as ImageIcon, Heart } from "lucide-react";

interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  category: string;
  tags: string[];
  published: boolean;
  likeCount: number;
  createdAt: string;
  images: any[];
}

export default function AdminGalleryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<Album[]>([]);

  useEffect(() => {
    checkAuth();
    loadAlbums();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/admin/login");
      }
    } catch (error) {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const loadAlbums = async () => {
    try {
      const res = await fetch("/api/admin/albums");
      if (res.ok) {
        const data = await res.json();
        setAlbums(data.albums || []);
      }
    } catch (error) {
      console.error("Load albums error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个相册吗？相册中的所有图片也会被删除。")) return;

    try {
      const res = await fetch(`/api/admin/albums/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadAlbums();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      alert("删除失败");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">图库管理</h1>
              <p className="text-sm text-muted-foreground">管理你的相册和图片</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/dashboard">返回首页</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <Button asChild className="bg-blue-500 hover:bg-blue-600">
            <Link href="/admin/gallery/new">
              <Plus className="h-4 w-4 mr-2" />
              新建相册
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">相册总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{albums.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">已发布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {albums.filter((a) => a.published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">图片总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {albums.reduce((sum, a) => sum + a.images.length, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">总点赞</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {albums.reduce((sum, a) => sum + a.likeCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Albums Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              还没有相册，点击上方按钮创建第一个相册
            </div>
          ) : (
            albums.map((album) => (
              <Card key={album.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Cover Image */}
                {album.coverImage && (
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardContent className="p-4">
                  {/* Title & Status */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{album.title}</h3>
                    {album.published ? (
                      <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        已发布
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                        草稿
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {album.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {album.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(album.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-3 w-3" />
                      {album.images.length} 张
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {album.likeCount}
                    </span>
                  </div>

                  {/* Category & Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {album.category && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                        {album.category}
                      </span>
                    )}
                    {album.tags.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="text-xs text-primary">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href={`/admin/gallery/${album.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        编辑
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(album.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


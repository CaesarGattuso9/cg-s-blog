"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Calendar, Image as ImageIcon } from "lucide-react";

interface Moment {
  id: string;
  content: string;
  images: string[];
  published: boolean;
  createdAt: string;
}

export default function AdminMomentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [moments, setMoments] = useState<Moment[]>([]);

  useEffect(() => {
    checkAuth();
    loadMoments();
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

  const loadMoments = async () => {
    try {
      const res = await fetch("/api/admin/moments");
      if (res.ok) {
        const data = await res.json();
        setMoments(data.moments || []);
      }
    } catch (error) {
      console.error("Load moments error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条随记吗？")) return;

    try {
      const res = await fetch(`/api/admin/moments/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadMoments();
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
              <h1 className="text-2xl font-bold">随记管理</h1>
              <p className="text-sm text-muted-foreground">管理你的生活随记</p>
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
            <Link href="/admin/moments/new">
              <Plus className="h-4 w-4 mr-2" />
              新建随记
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">随记总数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moments.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">已发布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {moments.filter((m) => m.published).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">带图片</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {moments.filter((m) => m.images.length > 0).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Moments List */}
        <Card>
          <CardHeader>
            <CardTitle>随记列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {moments.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  还没有随记，点击上方按钮创建第一条随记
                </div>
              ) : (
                moments.map((moment) => (
                  <div
                    key={moment.id}
                    className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {moment.published ? (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                            已发布
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                            草稿
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(moment.createdAt).toLocaleDateString()}
                        </span>
                        {moment.images.length > 0 && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ImageIcon className="h-3 w-3" />
                            {moment.images.length} 张图片
                          </span>
                        )}
                      </div>
                      <p className="text-sm line-clamp-3 whitespace-pre-wrap">
                        {moment.content}
                      </p>
                      {moment.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {moment.images.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt=""
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                          {moment.images.length > 3 && (
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs">
                              +{moment.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/moments/${moment.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(moment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


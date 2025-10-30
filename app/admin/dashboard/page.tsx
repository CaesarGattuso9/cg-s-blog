"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Eye,
  Calendar,
  Edit,
  Trash2,
  Heart,
  Mail,
  Check,
  X as XIcon,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  viewCount: number;
  createdAt: string;
  category?: { name: string };
  tags: { name: string }[];
}

interface Moment {
  id: string;
  content: string;
  images: string[];
  published: boolean;
  createdAt: string;
}

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

interface GuestbookMessage {
  id: string;
  name: string;
  content: string;
  category: string;
  theme: string;
  fontType: string;
  approved: boolean;
  createdAt: string;
}

type TabType = "posts" | "moments" | "gallery" | "guestbook";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  // 文章数据
  const [posts, setPosts] = useState<Post[]>([]);

  // 随记数据
  const [moments, setMoments] = useState<Moment[]>([]);

  // 图库数据
  const [albums, setAlbums] = useState<Album[]>([]);

  // 留言数据
  const [messages, setMessages] = useState<GuestbookMessage[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === "posts") {
      loadPosts();
    } else if (activeTab === "moments") {
      loadMoments();
    } else if (activeTab === "gallery") {
      loadAlbums();
    } else if (activeTab === "guestbook") {
      loadMessages();
    }
  }, [activeTab]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/admin/login");
        return;
      }
      loadPosts(); // 默认加载文章
    } catch (error) {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const res = await fetch("/api/admin/posts");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Load posts error:", error);
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

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/admin/guestbook");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Load messages error:", error);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("确定要删除这篇文章吗？")) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) loadPosts();
      else alert("删除失败");
    } catch (error) {
      alert("删除失败");
    }
  };

  const handleDeleteMoment = async (id: string) => {
    if (!confirm("确定要删除这条随记吗？")) return;
    try {
      const res = await fetch(`/api/admin/moments/${id}`, { method: "DELETE" });
      if (res.ok) loadMoments();
      else alert("删除失败");
    } catch (error) {
      alert("删除失败");
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm("确定要删除这个相册吗？相册中的所有图片也会被删除。")) return;
    try {
      const res = await fetch(`/api/admin/albums/${id}`, { method: "DELETE" });
      if (res.ok) loadAlbums();
      else alert("删除失败");
    } catch (error) {
      alert("删除失败");
    }
  };

  const handleApproveMessage = async (id: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/admin/guestbook/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved }),
      });
      if (res.ok) {
        loadMessages();
        alert(approved ? "已通过审核" : "已取消审核");
      } else {
        alert("操作失败");
      }
    } catch (error) {
      alert("操作失败");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("确定要删除这条留言吗？")) return;
    try {
      const res = await fetch(`/api/admin/guestbook/${id}`, { method: "DELETE" });
      if (res.ok) loadMessages();
      else alert("删除失败");
    } catch (error) {
      alert("删除失败");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
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
            {/* Tabs */}
            <div className="flex gap-1 border-b flex-1">
              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors relative ${activeTab === "posts"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <FileText className="h-4 w-4" />
                文章管理
                {activeTab === "posts" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("moments")}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors relative ${activeTab === "moments"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <MessageSquare className="h-4 w-4" />
                随记管理
                {activeTab === "moments" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("gallery")}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors relative ${activeTab === "gallery"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <ImageIcon className="h-4 w-4" />
                图库管理
                {activeTab === "gallery" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("guestbook")}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors relative ${activeTab === "guestbook"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Mail className="h-4 w-4" />
                留言管理
                {activeTab === "guestbook" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            </div>
            <Button onClick={handleLogout} variant="outline">
              退出登录
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* 文章管理 */}
        {activeTab === "posts" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">文章总数</div>
                  <div className="text-2xl font-bold">{posts.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">已发布</div>
                  <div className="text-2xl font-bold">
                    {posts.filter((p) => p.published).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">总浏览量</div>
                  <div className="text-2xl font-bold">
                    {posts.reduce((sum, p) => sum + p.viewCount, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">草稿</div>
                  <div className="text-2xl font-bold">
                    {posts.filter((p) => !p.published).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action */}
            <div className="mb-6">
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link href="/admin/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  新建文章
                </Link>
              </Button>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      还没有文章，点击上方按钮创建第一篇文章
                    </div>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{post.title}</h3>
                            {post.published ? (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                已发布
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded">
                                草稿
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.viewCount} 次浏览
                            </span>
                            {post.category && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {post.category.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/posts/${post.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* 随记管理 */}
        {activeTab === "moments" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">随记总数</div>
                  <div className="text-2xl font-bold">{moments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">已发布</div>
                  <div className="text-2xl font-bold">
                    {moments.filter((m) => m.published).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">带图片</div>
                  <div className="text-2xl font-bold">
                    {moments.filter((m) => m.images.length > 0).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action */}
            <div className="mb-6">
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link href="/admin/moments/new">
                  <Plus className="h-4 w-4 mr-2" />
                  新建随记
                </Link>
              </Button>
            </div>

            {/* Moments List */}
            <div className="space-y-4">
              {moments.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      还没有随记，点击上方按钮创建第一条随记
                    </div>
                  </CardContent>
                </Card>
              ) : (
                moments.map((moment) => (
                  <Card key={moment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
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
                            {moment.images.length > 0 && moment.images[0] && (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />
                                有图片
                              </span>
                            )}
                          </div>
                          <p className="text-sm line-clamp-3 whitespace-pre-wrap mb-3">
                            {moment.content}
                          </p>
                          {moment.images.length > 0 && moment.images[0] && (
                            <div>
                              <img
                                src={moment.images[0]}
                                alt="表情包"
                                className="max-w-[80px] max-h-[80px] object-contain rounded"
                              />
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
                            onClick={() => handleDeleteMoment(moment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* 图库管理 */}
        {activeTab === "gallery" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">相册总数</div>
                  <div className="text-2xl font-bold">{albums.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">已发布</div>
                  <div className="text-2xl font-bold">
                    {albums.filter((a) => a.published).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">图片总数</div>
                  <div className="text-2xl font-bold">
                    {albums.reduce((sum, a) => sum + a.images.length, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">总点赞</div>
                  <div className="text-2xl font-bold">
                    {albums.reduce((sum, a) => sum + a.likeCount, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action */}
            <div className="mb-6">
              <Button asChild className="bg-blue-500 hover:bg-blue-600">
                <Link href="/admin/gallery/new">
                  <Plus className="h-4 w-4 mr-2" />
                  新建相册
                </Link>
              </Button>
            </div>

            {/* Albums Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.length === 0 ? (
                <Card className="col-span-full">
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      还没有相册，点击上方按钮创建第一个相册
                    </div>
                  </CardContent>
                </Card>
              ) : (
                albums.map((album) => (
                  <Card
                    key={album.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
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
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">
                          {album.title}
                        </h3>
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
                      {album.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {album.description}
                        </p>
                      )}
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
                      <div className="flex items-center gap-2 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          asChild
                        >
                          <Link href={`/admin/gallery/${album.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            编辑
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAlbum(album.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* 留言管理 */}
        {activeTab === "guestbook" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">留言总数</div>
                  <div className="text-2xl font-bold">{messages.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">待审核</div>
                  <div className="text-2xl font-bold text-orange-500">
                    {messages.filter((m) => !m.approved).length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">已通过</div>
                  <div className="text-2xl font-bold text-green-600">
                    {messages.filter((m) => m.approved).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Messages List */}
            <div className="space-y-4">
              {messages.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      还没有留言
                    </div>
                  </CardContent>
                </Card>
              ) : (
                messages.map((message) => (
                  <Card
                    key={message.id}
                    className={`hover:shadow-md transition-shadow ${!message.approved ? "border-l-4 border-l-orange-500" : ""
                      }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* 状态和基本信息 */}
                          <div className="flex items-center gap-2 mb-2">
                            {message.approved ? (
                              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                已审核
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded flex items-center gap-1">
                                <XIcon className="h-3 w-3" />
                                待审核
                              </span>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {message.name}
                            </span>
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                              {message.category}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(message.createdAt).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>

                          {/* 留言内容 */}
                          <div className="mb-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm whitespace-pre-wrap line-clamp-3">
                              {message.content}
                            </p>
                          </div>

                          {/* 额外信息 */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>主题: {message.theme}</span>
                            <span>字体: {message.fontType}</span>
                          </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex items-center gap-2 ml-4">
                          {!message.approved ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveMessage(message.id, true)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              通过
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveMessage(message.id, false)}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                              <XIcon className="h-4 w-4 mr-1" />
                              取消
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMessage(message.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

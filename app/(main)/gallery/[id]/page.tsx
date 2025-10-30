"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, ArrowUp, Calendar, Image as ImageIcon, MapPin, Camera, Clock } from "lucide-react";

export default function GalleryDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // 从API获取相册详情
    fetch(`/api/albums/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.album) {
          setAlbum(data.album);
        } else {
          alert("相册不存在");
          router.push("/gallery");
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("加载相册失败:", error);
        alert("加载相册失败");
        router.push("/gallery");
      });
  }, [params.id, router]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">相册不存在</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
              {album.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(album.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <span>{album.images.length} 张照片</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{album.likeCount} 喜欢</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {album.category && (
                <Badge className="bg-pink-500 hover:bg-pink-600 text-base px-3 py-1.5">
                  {album.category}
                </Badge>
              )}
              {album.tags.map((tag: string, idx: number) => (
                <span key={idx} className="text-primary text-sm">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Description */}
            {album.description && (
              <div className="bg-muted/30 rounded-xl p-6 text-center">
                <p className="text-base leading-relaxed text-muted-foreground">
                  {album.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {album.images.map((image: any, index: number) => (
              <div
                key={image.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted hover:shadow-2xl transition-all"
              >
                {/* 根据文件类型显示视频或图片 */}
                {image.fileType === 'video' ? (
                  <video
                    src={image.imageUrl}
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <Image
                    src={image.imageUrl}
                    alt={image.title || `Photo ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                )}

                {/* Overlay with caption and EXIF info - 仅图片显示 */}
                {image.fileType !== 'video' && (image.title || image.description || image.takenAt || image.latitude || image.cameraMake) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6 text-white">
                    {/* EXIF Info - Top */}
                    {(image.takenAt || image.latitude || image.cameraMake) && (
                      <div className="space-y-1.5">
                        {image.takenAt && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(image.takenAt).toLocaleString('zh-CN', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </div>
                        )}
                        {image.latitude && image.longitude && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {image.location || `${image.latitude.toFixed(4)}, ${image.longitude.toFixed(4)}`}
                            </span>
                          </div>
                        )}
                        {image.cameraMake && (
                          <div className="flex items-center gap-2 text-sm">
                            <Camera className="h-4 w-4" />
                            <span>{image.cameraMake} {image.cameraModel || ''}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Title and Description - Bottom */}
                    {(image.title || image.description) && (
                      <div>
                        {image.title && (
                          <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                        )}
                        {image.description && (
                          <p className="text-sm text-gray-200">{image.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Comments Section */}
          <div className="mt-12 pt-8 border-t max-w-4xl mx-auto">
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
                <Button className="bg-pink-500 hover:bg-pink-600">
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
      </div>

      {/* Fixed Action Buttons - Right Side Center */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-50">
        <button className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg hover:shadow-xl transition-all">
          <Heart className="h-5 w-5 mb-0.5" />
          <span className="text-xs">{album.likeCount}</span>
        </button>
        <button className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg hover:shadow-xl transition-all">
          <MessageCircle className="h-5 w-5 mb-0.5" />
          <span className="text-xs">0</span>
        </button>
        <button className="flex items-center justify-center w-12 h-12 rounded-full bg-background border shadow-lg hover:shadow-xl transition-all">
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Scroll to Top Button */}
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

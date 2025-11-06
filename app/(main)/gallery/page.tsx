"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Image as ImageIcon, Heart } from "lucide-react";

export default function GalleryPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    // 从API获取相册数据
    fetch("/api/albums")
      .then((res) => res.json())
      .then((data) => {
        const albumsData = data.albums || [];
        setAlbums(albumsData);

        // 初始化图片索引
        const indices: Record<string, number> = {};
        albumsData.forEach((album: any) => {
          indices[album.id] = 0;
        });
        setCurrentImageIndex(indices);
        setLoading(false);
      })
      .catch((error) => {
        console.error("加载相册失败:", error);
        setLoading(false);
      });
  }, []);

  // 自动轮播图片
  useEffect(() => {
    if (!hoveredAlbum) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        const album = albums.find((a) => a.id === hoveredAlbum);
        if (!album || album.images.length === 0) return prev;

        const nextIndex = (prev[hoveredAlbum] + 1) % album.images.length;
        return {
          ...prev,
          [hoveredAlbum]: nextIndex,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [hoveredAlbum, albums]);

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
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
          图库
        </h1>
        <p className="text-lg text-muted-foreground">
          用镜头记录美好瞬间
        </p>
      </div>

      {/* Albums Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => {
            const isHovered = hoveredAlbum === album.id;
            const currentImage = album.images[currentImageIndex[album.id] || 0];
            const fallbackCover = album.coverImage || (album.images && album.images[0]?.imageUrl);
            const displayImage = isHovered && currentImage ? currentImage.imageUrl : fallbackCover;

            return (
              <Link
                key={album.id}
                href={`/gallery/${album.id}`}
                onMouseEnter={() => setHoveredAlbum(album.id)}
                onMouseLeave={() => setHoveredAlbum(null)}
              >
                <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300">
                  {/* Cover Image */}
                  <div className="relative h-64 bg-muted overflow-hidden">
                    {displayImage && (
                      <Image
                        src={displayImage}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}

                    {/* Image dots indicator */}
                    {isHovered && album.images.length > 0 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {album.images.map((_: any, idx: number) => (
                          <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex[album.id]
                              ? "bg-white w-6"
                              : "bg-white/50"
                              }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Title & Tags - 移动效果 */}
                    <div
                      className={`transition-transform duration-300 ${isHovered ? "-translate-y-2" : ""
                        }`}
                    >
                      <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {album.title}
                      </h3>

                      {album.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {album.description}
                        </p>
                      )}

                      {/* Category & Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {album.category && (
                          <Badge className="bg-pink-500 hover:bg-pink-600 text-xs">
                            {album.category}
                          </Badge>
                        )}
                        {album.tags.slice(0, 2).map((tag: string, idx: number) => (
                          <span key={idx} className="text-xs text-primary">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(album.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {album.images.length}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {album.likeCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* End Message */}
      <div className="text-center mt-12 text-muted-foreground">
        没有更多了
      </div>
    </div>
  );
}

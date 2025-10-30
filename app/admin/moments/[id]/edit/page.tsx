"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Image as ImageIcon, X, Upload, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditMomentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    loadMoment();
  }, []);

  const loadMoment = async () => {
    try {
      const res = await fetch(`/api/admin/moments/${params.id}`);
      if (!res.ok) {
        alert("随记不存在");
        router.push("/admin/moments");
        return;
      }

      const data = await res.json();
      const moment = data.moment;

      setContent(moment.content);
      setImages(moment.images || []);
      setPublished(moment.published);
    } catch (error) {
      alert("加载失败");
      router.push("/admin/moments");
    } finally {
      setLoading(false);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '上传失败');
        return;
      }

      // 只保留一张图片
      setImages([data.url]);
    } catch (error) {
      alert('上传失败，请稍后再试');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImage = () => {
    if (imageInput.trim()) {
      // 只保留一张图片
      setImages([imageInput.trim()]);
      setImageInput("");
    }
  };

  const handleRemoveImage = () => {
    setImages([]);
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!content.trim()) {
      alert("内容不能为空");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/admin/moments/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          images,
          published: !isDraft,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "更新失败");
        return;
      }

      alert("更新成功");
      router.push("/admin/moments");
    } catch (error) {
      alert("更新失败，请稍后再试");
    } finally {
      setSaving(false);
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
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/moments">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">编辑随记</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={saving}
              >
                保存草稿
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={saving}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {published ? "更新" : "发布"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="space-y-6">
            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                随记内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="写下你的随记..."
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium mb-2">
                图片/GIF（可选，仅一张）
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                支持图片和GIF格式，建议尺寸 200x200
              </p>
              {images.length === 0 ? (
                <div className="space-y-3">
                  {/* 上传按钮 */}
                  <div>
                    <label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      <div className="flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors">
                        {uploading ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            上传中...
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 mr-2" />
                            上传图片/GIF
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* 手动添加URL */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImage();
                        }
                      }}
                      className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="或手动输入图片/GIF URL"
                    />
                    <Button onClick={handleAddImage} type="button">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      添加
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={images[0]}
                    alt="表情包预览"
                    className="max-w-[200px] max-h-[200px] object-contain rounded-lg border"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


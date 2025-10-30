"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { uploadFileInChunks } from "@/lib/upload-chunked";
import { processBatchFiles } from "@/lib/image-utils";
import ImageListItem from "@/components/admin/image-list-item";

interface ImageItem {
  url?: string;
  imageUrl?: string;
  title: string;
  description: string;
  file?: File;
  isLocal?: boolean;
  fileType?: 'image' | 'video';
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  cameraMake?: string;
  cameraModel?: string;
}

export default function EditAlbumPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [ossFolder, setOssFolder] = useState("");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [published, setPublished] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    loadAlbum();
  }, []);

  const loadAlbum = async () => {
    try {
      const res = await fetch(`/api/admin/albums/${params.id}`);
      if (res.ok) {
        const album = await res.json();
        setTitle(album.title || "");
        setDescription(album.description || "");
        setCoverImage(album.coverImage || "");
        setCategory(album.category || "");
        setTags(album.tags?.join(", ") || "");
        setOssFolder(album.ossFolder || "");
        setPublished(album.published || false);
        setImages(
          album.images?.map((img: any) => ({
            url: img.imageUrl,
            imageUrl: img.imageUrl,
            title: img.title || "",
            description: img.description || "",
            fileType: img.fileType || 'image',
            takenAt: img.takenAt,
            latitude: img.latitude,
            longitude: img.longitude,
            location: img.location,
            cameraMake: img.cameraMake,
            cameraModel: img.cameraModel,
          })) || []
        );
      } else {
        alert("加载相册失败");
        router.push("/admin/gallery");
      }
    } catch (error) {
      console.error("加载相册失败:", error);
      alert("加载相册失败");
      router.push("/admin/gallery");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (files.length > 0) {
      await handleBatchUpload(files);
    }
  };

  const handleBatchUpload = async (fileList: File[]) => {
    try {
      const processedFiles = await processBatchFiles(fileList);

      const newImages: ImageItem[] = processedFiles.map((item) => ({
        url: item.previewUrl,
        title: "",
        description: "",
        file: item.file,
        isLocal: true,
        fileType: item.fileType,
        ...item.exifData,
      }));

      setImages((prev) => [...prev, ...newImages]);
    } catch (error) {
      console.error('处理文件失败:', error);
      alert('文件处理失败，请重试');
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadFileInChunks({
      file,
      folder: ossFolder.trim() || 'gallery',
      type: 'image',
    });

    if (result.success && result.url) {
      setCoverImage(result.url);
    } else {
      alert('封面上传失败');
    }
  };

  const handleUpdateImage = (index: number, field: 'title' | 'description', value: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title) {
      alert("标题不能为空");
      return;
    }

    setSaving(true);

    try {
      const uploadedImages: ImageItem[] = [];

      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        if (img.isLocal && img.file) {
          const result = await uploadFileInChunks({
            file: img.file,
            folder: ossFolder.trim() || 'gallery',
            type: img.fileType || 'image',
            chunkSize: 5 * 1024 * 1024,
            concurrent: 3,
            onProgress: (progress) => {
              setUploadProgress((prev) => ({ ...prev, [i]: progress }));
            },
          });

          if (result.success && result.url) {
            uploadedImages.push({
              url: result.url,
              title: img.title,
              description: img.description,
              fileType: img.fileType,
              takenAt: img.takenAt,
              latitude: img.latitude,
              longitude: img.longitude,
              location: img.location,
              cameraMake: img.cameraMake,
              cameraModel: img.cameraModel,
            });

            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[i];
              return newProgress;
            });
          } else {
            alert(`文件上传失败: ${result.error || '未知错误'}`);
            setSaving(false);
            return;
          }
        } else {
          uploadedImages.push({
            url: img.url || img.imageUrl || '',
            title: img.title,
            description: img.description,
            fileType: img.fileType,
            takenAt: img.takenAt,
            latitude: img.latitude,
            longitude: img.longitude,
            location: img.location,
            cameraMake: img.cameraMake,
            cameraModel: img.cameraModel,
          });
        }
      }

      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const res = await fetch(`/api/admin/albums/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          coverImage,
          category,
          tags: tagArray,
          images: uploadedImages,
          published,
          ossFolder: ossFolder.trim() || undefined,
        }),
      });

      if (res.ok) {
        alert("相册更新成功！");
        router.push("/admin/gallery");
      } else {
        const data = await res.json();
        alert(`更新失败: ${data.error}`);
      }
    } catch (error: any) {
      alert(`更新失败: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin/gallery">
              <Button variant="outline" size="sm">
                <ArrowLeft size={16} className="mr-2" />
                返回
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">编辑相册</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">基本信息</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">标题 *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">封面图片</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="输入图片 URL 或上传"
                    className="flex-1 px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        <Upload size={16} className="mr-2" />
                        上传
                      </span>
                    </Button>
                  </label>
                </div>
                {coverImage && (
                  <img
                    src={coverImage}
                    alt="封面预览"
                    className="mt-2 w-32 h-32 object-cover rounded"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">分类</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="例如：旅行、生活"
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">OSS 文件夹</label>
                  <input
                    type="text"
                    value={ossFolder}
                    onChange={(e) => setOssFolder(e.target.value)}
                    placeholder="例如：travel-2024"
                    className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">标签</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="用逗号分隔"
                  className="w-full px-3 py-2 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="published" className="text-sm font-medium">
                  发布相册
                </label>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">相册图片</h2>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
                }`}
            >
              <Upload className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-sm text-muted-foreground mb-2">
                拖拽图片/视频到此处，或点击上传
              </p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleBatchUpload(files);
                    }
                  }}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>选择文件</span>
                </Button>
              </label>
            </div>

            {images.length > 0 && (
              <div className="mt-6 space-y-4">
                {images.map((img, index) => (
                  <ImageListItem
                    key={index}
                    url={img.url || img.imageUrl || ''}
                    title={img.title}
                    description={img.description}
                    fileType={img.fileType}
                    isLocal={img.isLocal}
                    index={index}
                    uploadProgress={uploadProgress[index]}
                    exifData={{
                      takenAt: img.takenAt,
                      latitude: img.latitude,
                      longitude: img.longitude,
                      location: img.location,
                      cameraMake: img.cameraMake,
                      cameraModel: img.cameraModel,
                    }}
                    onUpdateTitle={(value) => handleUpdateImage(index, 'title', value)}
                    onUpdateDescription={(value) => handleUpdateImage(index, 'description', value)}
                    onRemove={() => handleRemoveImage(index)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/admin/gallery">
              <Button type="button" variant="outline">
                取消
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  保存更改
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";

// 动态导入 SimpleMDE 编辑器（仅客户端）
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const editorRef = useRef<any>(null);

  // 自动生成 slug
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setSlug(generatedSlug);
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

      setCoverImage(data.url);
    } catch (error) {
      alert('上传失败，请稍后再试');
    } finally {
      setUploading(false);
    }
  };

  // 上传图片到 OSS
  const uploadImageToOSS = useCallback(async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        return data.url;
      } else {
        alert(data.error || "图片上传失败");
        return null;
      }
    } catch (error) {
      console.error("图片上传错误:", error);
      alert("图片上传失败");
      return null;
    }
  }, []);

  // 检查是否是 OSS 图片地址
  const isOSSUrl = (url: string): boolean => {
    // 根据你的 OSS 配置调整这个判断逻辑
    // 例如：判断是否包含你的 OSS 域名
    return url.includes('.aliyuncs.com') || url.includes('oss-');
  };

  // 获取编辑器实例
  const getMdeInstance = useCallback((instance: any) => {
    if (instance) {
      editorRef.current = instance;
      const cm = instance.codemirror;

      // 默认开启分屏预览模式
      if (instance.toggleSideBySide) {
        setTimeout(() => {
          instance.toggleSideBySide();
        }, 100);
      }

      if (cm) {
        // 监听 CodeMirror 的 DOM 元素的粘贴事件
        const wrapper = cm.getWrapperElement();

        const pasteHandler = async (e: ClipboardEvent) => {
          const items = e.clipboardData?.items;
          if (!items) {
            return;
          }

          // 检查粘贴内容中是否有图片
          for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (item.type.indexOf('image') !== -1) {
              e.preventDefault();
              e.stopPropagation();

              const file = item.getAsFile();
              if (!file) {
                continue;
              }

              // 显示上传中提示
              const uploadingText = `![上传中...](uploading-${Date.now()})`;
              cm.replaceSelection(uploadingText);

              // 上传图片
              const url = await uploadImageToOSS(file);

              if (url) {
                // 生成文件名
                const timestamp = new Date().getTime();
                const alt = `image-${timestamp}`;

                // 替换上传中的文本为真实图片链接
                const currentContent = cm.getValue();
                const newContent = currentContent.replace(uploadingText, `![${alt}](${url})`);
                cm.setValue(newContent);
                setContent(newContent);
              } else {
                // 上传失败，删除上传中的文本
                const currentContent = cm.getValue();
                const newContent = currentContent.replace(uploadingText, '');
                cm.setValue(newContent);
                setContent(newContent);
              }

              break;
            }
          }
        };

        wrapper.addEventListener('paste', pasteHandler as any);

        // 清理函数
        return () => {
          wrapper.removeEventListener('paste', pasteHandler as any);
        };
      }
    }
  }, [uploadImageToOSS]);

  // 配置 SimpleMDE 编辑器选项
  const editorOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "使用 Markdown 语法编写文章内容...\n\n💡 提示：可以直接粘贴图片（Ctrl/Cmd + V），会自动上传到 OSS",
      status: ["lines", "words", "cursor"],
      autofocus: false,
      sideBySideFullscreen: false,
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        {
          name: "image",
          action: async (editor: any) => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.onchange = async (e: any) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const cm = editor.codemirror;
              if (!cm) return;

              console.log("工具栏点击上传图片，文件:", file.name);

              // 显示上传中提示
              const uploadingText = `![上传中...](uploading-${Date.now()})`;
              cm.replaceSelection(uploadingText);

              const url = await uploadImageToOSS(file);

              console.log("工具栏上传结果:", url);

              if (url) {
                // 删除上传中提示，插入真实图片
                const alt = file.name.split(".")[0];
                const currentContent = cm.getValue();
                const newContent = currentContent.replace(uploadingText, `![${alt}](${url})`);
                cm.setValue(newContent);
                setContent(newContent);
              } else {
                // 上传失败，删除提示
                const currentContent = cm.getValue();
                const newContent = currentContent.replace(uploadingText, '');
                cm.setValue(newContent);
                setContent(newContent);
              }
            };
            input.click();
          },
          className: "fa fa-picture-o",
          title: "插入图片",
        },
        "|",
        "code",
        "table",
        "horizontal-rule",
        "|",
        "preview",
        "side-by-side",
        "fullscreen",
        "|",
        "guide",
      ],
    };
  }, [uploadImageToOSS]);

  const handleSubmit = async (isDraft: boolean) => {
    if (!title || !slug || !content) {
      alert("标题、Slug 和内容不能为空");
      return;
    }

    setLoading(true);

    try {
      const tagNames = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);

      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          description,
          content,
          coverImage,
          categoryName: category || null,
          tagNames,
          published: !isDraft,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "创建失败");
        return;
      }

      alert(isDraft ? "保存草稿成功" : "发布成功");
      router.push("/admin/dashboard");
    } catch (error) {
      alert("创建失败，请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">新建文章</h1>
                <p className="text-sm text-muted-foreground">
                  创建一篇新的博客文章
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={loading}
              >
                保存草稿
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Save className="h-4 w-4 mr-2" />
                发布
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-4 py-3 text-2xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500"
                placeholder="输入文章标题..."
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-2">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="url-friendly-slug"
              />
              <p className="text-xs text-muted-foreground mt-1">
                文章的 URL 路径，只能包含小写字母、数字和连字符
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2">
                文章描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="输入文章简介..."
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium mb-2">
                封面图
              </label>
              <div className="space-y-3">
                {/* 上传按钮 */}
                <div className="flex gap-2">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <div className="flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors">
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          上传中...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          上传图片
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {/* 手动输入 URL */}
                <div>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="或手动输入图片 URL"
                  />
                </div>

                {/* 图片预览 */}
                {coverImage && (
                  <img
                    src={coverImage}
                    alt="封面预览"
                    className="mt-4 w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  分类
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="技术"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  标签（逗号分隔）
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Next.js, React, TypeScript"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">
                文章内容 <span className="text-red-500">*</span>
              </label>
              <div className="markdown-editor-wrapper">
                <SimpleMDE
                  value={content}
                  onChange={setContent}
                  options={editorOptions as any}
                  getMdeInstance={getMdeInstance}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 提示：点击工具栏的图片按钮可上传图片，支持拖拽和粘贴图片。使用右侧按钮切换预览模式。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


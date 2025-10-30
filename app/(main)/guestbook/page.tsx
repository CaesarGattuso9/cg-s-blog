"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, X } from "lucide-react";

// 颜色主题
const colorThemes = [
  { id: "pink", bg: "bg-pink-50 dark:bg-pink-900/20", border: "border-pink-200", color: "#ec4899", gradient: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)" },
  { id: "orange", bg: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200", color: "#f97316", gradient: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)" },
  { id: "blue", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-200", color: "#3b82f6", gradient: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)" },
  { id: "green", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-200", color: "#10b981", gradient: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" },
  { id: "purple", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-200", color: "#8b5cf6", gradient: "linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)" },
  { id: "yellow", bg: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200", color: "#eab308", gradient: "linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)" },
];

// 随机旋转角度
const rotations = ["rotate-[-1deg]", "rotate-[0.5deg]", "rotate-[-0.5deg]", "rotate-[1deg]", "rotate-[-0.8deg]", "rotate-[0.3deg]"];

// 字体类型
const fontTypes = [
  { id: "default", name: "默认", fontFamily: "system-ui, -apple-system, sans-serif" },
  { id: "songti", name: "宋体", fontFamily: "SimSun, STSong, serif" },
  { id: "kaiti", name: "楷体", fontFamily: "KaiTi, STKaiti, serif" },
  { id: "handwriting", name: "手写", fontFamily: "'Long Cang', 'Ma Shan Zheng', cursive" },
  { id: "heiti", name: "黑体", fontFamily: "SimHei, STHeiti, sans-serif" },
  { id: "yahei", name: "微软雅黑", fontFamily: "'Microsoft YaHei', sans-serif" },
];

// 分类标签
const categories = ["留言", "目标", "理想", "过去", "将来", "亲情", "友情", "秘密", "信条", "无题"];

export default function GuestbookPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("全部");

  // 表单状态
  const [selectedColor, setSelectedColor] = useState("pink");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("留言");
  const [selectedFont, setSelectedFont] = useState("default");
  const [showNameInput, setShowNameInput] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/guestbook");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("加载留言失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("留言内容不能为空");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: authorName.trim() || "访客",
          content: content.trim(),
          category: selectedCategory,
          theme: selectedColor,
          fontType: selectedFont,
          email: null,
          website: null,
        }),
      });

      if (res.ok) {
        alert("留言已提交，等待审核");
        setContent("");
        setSelectedCategory("留言");
        setSelectedColor("pink");
        setSelectedFont("default");
        setShowNameInput(false);
        setAuthorName("");
        setShowDialog(false);
        loadMessages();
      } else {
        alert("提交失败");
      }
    } catch (error) {
      alert("提交失败，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  };

  const filters = ["全部", "留言", "过去", "亲情", "将来", "爱情", "理想", "目标", "友情"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {/* Page Header */}
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-600">
          留言墙
        </h1>
        <p className="text-lg text-muted-foreground">
          很多事情值得记录，当然也值得回忆
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          {filters.map((filter) => (
            <Badge
              key={filter}
              variant={selectedFilter === filter ? "default" : "outline"}
              className="cursor-pointer px-6 py-2 text-base hover:bg-primary/90"
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </Badge>
          ))}
        </div>
        <div className="text-center text-sm text-muted-foreground">
          {messages.length} 条留言 · 滚动加载更多
        </div>
      </div>

      {/* Messages Grid - 便签纸风格 */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {messages.map((message, index) => {
            // 使用保存的主题，如果没有则回退到循环主题
            const savedTheme = colorThemes.find(t => t.id === message.theme);
            const theme = savedTheme || colorThemes[index % colorThemes.length];

            // 使用保存的字体，如果没有则使用默认字体
            const savedFont = fontTypes.find(f => f.id === message.fontType);
            const fontFamily = savedFont?.fontFamily || fontTypes[0].fontFamily;

            // 随机旋转角度
            const rotation = rotations[index % rotations.length];

            return (
              <div
                key={message.id}
                className={`${theme.border} ${rotation} border-2 rounded-lg p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:rotate-0 relative`}
                style={{
                  minHeight: "280px",
                  background: theme.gradient,
                }}
              >
                {/* Pin decoration - 钉子装饰 */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-red-400 rounded-full shadow-md border-2 border-red-500" />

                {/* Content */}
                <div className="space-y-4">
                  {/* 内容 - 使用保存的字体 */}
                  <div
                    className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed whitespace-pre-wrap mb-4"
                    style={{
                      fontFamily,
                      lineHeight: "2rem",
                      letterSpacing: "0.02em"
                    }}
                  >
                    {message.content}
                  </div>

                  {/* 署名 */}
                  {message.name && message.name !== '访客' && (
                    <div className="text-right text-sm font-medium text-gray-600 dark:text-gray-400 italic">
                      —— {message.name}
                    </div>
                  )}

                  {/* 底部信息 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-300/50">
                    <div className="flex gap-2">
                      <Badge
                        className="text-xs"
                        style={{ backgroundColor: theme.color, color: 'white' }}
                      >
                        {message.category || '留言'}
                      </Badge>
                    </div>

                    {/* 时间 */}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.createdAt).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* 互动按钮 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                      <Heart className="h-4 w-4" />
                      <span>0</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-4 w-4" />
                      <span>0</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 添加留言按钮 - 屏幕中间右侧 */}
      <button
        onClick={() => setShowDialog(true)}
        className="fixed right-8 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl transition-all flex items-center justify-center text-2xl z-50"
      >
        +
      </button>

      {/* 创建留言对话框 */}
      {showDialog && (
        <div className="fixed inset-0 bg-gray-500/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl max-w-md w-full p-6 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  ✨
                </div>
                <div>
                  <h2 className="text-xl font-bold">创建留言</h2>
                  <p className="text-sm text-muted-foreground">分享你的想法</p>
                </div>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 选择主题 */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                🎨 选择主题
              </label>
              <div className="flex gap-3">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedColor(theme.id)}
                    className={`w-12 h-12 rounded-xl transition-all ${selectedColor === theme.id
                      ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                      : "hover:scale-105"
                      }`}
                    style={{ backgroundColor: theme.color }}
                  />
                ))}
              </div>
            </div>

            {/* 选择字体 */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                ✏️ 选择字体
              </label>
              <div className="flex flex-wrap gap-2">
                {fontTypes.map((font) => (
                  <Badge
                    key={font.id}
                    variant={selectedFont === font.id ? "default" : "outline"}
                    className="cursor-pointer px-4 py-1.5 hover:bg-primary/90 transition-all"
                    onClick={() => setSelectedFont(font.id)}
                    style={{ fontFamily: font.fontFamily }}
                  >
                    {font.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 留言内容 */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">留言内容</label>
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, 500))}
                  placeholder="在这里写下你的想法..."
                  rows={6}
                  className="w-full px-4 py-3 pb-10 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
                  style={{
                    backgroundColor: colorThemes.find(t => t.id === selectedColor)?.color + '15',
                    fontFamily: fontTypes.find(f => f.id === selectedFont)?.fontFamily
                  }}
                />
                {/* 输入框内部底部：字数统计和署名 */}
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-between px-4">
                  <span className="text-xs text-muted-foreground">
                    {content.length}/500
                  </span>
                  {showNameInput ? (
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="输入署名"
                      className="text-xs px-3 py-1 bg-background border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-28"
                      onBlur={() => {
                        if (!authorName.trim()) {
                          setShowNameInput(false);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setShowNameInput(true)}
                      className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                    >
                      署名
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 选择分类 */}
            <div className="mb-8">
              <label className="text-sm font-medium mb-3 block">选择分类</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer px-4 py-1.5 hover:bg-primary/90"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={submitting || !content.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📤 发布留言
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

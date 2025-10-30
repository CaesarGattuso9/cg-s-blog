"use client";

import { useEffect, useState } from "react";
import { Cloud, Sun } from "lucide-react";

export default function MomentsPage() {
  const [moments, setMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMoment, setSelectedMoment] = useState<any>(null);

  useEffect(() => {
    // 从API获取随记数据
    fetch("/api/moments")
      .then((res) => res.json())
      .then((data) => {
        const momentsData = data.moments || [];
        setMoments(momentsData);
        if (momentsData.length > 0) {
          setSelectedMoment(momentsData[0]); // 默认选中第一条
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("加载随记失败:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg text-muted-foreground">加载中...</div>
      </div>
    );
  }

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 格式化短日期（月-日 时:分）
  const formatShortDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  };

  // 截取内容摘要
  const getExcerpt = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-background py-4 md:py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4 md:gap-6 max-w-7xl mx-auto">
          {/* 左侧：随记列表 */}
          <div className="bg-card rounded-lg border shadow-sm p-4 md:p-5 flex flex-col max-h-[400px] lg:max-h-[calc(100vh-120px)] overflow-hidden">
            <div className="mb-4 flex-shrink-0">
              <h1 className="text-2xl font-bold mb-2">随记</h1>
              <p className="text-sm text-muted-foreground">{moments.length} 篇随记</p>
            </div>

            <div className="space-y-2 md:space-y-3 flex-1 overflow-y-auto pr-2">
              {moments.map((moment) => (
                <div
                  key={moment.id}
                  onClick={() => setSelectedMoment(moment)}
                  className={`p-3 md:p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${selectedMoment?.id === moment.id
                    ? 'bg-primary/5 border-primary'
                    : 'bg-background hover:bg-muted/50'
                    }`}
                >
                  {/* 日期时间 */}
                  <div className="text-xs text-muted-foreground mb-2">
                    {formatDateTime(moment.createdAt)}
                  </div>

                  {/* 标题（取内容第一行） */}
                  <h3 className="font-medium mb-2 line-clamp-1">
                    {moment.content.split('\n')[0]}
                  </h3>

                  {/* 内容摘要 */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {getExcerpt(moment.content)}
                  </p>

                  {/* 图标 */}
                  <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                    <span className="text-lg">😊</span>
                    {moment.images && moment.images.length > 0 && moment.images[0] && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-600 rounded">📷</span>
                    )}
                  </div>
                </div>
              ))}

              {moments.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  还没有随记
                </div>
              )}

              {moments.length > 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  已加载全部
                </div>
              )}
            </div>
          </div>

          {/* 右侧：随记详情 - 纸张效果 */}
          <div className="relative min-h-[500px] lg:h-[calc(100vh-120px)] overflow-hidden">
            <div
              className="rounded-lg border shadow-xl h-full flex flex-col overflow-y-auto bg-white dark:bg-gray-900"
              style={{
                boxShadow: '0 2px 8px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.05)',
              }}
            >
              {selectedMoment ? (
                <>
                  {/* 标题和日期 */}
                  <div className="px-4 md:px-8 lg:px-12 pt-6 md:pt-8 pb-3 bg-white dark:bg-gray-900 flex-shrink-0">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-normal flex-1 text-gray-800 dark:text-gray-100" style={{ letterSpacing: '0.02em' }}>
                        {selectedMoment.content.split('\n')[0]}
                      </h1>
                      <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500">
                        <span className="text-xs">{formatShortDateTime(selectedMoment.createdAt)}</span>
                        <span className="text-base">😊</span>
                        <span className="text-xs hidden sm:inline">心情 3/5</span>
                        <Cloud className="h-4 w-4 text-blue-400" />
                      </div>
                    </div>
                    {/* 蓝色分隔线 */}
                    <div
                      style={{
                        height: '2px',
                        background: '#3b82f6',
                        marginBottom: '0',
                      }}
                    />
                  </div>

                  {/* 内容区域 - 格子纸背景 */}
                  <div className="px-4 md:px-8 lg:px-12 relative flex-1 pb-8 md:pb-12">
                    {/* 第一条占满整行的灰线 */}
                    <div className="h-px bg-gray-200 dark:bg-gray-700 -mx-4 md:-mx-8 lg:-mx-12" />

                    {/* 内容区域 - 带边距的格子线 */}
                    <div
                      className="pt-2 md:pt-3 min-h-full moment-lines"
                    >
                      {/* 内容 */}
                      <div
                        className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 pb-12"
                        style={{
                          lineHeight: '29px',
                          letterSpacing: '0.01em',
                          fontWeight: '400',
                        }}
                      >
                        {selectedMoment.content}
                      </div>

                      {/* 图片 - 响应式显示 */}
                      {selectedMoment.images && selectedMoment.images.length > 0 && selectedMoment.images[0] && (
                        <div className="my-6 flex justify-center md:justify-end">
                          <img
                            src={selectedMoment.images[0]}
                            alt="图片"
                            className="w-full max-w-[280px] md:max-w-[200px] h-auto rounded-lg shadow-md"
                            style={{
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                      )}

                      {/* 签名 */}
                      <div
                        className="text-gray-400 dark:text-gray-500 text-sm italic text-right mt-8 md:mt-12"
                        style={{
                          lineHeight: '29px',
                        }}
                      >
                        Caesar Gattuso
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full" style={{ color: '#95a5a6' }}>
                  选择一条随记查看详情
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
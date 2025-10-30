"use client";

import { X } from "lucide-react";
import { ExifData } from "@/lib/image-utils";

interface ImageListItemProps {
  url: string;
  title: string;
  description: string;
  fileType?: 'image' | 'video';
  isLocal?: boolean;
  index: number;
  uploadProgress?: number;
  exifData?: ExifData;
  onUpdateTitle: (value: string) => void;
  onUpdateDescription: (value: string) => void;
  onRemove: () => void;
}

export default function ImageListItem({
  url,
  title,
  description,
  fileType = 'image',
  isLocal = false,
  index,
  uploadProgress,
  exifData = {},
  onUpdateTitle,
  onUpdateDescription,
  onRemove,
}: ImageListItemProps) {
  return (
    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      {/* 预览 */}
      {fileType === 'video' ? (
        <video
          src={url}
          className="w-32 h-32 object-cover rounded flex-shrink-0"
          controls
        />
      ) : (
        <img
          src={url}
          alt=""
          className="w-32 h-32 object-cover rounded flex-shrink-0"
        />
      )}

      {/* 信息编辑 */}
      <div className="flex-1 space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="图片标题（可选）"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => onUpdateDescription(e.target.value)}
          className="w-full px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="图片描述（可选）"
        />

        {/* 状态标签 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>顺序：第 {index + 1} 张</span>
          {isLocal && (
            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
              待上传
            </span>
          )}
        </div>

        {/* 上传进度条 */}
        {uploadProgress !== undefined && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-blue-600 dark:text-blue-400">正在上传...</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* EXIF 信息 */}
        {(exifData.takenAt || exifData.latitude || exifData.cameraMake) && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs space-y-1">
            <div className="font-semibold text-blue-700 dark:text-blue-400">
              📸 EXIF 信息
            </div>
            {exifData.takenAt && (
              <div className="text-gray-600 dark:text-gray-400">
                🕐 拍摄时间: {new Date(exifData.takenAt).toLocaleString('zh-CN')}
              </div>
            )}
            {exifData.latitude && exifData.longitude && (
              <div className="text-gray-600 dark:text-gray-400">
                📍 位置: {exifData.location || `${exifData.latitude.toFixed(6)}, ${exifData.longitude.toFixed(6)}`}
              </div>
            )}
            {exifData.cameraMake && exifData.cameraModel && (
              <div className="text-gray-600 dark:text-gray-400">
                📷 设备: {exifData.cameraMake} {exifData.cameraModel}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 删除按钮 */}
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  );
}


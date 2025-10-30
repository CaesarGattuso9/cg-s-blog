/**
 * 图片处理工具函数
 */

import heic2any from "heic2any";
import exifr from "exifr";

/**
 * EXIF 数据接口
 */
export interface ExifData {
  takenAt?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  cameraMake?: string;
  cameraModel?: string;
}

/**
 * 检查是否为 HEIC/HEIF 格式
 */
export function isHeicFormat(file: File): boolean {
  const fileName = file.name.toLowerCase();
  return fileName.endsWith('.heic') || fileName.endsWith('.heif');
}

/**
 * 检查是否为视频文件
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/');
}

/**
 * 将 HEIC 格式转换为 JPEG
 */
export async function convertHeicToJpeg(file: File): Promise<File> {
  if (!isHeicFormat(file)) {
    return file;
  }

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    return new File(
      [blob],
      file.name.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg'),
      { type: 'image/jpeg' }
    );
  } catch (error) {
    console.error('HEIC 转换失败:', error);
    throw new Error('HEIC 格式转换失败');
  }
}

/**
 * 提取图片的 EXIF 数据
 */
export async function extractExifData(file: File): Promise<ExifData> {
  try {
    const exif = await exifr.parse(file, {
      gps: true,
      tiff: true,
      exif: true,
    });

    if (!exif) {
      return {};
    }

    const data: ExifData = {};

    // 提取拍摄时间
    if (exif.DateTimeOriginal || exif.DateTime || exif.CreateDate) {
      const date = exif.DateTimeOriginal || exif.DateTime || exif.CreateDate;
      data.takenAt = new Date(date).toISOString();
    }

    // 提取 GPS 坐标
    if (exif.latitude && exif.longitude) {
      data.latitude = exif.latitude;
      data.longitude = exif.longitude;
    }

    // 提取相机信息
    if (exif.Make) {
      data.cameraMake = exif.Make;
    }
    if (exif.Model) {
      data.cameraModel = exif.Model;
    }

    return data;
  } catch (error) {
    console.error('EXIF 提取失败:', error);
    return {};
  }
}

/**
 * 根据经纬度获取地点名称（逆地理编码）
 */
export async function getLocationName(
  latitude: number,
  longitude: number
): Promise<string | undefined> {
  try {
    const response = await fetch(
      `/api/geocode?latitude=${latitude}&longitude=${longitude}`
    );
    if (response.ok) {
      const data = await response.json();
      return data.location;
    }
  } catch (error) {
    console.error('获取地点名称失败:', error);
  }
  return undefined;
}

/**
 * 创建文件的本地预览 URL
 */
export async function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('无法读取文件'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsDataURL(file);
  });
}

/**
 * 处理图片文件：HEIC 转换 + EXIF 提取 + 预览 URL + 地理编码
 */
export async function processImageFile(file: File): Promise<{
  previewUrl: string;
  processedFile: File;
  exifData: ExifData;
}> {
  // 1. 先提取 EXIF（在转换前，避免丢失）
  const exifData = await extractExifData(file);

  // 2. 如果有经纬度，获取地点名称
  if (exifData.latitude && exifData.longitude) {
    exifData.location = await getLocationName(
      exifData.latitude,
      exifData.longitude
    );
  }

  // 3. 转换 HEIC 格式
  const processedFile = await convertHeicToJpeg(file);

  // 4. 创建预览 URL
  const previewUrl = await createPreviewUrl(processedFile);

  return {
    previewUrl,
    processedFile,
    exifData,
  };
}

/**
 * 批量处理图片/视频文件
 */
export async function processBatchFiles(
  files: File[]
): Promise<Array<{
  file: File;
  previewUrl: string;
  fileType: 'image' | 'video';
  exifData: ExifData;
}>> {
  const results = await Promise.all(
    files.map(async (file) => {
      const fileType: 'image' | 'video' = isVideoFile(file) ? 'video' : 'image';

      if (fileType === 'video') {
        // 视频文件只创建预览
        const previewUrl = await createPreviewUrl(file);
        return { file, previewUrl, fileType, exifData: {} };
      } else {
        // 图片文件完整处理
        const { previewUrl, processedFile, exifData } = await processImageFile(file);
        return { file: processedFile, previewUrl, fileType, exifData };
      }
    })
  );

  return results;
}


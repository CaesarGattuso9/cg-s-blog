import { uploadToOSS } from './oss';

/**
 * 从 Markdown 内容中提取所有图片 URL
 * 支持格式：![alt](url) 和 <img src="url">
 */
export function extractImageUrls(markdown: string): string[] {
  const urls: string[] = [];

  // 匹配 ![alt](url) 格式
  const markdownImageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;

  while ((match = markdownImageRegex.exec(markdown)) !== null) {
    urls.push(match[2]);
  }

  // 匹配 <img src="url"> 格式
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["']/g;

  while ((match = htmlImageRegex.exec(markdown)) !== null) {
    urls.push(match[1]);
  }

  return urls;
}

/**
 * 判断 URL 是否为外链（非 OSS 地址）
 */
export function isExternalUrl(url: string, ossBucket?: string): boolean {
  // 如果已经是 OSS 地址，不需要上传
  if (ossBucket && url.includes(ossBucket)) {
    return false;
  }

  // 判断是否为外链
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * 下载图片并返回 Buffer
 */
export async function downloadImage(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    throw error;
  }
}

/**
 * 获取图片的 Content-Type
 */
export async function getImageContentType(url: string): Promise<string> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return contentType || 'image/jpeg';
  } catch (error) {
    // 根据扩展名判断
    const ext = url.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
    };
    return typeMap[ext || 'jpg'] || 'image/jpeg';
  }
}

/**
 * 从 URL 中提取文件名
 */
export function getFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || 'image.jpg';
    return fileName;
  } catch {
    return 'image.jpg';
  }
}

/**
 * 上传单张图片并返回新的 OSS URL
 */
export async function uploadImageFromUrl(imageUrl: string): Promise<string> {
  try {
    // 下载图片
    const buffer = await downloadImage(imageUrl);

    // 获取 Content-Type
    const contentType = await getImageContentType(imageUrl);

    // 获取文件名
    const fileName = getFileNameFromUrl(imageUrl);

    // 上传到 OSS
    const result = await uploadToOSS(buffer, fileName, contentType);

    return result.url;
  } catch (error) {
    console.error(`Failed to upload image from ${imageUrl}:`, error);
    throw error;
  }
}

/**
 * 处理 Markdown 内容，将外链图片上传到 OSS 并替换 URL
 */
export async function processMarkdownImages(
  markdown: string,
  ossBucket?: string
): Promise<{ content: string; uploadedCount: number }> {
  // 提取所有图片 URL
  const imageUrls = extractImageUrls(markdown);

  if (imageUrls.length === 0) {
    return { content: markdown, uploadedCount: 0 };
  }

  let processedContent = markdown;
  let uploadedCount = 0;
  const urlMap = new Map<string, string>(); // 缓存已上传的图片，避免重复上传

  // 过滤出需要上传的外链图片
  const externalUrls = imageUrls.filter(url => isExternalUrl(url, ossBucket));

  // 上传所有外链图片
  for (const originalUrl of externalUrls) {
    // 如果已经上传过，直接使用缓存的 URL
    if (urlMap.has(originalUrl)) {
      continue;
    }

    try {
      // 上传图片到 OSS
      const ossUrl = await uploadImageFromUrl(originalUrl);
      urlMap.set(originalUrl, ossUrl);
      uploadedCount++;

      console.log(`✅ Uploaded: ${originalUrl} -> ${ossUrl}`);
    } catch (error) {
      console.error(`❌ Failed to upload: ${originalUrl}`, error);
      // 上传失败时保留原 URL
      urlMap.set(originalUrl, originalUrl);
    }
  }

  // 替换 Markdown 中的图片 URL
  for (const [originalUrl, ossUrl] of urlMap.entries()) {
    if (originalUrl !== ossUrl) {
      // 转义特殊字符，避免正则表达式错误
      const escapedUrl = originalUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedUrl, 'g');
      processedContent = processedContent.replace(regex, ossUrl);
    }
  }

  return {
    content: processedContent,
    uploadedCount,
  };
}


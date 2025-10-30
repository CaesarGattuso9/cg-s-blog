/**
 * 分片上传工具
 * 支持大文件分片并发上传，提升上传速度
 */

export interface ChunkUploadOptions {
  file: File;
  chunkSize?: number; // 分片大小，默认 5MB
  concurrent?: number; // 并发数，默认 3
  folder?: string;
  type?: 'image' | 'video';
  onProgress?: (progress: number) => void; // 进度回调 0-100
}

export interface ChunkUploadResult {
  success: boolean;
  url?: string;
  name?: string;
  error?: string;
}

/**
 * 分片上传文件
 */
export async function uploadFileInChunks(
  options: ChunkUploadOptions
): Promise<ChunkUploadResult> {
  const {
    file,
    chunkSize = 5 * 1024 * 1024, // 默认 5MB
    concurrent = 3, // 默认并发 3 个
    folder = 'uploads',
    type = 'image',
    onProgress,
  } = options;

  try {
    // 小于 10MB 的文件直接上传，不分片
    if (file.size < 10 * 1024 * 1024) {
      return await uploadDirect(file, folder, type, onProgress);
    }

    // 计算分片数量
    const totalChunks = Math.ceil(file.size / chunkSize);
    console.log(`文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB, 分片数: ${totalChunks}`);

    // 1. 初始化分片上传
    const initRes = await fetch('/api/admin/upload/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        fileSize: file.size,
        totalChunks,
        folder,
        type,
      }),
    });

    if (!initRes.ok) {
      throw new Error('初始化上传失败');
    }

    const { uploadId, key } = await initRes.json();

    // 2. 创建所有分片任务
    const chunkTasks: Array<() => Promise<any>> = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      chunkTasks.push(() =>
        uploadChunk(chunk, uploadId, key, i + 1, folder, type)
      );
    }

    // 3. 并发上传分片
    const uploadedParts: any[] = [];
    let completedChunks = 0;

    // 分批并发上传
    for (let i = 0; i < chunkTasks.length; i += concurrent) {
      const batch = chunkTasks.slice(i, i + concurrent);
      const results = await Promise.all(batch.map(task => task()));
      uploadedParts.push(...results);

      completedChunks += results.length;
      const progress = Math.round((completedChunks / totalChunks) * 100);
      onProgress?.(progress);

      console.log(`上传进度: ${progress}% (${completedChunks}/${totalChunks})`);
    }

    // 4. 完成上传
    const completeRes = await fetch('/api/admin/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uploadId,
        key,
        parts: uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber),
        folder,
        type,
      }),
    });

    if (!completeRes.ok) {
      throw new Error('完成上传失败');
    }

    const result = await completeRes.json();
    return {
      success: true,
      url: result.url,
      name: result.name,
    };
  } catch (error: any) {
    console.error('分片上传失败:', error);
    return {
      success: false,
      error: error.message || '上传失败',
    };
  }
}

/**
 * 直接上传小文件
 */
async function uploadDirect(
  file: File,
  folder: string,
  type: string,
  onProgress?: (progress: number) => void
): Promise<ChunkUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  formData.append('type', type);

  onProgress?.(0);

  const xhr = new XMLHttpRequest();

  return new Promise((resolve, reject) => {
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress?.(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        resolve({
          success: true,
          url: result.url,
          name: result.name,
        });
      } else {
        reject(new Error('上传失败'));
      }
    };

    xhr.onerror = () => reject(new Error('上传失败'));

    xhr.open('POST', '/api/admin/upload');
    xhr.send(formData);
  });
}

/**
 * 上传单个分片
 */
async function uploadChunk(
  chunk: Blob,
  uploadId: string,
  key: string,
  partNumber: number,
  folder: string,
  type: string
): Promise<any> {
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('uploadId', uploadId);
  formData.append('key', key);
  formData.append('partNumber', partNumber.toString());
  formData.append('folder', folder);
  formData.append('type', type);

  const res = await fetch('/api/admin/upload/chunk', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`分片 ${partNumber} 上传失败`);
  }

  return await res.json();
}


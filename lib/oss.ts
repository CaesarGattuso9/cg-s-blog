import OSS from 'ali-oss';

// OSS 客户端配置
export function getOSSClient() {
  const client = new OSS({
    region: process.env.OSS_REGION || '',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID || '',
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET || '',
    bucket: process.env.OSS_BUCKET || '',
    secure: true, // 强制使用 HTTPS
  });

  return client;
}

// 生成唯一文件名
export function generateFileName(originalName: string, folder: string = 'uploads'): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const ext = originalName.split('.').pop();
  // 确保文件夹路径格式正确
  const folderPath = folder.endsWith('/') ? folder.slice(0, -1) : folder;
  return `${folderPath}/${timestamp}-${randomStr}.${ext}`;
}

// 上传文件到 OSS
export async function uploadToOSS(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
) {
  try {
    const client = getOSSClient();
    const ossFileName = generateFileName(fileName, folder);

    const result = await client.put(ossFileName, file, {
      headers: {
        'Content-Type': contentType,
      },
    });

    // 返回 OSS 文件 URL，确保使用 HTTPS
    let url = result.url;
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }

    return {
      url,
      name: ossFileName,
    };
  } catch (error) {
    console.error('OSS upload error:', error);
    throw new Error('文件上传失败');
  }
}

// 删除 OSS 文件
export async function deleteFromOSS(fileName: string) {
  try {
    const client = getOSSClient();
    await client.delete(fileName);
    return true;
  } catch (error) {
    console.error('OSS delete error:', error);
    return false;
  }
}

// 获取文件签名 URL（用于私有文件访问）
export async function getSignedUrl(fileName: string, expiresInSeconds: number = 3600) {
  try {
    const client = getOSSClient();
    const url = client.signatureUrl(fileName, {
      expires: expiresInSeconds,
    });
    return url;
  } catch (error) {
    console.error('Get signed URL error:', error);
    throw new Error('获取文件签名失败');
  }
}


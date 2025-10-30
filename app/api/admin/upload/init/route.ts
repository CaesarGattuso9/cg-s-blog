import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOSSClient, generateFileName } from '@/lib/oss';

/**
 * 初始化分片上传
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { filename, fileSize, totalChunks, folder, type } = await request.json();

    console.log(`初始化分片上传: ${filename}, 大小: ${(fileSize / 1024 / 1024).toFixed(2)}MB, 分片数: ${totalChunks}`);

    // 生成文件名
    const key = generateFileName(filename, folder || 'uploads');

    // 获取 OSS 客户端
    const client = getOSSClient();

    // 初始化分片上传
    const result = await client.initMultipartUpload(key, {
      headers: {
        'Content-Type': type === 'video' ? 'video/mp4' : 'image/jpeg',
      },
    });

    console.log(`分片上传已初始化: uploadId=${result.uploadId}, key=${key}`);

    return NextResponse.json({
      success: true,
      uploadId: result.uploadId,
      key: key,
    });
  } catch (error: any) {
    console.error('初始化分片上传失败:', error);
    return NextResponse.json(
      { error: error.message || '初始化失败' },
      { status: 500 }
    );
  }
}


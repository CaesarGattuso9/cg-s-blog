import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOSSClient } from '@/lib/oss';

/**
 * 上传单个分片
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const formData = await request.formData();
    const chunk = formData.get('chunk') as Blob;
    const uploadId = formData.get('uploadId') as string;
    const key = formData.get('key') as string;
    const partNumber = parseInt(formData.get('partNumber') as string);

    if (!chunk || !uploadId || !key || !partNumber) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 将 Blob 转换为 Buffer
    const buffer = Buffer.from(await chunk.arrayBuffer());

    // 获取 OSS 客户端
    const client = getOSSClient();

    // 上传分片
    const result = await client.uploadPart(key, uploadId, partNumber, buffer);

    console.log(`分片 ${partNumber} 上传成功, ETag=${result.etag}`);

    return NextResponse.json({
      success: true,
      PartNumber: partNumber,
      ETag: result.etag,
    });
  } catch (error: any) {
    console.error('上传分片失败:', error);
    return NextResponse.json(
      { error: error.message || '上传分片失败' },
      { status: 500 }
    );
  }
}


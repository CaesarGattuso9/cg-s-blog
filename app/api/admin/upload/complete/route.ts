import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getOSSClient, getOSSUrl } from '@/lib/oss';

/**
 * 完成分片上传
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { uploadId, key, parts } = await request.json();

    if (!uploadId || !key || !parts || !Array.isArray(parts)) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    console.log(`完成分片上传: key=${key}, 分片数=${parts.length}`);

    // 获取 OSS 客户端
    const client = getOSSClient();

    // 完成分片上传
    const result = await client.completeMultipartUpload(
      key,
      uploadId,
      parts.map((part: any) => ({
        number: part.PartNumber,
        etag: part.ETag,
      }))
    );

    console.log(`文件上传完成: ${result.name}`);

    // 获取文件 URL
    const url = getOSSUrl(result.name);

    return NextResponse.json({
      success: true,
      url: url,
      name: result.name,
      type: 'file',
    });
  } catch (error: any) {
    console.error('完成分片上传失败:', error);
    return NextResponse.json(
      { error: error.message || '完成上传失败' },
      { status: 500 }
    );
  }
}


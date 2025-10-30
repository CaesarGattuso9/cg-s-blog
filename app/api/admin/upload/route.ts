import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadToOSS } from '@/lib/oss';

// 处理图片/视频上传
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'article'; // 默认使用 article 文件夹
    const fileType = (formData.get('type') as string) || 'image'; // image 或 video

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // 根据类型验证文件
    if (fileType === 'video') {
      // 验证视频类型
      const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!allowedVideoTypes.includes(file.type)) {
        return NextResponse.json(
          { error: '不支持的视频类型，仅支持 MP4、MOV、AVI、WebM' },
          { status: 400 }
        );
      }

      // 验证视频大小 (100MB)
      const maxVideoSize = 100 * 1024 * 1024;
      if (file.size > maxVideoSize) {
        return NextResponse.json(
          { error: '视频大小不能超过 100MB' },
          { status: 400 }
        );
      }
    } else {
      // 验证图片类型
      const allowedImageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif'
      ];
      if (!allowedImageTypes.includes(file.type)) {
        return NextResponse.json(
          { error: '不支持的图片类型，仅支持 JPG、PNG、GIF、WebP、HEIC' },
          { status: 400 }
        );
      }

      // 验证图片大小 (10MB)
      const maxImageSize = 10 * 1024 * 1024;
      if (file.size > maxImageSize) {
        return NextResponse.json(
          { error: '图片大小不能超过 10MB' },
          { status: 400 }
        );
      }
    }

    // 将文件转换为 Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 上传到 OSS，指定文件夹
    const result = await uploadToOSS(buffer, file.name, file.type, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      name: result.name,
      type: fileType,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '上传失败' },
      { status: 500 }
    );
  }
}

// 批量上传（用于图库）
export async function PUT(request: NextRequest) {
  try {
    // 验证用户权限
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = (formData.get('folder') as string) || 'gallery'; // 默认使用 gallery 文件夹
    const fileType = (formData.get('type') as string) || 'image'; // image 或 video

    if (!files || files.length === 0) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // 最多同时上传 20 个文件
    if (files.length > 20) {
      return NextResponse.json(
        { error: `最多一次上传 20 个${fileType === 'video' ? '视频' : '图片'}` },
        { status: 400 }
      );
    }

    // 批量上传
    const uploadPromises = files.map(async (file) => {
      // 根据类型验证文件
      if (fileType === 'video') {
        const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
        if (!allowedVideoTypes.includes(file.type)) {
          throw new Error(`文件 ${file.name} 类型不支持`);
        }

        const maxVideoSize = 100 * 1024 * 1024;
        if (file.size > maxVideoSize) {
          throw new Error(`视频 ${file.name} 大小超过 100MB`);
        }
      } else {
        const allowedImageTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/heic',
          'image/heif'
        ];
        if (!allowedImageTypes.includes(file.type)) {
          throw new Error(`文件 ${file.name} 类型不支持，仅支持 JPG、PNG、GIF、WebP、HEIC`);
        }

        const maxImageSize = 10 * 1024 * 1024;
        if (file.size > maxImageSize) {
          throw new Error(`图片 ${file.name} 大小超过 10MB`);
        }
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      return uploadToOSS(buffer, file.name, file.type, folder);
    });

    const results = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      files: results,
      type: fileType,
    });
  } catch (error) {
    console.error('Batch upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '批量上传失败' },
      { status: 500 }
    );
  }
}


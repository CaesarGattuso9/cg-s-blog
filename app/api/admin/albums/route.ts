import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取所有相册
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const albums = await prisma.album.findMany({
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ albums });
  } catch (error) {
    console.error('Get albums error:', error);
    return NextResponse.json(
      { error: '获取相册列表失败' },
      { status: 500 }
    );
  }
}

// 创建相册
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const data = await request.json();
    let { title, description, coverImage, category, tags, published, ossFolder, images } = data;

    if (!title) {
      return NextResponse.json(
        { error: '标题不能为空' },
        { status: 400 }
      );
    }

    // 若未显式提供封面且有图片，默认取第一张图片作为封面
    if (!coverImage && Array.isArray(images) && images.length > 0) {
      coverImage = images[0]?.url || images[0]?.imageUrl || coverImage;
    }

    const album = await prisma.album.create({
      data: {
        title,
        description: description || '',
        coverImage,
        category,
        tags: tags || [],
        ossFolder: ossFolder || null,
        published: published !== undefined ? published : true,
        images: {
          create: (images || []).map((img: any, index: number) => ({
            imageUrl: img.url,
            title: img.title || '',
            description: img.description || '',
            order: index,
            fileType: img.fileType || 'image',
            takenAt: img.takenAt ? new Date(img.takenAt) : null,
            latitude: img.latitude || null,
            longitude: img.longitude || null,
            location: img.location || null,
            cameraMake: img.cameraMake || null,
            cameraModel: img.cameraModel || null,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ album });
  } catch (error) {
    console.error('Create album error:', error);
    return NextResponse.json(
      { error: '创建相册失败' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取单个相册
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const album = await prisma.album.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!album) {
      return NextResponse.json({ error: '相册不存在' }, { status: 404 });
    }

    return NextResponse.json({ album });
  } catch (error) {
    console.error('Get album error:', error);
    return NextResponse.json(
      { error: '获取相册失败' },
      { status: 500 }
    );
  }
}

// 更新相册
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, coverImage, category, tags, published, ossFolder, images } = data;

    // 删除旧图片
    await prisma.albumImage.deleteMany({
      where: { albumId: params.id },
    });

    // 更新相册
    const album = await prisma.album.update({
      where: { id: params.id },
      data: {
        title,
        description,
        coverImage,
        category,
        tags: tags || [],
        ossFolder: ossFolder !== undefined ? ossFolder : undefined,
        published,
        images: {
          create: (images || []).map((img: any, index: number) => ({
            imageUrl: img.url || img.imageUrl,
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
    console.error('Update album error:', error);
    return NextResponse.json(
      { error: '更新相册失败' },
      { status: 500 }
    );
  }
}

// 删除相册
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    await prisma.album.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete album error:', error);
    return NextResponse.json(
      { error: '删除相册失败' },
      { status: 500 }
    );
  }
}


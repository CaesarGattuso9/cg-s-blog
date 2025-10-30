import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取单个相册（公开访问）
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const album = await prisma.album.findUnique({
      where: {
        id: params.id,
        published: true,
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!album) {
      return NextResponse.json(
        { error: '相册不存在' },
        { status: 404 }
      );
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


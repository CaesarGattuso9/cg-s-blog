import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取所有已发布的相册（公开访问）
export async function GET(request: NextRequest) {
  try {
    const albums = await prisma.album.findMany({
      where: {
        published: true,
      },
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


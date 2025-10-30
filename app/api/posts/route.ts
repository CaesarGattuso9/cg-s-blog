import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取所有已发布的文章（公开访问）
export async function GET(request: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      include: {
        category: true,
        tags: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: '获取文章列表失败' },
      { status: 500 }
    );
  }
}

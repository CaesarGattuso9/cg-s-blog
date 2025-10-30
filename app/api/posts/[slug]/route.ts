import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取单篇文章（公开访问）
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: {
        slug: params.slug,
        published: true,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }

    // 增加浏览量
    await prisma.post.update({
      where: { id: post.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取所有已发布的随记（公开访问）
export async function GET(request: NextRequest) {
  try {
    const moments = await prisma.moment.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ moments });
  } catch (error) {
    console.error('Get moments error:', error);
    return NextResponse.json(
      { error: '获取随记列表失败' },
      { status: 500 }
    );
  }
}

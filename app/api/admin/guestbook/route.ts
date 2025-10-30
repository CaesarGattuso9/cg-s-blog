import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';

// 获取所有留言（包括未审核的）
export async function GET(request: NextRequest) {
  const authResult = await authMiddleware(request);
  if (!authResult.authorized) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const messages = await prisma.guestbook.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Get guestbook error:', error);
    return NextResponse.json(
      { error: '获取留言失败' },
      { status: 500 }
    );
  }
}


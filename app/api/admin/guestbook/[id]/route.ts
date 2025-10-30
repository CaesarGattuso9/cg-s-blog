import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authMiddleware } from '@/lib/auth';

// 获取单个留言
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authMiddleware(request);
  if (!authResult.authorized) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const message = await prisma.guestbook.findUnique({
      where: { id: params.id },
    });

    if (!message) {
      return NextResponse.json({ error: '留言不存在' }, { status: 404 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Get guestbook error:', error);
    return NextResponse.json(
      { error: '获取留言失败' },
      { status: 500 }
    );
  }
}

// 更新留言（主要用于审核）
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authMiddleware(request);
  if (!authResult.authorized) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { approved } = data;

    const message = await prisma.guestbook.update({
      where: { id: params.id },
      data: {
        approved,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Update guestbook error:', error);
    return NextResponse.json(
      { error: '更新留言失败' },
      { status: 500 }
    );
  }
}

// 删除留言
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await authMiddleware(request);
  if (!authResult.authorized) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }

  try {
    await prisma.guestbook.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete guestbook error:', error);
    return NextResponse.json(
      { error: '删除留言失败' },
      { status: 500 }
    );
  }
}


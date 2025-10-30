import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取单条随记
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const moment = await prisma.moment.findUnique({
      where: { id: params.id },
    });

    if (!moment) {
      return NextResponse.json({ error: '随记不存在' }, { status: 404 });
    }

    return NextResponse.json({ moment });
  } catch (error) {
    console.error('Get moment error:', error);
    return NextResponse.json(
      { error: '获取随记失败' },
      { status: 500 }
    );
  }
}

// 更新随记
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
    const { content, images, published } = data;

    const moment = await prisma.moment.update({
      where: { id: params.id },
      data: {
        content,
        images: images || [],
        published,
      },
    });

    return NextResponse.json({ moment });
  } catch (error) {
    console.error('Update moment error:', error);
    return NextResponse.json(
      { error: '更新随记失败' },
      { status: 500 }
    );
  }
}

// 删除随记
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    await prisma.moment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete moment error:', error);
    return NextResponse.json(
      { error: '删除随记失败' },
      { status: 500 }
    );
  }
}


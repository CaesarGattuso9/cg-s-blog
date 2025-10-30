import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// 获取所有随记
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const moments = await prisma.moment.findMany({
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

// 创建随记
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const data = await request.json();
    const { content, images, published } = data;

    if (!content) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      );
    }

    const moment = await prisma.moment.create({
      data: {
        content,
        images: images || [],
        published: published !== undefined ? published : true,
      },
    });

    return NextResponse.json({ moment });
  } catch (error) {
    console.error('Create moment error:', error);
    return NextResponse.json(
      { error: '创建随记失败' },
      { status: 500 }
    );
  }
}


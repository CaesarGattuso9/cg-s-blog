import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取所有已审核的留言（公开访问）
export async function GET(request: NextRequest) {
  try {
    const messages = await prisma.guestbook.findMany({
      where: {
        approved: true,
      },
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

// 创建留言（公开访问）
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, website, content, category, theme, fontType } = data;

    if (!content) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      );
    }

    const message = await prisma.guestbook.create({
      data: {
        name: name || '访客',
        email: email || null,
        website: website || null,
        content,
        category: category || '留言',
        theme: theme || 'pink',
        fontType: fontType || 'default',
        approved: false, // 默认需要审核
      },
    });

    return NextResponse.json({
      message: '留言已提交，等待审核',
      data: message
    });
  } catch (error) {
    console.error('Create guestbook error:', error);
    return NextResponse.json(
      { error: '提交留言失败' },
      { status: 500 }
    );
  }
}

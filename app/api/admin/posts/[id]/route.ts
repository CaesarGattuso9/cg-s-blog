import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processMarkdownImages } from '@/lib/markdown-image-upload';

// 获取单篇文章
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    );
  }
}

// 更新文章
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
    let { title, slug, description, content, coverImage, published, categoryName, tagNames } = data;

    // 检查文章是否存在
    const existing = await prisma.post.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    }

    // 自动上传 Markdown 中的外链图片到 COS
    try {
      const cosBucket = process.env.COS_BUCKET;
      const result = await processMarkdownImages(content, cosBucket);
      content = result.content;

      if (result.uploadedCount > 0) {
        console.log(`✅ 已自动上传 ${result.uploadedCount} 张图片到 COS`);
      }
    } catch (error) {
      console.warn('⚠️ Markdown 图片处理失败，使用原始内容:', error);
      // 图片处理失败不影响文章更新，继续使用原始内容
    }

    // 处理分类
    let categoryId = null;
    if (categoryName) {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
        },
      });
      categoryId = category.id;
    }

    // 处理标签
    const tags = [];
    if (tagNames && Array.isArray(tagNames)) {
      for (const tagName of tagNames) {
        const tag = await prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-'),
          },
        });
        tags.push(tag);
      }
    }

    // 更新文章
    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        description,
        content,
        coverImage,
        published,
        categoryId,
        tags: {
          set: tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    );
  }
}


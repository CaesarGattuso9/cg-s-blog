import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { processMarkdownImages } from '@/lib/markdown-image-upload';

// 获取所有文章（管理员）
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
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

// 创建文章
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const data = await request.json();
    let { title, slug, description, content, coverImage, published, categoryName, tagNames } = data;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: '标题、slug 和内容不能为空' },
        { status: 400 }
      );
    }

    // 检查 slug 是否已存在
    const existing = await prisma.post.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: '该 slug 已存在' },
        { status: 400 }
      );
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
      // 图片处理失败不影响文章创建，继续使用原始内容
    }

    // 处理分类
    let category = null;
    if (categoryName) {
      category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
        },
      });
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

    // 创建文章
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        description: description || '',
        content,
        coverImage,
        published: published || false,
        categoryId: category?.id,
        tags: {
          connect: tags.map(tag => ({ id: tag.id })),
        },
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: '创建文章失败' },
      { status: 500 }
    );
  }
}


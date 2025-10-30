import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/search - 全局搜索
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // 搜索博客文章
    const posts = await prisma.post.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        category: true,
        tags: true,
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    // 搜索随记
    const moments = await prisma.moment.findMany({
      where: {
        published: true,
        content: { contains: query, mode: "insensitive" },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      query,
      results: {
        posts,
        moments,
      },
      total: posts.length + moments.length,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}


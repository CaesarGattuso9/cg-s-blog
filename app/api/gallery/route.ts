import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/gallery - 获取图库列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [images, total] = await Promise.all([
      prisma.galleryImage.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.galleryImage.count({ where: { published: true } }),
    ]);

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST /api/gallery - 上传图片（需要认证）
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const image = await prisma.galleryImage.create({
      data: {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        thumbnail: body.thumbnail,
        width: body.width,
        height: body.height,
        published: body.published !== false,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}


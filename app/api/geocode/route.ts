import { NextRequest, NextResponse } from 'next/server';

/**
 * 逆地理编码：将经纬度转换为中文地址
 * 使用高德地图 API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: '缺少经纬度参数' },
        { status: 400 }
      );
    }

    // 高德地图 API Key（从环境变量读取）
    // 优先使用 AMAP_KEY（服务端），其次使用 NEXT_PUBLIC_AMAP_KEY（兼容）
    const AMAP_KEY = process.env.AMAP_KEY || process.env.NEXT_PUBLIC_AMAP_KEY || 'YOUR_AMAP_KEY';

    // 调用高德地图逆地理编码 API
    const amapUrl = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&location=${longitude},${latitude}&extensions=base&output=json`;

    const response = await fetch(amapUrl);
    const data = await response.json();

    if (data.status === '1' && data.regeocode) {
      const address = data.regeocode.formatted_address;
      const addressComponent = data.regeocode.addressComponent;

      // 构建更简洁的地址
      const simpleAddress = `${addressComponent.province}${addressComponent.city}${addressComponent.district}`;

      return NextResponse.json({
        success: true,
        fullAddress: address,
        simpleAddress: simpleAddress,
        province: addressComponent.province,
        city: addressComponent.city,
        district: addressComponent.district,
      });
    }

    // 如果高德失败，返回经纬度
    return NextResponse.json({
      success: false,
      message: '无法获取地址信息',
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: '地理编码失败' },
      { status: 500 }
    );
  }
}


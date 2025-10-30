// 创建管理员账号的脚本
// 运行方式: npx tsx scripts/create-admin.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || '7228292@qq.com';
  const password = process.env.ADMIN_PASSWORD || 'licunzhi123..';
  const name = process.env.ADMIN_NAME || 'Admin';

  console.log('正在创建管理员账号...');
  console.log('邮箱:', email);

  // 检查是否已存在
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('该邮箱的管理员账号已存在');
    return;
  }

  // 加密密码
  const hashedPassword = await bcrypt.hash(password, 10);

  // 创建管理员
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
    },
  });

  console.log('管理员账号创建成功！');
  console.log('邮箱:', admin.email);
  console.log('密码:', password);
  console.log('请登录后及时修改密码！');
}

main()
  .catch((e) => {
    console.error('创建管理员失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


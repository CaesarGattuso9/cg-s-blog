import Link from "next/link";
import { Github, Mail, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">关于本站</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              这是一个基于 Next.js 构建的现代化个人博客，
              记录技术学习、生活随记和摄影作品。
            </p>
            <div className="flex space-x-4 mt-4">
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:your@email.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速导航</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  技术博客
                </Link>
              </li>
              <li>
                <Link
                  href="/moments"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  生活随记
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  摄影图库
                </Link>
              </li>
              <li>
                <Link
                  href="/guestbook"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  留言板
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-lg font-semibold mb-4">建站技术</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Next.js</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Prisma</li>
              <li>PostgreSQL</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Caesar Gattuso. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}


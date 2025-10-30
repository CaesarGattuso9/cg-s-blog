export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">关于</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-lg text-muted-foreground">
            这里是关于页面，你可以在这里介绍你自己。
          </p>
        </div>
      </div>
    </div>
  );
}


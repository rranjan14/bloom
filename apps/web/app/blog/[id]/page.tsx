import { AppShell } from "@/components/app-shell"
import { BlogEditor } from "@/components/blog-editor"

export default function BlogPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <BlogEditor blogId={params.id} />
    </AppShell>
  )
}


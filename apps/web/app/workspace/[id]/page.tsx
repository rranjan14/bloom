import { AppShell } from "@/components/app-shell"
import { WorkspaceView } from "@/components/workspace-view"

export default function WorkspacePage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <AppShell>
      <WorkspaceView workspaceId={params.id} />
    </AppShell>
  )
}


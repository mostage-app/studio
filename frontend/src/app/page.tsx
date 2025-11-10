"use client";

import { MainLayout } from "@/lib/components/layout";
import { Loading } from "@/lib/components/ui";
import { useEditor } from "@/features/editor/hooks/useEditor";
import { useAppLoading } from "@/lib/hooks/useAppLoading";

export default function Home() {
  const isAppLoaded = useAppLoading();
  const {
    markdown,
    showEditor,
    showPreview,
    updateMarkdown,
    editingSlide,
    updateEditingSlide,
  } = useEditor();

  if (!isAppLoaded) {
    return <Loading />;
  }

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900">
      <MainLayout
        markdown={markdown}
        onChange={updateMarkdown}
        showEditor={showEditor}
        showPreview={showPreview}
        editingSlide={editingSlide}
        updateEditingSlide={updateEditingSlide}
      />
    </div>
  );
}

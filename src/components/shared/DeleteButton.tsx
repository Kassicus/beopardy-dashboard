"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface DeleteButtonProps {
  table: "players" | "episodes" | "episode_appearances";
  id: string;
  itemName: string;
  onDeleted?: () => void;
  size?: "sm" | "md" | "lg";
}

export function DeleteButton({
  table,
  id,
  itemName,
  onDeleted,
  size = "sm",
}: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from(table).delete().eq("id", id);

      if (error) throw error;

      toast.success(`${itemName} deleted successfully`);
      setIsOpen(false);
      router.refresh();
      onDeleted?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size={size}
        onClick={() => setIsOpen(true)}
        className="text-red-500 hover:text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete <strong>{itemName}</strong>? This
            action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              isLoading={isLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

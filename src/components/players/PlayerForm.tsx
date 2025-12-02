"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playerSchema, type PlayerFormData } from "@/lib/validations/player";
import { generateSlug } from "@/lib/utils/slug";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import toast from "react-hot-toast";
import type { Tables } from "@/types/database";

interface PlayerFormProps {
  player?: Tables<"players">;
  mode: "create" | "edit";
}

export function PlayerForm({ player, mode }: PlayerFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PlayerFormData, string>>>({});

  const [formData, setFormData] = useState<PlayerFormData>({
    name: player?.name ?? "",
    image_url: player?.image_url ?? "",
  });

  function handleChange(field: keyof PlayerFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate form data
    const result = playerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof PlayerFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof PlayerFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      if (mode === "create") {
        const slug = generateSlug(formData.name);

        const { error } = await supabase.from("players").insert({
          name: formData.name,
          slug,
          image_url: formData.image_url || null,
        });

        if (error) throw error;

        toast.success("Player created successfully!");
        router.push(ROUTES.admin.players);
        router.refresh();
      } else if (player) {
        const { error } = await supabase
          .from("players")
          .update({
            name: formData.name,
            image_url: formData.image_url || null,
          })
          .eq("id", player.id);

        if (error) throw error;

        toast.success("Player updated successfully!");
        router.push(ROUTES.admin.players);
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Add New Player" : "Edit Player"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter player name"
            error={errors.name}
            required
            disabled={isLoading}
          />

          <Input
            label="Profile Image URL"
            value={formData.image_url ?? ""}
            onChange={(e) => handleChange("image_url", e.target.value)}
            placeholder="https://example.com/image.jpg"
            error={errors.image_url}
            helperText="Optional. Enter a URL for the player's profile image."
            disabled={isLoading}
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isLoading}>
              {mode === "create" ? "Create Player" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

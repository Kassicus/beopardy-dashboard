"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import toast from "react-hot-toast";

interface SignOutButtonProps {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function SignOutButton({
  variant = "ghost",
  size = "sm",
  showIcon = true,
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSignOut() {
    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error("Failed to sign out");
      setIsLoading(false);
      return;
    }

    toast.success("Signed out successfully");
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      isLoading={isLoading}
      leftIcon={showIcon ? <LogOut className="h-4 w-4" /> : undefined}
    >
      Sign Out
    </Button>
  );
}

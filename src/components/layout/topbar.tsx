import { createClient } from "@/lib/supabase/server";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

export async function Topbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("iba_profiles")
    .select("full_name")
    .eq("id", user?.id ?? "")
    .single();

  const displayName = profile?.full_name || user?.email || "";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <MobileNav />
      <div className="flex-1" />
      <UserMenu displayName={displayName} />
    </header>
  );
}

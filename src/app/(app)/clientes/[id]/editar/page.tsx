import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientForm } from "@/components/clients/client-form";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("iba_clients")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!client) notFound();

  return (
    <div className="max-w-2xl mx-auto">
      <ClientForm client={client} />
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidNIF } from "@/lib/validators";

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const nif = (formData.get("nif") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) return { error: "O nome é obrigatório." };
  if (!nif) return { error: "O NIF é obrigatório." };
  if (!isValidNIF(nif)) return { error: "NIF inválido." };

  const { error } = await supabase.from("iba_clients").insert({
    user_id: user.id,
    name,
    nif,
    email,
    phone,
    address,
    notes,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um cliente com este NIF." };
    }
    return { error: "Erro ao criar cliente." };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = (formData.get("name") as string)?.trim();
  const nif = (formData.get("nif") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) return { error: "O nome é obrigatório." };
  if (!nif) return { error: "O NIF é obrigatório." };
  if (!isValidNIF(nif)) return { error: "NIF inválido." };

  const { error } = await supabase
    .from("iba_clients")
    .update({ name, nif, email, phone, address, notes })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um cliente com este NIF." };
    }
    return { error: "Erro ao atualizar cliente." };
  }

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("iba_clients")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erro ao eliminar cliente." };
  }

  revalidatePath("/clientes");
  redirect("/clientes");
}

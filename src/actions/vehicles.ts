"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isValidLicensePlate } from "@/lib/validators";

export async function createVehicleAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const clientId = formData.get("client_id") as string;
  const brand = (formData.get("brand") as string)?.trim();
  const model = (formData.get("model") as string)?.trim();
  const licensePlate = (formData.get("license_plate") as string)
    ?.trim()
    .toUpperCase();
  const registrationDate = (formData.get("registration_date") as string)?.trim();
  const iucMonth = parseInt(formData.get("iuc_month") as string);
  const iucAmountStr = (formData.get("iuc_amount") as string)?.trim();
  const iucAmount = iucAmountStr ? parseFloat(iucAmountStr) : null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!clientId) return { error: "Cliente é obrigatório." };
  if (!brand) return { error: "A marca é obrigatória." };
  if (!model) return { error: "O modelo é obrigatório." };
  if (!licensePlate) return { error: "A matrícula é obrigatória." };
  if (!isValidLicensePlate(licensePlate))
    return { error: "Formato de matrícula inválido." };
  if (!registrationDate)
    return { error: "A data de registo é obrigatória." };
  if (!iucMonth || iucMonth < 1 || iucMonth > 12)
    return { error: "Mês de pagamento inválido." };

  const { error } = await supabase.from("iba_vehicles").insert({
    client_id: clientId,
    user_id: user.id,
    brand,
    model,
    license_plate: licensePlate,
    registration_date: registrationDate,
    iuc_month: iucMonth,
    iuc_amount: iucAmount,
    notes,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um veículo com esta matrícula." };
    }
    return { error: "Erro ao adicionar veículo." };
  }

  revalidatePath(`/clientes/${clientId}`);
  revalidatePath("/dashboard");
  redirect(`/clientes/${clientId}`);
}

export async function updateVehicleAction(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const brand = (formData.get("brand") as string)?.trim();
  const model = (formData.get("model") as string)?.trim();
  const licensePlate = (formData.get("license_plate") as string)
    ?.trim()
    .toUpperCase();
  const registrationDate = (formData.get("registration_date") as string)?.trim();
  const iucMonth = parseInt(formData.get("iuc_month") as string);
  const iucAmountStr = (formData.get("iuc_amount") as string)?.trim();
  const iucAmount = iucAmountStr ? parseFloat(iucAmountStr) : null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!brand) return { error: "A marca é obrigatória." };
  if (!model) return { error: "O modelo é obrigatório." };
  if (!licensePlate) return { error: "A matrícula é obrigatória." };
  if (!isValidLicensePlate(licensePlate))
    return { error: "Formato de matrícula inválido." };
  if (!registrationDate)
    return { error: "A data de registo é obrigatória." };
  if (!iucMonth || iucMonth < 1 || iucMonth > 12)
    return { error: "Mês de pagamento inválido." };

  // Get the vehicle's client_id before updating
  const { data: vehicle } = await supabase
    .from("iba_vehicles")
    .select("client_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!vehicle) return { error: "Veículo não encontrado." };

  const { error } = await supabase
    .from("iba_vehicles")
    .update({
      brand,
      model,
      license_plate: licensePlate,
      registration_date: registrationDate,
      iuc_month: iucMonth,
      iuc_amount: iucAmount,
      notes,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um veículo com esta matrícula." };
    }
    return { error: "Erro ao atualizar veículo." };
  }

  revalidatePath(`/clientes/${vehicle.client_id}`);
  revalidatePath("/dashboard");
  redirect(`/clientes/${vehicle.client_id}`);
}

export async function deleteVehicleAction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get the vehicle's client_id before deleting
  const { data: vehicle } = await supabase
    .from("iba_vehicles")
    .select("client_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!vehicle) return { error: "Veículo não encontrado." };

  const { error } = await supabase
    .from("iba_vehicles")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erro ao eliminar veículo." };
  }

  revalidatePath(`/clientes/${vehicle.client_id}`);
  revalidatePath("/dashboard");
  redirect(`/clientes/${vehicle.client_id}`);
}

export async function markIucPaidAction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const vehicleId = formData.get("vehicle_id") as string;
  const year = parseInt(formData.get("year") as string);
  const amountStr = (formData.get("amount") as string)?.trim();
  const amount = amountStr ? parseFloat(amountStr) : 0;
  const paidAt = (formData.get("paid_at") as string) || new Date().toISOString().split("T")[0];
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!vehicleId) return { error: "Veículo é obrigatório." };
  if (!year) return { error: "Ano é obrigatório." };
  if (amount <= 0) return { error: "Valor deve ser superior a 0." };

  const { error } = await supabase.from("iba_iuc_payments").insert({
    vehicle_id: vehicleId,
    user_id: user.id,
    year,
    amount,
    paid_at: paidAt,
    notes,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "O IUC deste ano já está registado como pago." };
    }
    return { error: "Erro ao registar pagamento." };
  }

  // Get vehicle to revalidate client page
  const { data: vehicle } = await supabase
    .from("iba_vehicles")
    .select("client_id")
    .eq("id", vehicleId)
    .single();

  if (vehicle) {
    revalidatePath(`/clientes/${vehicle.client_id}`);
  }
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteIucPaymentAction(paymentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: payment } = await supabase
    .from("iba_iuc_payments")
    .select("vehicle_id")
    .eq("id", paymentId)
    .eq("user_id", user.id)
    .single();

  if (!payment) return { error: "Pagamento não encontrado." };

  const { error } = await supabase
    .from("iba_iuc_payments")
    .delete()
    .eq("id", paymentId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Erro ao eliminar pagamento." };
  }

  const { data: vehicle } = await supabase
    .from("iba_vehicles")
    .select("client_id")
    .eq("id", payment.vehicle_id)
    .single();

  if (vehicle) {
    revalidatePath(`/clientes/${vehicle.client_id}`);
  }
  revalidatePath("/dashboard");

  return { success: true };
}

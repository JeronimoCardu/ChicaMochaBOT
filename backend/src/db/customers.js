import { supabase } from "./supabase.js";

// Argentina = UTC-3 (sin DST)
const ARG_OFFSET_MS = -3 * 60 * 60 * 1000;

function todayArgentina() {
  return new Date(Date.now() + ARG_OFFSET_MS).toISOString().slice(0, 10); // YYYY-MM-DD
}

function dateArgentina(isoString) {
  return new Date(new Date(isoString).getTime() + ARG_OFFSET_MS)
    .toISOString()
    .slice(0, 10);
}

// ─── Consultas ────────────────────────────────────────────────────────────────

export async function getCustomer(phone) {
  const { data } = await supabase
    .from("customers")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();
  return data || null;
}

export async function getOrCreateCustomer(phone) {
  const existing = await getCustomer(phone);
  if (existing) return existing;

  const { data, error } = await supabase
    .from("customers")
    .insert({ phone })
    .select()
    .single();

  if (error) {
    // Concurrencia: otro proceso ya insertó → retornar el existente
    if (error.code === "23505") return await getCustomer(phone);
    throw error;
  }
  return data;
}

// ─── Lógica de bienvenida ─────────────────────────────────────────────────────

export function shouldSendDailyWelcome(customer) {
  if (!customer)                         return true;
  if (!customer.last_welcome_sent_at)    return true;
  return dateArgentina(customer.last_welcome_sent_at) !== todayArgentina();
}

export async function updateLastWelcomeSent(phone) {
  const { error } = await supabase
    .from("customers")
    .update({ last_welcome_sent_at: new Date().toISOString() })
    .eq("phone", phone);
  if (error) throw error;
}

export async function updateCustomerName(phone, name) {
  if (!name?.trim()) return;
  const { error } = await supabase
    .from("customers")
    .update({ name: name.trim() })
    .eq("phone", phone);
  if (error) throw error;
}

// ─── Estado de confirmación de cancelación ────────────────────────────────────

export async function setPendingCancelConfirmation(phone, orderId) {
  const { error } = await supabase
    .from("customers")
    .update({ waiting_cancel_confirmation: true, pending_cancel_order_id: orderId })
    .eq("phone", phone);
  if (error) throw error;
}

export async function clearPendingCancelConfirmation(phone) {
  const { error } = await supabase
    .from("customers")
    .update({ waiting_cancel_confirmation: false, pending_cancel_order_id: null })
    .eq("phone", phone);
  if (error) throw error;
}

// ─── Estado de confirmación pendiente ────────────────────────────────────────

export async function setPendingConfirmation(phone, pendingOrderData) {
  const { error } = await supabase
    .from("customers")
    .update({ waiting_new_order_confirmation: true, pending_new_order_data: pendingOrderData })
    .eq("phone", phone);
  if (error) throw error;
}

export async function clearPendingConfirmation(phone) {
  const { error } = await supabase
    .from("customers")
    .update({ waiting_new_order_confirmation: false, pending_new_order_data: null })
    .eq("phone", phone);
  if (error) throw error;
}

// ─── Estado de confirmación de modificación de pedido ─────────────────────────

export async function setPendingModification(phone, modificationData) {
  const { error } = await supabase
    .from("customers")
    .update({ waiting_modification_confirmation: true, pending_modification_data: modificationData })
    .eq("phone", phone);
  if (error) throw error;
}

export async function clearPendingModification(phone) {
  const { error } = await supabase
    .from("customers")
    .update({ waiting_modification_confirmation: false, pending_modification_data: null })
    .eq("phone", phone);
  if (error) throw error;
}

// ─── Mensajes de bienvenida ───────────────────────────────────────────────────

const BODY = `Recordá que los pedidos pasan a la cocina una vez indicada la ORDEN, DIRECCIÓN Y APELLIDO.

🛵 Venir a retirar por el local SIEMPRE es más rápido.
📱NO atendemos llamados, tené paciencia, ya vamos a llegar a tu mensaje.`;

export function buildWelcomeMessage(customer) {
  const firstName = customer?.name?.split(" ")[0];

  const greeting = firstName
    ? `Buenassss ${firstName}! Soy tu Asistente Virtual de ChicaMocha, permitime tomar tu pedido 🍔🍟`
    : `Buenassss! Soy tu Asistente Virtual de ChicaMocha, permitime tomar tu pedido 🍔🍟`;

  const nameRequest = firstName
    ? ""
    : "\n\n¿Podrías decirme tu nombre o apellido así te registramos?";

  return `${greeting}\n\n${BODY}${nameRequest}`;
}

import { Message } from "@/types";

const TZ = "America/Argentina/Buenos_Aires";

function dayKey(date: Date): string {
  return date.toLocaleDateString("es-AR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getDayLabel(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const key = dayKey(date);
  if (key === dayKey(today))     return "Hoy";
  if (key === dayKey(yesterday)) return "Ayer";

  return date.toLocaleDateString("es-AR", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type MessageDayGroup = {
  label: string;
  messages: Message[];
};

export function groupMessagesByDay(messages: Message[]): MessageDayGroup[] {
  const groups: MessageDayGroup[] = [];

  for (const msg of messages) {
    const label = getDayLabel(new Date(msg.created_at));
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.messages.push(msg);
    } else {
      groups.push({ label, messages: [msg] });
    }
  }

  return groups;
}

// Lógica para grabación y transmisión de audios cortos (mensajes de voz)
import { supabase } from "@/integrations/supabase/client";

export async function uploadVoiceMessage(blob: Blob, roomCode: string, playerId: string) {
  const fileName = `${roomCode}/${playerId}_${Date.now()}.webm`;

  // 1. Subir a Supabase Storage
  const { data, error } = await supabase.storage
    .from("voice_messages")
    .upload(fileName, blob);

  if (error) throw error;

  // 2. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage
    .from("voice_messages")
    .getPublicUrl(fileName);

  // 3. Emitir evento por Realtime Broadcast
  await supabase.channel(`room-${roomCode.toUpperCase()}`).send({
    type: "broadcast",
    event: "voice-message",
    payload: { url: publicUrl, senderId: playerId }
  });

  return publicUrl;
}

export function subscribeToVoiceMessages(roomCode: string, onMessage: (url: string, senderId: string) => void) {
  const channel = supabase.channel(`room-${roomCode.toUpperCase()}`)
    .on("broadcast", { event: "voice-message" }, ({ payload }) => {
      onMessage(payload.url, payload.senderId);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

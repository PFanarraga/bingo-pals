import { supabase } from "@/integrations/supabase/client";

const BUCKET = "voice_messages";
const MAX_VOICE_DURATION_MS = 10000; // 10 segundos

/**
 * Sube un audio y gestiona la rotación de 2 mensajes por persona.
 * Elimina el más antiguo si ya existen 2.
 */
export async function uploadAndBroadcastVoice(blob: Blob, roomCode: string, playerId: string) {
  const folder = roomCode.toUpperCase();
  const timestamp = Date.now();
  const fileName = `${folder}/${playerId}_${timestamp}.webm`;

  // 1. Obtener lista de archivos actuales del jugador en esta sala
  const { data: existingFiles } = await supabase.storage
    .from(BUCKET)
    .list(folder, { search: playerId });

  if (existingFiles && existingFiles.length >= 2) {
    // Ordenar por fecha (nombre contiene el timestamp) y borrar los más antiguos
    const sorted = existingFiles.sort((a, b) => a.name.localeCompare(b.name));
    const toDelete = sorted.slice(0, (existingFiles.length - 2) + 1);

    for (const file of toDelete) {
      await supabase.storage.from(BUCKET).remove([`${folder}/${file.name}`]);
    }
  }

  // 2. Subir el nuevo audio
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, blob);
  if (error) throw error;

  // 3. Obtener URL pública
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(fileName);

  // 4. Emitir evento por Realtime
  await supabase.channel(`room-${folder}`).send({
    type: "broadcast",
    event: "voice-message",
    payload: { url: publicUrl, senderId: playerId }
  });

  return publicUrl;
}

/** Limpia todos los audios de una sala (para cuando termina la partida). */
export async function deleteRoomStorage(roomCode: string) {
  const folder = roomCode.toUpperCase();
  const { data: files } = await supabase.storage.from(BUCKET).list(folder);

  if (files && files.length > 0) {
    const paths = files.map(f => `${folder}/${f.name}`);
    await supabase.storage.from(BUCKET).remove(paths);
  }
}

/** Suscripción a mensajes entrantes. */
export function onVoiceMessage(roomCode: string, callback: (url: string, senderId: string) => void) {
  const folder = roomCode.toUpperCase();
  const channel = supabase.channel(`room-${folder}`)
    .on("broadcast", { event: "voice-message" }, ({ payload }) => {
      callback(payload.url, payload.senderId);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Utilidad para grabar audio con límite de tiempo. Solo funciona en el cliente. */
export function createRecorder(onStop: (blob: Blob) => void) {
  if (typeof window === "undefined" || !window.MediaRecorder) return null;

  let recorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let timer: ReturnType<typeof setTimeout>;

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder = new MediaRecorder(stream);
      chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        onStop(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();

      // Límite automático de 10 segundos
      timer = setTimeout(() => stop(), MAX_VOICE_DURATION_MS);
    } catch (err) {
      console.error("[Voice] Error al iniciar grabación:", err);
      throw err;
    }
  };

  const stop = () => {
    if (recorder && recorder.state === "recording") {
      recorder.stop();
      clearTimeout(timer);
    }
  };

  return { start, stop };
}

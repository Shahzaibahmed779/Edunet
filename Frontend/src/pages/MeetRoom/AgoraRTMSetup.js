import { createClient } from 'agora-rtm-react';

const appId = import.meta.env.VITE_AGORA_APP_ID;
if (!appId) {
    throw new Error("VITE_AGORA_APP_ID environment variable is required");
}
const token = import.meta.env.VITE_AGORA_TOKEN || null;
export const config = { mode: "rtc", codec: "vp8", appId, token };
export const useRTMClient = createClient(appId);
import { createClient, createMicrophoneAndCameraTracks, createScreenVideoTrack } from "agora-rtc-react";

import AgoraRTM from 'agora-rtm-sdk';

const appId = import.meta.env.VITE_AGORA_APP_ID;
const token = import.meta.env.VITE_AGORA_TOKEN || null;
if (!appId) {
    throw new Error("VITE_AGORA_APP_ID environment variable is required");
}
export const config = { mode: "rtc", codec: "vp8", appId, token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const useScreenVideoTrack = createScreenVideoTrack();


export const rtmClient = AgoraRTM.createInstance(appId);

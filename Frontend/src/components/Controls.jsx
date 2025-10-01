import { useContext, useEffect, useRef, useState } from "react";
import './MeetPage.css';
import { Button } from "@mui/base";
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { SocketContext } from '../context/SocketContext';
import { useNavigate } from "react-router-dom";

export default function Controls(props) {
  const { tracks, client, setStart, setInCall, participantsListOpen, setParticipantsListOpen } = useContext(SocketContext);
  const [trackState, setTrackState] = useState({ video: true, audio: true });

  // Conference controls (video and audio)
  const mute = async (type) => {
    if (type === "audio") {
      await tracks[0].setEnabled(!trackState.audio);
      setTrackState((ps) => {
        return { ...ps, audio: !ps.audio };
      });
    } else if (type === "video") {
      await tracks[1].setEnabled(!trackState.video);
      setTrackState((ps) => {
        return { ...ps, video: !ps.video };
      });
    }
  };

  const navigate = useNavigate();

  const leaveChannel = async () => {
    await client.leave();
    client.removeAllListeners();
    tracks[0].close();
    tracks[1].close();
    setStart(false);
    setInCall(false);
    navigate('/subjectspage');
  };

  return (
    <div className="controls-page">
      <div className="controllers-video-part">
        <Button
          variant="contained"
          color={trackState.audio ? "primary" : "secondary"}
          onClick={() => mute("audio")}
        >
          {trackState.audio ? (
            <MicIcon />
          ) : (
            <MicOffIcon />
          )}
        </Button>

        <Button
          variant="contained"
          color={trackState.video ? "primary" : "secondary"}
          onClick={() => mute("video")}
        >
          {trackState.video ? (
            <VideocamIcon />
          ) : (
            <VideocamOffIcon />
          )}
        </Button>

        <Button
          variant="contained"
          color="default"
          onClick={() => leaveChannel()}
        >
          <LogoutIcon />
        </Button>
      </div>

      <div className="controllers-chat-participants">
        <button
          onClick={() => {
            setParticipantsListOpen(!participantsListOpen);
          }}
        >
          <PersonIcon />
        </button>
      </div>
    </div>
  );
}

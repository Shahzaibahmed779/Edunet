import React, { useContext, useEffect, useState } from "react";
import "./MeetRoom.css";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import { config } from "./AgoraSetup";
import VideoPlayer from "../../components/VideoPlayer";
import Controls from "../../components/Controls";
import Participants from "../../components/Participants";
import Chat from "../../components/Chat";
import axios from "axios";

const MeetRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [transcription, setTranscription] = useState("");
  const [classroomId, setClassroomId] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const { socket, setInCall, client, users, setUsers, ready, tracks, setStart, setParticipants, start } =
    useContext(SocketContext);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    socket.emit("join-room", { userId, roomId: id });

    socket.on("user-joined", async () => {
      setInCall(true);
      console.log("✅ A user joined the room. Fetching participants...");
      socket.emit("get-participants", { roomId: id }); // 🔥 Fetch participants
    });

    socket.emit("get-participants", { roomId: id }); // 🔥 Fetch immediately

    socket.on("participants-list", async ({ usernames, roomName }) => {
      console.log("✅ Participants Received:", usernames);
      setParticipants(usernames);
      setRoomName(roomName);
    });

    return () => {
      socket.emit("leave-room", { userId, roomId: id });
      socket.off("user-joined");
      socket.off("participants-list");
    };
  }, [socket]);


  useEffect(() => {
    const init = async (name) => {
      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setUsers((prevUsers) => [...prevUsers, user]);
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.stop();
        }
        if (mediaType === "video") {
          setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        }
      });

      client.on("user-left", (user) => {
        socket.emit("user-left-room", { userId: user.uid, roomId: id });
        setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
      });

      try {
        await client.join(config.appId, name, config.token, userId);
      } catch (error) {
        console.error("Agora Join Error:", error);
      }

      if (tracks) await client.publish([tracks[0], tracks[1]]);
      setStart(true);
    };

    if (ready && tracks) {
      try {
        init(id);
      } catch (error) {
        console.error(error);
      }
    }

    // Fetch the classroom ID associated with this meeting
    const fetchClassroomId = async () => {
      try {
        const response = await axios.post("http://localhost:5000/getMeetingClassroom", {
          roomId: id
        });
        if (response.data && response.data.classroomId) {
          console.log("✅ Found classroom ID:", response.data.classroomId);
          setClassroomId(response.data.classroomId);
        }
      } catch (error) {
        console.error("❌ Error fetching classroom ID:", error);
      }
    };

    fetchClassroomId();
  }, [id, client, ready, tracks]);

  // **Start Recording**
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      console.log("✅ Audio Stream:", stream);

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      let localChunks = [];

      recorder.ondataavailable = (event) => {
        console.log("🎤 Data Available Event Triggered:", event);
        if (event.data.size > 0) {
          localChunks.push(event.data);
          console.log("📂 Audio Chunk Added:", event.data);
        }
      };

      recorder.onstop = async () => {
        console.log("🛑 Recording Stopped.");

        if (localChunks.length === 0) {
          alert("❌ No audio recorded! Check microphone access.");
          return;
        }

        const audioBlob = new Blob(localChunks, { type: "audio/webm" });

        console.log("🎙 Recorded Blob:", audioBlob);
        console.log("Blob Size:", audioBlob.size, "bytes");

        if (audioBlob.size === 0) {
          alert("Recording failed. No valid audio recorded.");
          return;
        }

        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("roomId", id);

        try {
          const response = await axios.post("http://localhost:5000/uploadAudio", formData);
          setTranscription(response.data.transcription);

          // Check if we have a processedTranscriptionUrl and classroomId to post as an announcement
          if (response.data.processedTranscriptionUrl && classroomId) {
            try {
              // Post the transcription URL as an announcement to the classroom
              await axios.post("http://localhost:5000/createAnnouncement", {
                privateclassroomid: classroomId,
                announcementdata: `📝 Meeting transcription available: <a href="${response.data.processedTranscriptionUrl}" target="_blank">View Transcription</a>`,
                email: user.email,
              });
              console.log("📢 Transcription announcement posted to classroom!");
            } catch (announcementError) {
              console.error("❌ Error posting transcription announcement:", announcementError);
            }
          } else {
            console.log("⚠️ Missing data to post transcription announcement:", {
              hasUrl: !!response.data.processedTranscriptionUrl,
              hasClassroomId: !!classroomId
            });
          }
        } catch (error) {
          console.error("❌ Error uploading audio:", error);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(localChunks);
      setIsRecording(true);
      console.log("🔴 Recording Started...");
    } catch (error) {
      console.error("❌ Microphone Error:", error);
      alert("Recording failed. Please check your microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="meetPage">
      <button className="back-button-meet" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="meetPage-header">
        <h3>
          Meet: <span>{roomName}</span>
        </h3>
        <p>
          Meet Id: <span id="meet-id-copy">{id}</span>
        </p>
      </div>

      {/* <Participants /> */}
      {/* <Chat roomId={id} userId={userId} /> */}

      <div className="meetPage-videoPlayer-container">
        {start && tracks ? <VideoPlayer tracks={tracks} users={users} /> : ""}
      </div>

      <div className="meetPage-controls-part">
        {ready && tracks && <Controls tracks={tracks} />}
      </div>

      <div className="record-controls">
        {!isRecording ? (
          <button onClick={startRecording} className="record-btn">
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="stop-btn">
            Stop & Upload
          </button>
        )}
      </div>


      {transcription && (
        <div className="transcription-container">
          <h4>Transcription:</h4>
          <p>{transcription}</p>
        </div>
      )}
    </div>
  );
};

export default MeetRoom;

import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../components/ToastProvider";
import api from "../services/api";
import InfoSection from "../components/InfoSection";
import "./Home.css";

export default function Home() {
  const toast = useToast();

  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [tone, setTone] = useState("professional");
  const [language, setLanguage] = useState("english");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("access");

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setInput((prev) => (prev ? prev + " " + text : text));
      };

      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.stop?.();
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch (e) {}
      }
    };
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) return toast("Speech recognition not supported", "error");
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  // ---- Rewrite ----
  const handleRewrite = async () => {
    if (!isLoggedIn) {
      toast("Please register or login first", "error");
      return;
    }

    if (!input.trim()) return toast("Enter text to rewrite", "error");

    setLoading(true);
    try {
      const res = await api.rewrite({ text: input, tone, language });
      const out =
        res.data?.rewritten_text ||
        res.data?.text ||
        res.data?.rewritten ||
        (typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      setResult(out);
      toast("Rewrite complete", "success");
    } catch (err) {
      console.error(err);
      toast("Rewrite failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---- Save history ----
  const handleSave = async () => {
    if (!isLoggedIn) {
      toast("Please register or login first", "error");
      return;
    }

    if (!result.trim()) return toast("Nothing to save", "error");

    setSaving(true);
    try {
      await api.saveHistory({ original_text: input, rewritten_text: result, tone });
      toast("Saved to history", "success");
    } catch (err) {
      console.error(err);
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // ---- Play / Text→Voice ----
  const handlePlay = async () => {
    if (!isLoggedIn) {
      toast("Please register or login first", "error");
      return;
    }
    if (!result.trim()) return toast("Nothing to play", "error");
    setPlaying(true);

    // cleanup previous audio
    if (audioRef.current) {
      try { audioRef.current.pause(); } catch (e) {}
      audioRef.current = null;
    }

    try {
      console.log("==> handlePlay: requesting textToVoice");
      const res = await api.textToVoice({ text: result, language: language.slice(0, 2) });
      console.log("==> textToVoice response object:", res);
      console.log("==> status:", res?.status, "content-type:", res?.headers?.["content-type"]);

      let blob = null;

      // 1) ArrayBuffer (axios responseType: 'arraybuffer')
      if (res && res.data && (res.data instanceof ArrayBuffer || (res.data.buffer && res.data.byteLength))) {
        const arrayBuffer = res.data instanceof ArrayBuffer ? res.data : res.data.buffer;
        const contentType = (res.headers && res.headers["content-type"]) || "audio/mpeg";
        console.log("==> building blob from ArrayBuffer, contentType=", contentType);
        blob = new Blob([arrayBuffer], { type: contentType });
      }
      // 2) JSON with audio_base64
      else if (res && res.data && (res.data.audio_base64 || res.data.audioBase64)) {
        const b64 = res.data.audio_base64 || res.data.audioBase64;
        console.log("==> got audio_base64, length:", b64.length);
        const bytes = atob(b64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        blob = new Blob([arr.buffer], { type: "audio/mpeg" });
      }
      // 3) string URL returned
      else if (res && typeof res.data === "string" && (res.data.startsWith("http") || res.data.startsWith("/"))) {
        console.log("==> got URL (string), playing via playUrl:", res.data);
        playUrl(res.data);
        return;
      }
      // 4) Blob itself
      else if (res && res.data instanceof Blob) {
        console.log("==> response is Blob");
        blob = res.data;
      }
      // 5) res.data is stringified JSON containing base64/url
      else if (typeof res.data === "string") {
        try {
          const parsed = JSON.parse(res.data);
          console.log("==> parsed stringified JSON:", parsed);
          if (parsed.audio_base64 || parsed.audioBase64) {
            const b64 = parsed.audio_base64 || parsed.audioBase64;
            const bytes = atob(b64);
            const arr = new Uint8Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
            blob = new Blob([arr.buffer], { type: "audio/mpeg" });
          } else if (parsed.url) {
            playUrl(parsed.url);
            return;
          }
        } catch (e) {
          console.log("==> res.data is string but not JSON; content preview:", res.data.slice ? res.data.slice(0, 200) : res.data);
        }
      }

      if (!blob) {
        console.error("==> No audio blob created. Response:", res);
        toast("Voice generation returned no playable audio", "error");
        setPlaying(false);
        return;
      }

      const url = URL.createObjectURL(blob);
      console.log("==> created object URL:", url, " - opening for debug and attempting play");

      // open debug tab so you can download & inspect audio if needed
      try { window.open(url, "_blank"); } catch (e) { console.log("open tab failed:", e); }

      const audio = new Audio(url);
      audioRef.current = audio;
      try { audio.crossOrigin = "anonymous"; } catch (e) {}

      audio.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = (ev) => {
        console.error("==> audio playback error:", ev);
        toast("Playback failed", "error");
        setPlaying(false);
        URL.revokeObjectURL(url);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("==> audio.play() started");
          })
          .catch((err) => {
            console.error("==> audio.play() rejected:", err);
            toast("Playback failed (autoplay/format)", "error");
            setPlaying(false);
            // debug tab remains open for inspection
          });
      }
    } catch (err) {
      console.error("==> handlePlay caught error:", err);
      toast("Voice generation failed", "error");
      setPlaying(false);
    }
  };

  const playUrl = (url) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlaying(true);
    audio.onended = () => setPlaying(false);
    audio.onerror = () => {
      toast("Playback failed", "error");
      setPlaying(false);
    };
    audio.play().catch((e) => {
      console.error("playUrl playback error:", e);
      toast("Playback failed", "error");
      setPlaying(false);
    });
  };

  const handleUploadSpeechFile = async (file) => {
    if (!file) return;
    try {
      // if API expects FormData, create and pass FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("language", language.slice(0, 2));
      const res = await api.speechToText(formData);
      const text = res.data?.text || res.data?.transcript || res.data?.result || "";
      if (text) setInput((prev) => (prev ? prev + " " + text : text));
      toast(text ? "Audio transcribed" : "No transcription received", text ? "success" : "error");
    } catch (err) {
      console.error(err);
      toast("Audio transcription failed", "error");
    }
  };

  const handleExportTxt = (content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rewritten.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="home-container">
      <div className="top-grid">
        {/* Original Text */}
        <div className="card-block">
          <h3>Original Text</h3>
          <textarea
            className="main-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type your text..."
          />
          <div className="controls">
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="select">
              <option value="professional">Professional</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
            </select>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select">
              <option value="english">English</option>
              <option value="telugu">Telugu</option>
              <option value="hindi">Hindi</option>
            </select>

            
            

            <button onClick={handleRewrite} disabled={loading} className="btn btn-accent">
              {loading ? "Rewriting..." : "Rewrite"} ✨
            </button>
          </div>
        </div>

        {/* Improved Text */}
        <div className="card-block">
          <h3>Improved Text</h3>
          <textarea
            className="main-textarea"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="Improved text will appear here..."
          />
          <div className="controls">
            
            <button className="btn-outline" onClick={(e) => { e.preventDefault(); handleExportTxt(result); }} disabled={!result}>
              Export TXT 📤
            </button>
            <button className="btn btn-accent" onClick={handleSave} disabled={saving || !result.trim()}>
              {saving ? "Saving..." : "Save 💾"}
            </button>
          </div>
        </div>
      </div>

      <InfoSection />
    </div>
  );
}

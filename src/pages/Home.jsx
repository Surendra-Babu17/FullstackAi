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

  const [loading, setLoading] = useState(false); // rewrite
  const [saving, setSaving] = useState(false); // save history
  const [playing, setPlaying] = useState(false); // play audio
  const audioRef = useRef(null);

  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new SR();
      r.continuous = false;
      r.interimResults = false;
      r.lang = "en-US";
      r.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setInput((p) => (p ? p + " " + text : text));
      };
      r.onend = () => setListening(false);
      recognitionRef.current = r;
    }
    // cleanup on unmount
    return () => {
      if (recognitionRef.current && recognitionRef.current.stop) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current = null;
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

  // ---- Rewrite (AI) ----
  const handleRewrite = async () => {
    if (!input.trim()) return toast("Enter text to rewrite", "error");
    const token = localStorage.getItem("access");
    if (!token) return toast("Please login/register to use this feature", "error");
    setLoading(true);
    try {
      const res = await api.rewrite({ text: input, tone, language });
      const out = res.data?.rewritten_text || res.data?.text || res.data?.rewritten || (typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      setResult(out);
      toast("Rewrite complete", "success");
    } catch (err) {
      console.error("Rewrite error:", err?.response?.data || err.message);
      toast("Rewrite failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---- Save history ----
  const handleSave = async () => {
    if (!result || !result.trim()) return toast("Nothing to save", "error");
    setSaving(true);
    try {
      await api.saveHistory({ original_text: input || "", rewritten_text: result, tone });
      toast("Saved to history", "success");
    } catch (err) {
      console.error("Save history error:", err?.response?.data || err.message);
      toast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // ---- Play / Text → Voice ----
  const handlePlay = async () => {
    if (!result || !result.trim()) return toast("Nothing to play", "error");
    setPlaying(true);

    // stop previous audio if any
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = "";
      } catch {}
      audioRef.current = null;
    }

    try {
      const res = await api.textToVoice({ text: result, language: language.slice(0, 2) || "en" });

      // res.data might be a Blob, base64, or an URL string.
      let blob = null;
      if (res.data instanceof Blob) {
        blob = res.data;
      } else if (res.data && typeof res.data === "object" && res.data.audio_base64) {
        // backend returned base64 in JSON: { audio_base64: "..." }
        const b64 = res.data.audio_base64;
        const bytes = atob(b64);
        const len = bytes.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) arr[i] = bytes.charCodeAt(i);
        blob = new Blob([arr.buffer], { type: "audio/mpeg" });
      } else if (typeof res.data === "string" && (res.data.startsWith("http") || res.data.startsWith("/"))) {
        // backend returned a URL (absolute or relative)
        playUrl(res.data);
        return;
      } else if (res.request && res.request.responseType === "blob" && res.data) {
        // sometimes res.data not instance of Blob but contains binary
        blob = res.data;
      } else {
        // last-resort: try to create blob from response
        try {
          blob = new Blob([res.data], { type: "audio/mpeg" });
        } catch (e) {
          console.error("Couldn't create blob from response:", e);
        }
      }

      if (!blob) throw new Error("No audio returned from server");

      const url = URL.createObjectURL(blob);
      const audio = new Audio();
      audioRef.current = audio;
      audio.src = url;
      audio.onended = () => {
        setPlaying(false);
        // revoke url after slight delay
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      };
      audio.onerror = (e) => {
        console.error("Audio playback error", e);
        toast("Playback failed", "error");
        setPlaying(false);
        setTimeout(() => URL.revokeObjectURL(url), 1500);
      };

      // start playback
      await audio.play();
      // playing state will be cleared onended or onerror
    } catch (err) {
      console.error("TextToVoice / play error:", err?.response?.data || err.message || err);
      toast("Voice generation failed", "error");
      setPlaying(false);
    }
  };

  // helper to play returned URL
  const playUrl = (audioUrl) => {
    try {
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current = null;
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlaying(true);
      audio.onended = () => setPlaying(false);
      audio.onerror = (e) => {
        console.error("Audio URL playback error", e);
        toast("Playback failed", "error");
        setPlaying(false);
      };
      audio.play().catch((e) => {
        console.error("Play rejected:", e);
        toast("Playback failed", "error");
        setPlaying(false);
      });
    } catch (e) {
      console.error("playUrl error", e);
      toast("Playback failed", "error");
    }
  };

  // ---- Upload speech file -> transcribe ----
  const handleUploadSpeechFile = async (file) => {
    if (!file) return;
    try {
      const resp = await api.speechToText({ file, language: language.slice(0, 2) });
      const txt = resp.data?.text || resp.data?.transcript || resp.data?.result || "";
      if (txt) {
        setInput((p) => (p ? p + " " + txt : txt));
        toast("Audio transcribed", "success");
      } else {
        toast("No transcription received", "error");
      }
    } catch (err) {
      console.error("speechToText error:", err?.response?.data || err.message);
      toast("Audio transcription failed", "error");
    }
  };

  // ---- Export TXT helper ----
  const handleExportTxt = (content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rewritten.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <div className="home-container">
      <div className="top-grid">
        <div className="card-block">
          <div className="badge-row">
            <span className="section-badge">Original ✨</span>
            <div className="meta">Input</div>
          </div>
          <h3 className="section-title">Original Text</h3>

          <textarea
            className="main-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste or type your text..."
          />

          <div className="controls">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="select"
              style={{ backgroundColor: "blue", color: "white" }}
            >
              <option value="professional">Professional</option>
              <option value="formal">Formal</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="concise">Concise</option>
            </select>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="select"
              style={{ backgroundColor: "blue", color: "white" }}
            >
              <option value="english">English</option>
              <option value="telugu">Telugu</option>
              <option value="hindi">Hindi</option>
            </select>

            <button type="button" onClick={toggleListen} className="btn btn-black">
              {listening ? "Stop Mic" : "Speak"} 🔊
            </button>

            <label className="btn btn-black file-label">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleUploadSpeechFile(e.target.files?.[0])}
                className="hidden-file"
              />
              Upload audio 📁
            </label>

            <button onClick={handleRewrite} disabled={loading} className="btn btn-accent">
              {loading ? "Rewriting..." : "Rewrite"} ✨
            </button>
          </div>
        </div>

        <div className="card-block">
          <div className="badge-row">
            <span className="section-badge">Improved ✨</span>
            <div className="meta">Output</div>
          </div>

          <h3 className="section-title">Improved Text</h3>

          <textarea
            className="main-textarea"
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="Improved text will appear here..."
          />

          <div className="right-actions">
            <button
              className="btn-outline"
              onClick={() => handlePlay()}
              disabled={playing}
            >
              {playing ? "Playing..." : "Play ▶️"}
            </button>

          

            <button
              className="btn-outline"
              onClick={(e) => {
                e.preventDefault();
                handleExportTxt(result);
              }}
            >
              Export TXT 📤
            </button>
          </div>
        </div>
      </div>

      <InfoSection />
    </div>
  );
}

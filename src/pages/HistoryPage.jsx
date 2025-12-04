import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

export default function HistoryPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await api.getHistory();
      setItems(res.data || []);
    } catch {
      toast("Failed to load history", "error");
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const del = async (id) => {
    try { await api.deleteHistory(id); toast("Deleted", "success"); fetchHistory(); }
    catch { toast("Delete failed", "error"); }
  };

  const downloadPdf = async (id, title = "rewritten.pdf") => {
    try {
      const res = await api.exportPdf(id);
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a"); a.href = url; a.download = title; a.click();
    } catch { toast("PDF download failed", "error"); }
  };

  return (
    <div className="history-wrap">
      <h2>Your rewrite history</h2>
      <div className="history-list">
        {items.length === 0 ? <div className="muted">No history yet</div> : items.map((it) => (
          <div key={it.id} className="history-item">
            <div className="history-meta">Tone: {it.tone}</div>
            <div className="history-text">{it.rewritten_text}</div>
            <div className="history-actions">
              <button onClick={() => navigator.clipboard.writeText(it.rewritten_text)}>Copy</button>
              <button onClick={() => del(it.id)} className="danger">Delete</button>
              <button onClick={() => downloadPdf(it.id, `rewritten-${it.id}.pdf`)}>Download PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

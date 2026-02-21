import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useToast } from "../components/ToastProvider";

export default function HistoryPage() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveText, setSaveText] = useState("");

  // ✅ Fetch history (SAFE)
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory();

      // 🔥 MAIN FIX (Array check)
      if (Array.isArray(res.data)) {
        setItems(res.data);
      } else if (Array.isArray(res.data?.data)) {
        setItems(res.data.data);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      toast("Failed to load history", "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Delete history
  const del = async (id) => {
    try {
      await api.deleteHistory(id);
      toast("Deleted", "success");
      fetchHistory();
    } catch (err) {
      console.error(err);
      toast("Delete failed", "error");
    }
  };

  // Save manual text
  const handleSave = async () => {
    if (!saveText.trim()) {
      return toast("Enter text to save", "error");
    }

    try {
      const res = await api.saveHistory({
        original_text: saveText,
        rewritten_text: saveText,
        tone: "manual",
      });

      toast("Saved successfully", "success");

      // ✅ SAFE immediate update
      if (res?.data) {
        setItems((prev) => [res.data, ...prev]);
      }

      setSaveText("");
    } catch (err) {
      console.error(err);
      toast("Save failed", "error");
    }
  };

  // 🔥 LOADING STATE (prevents black page)
  if (loading) {
    return <div style={{ padding: 20 }}>Loading history...</div>;
  }

  return (
    <div className="history-wrap">
      <h2>Your rewrite history 📄</h2>

      {/* Save new text */}
      {/* <div style={{ marginBottom: 16 }}>
        <textarea
          value={saveText}
          onChange={(e) => setSaveText(e.target.value)}
          placeholder="Enter text to save"
          rows={4}
          maxLength={30000}
        />

        <button onClick={handleSave}>Save</button>
      </div> */}

      {/* History list */}
      <div className="history-list">
        {items.length === 0 ? (
          <div>No history yet</div>
        ) : (
          items.map((it, index) => (
            <div key={it.id || index} className="history-item">
              <div>
                <b>Tone:</b> {it.tone || "N/A"}
              </div>

              <div style={{ margin: "8px 0" }}>
                {it.rewritten_text || it.original_text || "-"}
              </div>

              <div>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      it.rewritten_text || it.original_text || ""
                    )
                  }
                >
                  Copy
                </button>

                <button onClick={() => del(it.id)}>Delete</button>

                <button
                  onClick={async () => {
                    try {
                      const res = await api.exportPdf(it.id);
                      const url = window.URL.createObjectURL(res.data);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `rewritten-${it.id}.pdf`;
                      a.click();
                    } catch {
                      toast("PDF download failed", "error");
                    }
                  }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
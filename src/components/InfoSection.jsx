import React from "react";

export default function InfoSection() {
  return (
    <section className="info-grid">
      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-3">How to use this website</h3>
        <ol className="list-decimal ml-5 space-y-2 text-white/90">
          <li>Register or Login — create your account to save history.</li>
          <li>Paste or type the text you want to rewrite into the left textarea.</li>
          <li>Choose a <strong>tone</strong> (Professional, Friendly, Casual, etc.) and <strong>language</strong>.</li>
          <li>Use the <em>Speak</em> button to add voice input or upload an audio file for transcription.</li>
          <li>Click <strong>Rewrite</strong> to generate improved text with AI.</li>
          <li>Review the improved text on the right, edit if needed, then click <strong>Save</strong> to store it in history.</li>
          <li>Export as TXT or Download PDF from History when you want to share or keep a copy.</li>
        </ol>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-3">Must follow rules</h3>
        <p className="text-white/90 leading-relaxed">
          Use this service responsibly. Do not attempt to generate or rewrite illegal, harmful,
          or abusive content. Respect privacy — do not paste other people’s private data or
          confidential information. Avoid copyright infringement: do not submit full copyrighted
          books or paywalled content for reproduction. The AI is a helper — always review results
          before sending them to others.
        </p>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-3">
          🚀 Launch & Updates
        </h3>

        <p className="text-white/90 mb-2">Official launch date:</p>

        <div className="inline-block bg-black/60 px-4 py-2 rounded-md border border-white/10 text-white font-semibold mb-4">
          📅 03 December 2025
        </div>

        <p className="text-white/80 mb-4">
          The platform is continuously evolving with a focus on performance,
          scalability, and user experience.
        </p>

        {/* Updates list */}
        <ul className="space-y-3 text-white/85 text-sm leading-relaxed">
          <li>
            📤 <b>Export Templates</b>
            <br />
            <span className="text-white/70">
              Predefined TXT / PDF templates with professional document formatting.
            </span>
          </li>

          <li>
            🌍 <b>Multi-Language Polishing</b>
            <br />
            <span className="text-white/70">
              Improved accuracy for Telugu, Hindi, and English with better tone handling.
            </span>
          </li>

          <li>
            ⚖️ <b>Load Balancing (Scalability Upgrade)</b>
            <br />
            <span className="text-white/70">
              Distributes user requests across multiple servers to prevent overload,
              ensure faster response times, and support concurrent users reliably.
            </span>
          </li>
        </ul>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-3">Key features</h3>
          <ul className="space-y-5">
  {/* Item 1 */}
  <li className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold shadow">
      1
    </div>
    <div>
      <div className="font-semibold text-white text-base">
        ⚡ Fast & Clear Rewrites
      </div>
      <div className="text-white/80 text-sm leading-relaxed">
        Turn rough drafts into polished, professional text in just one click.
      </div>
    </div>
  </li>

  {/* Item 2 */}
  <li className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold shadow">
      2
    </div>
    <div>
      <div className="font-semibold text-white text-base">
        📁 History & Export
      </div>
      <div className="text-white/80 text-sm leading-relaxed">
        Save versions, copy content, delete entries, or export as PDF / TXT.
      </div>
    </div>
  </li>

  {/* Item 3 */}
  <li className="flex items-start gap-4 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition">
    <div className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold shadow">
      3
    </div>
    <div>
      <div className="font-semibold text-white text-base">
        👨‍💻 Website Developers
      </div>
      <div className="text-white/80 text-sm leading-relaxed">
        <b>G. Surendra Babu</b> — Full Stack Developer
      </div>
      <div className="text-white/80 text-sm leading-relaxed">
        <b>M. Abhishek</b> — Full Stack Developer
      </div>
    </div>
  </li>
</ul>
      </div>
    </section>
  );
}

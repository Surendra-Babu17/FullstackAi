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
        <h3 className="text-xl font-bold text-white mb-3">Launch & updates</h3>
        <p className="text-white/90 mb-4">Official launch date:</p>
        <div className="inline-block bg-black/60 px-4 py-2 rounded-md border border-white/6 text-white font-semibold">
          03 December 2025
        </div>
        <p className="text-white/80 mt-4">Next updates: voice improvements, export templates, and multi-language polishing.</p>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold text-white mb-3">Key features</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded bg-orange-500 text-white font-bold">1</div>
            <div>
              <div className="font-semibold text-white">Fast & clear rewrites</div>
              <div className="text-white/80 text-sm">Turn rough drafts into polished text in one click.</div>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded bg-orange-500 text-white font-bold">2</div>
            <div>
              <div className="font-semibold text-white">History & export</div>
              <div className="text-white/80 text-sm">Save versions, delete, copy, or download as PDF / TXT.</div>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded bg-orange-500 text-white font-bold">3</div>
            <div>
              <div className="font-semibold text-white">Voice in/out</div>
              <div className="text-white/80 text-sm">Speech-to-text upload and text-to-speech playback supported.</div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

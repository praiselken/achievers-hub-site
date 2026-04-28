import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white/60">
      <div className="max-w-6xl mx-auto px-5 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-lg text-white"
                 style={{ background: 'linear-gradient(135deg, #639922, #1D9E75)' }}>A</div>
            <span className="font-body font-semibold text-white text-[16px]">Achievers<span className="text-green-400">Hub</span></span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed">
            Personalised GCSE revision that gives students direction, not just content.
          </p>
          <p className="text-xs text-white/25 mt-4">Built by teachers & examiners</p>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Platform</div>
          <div className="flex flex-col gap-2.5">
            {[['For Students', '/student'], ['For Parents', '/parent'], ['For Tutors', '/tutor']].map(([l, p]) => (
              <Link key={p} to={p} className="text-sm text-white/55 hover:text-white transition-colors no-underline">{l}</Link>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Features</div>
          <div className="flex flex-col gap-2.5 text-sm text-white/55">
            {['Diagnostic Assessment', 'Daily 5 Practice', 'Topic Hub', 'Past Paper Hub', 'Spec Mapper', 'Mindset Prompts'].map(f => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Subjects</div>
          <div className="flex flex-col gap-2.5 text-sm text-white/55">
            <span>GCSE Maths</span>
            <span className="flex items-center gap-2">AQA · Edexcel · OCR</span>
            <span>GCSE Economics</span>
            <span className="flex items-center gap-2">AQA · OCR</span>
            <span className="text-white/30 text-xs mt-1">More subjects coming</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/8 px-5 py-5 max-w-6xl mx-auto flex flex-col sm:flex-row justify-between gap-3">
        <span className="text-xs text-white/25">© 2026 The Achievers Hub UK. All rights reserved.</span>
        <div className="flex gap-5 text-xs text-white/30">
          <span className="cursor-pointer hover:text-white/60 transition-colors">Privacy Policy</span>
          <span className="cursor-pointer hover:text-white/60 transition-colors">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}

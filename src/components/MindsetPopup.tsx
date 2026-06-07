import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Prompt {
  month: string;
  month_theme: string;
  day: number;
  confession: string;
  reflection: string | null;
}

export default function MindsetPopup() {
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const today = new Date();
    const month = today.toLocaleString('en-GB', { month: 'long' });
    const day   = today.getDate();
    const key   = `mindset_seen_${today.toISOString().slice(0, 10)}`;

    if (localStorage.getItem(key)) return;

    async function load() {
      if (!supabase) return;
      const { data } = await supabase
        .from('mindset_prompts')
        .select('*')
        .eq('month', month)
        .eq('day', day)
        .single();
      if (data) {
        setPrompt(data);
        setVisible(true);
      }
    }
    load();
  }, []);

  function dismiss() {
    const key = `mindset_seen_${new Date().toISOString().slice(0, 10)}`;
    localStorage.setItem(key, '1');
    setVisible(false);
  }

  if (!visible || !prompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(15,10,30,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
           style={{ boxShadow: '0 32px 80px rgba(28,28,46,0.22)' }}>

        {/* Header */}
        <div className="px-7 pt-7 pb-5"
             style={{ background: 'linear-gradient(135deg, var(--purple-faint) 0%, #EDE0F4 100%)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span className="font-body text-xs font-bold uppercase tracking-wider"
                    style={{ color: 'var(--purple)' }}>Today's mindset</span>
            </div>
            <span className="font-body text-xs text-gray-400">
              {prompt.month_theme}
            </span>
          </div>
          <p className="font-display font-bold text-lg leading-snug"
             style={{ color: 'var(--purple-dark)' }}>
            "{prompt.confession}"
          </p>
        </div>

        {/* Reflection */}
        {prompt.reflection && (
          <div className="px-7 py-5 border-b border-gray-100">
            <p className="font-body text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Today's reflection
            </p>
            <p className="font-body text-sm text-gray-700 leading-relaxed">
              {prompt.reflection}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="px-7 py-5 flex gap-3">
          <button onClick={dismiss}
            className="flex-1 py-3 rounded-2xl font-body font-bold text-sm text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)' }}>
            I'm ready. Let's go 🚀
          </button>
        </div>
      </div>
    </div>
  );
}

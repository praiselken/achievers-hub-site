import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

/**
 * Without this, any render-time exception unmounts the whole tree and the
 * student or parent is left staring at a blank white page with no way back.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep the detail in the console for support; never show a stack to a student.
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="mkt flex min-h-screen items-center justify-center bg-[#fcfbfe] px-6">
        <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-8 text-center shadow-[var(--shadow-soft-lg)]">
          <h1 className="font-display text-2xl font-extrabold text-[var(--color-ink-900)]">
            Something went wrong on this page
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-ink-500)]">
            Your work is saved. Reloading usually fixes it — if it keeps happening,
            let us know what you were doing at the time.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--color-primary-600)] px-6 font-bold text-white transition hover:bg-[var(--color-primary-700)]"
            >
              Reload the page
            </button>
            <a
              href="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-6 font-bold text-[var(--color-ink-700)] hover:bg-slate-50"
            >
              Back to dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }
}

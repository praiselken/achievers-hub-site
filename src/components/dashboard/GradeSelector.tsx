import { GRADES, type Grade, type Grades } from '../../lib/grades';

/**
 * Student-facing grade picker. Deliberately shows GCSE grades only — the
 * internal pathway tiers are never surfaced alongside these, so students and
 * parents are not reading two grading systems at once.
 */
export function GradeSelector({
  grades,
  onChange,
  subjectLabel,
}: {
  grades: Grades;
  onChange: (next: Grades) => void;
  subjectLabel: string;
}) {
  return (
    <div className="space-y-6">
      <Row
        label="Current working grade"
        hint={`What you are working at in ${subjectLabel} now. Your school or teacher usually tells you this — leave it blank if you are not sure.`}
        value={grades.working}
        allowUnset
        onSelect={(g) => onChange({ ...grades, working: g })}
      />
      <Row
        label="Target grade"
        hint="What you are aiming for. This shapes the questions you get."
        value={grades.target}
        onSelect={(g) => onChange({ ...grades, target: g })}
      />
      <p className="text-xs leading-5 text-[var(--color-ink-500)]">
        These are your own grades, not a prediction. Achievers Hub never turns them into an
        official exam result.
      </p>
    </div>
  );
}

function Row({
  label,
  hint,
  value,
  allowUnset = false,
  onSelect,
}: {
  label: string;
  hint: string;
  value: Grade | null;
  allowUnset?: boolean;
  onSelect: (g: Grade | null) => void;
}) {
  return (
    <div>
      <p className="text-sm font-extrabold text-[var(--color-ink-900)]">{label}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--color-ink-500)]">{hint}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={label}>
        {GRADES.map((g) => {
          const active = value === g;
          return (
            <button
              key={g}
              type="button"
              onClick={() => onSelect(active && allowUnset ? null : g)}
              aria-pressed={active}
              className={`h-11 w-11 rounded-xl border text-sm font-extrabold tabular-nums transition ${
                active
                  ? 'border-[var(--color-primary-600)] bg-[var(--color-primary-600)] text-white'
                  : 'border-slate-200 bg-white text-[var(--color-ink-700)] hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-50)]'
              }`}
            >
              {g}
            </button>
          );
        })}
        {allowUnset && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-pressed={value === null}
            className={`h-11 rounded-xl border px-4 text-sm font-bold transition ${
              value === null
                ? 'border-[var(--color-primary-300)] bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                : 'border-slate-200 bg-white text-[var(--color-ink-500)] hover:bg-slate-50'
            }`}
          >
            Not sure yet
          </button>
        )}
      </div>
    </div>
  );
}

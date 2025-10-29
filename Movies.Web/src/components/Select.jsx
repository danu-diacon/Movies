import { useEffect, useMemo, useRef, useState } from 'react';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const normalized = useMemo(() => options.map((o) => (
    typeof o === 'object' && o !== null ? o : { value: o, label: String(o) }
  )), [options]);

  const current = useMemo(() => normalized.find((o) => o.value === value) || null, [normalized, value]);

  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  function select(val) {
    if (disabled) return;
    onChange?.(val);
    setOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        className={`input w-full flex items-center justify-between ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={current ? 'text-slate-200' : 'text-slate-400'}>
          {current ? current.label : placeholder}
        </span>
        <ChevronDown className={`ml-2 h-4 w-4 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-white/10 bg-neutral-800 p-1 shadow-lg">
          <ul className="max-h-56 overflow-auto py-1">
            {normalized.map((o) => (
              <li key={String(o.value)}>
                <button
                  type="button"
                  onClick={() => select(o.value)}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-white/5 ${o.value === value ? 'bg-white/10 text-white' : 'text-slate-200'}`}
                >
                  {o.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ChevronDown({ className = '' }) {
  return (
    <svg className={`transition-transform ${className}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
    </svg>
  );
}

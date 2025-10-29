import { useEffect, useMemo, useRef, useState } from 'react';

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select...',
  allowCustom = true,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const normalized = useMemo(() => options.map(String), [options]);
  const selectedSet = useMemo(() => new Set((value || []).map(String)), [value]);
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return normalized;
    return normalized.filter((o) => o.toLowerCase().includes(s));
  }, [normalized, search]);

  function toggle(val) {
    const str = String(val);
    const next = new Set(selectedSet);
    if (next.has(str)) next.delete(str); else next.add(str);
    onChange?.(Array.from(next));
  }

  function remove(val) {
    const str = String(val);
    const next = (value || []).filter((v) => String(v) !== str);
    onChange?.(next);
  }

  function addCustom() {
    const s = search.trim();
    if (!s) return;
    if (!selectedSet.has(s)) onChange?.([...(value || []), s]);
    setSearch('');
  }

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" className="input min-h-10 w-full text-left" onClick={() => setOpen((o) => !o)}>
        {value && value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {value.map((v) => (
              <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-slate-200 text-xs">
                {v}
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); remove(v); }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >×</span>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-slate-400">{placeholder}</span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-white/10 bg-neutral-800 p-2 shadow-lg">
          <input
            className="input mb-2"
            placeholder="Search or type and press Enter..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (allowCustom && e.key === 'Enter') { e.preventDefault(); addCustom(); }
            }}
          />
          <div className="max-h-48 overflow-auto flex flex-col gap-1">
            {filtered.length === 0 ? (
              <div className="text-sm text-slate-400 px-1 py-1">No options</div>
            ) : filtered.map((opt) => (
              <label key={opt} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSet.has(String(opt))}
                  onChange={() => toggle(opt)}
                />
                <span className="text-sm text-slate-200">{opt}</span>
              </label>
            ))}
            {allowCustom && search.trim() && !normalized.map((o) => o.toLowerCase()).includes(search.trim().toLowerCase()) && (
              <button type="button" className="btn btn-sm mt-1" onClick={addCustom}>
                Add "{search.trim()}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

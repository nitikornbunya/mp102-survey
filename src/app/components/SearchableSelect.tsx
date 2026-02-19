"use client";

import { useState, useRef, useEffect } from "react";

type Option = { value: string; label: string };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "ค้นหาหรือเลือก...",
  disabled = false,
  className = "",
  id,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayLabel = value ? options.find((o) => o.value === value)?.label ?? value : "";
  const searchLower = search.trim().toLowerCase();
  const filtered =
    !searchLower || !search.trim()
      ? options
      : options.filter(
          (o) =>
            o.label.includes(search.trim()) ||
            o.label.toLowerCase().includes(searchLower)
        );

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onBlur = (e: FocusEvent) => {
      if (containerRef.current?.contains(e.relatedTarget as Node)) return;
      setOpen(false);
    };
    const onDocClick = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    window.addEventListener("focusin", onBlur);
    return () => {
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("focusin", onBlur);
    };
  }, [open]);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={open ? "searchable-list" : undefined}
          autoComplete="off"
          value={open ? search : displayLabel}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => !disabled && setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
              return;
            }
            if (e.key === "Enter" && filtered.length > 0 && !open) {
              setOpen(true);
              return;
            }
            if (e.key === "Enter" && open && filtered.length === 1) {
              e.preventDefault();
              handleSelect(filtered[0]);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border border-zinc-200 bg-white pr-8 pl-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-[#ff6a13] focus:outline-none focus:ring-1 focus:ring-[#ff6a13] disabled:bg-zinc-100 disabled:cursor-not-allowed ${className}`}
        />
        <span
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400"
          aria-hidden
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      {open && (
        <ul
          id="searchable-list"
          role="listbox"
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-zinc-200 bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-zinc-500">ไม่พบรายการ</li>
          ) : (
            filtered.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                onClick={() => handleSelect(opt)}
                className={`cursor-pointer px-3 py-2 text-sm transition ${
                  opt.value === value
                    ? "bg-[#ff6a13]/10 text-[#ff6a13]"
                    : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

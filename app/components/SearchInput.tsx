/** Reusable search input with a magnifying-glass icon. */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative w-full sm:w-80 group">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-gray-100 rounded-xl text-xs font-bold text-emerald-950 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-zinc-300"
      />
      <svg
        className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-300 group-focus-within:text-emerald-600 transition-colors"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}

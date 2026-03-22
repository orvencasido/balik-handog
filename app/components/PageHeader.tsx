/** Consistent page header with title, subtitle, and an optional right-slot for filters. */
export default function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white px-6 py-6 rounded-2xl border border-gray-100 shadow-sm shrink-0">
      <div>
        <h1 className="text-lg font-black text-emerald-950 uppercase tracking-tight leading-none">
          {title}
        </h1>
        <p className="text-emerald-700/60 font-bold text-[8px] uppercase tracking-widest mt-0.5">
          {subtitle}
        </p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

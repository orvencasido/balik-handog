/** Section title with the emerald accent bar, used in analytics and dashboard panels. */
export default function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[10px] font-black text-emerald-950 uppercase tracking-widest flex items-center gap-3">
      <span className="h-4 w-1 bg-emerald-600 rounded-full" />
      {title}
    </h2>
  );
}

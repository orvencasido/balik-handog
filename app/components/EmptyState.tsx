/** Centered empty-state message used in lists and data panels. */
export default function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-center py-10 text-[10px] font-black italic text-zinc-300 uppercase">
      {message}
    </p>
  );
}

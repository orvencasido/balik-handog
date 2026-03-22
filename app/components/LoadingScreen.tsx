/** Centered full-screen loading indicator used on every guarded page. */
export default function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex-1 flex items-center justify-center text-emerald-900 font-bold">
      {message}
    </div>
  );
}

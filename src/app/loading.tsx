export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="mb-4 animate-pulse">
        <img src="/icon.png" alt="CareB" className="w-12 h-12 rounded-2xl" />
      </div>
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

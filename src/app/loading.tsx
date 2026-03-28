export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center mb-4 animate-pulse">
        <span className="text-white text-2xl font-black">맘</span>
      </div>
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

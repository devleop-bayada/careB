export default function AppLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-gray-400 mt-3 font-medium">불러오는 중...</p>
    </div>
  );
}

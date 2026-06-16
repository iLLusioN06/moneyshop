export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background animate-pulse">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-surface-tertiary" />
        <div className="h-4 w-40 bg-surface-tertiary rounded" />
      </div>
    </div>
  );
}

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-pulse space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="h-10 w-40 bg-surface-tertiary rounded" />
        </div>

        {/* Form Card */}
        <div className="rounded-xl bg-surface border border-border p-6 space-y-4">
          <div className="h-6 w-32 bg-surface-tertiary rounded mx-auto" />
          <div className="h-10 w-full bg-surface-tertiary rounded" />
          <div className="h-10 w-full bg-surface-tertiary rounded" />
          <div className="h-10 w-full bg-surface-tertiary rounded" />
          <div className="h-10 w-24 bg-surface-tertiary rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}

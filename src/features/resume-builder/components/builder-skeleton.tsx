/** Shown while the builder code loads and the saved draft is read from this device. */
export function BuilderSkeleton() {
  return (
    <div role="status" className="flex h-dvh items-center justify-center text-muted-foreground">
      Loading your resume...
    </div>
  );
}

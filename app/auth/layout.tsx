export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="section-grid min-h-screen">
      <div className="container flex min-h-screen items-center justify-center py-12">{children}</div>
    </main>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

export default AuthLayout;

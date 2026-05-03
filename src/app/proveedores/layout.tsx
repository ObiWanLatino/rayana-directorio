export default function ProveedoresLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen font-sans antialiased">{children}</div>
  );
}

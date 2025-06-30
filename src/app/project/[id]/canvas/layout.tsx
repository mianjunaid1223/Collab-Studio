
export default function CanvasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="overflow-hidden">{children}</div>;
}

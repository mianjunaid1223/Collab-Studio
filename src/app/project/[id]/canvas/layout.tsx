export const metadata = {
  title: "Canvas",
};

export default function CanvasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="overflow-hidden h-screen w-full">{children}</div>;
}

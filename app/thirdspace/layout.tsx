export default function ThirdSpaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="theme-thirdspace min-h-screen bg-background text-foreground">
      {children}
    </div>
  )
}

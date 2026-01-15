import './globals.css'
export const metadata = { title: 'Nexus POS Emerald', description: 'Premium Kasir System' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-[#07080A]">
      <body className="antialiased selection:bg-emerald-500/30">{children}</body>
    </html>
  )
}
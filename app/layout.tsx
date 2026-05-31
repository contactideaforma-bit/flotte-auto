import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Flotte Auto — Mymy la King',
  description: 'Gestion de parc automobile',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}

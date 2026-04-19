import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Market Sentiment Intelligence — Muhammed Adediran',
  description: 'NLP pipeline using FinBERT to classify financial news and social signals. Generates trend alerts and sentiment scores for trading decision support.',
  alternates: { canonical: 'https://market-sentiment-web.vercel.app' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full">{children}</body>
    </html>
  )
}

"use client";
import dynamic from 'next/dynamic'
const SentimentApp = dynamic(() => import('@/components/SentimentApp'), { ssr: false })
export default function Page() { return <SentimentApp /> }

import { Metadata, Viewport } from 'next/types'

export const metadata: Metadata = {
  title: 'Connect',
  description: 'Connect with mentors and peers'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: 'dark'
}

export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="connect-layout">
      {children}
    </div>
  );
}

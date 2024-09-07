import './globals.css'
import { ReactFlowProvider } from '@xyflow/react'
import { DnDProvider } from './components/DnDContext'

export default function RootLayout({ children }: {
    children: React.ReactNode
}) {
  return (
      <html lang="en">
      <body>
      <ReactFlowProvider>
        <DnDProvider>
          {children}
        </DnDProvider>
      </ReactFlowProvider>
      </body>
      </html>
  )
}
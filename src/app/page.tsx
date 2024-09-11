import dynamic from 'next/dynamic'

// TODO https://reactflow.dev/learn/troubleshooting/remove-attribution
const Canvas = dynamic(() => import('./components/Canvas'), { ssr: false })

export default function Home() {
  return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Canvas />
      </div>
  )
}
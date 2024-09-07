import dynamic from 'next/dynamic'

const DnDFlow = dynamic(() => import('./components/DnDFlow'), { ssr: false })

export default function Home() {
  return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <DnDFlow />
      </div>
  )
}
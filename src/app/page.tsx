import dynamic from 'next/dynamic';

const ExcalidrawWrapper = dynamic(
    async () => (await import('../excalidraw/wrapper')).default,
    {
      ssr: false,
    },
);

export default function Page() {
  return (
      <ExcalidrawWrapper />
  );
}
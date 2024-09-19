import './globals.css'
import { ReactFlowProvider } from '@xyflow/react'
import { DnDProvider } from './components/DnDContext'
import Template, {templateType} from "@/parser/template";
import {TemplateProvider} from "@/app/components/toolbar/TemplateContext";

export default async function RootLayout({ children }: {
    children: React.ReactNode
}) {
    const loader = new Template();
    const templates = await loader.loadBuiltinTemplates();

    return (
        <html lang="en">
        <body>
        <TemplateProvider templates={templates}>
            <ReactFlowProvider>
                <DnDProvider>
                    {children}
                </DnDProvider>
            </ReactFlowProvider>
        </TemplateProvider>
        </body>
        </html>
    )
}
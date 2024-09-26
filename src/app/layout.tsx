import '@/app/globals.css'
import { ReactFlowProvider } from '@xyflow/react'
import { DnDProvider } from './components/DnDContext'
import Template from "@/parser/template";
import {TemplateProvider} from "@/app/components/panels/toolbar/TemplateContext";
import {Toaster} from "@/components/ui/toaster";
import {CommandProvider} from "@/app/components/CommandProvider";

export default async function RootLayout({ children }: {
    children: React.ReactNode
}) {
    const loader = new Template();
    const templates = await loader.loadBuiltinTemplates();

    return (
        <html lang="en">
        <body>
        <Toaster />
        <TemplateProvider templates={templates}>
            <ReactFlowProvider>
                <DnDProvider>
                    <CommandProvider>
                        {children}
                    </CommandProvider>
                </DnDProvider>
            </ReactFlowProvider>
        </TemplateProvider>
        </body>
        </html>
    )
}
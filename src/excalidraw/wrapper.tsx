"use client";

import React from 'react';
import { FONT_FAMILY, Excalidraw, WelcomeScreen } from "@excalidraw/excalidraw";

const ExcalidrawWrapperClient: React.FC = () => {
    const excalidrawRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        return () => {
            removeAdditionalElements(excalidrawRef);
            removeRestrictedFeatures(excalidrawRef);
            showCommandPlate();
        };
    }, []);

    return (
        <div
            ref={ excalidrawRef }
            style={{ position: 'fixed', inset: 0 }}
        >

            <Excalidraw
                initialData={{
                    appState: {
                        currentItemFontFamily: FONT_FAMILY.Cascadia,
                        zenModeEnabled: true,
                        // gridSize: 20
                        objectsSnapModeEnabled: true,
                        showStats: true
                    },
                    scrollToContent: true
                }}

                renderCustomStats={() => (
                    <p style={{ color: "#70b1ec", fontWeight: "bold" }}>
                        Model stats will be shown here
                    </p>
                )}

            >
            </Excalidraw>
        </div>
    );
};

function showCommandPlate() {
    const cmd = () => {
        console.log(1);
    };
    window.addEventListener('dblclick', cmd, true);
    return () => {
        window.removeEventListener('dblclick', cmd, true);
    }
}

function removeRestrictedFeatures(excalidrawRef: React.RefObject<HTMLDivElement>) {
    const removeButtons: (() => void)[] = [];
    removeButtons.push(removeButtonHelper('.disable-zen-mode', excalidrawRef));
    removeButtons.push(removeButtonHelper('.dropdown-menu-button.main-menu-trigger.zen-mode-transition', excalidrawRef));

    const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();
    };
    excalidrawRef.current?.addEventListener('contextmenu', preventContextMenu, true);

    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.altKey) &&
            (event.keyCode === 90 || event.key.toLowerCase() === 'z')
            || (event.keyCode === 47 || event.key.toLowerCase() === '/')) {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    excalidrawRef.current?.addEventListener('keydown', handleKeyDown, true);

    return () => {
        removeButtons.forEach(removeButton => removeButton());
        excalidrawRef.current?.removeEventListener('contextmenu', preventContextMenu, true);
        excalidrawRef.current?.removeEventListener('keydown', handleKeyDown, true);
    };
}

function removeAdditionalElements(excalidrawRef: React.RefObject<HTMLDivElement>) {
    const removeButtons: (() => void)[] = [];
    removeButtons.push(removeButtonHelper('.ToolIcon.ToolIcon__lock.ToolIcon_size_medium', excalidrawRef));
    removeButtons.push(removeButtonHelper('.App-toolbar__divider', excalidrawRef));
    removeButtons.push(removeButtonHelper('label.ToolIcon.Shape.fillable[title="Diamond — D or 3"]', excalidrawRef));
    removeButtons.push(removeButtonHelper('label.ToolIcon.Shape.fillable[title="Ellipse — O or 4"]', excalidrawRef));
    removeButtons.push(removeButtonHelper('label.ToolIcon.Shape.fillable[title="Line — L or 6"]', excalidrawRef));
    removeButtons.push(removeButtonHelper('label.ToolIcon.Shape.fillable[title="Draw — P or 7"]', excalidrawRef));
    removeButtons.push(removeButtonHelper('button[data-testid="toolbar-embeddable"]', excalidrawRef));

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.keyCode === 81 || event.key.toLowerCase() === 'q'
            || event.keyCode === 68 || event.key.toLowerCase() === 'd'
            || event.keyCode === 3 || parseInt(event.key) == 3
            || event.keyCode === 79 || event.key.toLowerCase() === 'o'
            || event.keyCode === 4 || parseInt(event.key) == 4
            || event.keyCode === 76 || event.key.toLowerCase() === 'l'
            || event.keyCode === 6 || parseInt(event.key) == 6) {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    excalidrawRef.current?.addEventListener('keydown', handleKeyDown, true);


    return () => {
        removeButtons.forEach(removeButton => removeButton());
        excalidrawRef.current?.removeEventListener('keydown', handleKeyDown, true);
    }
}

function removeButtonHelper(selector: string, excalidrawRef: React.RefObject<HTMLDivElement>) {
    const style = document.createElement('style');
    style.textContent = `
        ${selector} {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    const removeElements = () => {
        if (excalidrawRef.current) {
            const button = excalidrawRef.current.querySelector(selector);
            if (button) {
                button.remove();
            }
        }
    };

    const observer = new MutationObserver(removeElements);
    if (excalidrawRef.current) {
        observer.observe(excalidrawRef.current, { childList: true, subtree: true });
    }

    return () => {
        observer.disconnect();
        document.head.removeChild(style);
    }
}

export default ExcalidrawWrapperClient;
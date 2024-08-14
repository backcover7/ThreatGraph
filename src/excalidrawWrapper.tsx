"use client";

import React from 'react';
import * as excalidrawLib from "@excalidraw/excalidraw";

const ExcalidrawWrapperClient: React.FC = () => {
    const excalidrawRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        return () => {
            removeRestrictedElements(excalidrawRef);
            showCommandPlate();
        };
    }, []);

    return (
        <div
            ref={excalidrawRef}
            style={{ position: 'fixed', inset: 0 }}
        >

            <excalidrawLib.Excalidraw
                initialData={{
                    appState: { zenModeEnabled: true },
                    scrollToContent: true
                }}
            >
            </excalidrawLib.Excalidraw>
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

function removeRestrictedElements(excalidrawRef: React.RefObject<HTMLDivElement>) {
    const style = document.createElement('style');
    style.textContent = `
        .disable-zen-mode {
            display: none !important;
        }
        .dropdown-menu-button main-menu-trigger zen-mode-transition {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    const removeElements = () => {
        if (excalidrawRef.current) {
            const exitButton = excalidrawRef.current.querySelector('.disable-zen-mode.disable-zen-mode--visible');
            if (exitButton) {
                exitButton.remove();
            }
            const menuButton = excalidrawRef.current.querySelector('.dropdown-menu-button.main-menu-trigger.zen-mode-transition');
            if (menuButton) {
                menuButton.remove();
            }
        }
    };

    const observer = new MutationObserver(removeElements);
    if (excalidrawRef.current) {
        observer.observe(excalidrawRef.current, { childList: true, subtree: true });
    }

    const preventContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopImmediatePropagation();
    };

    if (excalidrawRef.current) {
        excalidrawRef.current.addEventListener('contextmenu', preventContextMenu);
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if ((event.metaKey || event.altKey) &&
            (event.keyCode === 90 || event.key.toLowerCase() === 'z')) {
            event.preventDefault();
            event.stopPropagation();
        }
    };
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
        observer.disconnect();
        document.head.removeChild(style);
        if (excalidrawRef.current) {
            excalidrawRef.current.removeEventListener('contextmenu', preventContextMenu);
        }
        window.removeEventListener('keydown', handleKeyDown, true);
    };
}

export default ExcalidrawWrapperClient;
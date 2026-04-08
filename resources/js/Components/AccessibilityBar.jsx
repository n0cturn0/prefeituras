import React, { useState, useEffect } from 'react';
import { Sun, Moon, Type, Minus, Plus } from 'lucide-react';

export default function AccessibilityBar() {
    const [highContrast, setHighContrast] = useState(false);
    const [fontSize, setFontSize] = useState(100); // Percentage

    useEffect(() => {
        // Apply high contrast
        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [highContrast]);

    useEffect(() => {
        // Apply font size to root 
        // 16px is default browser size usually corresponds to 100%
        // We set font-size on html, allowing rem units to scale
        document.documentElement.style.fontSize = `${fontSize}%`;
    }, [fontSize]);

    const toggleContrast = (e) => {
        if (e) e.preventDefault();
        setHighContrast(!highContrast);
    };

    const increaseFont = (e) => {
        if (e) e.preventDefault();
        if (fontSize < 150) setFontSize(fontSize + 10);
    };

    const decreaseFont = (e) => {
        if (e) e.preventDefault();
        if (fontSize > 70) setFontSize(fontSize - 10);
    };

    const resetFont = (e) => {
        if (e) e.preventDefault();
        setFontSize(100);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.shiftKey) { // Alt + Shift modifiers to avoid potential conflicts
                if (e.key === 'c') {
                    toggleContrast();
                }
                if (e.key === '+') {
                    increaseFont();
                }
                if (e.key === '-') {
                    decreaseFont();
                }
                if (e.key === 'r') {
                    resetFont();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [highContrast, fontSize]);


    return (
        <div className="bg-gray-100 border-b text-xs py-1" role="region" aria-label="Barra de Acessibilidade">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div /* Shortcut info or links */ className="hidden md:flex space-x-4 text-gray-600">
                    <a href="#main-content" className="hover:underline" accessKey="1">Ir para conteúdo (Alt+1)</a>
                    <a href="#menu" className="hover:underline" accessKey="2">Ir para menu (Alt+2)</a>
                    <a href="#search" className="hover:underline" accessKey="3">Ir para busca (Alt+3)</a>
                    <a href="#footer" className="hover:underline" accessKey="4">Ir para rodapé (Alt+4)</a>
                </div>

                <div className="flex items-center space-x-4 ml-auto">
                    <div className="flex items-center space-x-1 border-r pr-4 border-gray-300">
                        <span className="text-gray-500 mr-1">Tamanho da Fonte:</span>
                        <button onClick={decreaseFont} className="p-1 hover:bg-gray-200 rounded" title="Diminuir Fonte (Alt+Shift+-)" aria-label="Diminuir Fonte">A-</button>
                        <button onClick={resetFont} className="p-1 hover:bg-gray-200 rounded" title="Tamanho Normal (Alt+Shift+R)" aria-label="Tamanho Normal">A</button>
                        <button onClick={increaseFont} className="p-1 hover:bg-gray-200 rounded" title="Aumentar Fonte (Alt+Shift++)" aria-label="Aumentar Fonte">A+</button>
                    </div>

                    <button
                        onClick={toggleContrast}
                        className={`flex items-center space-x-1 px-2 py-1 rounded transition ${highContrast ? 'bg-yellow-400 text-black font-bold' : 'hover:bg-gray-200 text-gray-700'}`}
                        title="Alto Contraste (Alt+Shift+C)"
                    >
                        {highContrast ? <Sun size={14} /> : <Moon size={14} />}
                        <span>Alto Contraste</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

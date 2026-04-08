import React from 'react';
import { Editor, Frame } from '@craftjs/core';
import { Text, Container, Image, Button, HeroSection } from '@/Components/Admin/Craft/components';

/**
 * CraftRenderer — renderiza páginas criadas com Craft.js no site público.
 * Usa `enabled={false}` para desabilitar qualquer interação de edição.
 *
 * @param {string} json — JSON serializado pelo Craft.js (content_components)
 */
const CraftRenderer = ({ json }) => {
    if (!json) return null;

    let parsedJson = json;
    if (typeof json === 'object') {
        parsedJson = JSON.stringify(json);
    }

    return (
        <Editor
            enabled={false}
            resolver={{ Text, Container, Image, Button, HeroSection }}
        >
            <Frame data={parsedJson} />
        </Editor>
    );
};

export default CraftRenderer;

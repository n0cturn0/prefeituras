import React from 'react';
import { useNode } from '@craftjs/core';

const fontSizes = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl'];
const alignments = ['text-left', 'text-center', 'text-right', 'text-justify'];
const colors = [
    { label: 'Preto', value: 'text-gray-900' },
    { label: 'Cinza', value: 'text-gray-600' },
    { label: 'Branco', value: 'text-white' },
    { label: 'Azul', value: 'text-blue-700' },
    { label: 'Verde', value: 'text-green-700' },
    { label: 'Vermelho', value: 'text-red-700' },
];
const weights = [
    { label: 'Normal', value: 'font-normal' },
    { label: 'Médio', value: 'font-medium' },
    { label: 'Semi-bold', value: 'font-semibold' },
    { label: 'Negrito', value: 'font-bold' },
];

export const Text = ({ text, fontSize, alignment, color, weight, isHeading }) => {
    const { connectors: { connect, drag }, isSelected, actions: { setProp } } = useNode((state) => ({
        isSelected: state.events.selected,
    }));

    const classes = [fontSize, alignment, color, weight, 'outline-none', 'min-h-[1em]', 'w-full', 'block'].join(' ');
    const Tag = isHeading ? 'h2' : 'p';

    return (
        <Tag
            ref={(ref) => connect(drag(ref))}
            contentEditable={isSelected}
            suppressContentEditableWarning
            className={classes}
            onBlur={(e) => setProp((props) => (props.text = e.target.innerText))}
        >
            {text}
        </Tag>
    );
};

const TextSettings = () => {
    const { actions: { setProp }, fontSize, alignment, color, weight, isHeading } = useNode((node) => ({
        fontSize: node.data.props.fontSize,
        alignment: node.data.props.alignment,
        color: node.data.props.color,
        weight: node.data.props.weight,
        isHeading: node.data.props.isHeading,
    }));

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo</label>
                <div className="flex gap-2">
                    <button
                        onClick={() => setProp((p) => (p.isHeading = false))}
                        className={`px-3 py-1 rounded text-sm border ${!isHeading ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
                    >Parágrafo</button>
                    <button
                        onClick={() => setProp((p) => (p.isHeading = true))}
                        className={`px-3 py-1 rounded text-sm border ${isHeading ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700'}`}
                    >Título</button>
                </div>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tamanho</label>
                <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={fontSize}
                    onChange={(e) => setProp((p) => (p.fontSize = e.target.value))}
                >
                    {fontSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alinhamento</label>
                <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={alignment}
                    onChange={(e) => setProp((p) => (p.alignment = e.target.value))}
                >
                    {alignments.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cor</label>
                <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={color}
                    onChange={(e) => setProp((p) => (p.color = e.target.value))}
                >
                    {colors.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Peso</label>
                <select
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={weight}
                    onChange={(e) => setProp((p) => (p.weight = e.target.value))}
                >
                    {weights.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
            </div>
        </div>
    );
};

Text.craft = {
    displayName: 'Texto',
    props: {
        text: 'Clique para editar o texto...',
        fontSize: 'text-base',
        alignment: 'text-left',
        color: 'text-gray-900',
        weight: 'font-normal',
        isHeading: false,
    },
    related: {
        settings: TextSettings,
    },
};

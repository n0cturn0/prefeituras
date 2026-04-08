import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

const paddingOptions = ['p-0', 'p-2', 'p-4', 'p-6', 'p-8', 'p-12'];
const bgOptions = [
    { label: 'Nenhum', value: 'bg-transparent' },
    { label: 'Branco', value: 'bg-white' },
    { label: 'Cinza Claro', value: 'bg-gray-50' },
    { label: 'Cinza', value: 'bg-gray-100' },
    { label: 'Azul', value: 'bg-blue-50' },
    { label: 'Azul Escuro', value: 'bg-blue-800' },
];
const layoutOptions = [
    { label: 'Bloco', value: 'block' },
    { label: 'Flex - Linha', value: 'flex flex-row gap-4' },
    { label: 'Flex - Coluna', value: 'flex flex-col gap-4' },
    { label: 'Grid 2 colunas', value: 'grid grid-cols-2 gap-4' },
    { label: 'Grid 3 colunas', value: 'grid grid-cols-3 gap-4' },
];
const roundedOptions = ['rounded-none', 'rounded', 'rounded-lg', 'rounded-xl', 'rounded-2xl'];
const shadowOptions = [
    { label: 'Nenhuma', value: '' },
    { label: 'Suave', value: 'shadow-sm' },
    { label: 'Média', value: 'shadow' },
    { label: 'Grande', value: 'shadow-lg' },
];

export const Container = ({ children, padding, bg, layout, rounded, shadow }) => {
    const { connectors: { connect, drag }, isSelected } = useNode((state) => ({
        isSelected: state.events.selected,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    const classes = [
        padding, bg, layout, rounded, shadow,
        'min-h-[60px]', 'w-full',
        enabled && isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : '',
        enabled ? 'cursor-move' : '',
    ].filter(Boolean).join(' ');

    return (
        <div ref={(ref) => connect(drag(ref))} className={classes}>
            {children}
        </div>
    );
};

const ContainerSettings = () => {
    const { actions: { setProp }, padding, bg, layout, rounded, shadow } = useNode((node) => ({
        padding: node.data.props.padding,
        bg: node.data.props.bg,
        layout: node.data.props.layout,
        rounded: node.data.props.rounded,
        shadow: node.data.props.shadow,
    }));

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Layout</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={layout} onChange={(e) => setProp((p) => (p.layout = e.target.value))}>
                    {layoutOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Padding</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={padding} onChange={(e) => setProp((p) => (p.padding = e.target.value))}>
                    {paddingOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fundo</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={bg} onChange={(e) => setProp((p) => (p.bg = e.target.value))}>
                    {bgOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bordas</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={rounded} onChange={(e) => setProp((p) => (p.rounded = e.target.value))}>
                    {roundedOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sombra</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={shadow} onChange={(e) => setProp((p) => (p.shadow = e.target.value))}>
                    {shadowOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        </div>
    );
};

Container.craft = {
    displayName: 'Container',
    props: {
        padding: 'p-4',
        bg: 'bg-white',
        layout: 'block',
        rounded: 'rounded-lg',
        shadow: 'shadow-sm',
    },
    rules: {
        canDrop: () => true,
        canDrag: () => true,
    },
    related: {
        settings: ContainerSettings,
    },
};

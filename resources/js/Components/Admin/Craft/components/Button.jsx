import React from 'react';
import { useNode } from '@craftjs/core';

const variantOptions = [
    { label: 'Azul (Primário)', value: 'bg-blue-700 hover:bg-blue-800 text-white' },
    { label: 'Verde (Sucesso)', value: 'bg-green-600 hover:bg-green-700 text-white' },
    { label: 'Cinza (Secundário)', value: 'bg-gray-600 hover:bg-gray-700 text-white' },
    { label: 'Vermelho (Perigo)', value: 'bg-red-600 hover:bg-red-700 text-white' },
    { label: 'Contorno Azul', value: 'border-2 border-blue-700 text-blue-700 hover:bg-blue-50' },
    { label: 'Contorno Cinza', value: 'border-2 border-gray-400 text-gray-700 hover:bg-gray-50' },
];
const sizeOptions = [
    { label: 'Pequeno', value: 'py-1 px-3 text-sm' },
    { label: 'Médio', value: 'py-2 px-5 text-base' },
    { label: 'Grande', value: 'py-3 px-7 text-lg' },
];
const roundedOptions = ['rounded', 'rounded-lg', 'rounded-full', 'rounded-none'];

export const Button = ({ label, href, variant, size, rounded, fullWidth }) => {
    const { connectors: { connect, drag }, isSelected } = useNode((state) => ({
        isSelected: state.events.selected,
    }));

    const classes = [
        variant, size, rounded,
        'inline-flex items-center justify-center font-semibold transition-colors duration-200 cursor-pointer',
        fullWidth ? 'w-full' : 'w-auto',
        isSelected ? 'ring-2 ring-offset-1 ring-blue-400' : '',
    ].filter(Boolean).join(' ');

    return (
        <a
            ref={(ref) => connect(drag(ref))}
            href={href || '#'}
            className={classes}
            onClick={(e) => e.preventDefault()}
        >
            {label}
        </a>
    );
};

const ButtonSettings = () => {
    const { actions: { setProp }, label, href, variant, size, rounded, fullWidth } = useNode((node) => ({
        label: node.data.props.label,
        href: node.data.props.href,
        variant: node.data.props.variant,
        size: node.data.props.size,
        rounded: node.data.props.rounded,
        fullWidth: node.data.props.fullWidth,
    }));

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Texto do Botão</label>
                <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={label || ''}
                    onChange={(e) => setProp((p) => (p.label = e.target.value))}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Link (URL)</label>
                <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={href || ''}
                    placeholder="/pagina ou https://..."
                    onChange={(e) => setProp((p) => (p.href = e.target.value))}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Variante</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={variant} onChange={(e) => setProp((p) => (p.variant = e.target.value))}>
                    {variantOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tamanho</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={size} onChange={(e) => setProp((p) => (p.size = e.target.value))}>
                    {sizeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Bordas</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={rounded} onChange={(e) => setProp((p) => (p.rounded = e.target.value))}>
                    {roundedOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="fullwidth-check"
                    checked={fullWidth || false}
                    onChange={(e) => setProp((p) => (p.fullWidth = e.target.checked))}
                    className="h-4 w-4"
                />
                <label htmlFor="fullwidth-check" className="text-sm text-gray-700">Largura total</label>
            </div>
        </div>
    );
};

Button.craft = {
    displayName: 'Botão',
    props: {
        label: 'Clique Aqui',
        href: '#',
        variant: 'bg-blue-700 hover:bg-blue-800 text-white',
        size: 'py-2 px-5 text-base',
        rounded: 'rounded-lg',
        fullWidth: false,
    },
    related: {
        settings: ButtonSettings,
    },
};

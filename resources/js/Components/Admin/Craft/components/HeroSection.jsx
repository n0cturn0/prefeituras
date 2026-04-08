import React from 'react';
import { useNode } from '@craftjs/core';

const bgOptions = [
    { label: 'Azul Escuro', value: 'bg-blue-900' },
    { label: 'Azul', value: 'bg-blue-700' },
    { label: 'Cinza Escuro', value: 'bg-gray-800' },
    { label: 'Verde Escuro', value: 'bg-green-900' },
    { label: 'Imagem (URL)', value: 'bg-cover bg-center' },
];
const heightOptions = ['min-h-[200px]', 'min-h-[300px]', 'min-h-[400px]', 'min-h-[500px]'];
const alignOptions = [
    { label: 'Esquerda', value: 'text-left items-start' },
    { label: 'Centro', value: 'text-center items-center' },
    { label: 'Direita', value: 'text-right items-end' },
];

export const HeroSection = ({ title, subtitle, bgColor, bgImage, height, alignment, overlayOpacity }) => {
    const { connectors: { connect, drag }, isSelected } = useNode((state) => ({
        isSelected: state.events.selected,
    }));

    const style = bgImage ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};

    return (
        <div
            ref={(ref) => connect(drag(ref))}
            className={`relative w-full ${height} ${!bgImage ? bgColor : ''} flex flex-col justify-center px-8 ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
            style={style}
        >
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black"
                style={{ opacity: parseFloat(overlayOpacity) || 0 }}
            />
            <div className={`relative z-10 max-w-3xl flex flex-col ${alignment}`}>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">{title}</h2>
                {subtitle && <p className="text-lg text-white/80">{subtitle}</p>}
            </div>
        </div>
    );
};

const HeroSettings = () => {
    const { actions: { setProp }, title, subtitle, bgColor, bgImage, height, alignment, overlayOpacity } = useNode((node) => ({
        title: node.data.props.title,
        subtitle: node.data.props.subtitle,
        bgColor: node.data.props.bgColor,
        bgImage: node.data.props.bgImage,
        height: node.data.props.height,
        alignment: node.data.props.alignment,
        overlayOpacity: node.data.props.overlayOpacity,
    }));

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Título</label>
                <input type="text" className="w-full border rounded px-2 py-1 text-sm" value={title || ''} onChange={(e) => setProp((p) => (p.title = e.target.value))} />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Subtítulo</label>
                <input type="text" className="w-full border rounded px-2 py-1 text-sm" value={subtitle || ''} onChange={(e) => setProp((p) => (p.subtitle = e.target.value))} />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cor de Fundo</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={bgColor} onChange={(e) => setProp((p) => (p.bgColor = e.target.value))}>
                    {bgOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">URL da Imagem de Fundo</label>
                <input type="text" className="w-full border rounded px-2 py-1 text-sm" value={bgImage || ''} placeholder="https://... ou deixe vazio" onChange={(e) => setProp((p) => (p.bgImage = e.target.value))} />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Opacidade do Overlay (0 a 1)</label>
                <input type="number" min="0" max="1" step="0.1" className="w-full border rounded px-2 py-1 text-sm" value={overlayOpacity || 0} onChange={(e) => setProp((p) => (p.overlayOpacity = e.target.value))} />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Altura mínima</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={height} onChange={(e) => setProp((p) => (p.height = e.target.value))}>
                    {heightOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Alinhamento</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={alignment} onChange={(e) => setProp((p) => (p.alignment = e.target.value))}>
                    {alignOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            </div>
        </div>
    );
};

HeroSection.craft = {
    displayName: 'Seção Hero',
    props: {
        title: 'Bem-vindo à nossa Prefeitura',
        subtitle: 'Transparência, eficiência e serviço ao cidadão.',
        bgColor: 'bg-blue-900',
        bgImage: '',
        height: 'min-h-[300px]',
        alignment: 'text-left items-start',
        overlayOpacity: 0.3,
    },
    related: {
        settings: HeroSettings,
    },
};

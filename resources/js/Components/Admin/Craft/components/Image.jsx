import React, { useRef, useState } from 'react';
import { useNode } from '@craftjs/core';
import axios from 'axios';

const widthOptions = ['w-full', 'w-1/2', 'w-1/3', 'w-2/3', 'w-auto'];
const roundedOptions = ['rounded-none', 'rounded', 'rounded-lg', 'rounded-xl', 'rounded-full'];
const objectFitOptions = ['object-cover', 'object-contain', 'object-fill', 'object-none'];

export const Image = ({ src, alt, width, rounded, objectFit, height }) => {
    const { connectors: { connect, drag }, isSelected } = useNode((state) => ({
        isSelected: state.events.selected,
    }));

    return (
        <div
            ref={(ref) => connect(drag(ref))}
            className={`${width} ${isSelected ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    className={`${width} ${rounded} ${objectFit}`}
                    style={{ height: height || 'auto' }}
                />
            ) : (
                <div className="w-full h-40 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    📷 Selecione uma imagem no painel
                </div>
            )}
        </div>
    );
};

const ImageSettings = () => {
    const { actions: { setProp }, src, alt, width, rounded, objectFit, height } = useNode((node) => ({
        src: node.data.props.src,
        alt: node.data.props.alt,
        width: node.data.props.width,
        rounded: node.data.props.rounded,
        objectFit: node.data.props.objectFit,
        height: node.data.props.height,
    }));

    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const form = new FormData();
            form.append('files', file);
            const response = await axios.post('/upload', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // The upload endpoint returns an array of uploaded file URLs
            const url = response.data?.data?.[0]?.src || response.data?.[0]?.src || response.data?.src;
            if (url) {
                setProp((p) => (p.src = url));
            } else {
                setError('URL de retorno não encontrada.');
            }
        } catch (err) {
            setError('Erro no upload: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Imagem</label>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm py-2 px-3 rounded"
                >
                    {uploading ? 'Enviando...' : '📂 Selecionar / Fazer Upload'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">URL Manual</label>
                <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={src || ''}
                    placeholder="https://..."
                    onChange={(e) => setProp((p) => (p.src = e.target.value))}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Texto alternativo</label>
                <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={alt || ''}
                    onChange={(e) => setProp((p) => (p.alt = e.target.value))}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Largura</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={width} onChange={(e) => setProp((p) => (p.width = e.target.value))}>
                    {widthOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Altura (px ou auto)</label>
                <input
                    type="text"
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={height || ''}
                    placeholder="auto ou 200px"
                    onChange={(e) => setProp((p) => (p.height = e.target.value))}
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Borda arredondada</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={rounded} onChange={(e) => setProp((p) => (p.rounded = e.target.value))}>
                    {roundedOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Ajuste de imagem</label>
                <select className="w-full border rounded px-2 py-1 text-sm" value={objectFit} onChange={(e) => setProp((p) => (p.objectFit = e.target.value))}>
                    {objectFitOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            </div>
        </div>
    );
};

Image.craft = {
    displayName: 'Imagem',
    props: {
        src: '',
        alt: 'Imagem',
        width: 'w-full',
        rounded: 'rounded-lg',
        objectFit: 'object-cover',
        height: 'auto',
    },
    related: {
        settings: ImageSettings,
    },
};

import React from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Text, Container, Image, Button, HeroSection } from './components';

const BlockItem = ({ label, icon, component }) => {
    const { connectors } = useEditor();

    return (
        <div
            ref={(ref) => connectors.create(ref, component)}
            className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all select-none"
            title={`Arrastar: ${label}`}
        >
            <span className="text-2xl">{icon}</span>
            <span className="text-xs text-gray-600 font-medium">{label}</span>
        </div>
    );
};

export const Toolbox = () => {
    const blocks = [
        {
            label: 'Container',
            icon: '⬜',
            component: (
                <Element is={Container} canvas padding="p-4" bg="bg-white" layout="block" rounded="rounded-lg" shadow="shadow-sm" />
            ),
        },
        {
            label: 'Flex Row',
            icon: '↔️',
            component: (
                <Element is={Container} canvas padding="p-4" bg="bg-transparent" layout="flex flex-row gap-4" rounded="rounded-none" shadow="" />
            ),
        },
        {
            label: 'Grid 2 Col',
            icon: '▦',
            component: (
                <Element is={Container} canvas padding="p-4" bg="bg-transparent" layout="grid grid-cols-2 gap-4" rounded="rounded-none" shadow="" />
            ),
        },
        {
            label: 'Texto',
            icon: '📝',
            component: <Text text="Clique para editar..." fontSize="text-base" alignment="text-left" color="text-gray-900" weight="font-normal" isHeading={false} />,
        },
        {
            label: 'Título',
            icon: 'H',
            component: <Text text="Seu Título Aqui" fontSize="text-2xl" alignment="text-left" color="text-gray-900" weight="font-bold" isHeading={true} />,
        },
        {
            label: 'Imagem',
            icon: '🖼️',
            component: <Image src="" alt="Imagem" width="w-full" rounded="rounded-lg" objectFit="object-cover" height="auto" />,
        },
        {
            label: 'Botão',
            icon: '🔲',
            component: <Button label="Clique Aqui" href="#" variant="bg-blue-700 hover:bg-blue-800 text-white" size="py-2 px-5 text-base" rounded="rounded-lg" fullWidth={false} />,
        },
        {
            label: 'Hero',
            icon: '🏛️',
            component: (
                <HeroSection
                    title="Bem-vindo à nossa Prefeitura"
                    subtitle="Transparência, eficiência e serviço ao cidadão."
                    bgColor="bg-blue-900"
                    bgImage=""
                    height="min-h-[300px]"
                    alignment="text-left items-start"
                    overlayOpacity={0.3}
                />
            ),
        },
    ];

    return (
        <aside className="w-[200px] min-w-[200px] bg-gray-50 border-r border-gray-200 flex flex-col overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-200 bg-white">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Blocos</h3>
                <p className="text-xs text-gray-400 mt-0.5">Arraste para a tela</p>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 auto-rows-min">
                {blocks.map((block) => (
                    <BlockItem key={block.label} {...block} />
                ))}
            </div>
        </aside>
    );
};

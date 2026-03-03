import React from 'react';

const BlockRenderer = ({ content }) => {
    if (!content) return null;

    let blocks = [];
    try {
        const data = typeof content === 'string' ? JSON.parse(content) : content;
        blocks = data.blocks || [];
    } catch (e) {
        console.error("Error parsing content:", e);
        return <p className="text-red-500">Erro ao carregar conteúdo.</p>;
    }

    return (
        <div className="space-y-6">
            {blocks.map((block) => {
                switch (block.type) {
                    case 'header':
                        const Tag = `h${block.data.level}`;
                        return (
                            <Tag key={block.id} className="font-bold text-gray-900 mb-4 mt-8" style={{
                                fontSize: block.data.level === 2 ? '1.875rem' : block.data.level === 3 ? '1.5rem' : '1.25rem'
                            }}>
                                {block.data.text}
                            </Tag>
                        );

                    case 'paragraph':
                        return (
                            <p key={block.id} className="text-gray-700 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: block.data.text }} />
                        );

                    case 'list':
                        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                        return (
                            <ListTag key={block.id} className={`list-outside ml-6 space-y-2 text-gray-700 ${block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
                                {block.data.items.map((item, index) => (
                                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                                ))}
                            </ListTag>
                        );

                    case 'image':
                        return (
                            <figure key={block.id} className="my-8">
                                <img
                                    src={block.data.file?.url}
                                    alt={block.data.caption || "Imagem do conteúdo"}
                                    className={`rounded-lg shadow-md max-w-full h-auto ${block.data.withBorder ? 'border' : ''} ${block.data.withBackground ? 'bg-gray-100 p-4' : ''} ${block.data.stretched ? 'w-full' : ''}`}
                                />
                                {block.data.caption && (
                                    <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                                        {block.data.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );

                    case 'table':
                        const { content: rows, withHeadings } = block.data;
                        return (
                            <div key={block.id} className="overflow-x-auto my-6">
                                <table className="min-w-full divide-y divide-gray-200 border">
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {rows.map((row, rowIndex) => (
                                            <tr key={rowIndex} className={withHeadings && rowIndex === 0 ? "bg-gray-50 font-semibold" : ""}>
                                                {row.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className="px-6 py-4 whitespace-normal text-sm text-gray-700 border-r last:border-r-0" dangerouslySetInnerHTML={{ __html: cell }} />
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );

                    default:
                        console.warn('Unknown block type', block.type);
                        return null;
                }
            })}
        </div>
    );
};

export default BlockRenderer;

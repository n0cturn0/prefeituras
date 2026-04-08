import React, { useState } from 'react';
import { Link2, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { router } from '@inertiajs/react';

/**
 * Painel de importação automática via URL (Web Scraping).
 *
 * Props:
 *   onImport(data) — chamado com os dados capturados para preencher o formulário pai
 */
export default function ImportadorURL({ onImport }) {
    const [url, setUrl]         = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus]   = useState(null); // { type: 'success'|'error', message: string }

    const handleScrape = async () => {
        if (!url.trim()) {
            setStatus({ type: 'error', message: 'Informe uma URL válida.' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await axios.post(route('departments.scrape'), { url }, {
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            const result = response.data;

            if (result.success) {
                setStatus({ type: 'success', message: result.message });
                // Redireciona após 2,5 segundos para permitir leitura da mensagem
                setTimeout(() => {
                    router.visit(route('departments.index'));
                }, 2500);
            } else {
                setStatus({ type: 'error', message: result.message });
            }
        } catch (err) {
            const msg = err.response?.data?.message
                ?? err.response?.data?.errors?.url?.[0]
                ?? 'Erro ao processar a requisição. Verifique a URL e tente novamente.';
            setStatus({ type: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/50 p-5 space-y-3">
            {/* Cabeçalho */}
            <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
                <div>
                    <p className="text-sm font-semibold text-blue-800">Importação Automática via URL</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                        Informe a URL de uma secretaria ou prefeitura e tentaremos preencher os campos automaticamente.
                    </p>
                </div>
            </div>

            {/* Campo URL + Botão */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                        placeholder="https://www.prefeitura.rs.gov.br/secretaria/financas"
                        disabled={loading}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleScrape}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Capturando...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            Capturar Dados
                        </>
                    )}
                </button>
            </div>

            {/* Feedback */}
            {status && (
                <div className={`flex items-start gap-2 text-sm px-3 py-2 rounded-lg ${
                    status.type === 'success'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                    {status.type === 'success'
                        ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                        : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    }
                    <span>{status.message}</span>
                </div>
            )}

            <p className="text-xs text-slate-400">
                ⚠️ Ao clicar, a entidade e todas as secretarias encontradas na mesma página serão importadas automaticamente para o banco de dados.
            </p>
        </div>
    );
}

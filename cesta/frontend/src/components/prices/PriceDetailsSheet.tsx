import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import type { PesquisaMaterialDetalheDTO, PesquisaServicoDetalheDTO, PesquisaMaterialDTO, PesquisaServicoDTO } from "./types";

interface PriceDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: PesquisaMaterialDTO | PesquisaServicoDTO | null;
  type?: 'material' | 'servico';
}

export function PriceDetailsSheet({ open, onOpenChange, item, type = 'material' }: PriceDetailsSheetProps) {
  const [details, setDetails] = useState<PesquisaMaterialDetalheDTO | PesquisaServicoDetalheDTO | null>(null);
  const [loading, setLoading] = useState(false);
  
  const idItemCompra = item?.idItemCompra;
  const isPncpOfficial = item?.origem === 'PNCP_OFICIAL';

  const summary = item ? {
      descricao: (item as any).descricaoItem || (item as any).marca || "Item sem descrição",
      fornecedor: item.nomeFornecedor,
      preco: item.precoUnitario,
      orgao: item.nomeUasg,
      numeroControlePNCP: item.numeroControlePNCP,
      cnpjOrgao: item.cnpjOrgao,
      linkAtaPNCP: item.linkAtaPNCP,
      origem: item.origem
  } : null;

  useEffect(() => {
    if (isPncpOfficial) {
         setDetails(null);
         return;
    }

    if (open && idItemCompra) {
      setLoading(true);
      const endpoint = type === 'material' 
        ? `/api/pesquisa-preco/materiais/detalhe?idItemCompra=${idItemCompra}`
        : `/api/pesquisa-preco/servicos/detalhe?idItemCompra=${idItemCompra}`;
        
      fetch(endpoint)
        .then(res => {
            if (!res.ok) throw new Error("No Content");
            return res.json();
        })
        .then(data => setDetails(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
        setDetails(null);
    }
  }, [open, idItemCompra, type, isPncpOfficial]);
  
  const isPncp = summary?.origem === 'PNCP' || isPncpOfficial;
  
  const getPncpLink = () => {
       if (summary?.linkAtaPNCP) return summary.linkAtaPNCP;
       if (isPncpOfficial && summary?.numeroControlePNCP) {
           // For Contratações (Editais), using general search or specific edital link if pattern known
           // Using contratacoes link which is quite generic for PNCP
           return `https://pncp.gov.br/app/contratacoes/${summary.numeroControlePNCP}/resumo`;
       }
       if (summary?.numeroControlePNCP) {
           return `https://pncp.gov.br/app/atas/${summary.numeroControlePNCP}`;
       }
       return '#';
  };
  
  const pncpLink = getPncpLink();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Detalhes da Compra/Ata</SheetTitle>
          <SheetDescription>
            Informações detalhadas sobre o item e o processo.
          </SheetDescription>
        </SheetHeader>

        {summary && (
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-slate-900 text-sm">{summary.descricao}</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 whitespace-nowrap">
                        R$ {summary.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Badge>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                    <p><span className="font-medium text-slate-700">Fornecedor:</span> {summary.fornecedor}</p>
                    <p><span className="font-medium text-slate-700">Órgão:</span> {summary.orgao}</p>
                    {summary.cnpjOrgao && <p><span className="font-medium text-slate-700">CNPJ Órgão:</span> {summary.cnpjOrgao}</p>}
                    {summary.numeroControlePNCP && <p><span className="font-medium text-slate-700">Ctrl PNCP:</span> {summary.numeroControlePNCP}</p>}
                </div>
                
                {isPncp && (
                    <div className="pt-2">
                         <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" size="sm" onClick={() => window.open(pncpLink, '_blank')}>
                             Visualizar no PNCP
                         </Button>
                    </div>
                )}
            </div>
        )}

        <div className="mt-6">
            {loading ? (
                <div className="flex justify-center py-12 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : details ? (
                <ScrollArea className="h-[50vh] pr-4">
                    <div className="space-y-6">
                        <section>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> 
                                Descrição Detalhada
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded border border-slate-100 shadow-sm">
                                {(details as any).descricaoDetalhadaItem || (details as any).descricaoDetalhadaServico || "Sem descrição detalhada."}
                            </p>
                        </section>

                        <section>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" /> 
                                Objeto da Compra
                            </h4>
                            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded border border-slate-100 shadow-sm">
                                {details.objetoCompra || "Não informado."}
                            </p>
                        </section>
                    </div>
                </ScrollArea>
            ) : (
                <p className="text-center text-slate-400 py-12">
                    {isPncpOfficial ? "Para detalhes do Edital, acesse o link do PNCP acima." : "Nenhum detalhe adicional encontrado."}
                </p>
            )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

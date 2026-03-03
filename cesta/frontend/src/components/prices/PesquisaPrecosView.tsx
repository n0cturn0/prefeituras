import { useState } from "react";
import { Plus, Loader2, CheckCircle, AlertCircle, Building2, Package, Settings, Calendar, Filter, FileText, Save } from "lucide-react";
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PriceDetailsSheet } from "./PriceDetailsSheet";
import { BpsEvidenceDialog } from "./BpsEvidenceDialog";
import { ItemSearchCombobox } from "@/components/prices/ItemSearchCombobox";
import type { PesquisaMaterialDTO, PesquisaServicoDTO } from "./types";

export function PesquisaPrecosView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"material" | "servico">("material");
  const [uf, setUf] = useState<string>("all");
  const [onlyPncp, setOnlyPncp] = useState(false);
  const [showArp, setShowArp] = useState(false);
  const [incluirBps, setIncluirBps] = useState(false);
  
  // Advanced Filters
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [modalidade, setModalidade] = useState("all");
  const [cnpjOrgao, setCnpjOrgao] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Lifecycle Toggles
  const [viewMode, setViewMode] = useState<"item" | "notice" | "contract" | "invoice">("item");

  // Supplier Locality Search
  const [filterMun, setFilterMun] = useState("");
  
  const [catalogItems, setCatalogItems] = useState<{codigoItem: number, descricaoItem: string, type?: string}[]|null>(null);
  const [results, setResults] = useState<(PesquisaMaterialDTO | PesquisaServicoDTO)[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Virtualization
  const parentRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const rowVirtualizer = useVirtualizer({
      count: results.length,
      getScrollElement: () => parentRef.current,
      estimateSize: () => 50,
      overscan: 10,
  });

  // Sheet State
  const [selectedItem, setSelectedItem] = useState<PesquisaMaterialDTO | PesquisaServicoDTO | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);

  const [selectedServiceClass, setSelectedServiceClass] = useState<{id: string, label: string} | null>(null);
  const [currentSearchLabel, setCurrentSearchLabel] = useState("");
  
  // Basket State
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Basket Statistics
  const basketStats = useState(() => {
      // We calculate this in render or useMemo, but here we just need the state to trigger re-renders?
      // Actually, derived state is better.
      return { count: 0, mean: 0, median: 0 };
  })[0]; // dummy, we'll use derived var

  const stats = (() => {
      if (selectedItems.size === 0) return { count: 0, mean: 0, median: 0 };
      const selectedPrices = results
          .filter(r => selectedItems.has(String(r.idItemCompra)))
          .map(r => r.precoUnitario || parseFloat((r as any).valorItemCompra) || 0)
          .filter(p => p > 0)
          .sort((a, b) => a - b);
      
      const count = selectedPrices.length;
      const sum = selectedPrices.reduce((a, b) => a + b, 0);
      const mean = count > 0 ? sum / count : 0;
      const mid = Math.floor(count / 2);
      const median = count === 0 ? 0 : count % 2 !== 0 ? selectedPrices[mid] : (selectedPrices[mid - 1] + selectedPrices[mid]) / 2;
      
      return { count, mean, median };
  })();

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedItems);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedItems(newSet);
  };

  const toggleSelectAll = () => {
      if (selectedItems.size === results.length && results.length > 0) {
          setSelectedItems(new Set());
      } else {
          setSelectedItems(new Set(results.map(r => String(r.idItemCompra))));
      }
  };

  const isOutlier = (price: number) => {
       if (stats.count < 3) return false;
       if (price > stats.median * 1.25) return "high";
       if (price < stats.median * 0.75) return "low";
       return false;
  };

  // Toast State
  const [toastMessage, setToastMessage] = useState<{msg: string, type: 'error' | 'success' | 'warning'} | null>(null);

  const showToast = (msg: string, type: 'error' | 'success' | 'warning' = 'error') => {
      console.log(`[Toast] Showing: ${msg} (${type})`);
      setToastMessage({ msg, type });
      setTimeout(() => setToastMessage(null), 5000);
  };
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const handleSearchWithParams = async (codeStr: string | null, type: "material" | "servico" | "pdm" | "servico_class", label?: string) => {
    console.log("[Search] Initiated with:", { codeStr, type, label, viewMode, dataInicio, dataFim, cnpjOrgao });

    // Determine Search Mode based on View Mode
    if (viewMode === 'item' && !codeStr) {
        console.warn("[Search] Aborted: Item mode requires codeStr");
        return;
    }
    
    // Date Validation Logic moved to where it is needed (Price Search)
    
    setLoading(true);
    setHasSearched(true);
    setResults([]);
    setCatalogItems(null);
    setSelectedServiceClass(null);

    try {
        if (viewMode === 'invoice') {
             setCurrentSearchLabel("Faturamento / Cobrança");
             let url = `/api/pesquisa-preco/execucao/faturamento?dataInicial=${dataInicio}&dataFinal=${dataFim}&pagina=1`;
             if (cnpjOrgao) url += `&cnpjOrgao=${cnpjOrgao}`;
             
             console.log("[Search] Fetching Invoices:", url);
             const res = await fetch(url);
             if (res.ok) {
                 const data = await res.json();
                 console.log("[Search] Invoices Data:", data);
                 const mapped = data.map((i: any) : PesquisaMaterialDTO => ({
                     idItemCompra: i.idInstrumentoCobranca,
                     idCompra: i.idInstrumentoCobranca,
                     dataCompra: i.dataEmissao,
                     dataVigenciaFinal: i.dataVencimento,
                     precoUnitario: i.valorTotal,
                     quantidade: 1,
                     unidade: i.tipoInstrumentoCobrancaNome || 'Cobrança',
                     municipio: i.municipioNome,
                     uf: 'MS',
                     uasg: 0,
                     nomeUasg: i.orgaoNome, 
                     nomeFornecedor: i.nomeRazaoSocialFornecedor,
                     niFornecedor: i.niFornecedor,
                     marca: i.numeroInstrumentoCobranca, 
                     descricaoItem: `Ref. Contrato: ${i.numeroContratoEmpenho || 'N/A'}`,
                     numeroControlePNCP: i.idInstrumentoCobranca?.toString(),
                     cnpjOrgao: i.orgaoCnpj,
                     origem: 'PNCP_COBRANCA'
                 }));
                 setResults(mapped);
             }
             setLoading(false);
             return;
        }

        if (viewMode === 'contract') {
             setCurrentSearchLabel("Execução / Contratos");
             let url = `/api/pesquisa-preco/execucao/contratos?dataInicial=${dataInicio}&dataFinal=${dataFim}&pagina=1`;
             if (uf !== 'all') url += `&uf=${uf}`;
             if (cnpjOrgao) url += `&cnpjOrgao=${cnpjOrgao}`;
             
             console.log("[Search] Fetching Contracts:", url);
             const res = await fetch(url);
             if (res.ok) {
                 const data = await res.json();
                 console.log("[Search] Contracts Data:", data);
                 const mapped = data.map((c: any) : PesquisaMaterialDTO => ({
                     idItemCompra: c.idContrato,
                     idCompra: c.idContrato,
                     dataCompra: c.dataAssinatura || c.dataVigenciaInicio,
                     dataVigenciaFinal: c.dataVigenciaFim,
                     precoUnitario: c.valorInicial,
                     quantidade: 1,
                     unidade: 'Contrato',
                     municipio: c.municipioNome,
                     uf: c.ufSigla,
                     uasg: 0,
                     nomeUasg: c.unidadeOrgaoNome || c.orgaoNome,
                     nomeFornecedor: c.nomeRazaoSocialFornecedor,
                     niFornecedor: c.niFornecedor,
                     marca: c.objetoContrato,
                     descricaoItem: c.numeroContratoEmpenho || "Contrato/Empenho",
                     numeroControlePNCP: c.numeroControlePNCP,
                     cnpjOrgao: c.orgaoCnpj,
                     origem: 'PNCP_EXECUCAO'
                 }));
                 setResults(mapped);
             }
             setLoading(false);
             return;
        }

        if (viewMode === 'notice') {
             setCurrentSearchLabel("Editais / Publicações");
             let url = `/api/pesquisa-preco/contratacoes/publicacao?dataInicial=${dataInicio}&dataFinal=${dataFim}&pagina=1`;
             if (uf !== 'all') url += `&uf=${uf}`;
             if (modalidade !== 'all') url += `&codigoModalidadeContratacao=${modalidade}`;
             
             console.log("[Search] Fetching Notices:", url);
             const res = await fetch(url);
             if (res.ok) {
                 const data = await res.json();
                 console.log("[Search] Notice Data:", data);
                 const mapped = data.map((n: any) : PesquisaMaterialDTO => ({
                     idItemCompra: n.idContratacao,
                     idCompra: n.idContratacao,
                     dataCompra: n.dataPublicacaoPncp?.substring(0, 10),
                     precoUnitario: 0,
                     quantidade: 1,
                     unidade: 'Edital',
                     municipio: n.municipioNome,
                     uf: n.ufSigla,
                     uasg: n.uasg,
                     nomeUasg: n.unidadeOrgaoNome || n.orgaoNome, 
                     nomeFornecedor: "Licitação Pública",
                     marca: n.objetoCompra || "Objeto não informado",
                     descricaoItem: n.objetoCompra,
                     numeroControlePNCP: n.numeroControlePNCP,
                     cnpjOrgao: n.orgaoCnpj,
                     origem: 'PNCP_OFICIAL',
                     recebimentoProposta: n.recebimentoProposta
                 }));
                 setResults(mapped);
             }
             setLoading(false);
             return;
        }
    
        if (!codeStr) return;
        
        // Allow text search if BPS is enabled (for Description Search)
        // Check if numeric
        const isNumeric = /^\d+$/.test(codeStr);
        const code = isNumeric ? parseInt(codeStr) : 0;
        
        if (!isNumeric && !incluirBps) {
             // If manual text search without BPS, maybe show error or PDM search?
             // Current logic enforces Code. Only PDM allows searching items.
             // But let's allow "BPS Description Search" if BPS is checked.
             showToast("Para busca textual, ative a opção 'Incluir BPS' ou insira um código numérico.", "warning");
             setLoading(false);
             return;
        }

        setCurrentSearchLabel(label ? `${label} (${codeStr})` : isNumeric ? `Item: ${codeStr}` : `Busca: ${codeStr}`);

        // Standard Item Search
        if (type === 'pdm' && isNumeric) {
            const url = `/api/pesquisa-preco/items-by-pdm?pdm=${code}`;
            console.log("[Search] Fetching PDM Items:", url);
            const res = await fetch(url);
            if (res.ok) {
                const items = await res.json();
                console.log("[Search] PDM Items:", items);
                setCatalogItems(items);
            }
            setLoading(false);
            return;
        }
        
        if (type === 'servico_class') {
            setSelectedServiceClass({ id: codeStr, label: label || "Classe de Serviço" });
            
            try {
                // Fetch subclasses
                const subclassesRes = await fetch(`/api/catser/subclasses?codigoClasse=${code}`);
                if (subclassesRes.ok) {
                    const subclasses = await subclassesRes.json();
                    
                    // Fetch services for each subclass
                    const servicosPromises = subclasses.map((sc: any) => 
                        fetch(`/api/catser/servicos?codigoSubclasse=${sc.codigoSubclasse}`).then(r => r.ok ? r.json() : [])
                    );
                    
                    const servicosArrs = await Promise.all(servicosPromises);
                    const allServicos = servicosArrs.flat();
                    
                    setCatalogItems(allServicos.map((s: any) => ({
                        codigoItem: s.codigoServico,
                        descricaoItem: s.nomeServico,
                        type: 'servico'
                    })));
                } else {
                    showToast("Erro ao buscar serviços para a classe", "error");
                }
            } catch(e) {
                console.error("Error fetching services", e);
                showToast("Erro ao buscar serviços para a classe", "error");
            }
            setLoading(false);
            return;
        }

        // Validate Dates for Price Search
        // Validate Dates stripped for Price Search to allow legacy/BPS search without dates
        // if (!dataInicio || !dataFim) { ... }
        const dStart = new Date(dataInicio);
        const dEnd = new Date(dataFim);
        if (Math.ceil(Math.abs(dEnd.getTime() - dStart.getTime()) / (1000 * 60 * 60 * 24)) > 365) {
            showToast("O intervalo de datas não pode ser superior a 365 dias (Limite do PNCP).", "error");
            setLoading(false);
            return;
        }

        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        // SSE STREAMING for Material Search
        if (type === 'material' && !onlyPncp && !showArp) {
             const queryParams = new URLSearchParams();
             queryParams.append("codigoItemCatalogo", code.toString());
             queryParams.append("pagina", "1");
             if(uf !== "all") queryParams.append("uf", uf);
             
             if (incluirBps) {
                  queryParams.append("incluirBps", "true");
                  if (!isNumeric) queryParams.append("descCatmat", codeStr);
                  else if (label) queryParams.append("descCatmat", label);
             }

             const url = `/api/pesquisa-preco/materiais?${queryParams.toString()}`;
             console.log("[SSE] Connecting to:", url);

             const eventSource = new EventSource(url);
             eventSourceRef.current = eventSource;
             
             let totalItems = 0;

             eventSource.addEventListener("result-batch", (event) => {
                 try {
                     const batch = JSON.parse(event.data);
                     if (Array.isArray(batch) && batch.length > 0) {
                         console.log(`[SSE] Received batch of ${batch.length}`);
                         
                         // Helper for filtering
                         let filteredBatch = uf === 'all' ? batch : batch.filter((r: any) => !r.uf || r.uf === uf);
                         if (filterMun) {
                            filteredBatch = filteredBatch.filter((r: any) => 
                                (r.municipioFornecedor && r.municipioFornecedor.toLowerCase().includes(filterMun.toLowerCase())) ||
                                (r.municipio && r.municipio.toLowerCase().includes(filterMun.toLowerCase())) 
                            );
                         }

                         totalItems += filteredBatch.length;
                         setResults(prev => [...prev, ...filteredBatch]);
                         
                         // Update toast occasionally or simple counter in UI?
                         // UI already shows results.length badge.
                     }
                 } catch (e) {
                     console.error("Error parsing batch", e);
                 }
             });

             eventSource.onerror = (err) => {
                 console.log("[SSE] Stream ended or error", err);
                 eventSource.close();
                 setLoading(false);
                 if (totalItems === 0) {
                     // Maybe show "No results" or just stop loading
                 }
             };
             
             // Safety timeout to stop loading if connection hangs
             setTimeout(() => {
                 if(loading) setLoading(false); 
             }, 300000); // 5 min

             return;
        }

        let endpoints: string[] = [];
        const queryParams = new URLSearchParams();
        if (uf !== "all") queryParams.append("uf", uf); 
        
        if (onlyPncp) {
             endpoints.push(`/api/pesquisa-preco/pncp?codigoItemCatalogo=${code}`);
        } else if (showArp) {
             endpoints.push(`/api/pesquisa-preco/arp?codigoItemCatalogo=${code}`);
        } else {
             // Fallback or Service Search
             const base = type === "material" 
                ? `/api/pesquisa-preco/materiais?codigoItemCatalogo=${code}` // Should not be reached if logic matches above
                : `/api/pesquisa-preco/servicos?codigoServico=${code}`;
             endpoints.push(`${base}&${queryParams.toString()}`);
        }
        
        
        console.log("[Search] Endpoints:", endpoints);
        const responses = await Promise.all(endpoints.map(async e => {
            try {
                console.time(`Fetch ${e}`);
                const r = await fetch(e);
                console.timeEnd(`Fetch ${e}`);
                if (!r.ok) {
                    console.error(`Fetch failed for ${e}: ${r.status} ${r.statusText}`);
                    return [];
                }
                const json = await r.json();
                return json;
            } catch (err) {
                console.error(`Fetch error for ${e}`, err);
                return [];
            }
        }));
        const flatResults = responses.flat();
        console.log(`[Search] Total Flat Results: ${flatResults.length}`);
        
        let filtered = uf === 'all' ? flatResults : flatResults.filter((r: any) => !r.uf || r.uf === uf);
        
        if (filterMun) {
            filtered = filtered.filter((r: any) => 
                (r.municipioFornecedor && r.municipioFornecedor.toLowerCase().includes(filterMun.toLowerCase())) ||
                (r.municipio && r.municipio.toLowerCase().includes(filterMun.toLowerCase())) 
            );
        }
        setResults(filtered);
        setCurrentPage(1); // Reset pagination

        // Check for Out of Range items (Relaxed Filter Warning)
        const hasOutOfRange = filtered.some((r: any) => {
            if (!r.dataCompra) return false;
            const d = new Date(r.dataCompra.substring(0, 10)); 
            return d < dStart || d > dEnd;
        });

        if (hasOutOfRange) {
             setTimeout(() => showToast("Alguns itens exibidos estão fora do período solicitado pois tiveram atualizações recentes (Filtro Relaxado).", "warning"), 500);
        }
        
        setLoading(false); // Explicit stop for normal flow
        
    } catch (error) {
        console.error("Search failed", error);
        showToast("Erro ao realizar busca. Tente novamente.", "error");
        setLoading(false); // Explicit stop for error
    } 
    // Finally removed to allow SSE to keep loading true
  };

  const handleSearch = () => handleSearchWithParams(searchTerm, searchType);

  const handleGenerateReport = async () => {
      if (selectedItems.size === 0) return;
      setIsGeneratingPdf(true);
      
      const itemsToReport = results.filter(r => selectedItems.has(String(r.idItemCompra)));
      const payload = {
          numeroProcesso: "001/2026", // Requirement
          responsavel: "Guto",
          descricaoObjeto: "Aquisição de itens diversos",
          itens: itemsToReport
      };

      try {
          const res = await fetch('/api/relatorios/mapa-precos/pdf', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          if (res.ok) {
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `mapa_precos_${new Date().toISOString().slice(0,10)}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              showToast("Relatório gerado com sucesso!", "success");
              a.remove();
              showToast("Relatório gerado com sucesso!", "success");
          } else {
              showToast("Erro ao gerar relatório.", "error");
          }
      } catch (e) {
          console.error(e);
          showToast("Erro de conexão ao gerar relatório.", "error");
      } finally {
          setIsGeneratingPdf(false);
      }
  };

  const handleSaveBasket = async () => {
      if (selectedItems.size === 0) return;

      const itemsToSave = results.filter(r => selectedItems.has(String(r.idItemCompra)));
      const payload = {
          numeroProcesso: "001/2026",
          responsavel: "Guto",
          descricaoObjeto: "Aquisição de itens diversos",
          itens: itemsToSave
      };

      try {
          const res = await fetch(`/api/processos/${encodeURIComponent("001/2026")}/cesta`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
          
          if (res.ok) {
              const id = await res.json();
              console.log("Cesta Salva ID:", id);
              showToast("Cesta de preços salva com sucesso!", "success");
          } else {
              showToast("Erro ao salvar cesta.", "error");
          }
      } catch (e) {
          console.error(e);
          showToast("Erro de conexão ao salvar cesta.", "error");
      }
  };

  const handleOpenDetails = (item: PesquisaMaterialDTO | PesquisaServicoDTO) => {
    setSelectedItem(item);
    // If BPS, open Evidence Dialog directly? Or generic sheet?
    // Let's open Evidence Dialog if it's BPS
    if ((item as any).origem === 'BPS') {
        setEvidenceOpen(true);
    } else {
        setSheetOpen(true);
    }
  };
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };
  const getDocLink = (item: any) => {
      if (item.linkAtaPNCP) return item.linkAtaPNCP;
      if (item.origem === 'PNCP_EXECUCAO' && item.numeroControlePNCP) {
          return `https://pncp.gov.br/app/contratos/${item.numeroControlePNCP}`;
      }
      if ((item.origem === 'PNCP_OFICIAL' || item.origem === 'PNCP_COBRANCA') && item.numeroControlePNCP) {
           return `https://pncp.gov.br/app/editais/${item.numeroControlePNCP}`;
      }
      if (item.numeroControlePNCP) return `https://pncp.gov.br/app/contratacoes/${item.numeroControlePNCP}`;
      return "#";
  };
  const isExpired = (dateStr?: string) => { if (!dateStr) return false; return new Date(dateStr) < new Date(); };
  const maskNi = (ni?: string) => { if (!ni) return ""; if (ni.length === 11) return "***." + ni.substring(3, 6) + "." + ni.substring(6, 9) + "-**"; return ni; };
  const minPrice = results.length > 0 ? Math.min(...results.map(r => r.precoUnitario)) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-inter text-slate-900 relative">
       {/* Breadcrumbs */}
       {hasSearched && currentSearchLabel && (
           <div className="flex items-center gap-2 text-sm text-slate-500 mb-[-20px]">
                <span>Pesquisa</span> <span>&gt;</span> <span className="font-medium text-slate-900">{currentSearchLabel}</span>
           </div>
       )}

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Pesquisa Full Cycle</h1>
        <p className="text-slate-500">Acompanhe o ciclo de vida da compra: Edital -&gt; Contrato -&gt; Execução.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col gap-4">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                 <Button variant={viewMode === 'item' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('item')} className={viewMode==='item'?'shadow-sm bg-white text-slate-900 border':''}>Item/Catálogo</Button>
                 <Button variant={viewMode === 'notice' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('notice')} className={viewMode==='notice'?'shadow-sm bg-white text-slate-900 border':''}>Editais</Button>
                 <Button variant={viewMode === 'contract' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('contract')} className={viewMode==='contract'?'shadow-sm bg-white text-slate-900 border':''}>Contratos</Button>
                 <Button variant={viewMode === 'invoice' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('invoice')} className={viewMode==='invoice'?'shadow-sm bg-white text-slate-900 border':''}>Faturamento</Button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 flex-wrap items-end relative z-50">
            {viewMode === 'item' && (
                <div className="md:w-[500px] w-full flex flex-col gap-4">
                    <Tabs value={searchType} onValueChange={(v) => setSearchType(v as "material" | "servico")} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-9">
                            <TabsTrigger value="material">Material/PDM</TabsTrigger>
                            <TabsTrigger value="servico">Serviço</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex gap-2">
                        <ItemSearchCombobox 
                            type={searchType} 
                            value={searchTerm}
                            onChange={setSearchTerm}
                            onSelect={(item) => {
                                setSearchTerm(item.id);
                                
                                console.log("[Search] Item Selected:", item);
                                const itemType = item.type ? item.type.toUpperCase() : searchType.toUpperCase();
                                
                                let typeParam: "material" | "servico" | "pdm" | "servico_class" = "material";
                                if (itemType === 'PDM') typeParam = 'pdm';
                                else if (itemType === 'SERVICO_CLASS') typeParam = 'servico_class';
                                else if (itemType === 'SERVICO') typeParam = 'servico';
                                
                                // Update UI label
                                setCurrentSearchLabel(item.label);

                                // Trigger Search immediately
                                setTimeout(() => handleSearchWithParams(item.id, typeParam, item.label), 50);
                            }} 
                        />
                        
                        {searchType === 'material' && (
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="shrink-0 w-10 px-0"><Settings className="h-4 w-4"/></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className="space-y-4">
                                        <h4 className="font-medium leading-none">Configurações de Busca</h4>
                                        <div className="flex items-center space-x-2">
                                            <input 
                                                type="checkbox" 
                                                id="bps-toggle" 
                                                checked={incluirBps} 
                                                onChange={e => setIncluirBps(e.target.checked)} 
                                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="bps-toggle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                                                Incluir BPS (Saúde)
                                            </label>
                                        </div>
                                        <p className="text-[10px] text-slate-400">Habilita busca simultânea no Banco de Preços em Saúde. Pode tornar a busca mais lenta.</p>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>
                </div>
            )}
            {viewMode !== 'item' && (
                 <div className="flex gap-2 items-center flex-1">
                      <div className="flex items-center gap-2 border rounded-md p-2 bg-slate-50">
                          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Período:</span>
                          <Input type="date" className="h-8 text-xs bg-white w-32" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                          <span className="text-slate-400">-</span>
                          <Input type="date" className="h-8 text-xs bg-white w-32" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                      </div>

                      <Input placeholder="CNPJ Órgão (Opcional)" value={cnpjOrgao} onChange={e => setCnpjOrgao(e.target.value)} className="h-[50px] w-48" />
                 </div>
            )}
            
             {/* BPS Toggle */}
             {viewMode === 'item' && searchType === 'material' && (
                <div className="flex items-center space-x-2 pb-3">
                    <input 
                        type="checkbox" 
                        id="bps-toggle" 
                        checked={incluirBps} 
                        onChange={e => setIncluirBps(e.target.checked)} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                    <label htmlFor="bps-toggle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">
                        Incluir BPS (Saúde)
                    </label>
                </div>
            )}
            <div className="w-full md:w-32">
                <Select value={uf} onValueChange={setUf}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="MS">MS</SelectItem><SelectItem value="DF">DF</SelectItem></SelectContent>
                </Select>
            </div>
            <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto min-w-[100px] bg-slate-900">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Pesquisar"}
            </Button>
        </div>
      </div>

      {/* Basket Summary Sticky Header */}
       {selectedItems.size > 0 && (
           <div className="sticky top-4 z-[40] bg-white border border-slate-200 shadow-lg p-4 mb-6 flex items-center justify-between rounded-xl ring-1 ring-slate-900/5 animate-in slide-in-from-top-2">
                <div className="flex gap-8 items-center pl-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Selecionados</span>
                        <div className="flex items-baseline gap-1">
                             <span className="text-2xl font-bold text-slate-900">{stats.count}</span>
                             <span className="text-sm text-slate-500">itens</span>
                        </div>
                    </div>
                     <div className="h-10 w-px bg-slate-200"></div>
                     <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Média</span>
                        <span className="text-lg font-medium text-slate-700">{formatCurrency(stats.mean)}</span>
                    </div>
                     <div className="h-10 w-px bg-slate-200"></div>
                     <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Mediana</span>
                        <span className="text-xl font-bold text-blue-700">{formatCurrency(stats.median)}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="gap-2 border-slate-300 hover:bg-slate-50 hover:text-slate-900" onClick={handleGenerateReport} disabled={isGeneratingPdf}>
                        {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin text-blue-600"/> : <FileText className="h-4 w-4 text-red-500"/>}
                        {isGeneratingPdf ? "Gerando..." : "Gerar Relatório PDF"}
                    </Button>
                     <Button size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-sm" onClick={handleSaveBasket}>
                        <Save className="h-4 w-4"/>
                        Salvar Cesta
                    </Button>
                </div>
           </div>
       )}

      {/* Results Section */}
      {hasSearched && (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-2 border-b border-slate-100">
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <span>Resultados <Badge variant="secondary" className="ml-2">{results.length > 0 ? results.length : (catalogItems?.length || 0)}</Badge></span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div ref={parentRef} className="h-[600px] overflow-auto relative rounded-md border w-full">
                <Table className="min-w-[1200px] w-full">
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[40px] pl-4">
                                <Checkbox 
                                    checked={results.length > 0 && selectedItems.size === results.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead className="w-[40px] text-center text-xs text-slate-400">#</TableHead>
                           {/* Dynamic Header based on content */}
                           {catalogItems ? (
                               <>
                                   <TableHead>Código do Item</TableHead>
                                   <TableHead>Descrição do Item (PDM Selecionado)</TableHead>
                                   <TableHead className="w-[120px]">Ação</TableHead>
                               </>
                           ) : incluirBps ? (
                               // BPS Specific Headers
                               <>
                                   <TableHead>Data Homolog.</TableHead>
                                   <TableHead>CATMAT</TableHead>
                                   <TableHead>Unidade</TableHead>
                                   <TableHead>Modalidade</TableHead>
                                   <TableHead>Comprador / Instituição</TableHead>
                                   <TableHead>Local</TableHead>
                                   <TableHead className="text-right">Val. Unit</TableHead>
                                   <TableHead className="text-right">Qtd</TableHead>
                                   <TableHead className="text-right">Total</TableHead>
                                   <TableHead className="w-[100px]">Ação</TableHead>
                               </>
                           ) : (
                               // Default Headers
                               <>
                                   <TableHead className="w-[120px]">Timeline / Data</TableHead>
                                   <TableHead>Órgão / Localidade</TableHead>
                                   <TableHead>Detalhes / Fornecedor</TableHead>
                                   <TableHead className="text-right">Valor</TableHead>
                                   <TableHead className="w-[50px]"></TableHead>
                               </>
                           )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {catalogItems ? (
                            // Render Catalog Items from PDM
                            catalogItems.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-8">Nenhum item encontrado neste PDM.</TableCell></TableRow>
                            ) : (
                                catalogItems.map((catItem: any) => (
                                    <TableRow key={catItem.codigoItem} className="hover:bg-slate-50">
                                        <TableCell></TableCell>
                                        <TableCell className="text-center text-xs text-slate-400 font-mono">
                                             - 
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">{catItem.codigoItem}</TableCell>
                                        <TableCell>{catItem.descricaoItem}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline" className="text-xs" onClick={() => handleSearchWithParams(catItem.codigoItem.toString(), catItem.type || 'material', catItem.descricaoItem)}>
                                                Buscar Preços
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )
                        ) : results.length === 0 && !loading ? (
                            <TableRow><TableCell colSpan={incluirBps ? 12 : 9} className="h-32 text-center text-slate-500">{hasSearched ? "Nenhum resultado encontrado." : "Inicie uma pesquisa acima."}</TableCell></TableRow>
                        ) : results.length === 0 && loading ? (
                             <TableRow>
                                <TableCell colSpan={incluirBps ? 12 : 9} className="h-48 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-600"/>
                                        <p className="text-sm">Buscando informações em tempo real...</p>
                                        <p className="text-xs text-slate-400">Consultando PNCP, BPS e bases locais.</p>
                                    </div>
                                </TableCell>
                             </TableRow>
                        ) : (
                            <>
                            {rowVirtualizer.getVirtualItems().length > 0 && rowVirtualizer.getVirtualItems()[0].start > 0 && (
                                <tr><td colSpan={incluirBps ? 13 : 10} style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }} /></tr>
                            )}
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const item = results[virtualRow.index];
                                const idx = virtualRow.index;
                                // Default render for non-BPS mode or logic split
                                if (!incluirBps) {
                                    const price = item.precoUnitario;
                                    const outlier = isOutlier(price);
                                    return (
                                        <TableRow key={idx} className={`group cursor-pointer hover:bg-slate-50/80 ${selectedItems.has(String(item.idItemCompra)) ? 'bg-blue-50/50' : ''}`} onClick={() => handleOpenDetails(item)}>
                                            <TableCell className="pl-4" onClick={(e) => { e.stopPropagation(); toggleSelection(String(item.idItemCompra)); }}>
                                                <Checkbox checked={selectedItems.has(String(item.idItemCompra))} />
                                            </TableCell>
                                            <TableCell className="text-center text-xs text-slate-400 font-mono">
                                                {idx + 1}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">{item.dataCompra ? new Date(item.dataCompra).toLocaleDateString('pt-BR') : '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{item.uf}</span>
                                                    <span className="text-xs text-slate-500 truncate max-w-[100px]" title={item.municipio}>{item.municipio}</span>
                                                    <span className="text-xs text-slate-400 truncate max-w-[100px]" title={item.nomeUasg}>{item.nomeUasg}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[300px]">
                                                <div className="font-medium truncate" title={(item as any).descricaoItem || (item as any).marca}>
                                                    {(item as any).descricaoItem || (item as any).marca || "Item sem descrição"}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">
                                                    {(item as any).marca ? `Marca: ${(item as any).marca}` : ''} 
                                                    {(item as any).origem === 'BPS' && <Badge variant="secondary" className="ml-1 text-[10px]">BPS</Badge>}
                                                </div>
                                                <div className="truncate text-xs text-slate-400" title={item.nomeFornecedor}>{item.nomeFornecedor}</div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-900">
                                                <div className={`flex flex-col items-end ${outlier === 'high' ? 'text-red-600 font-bold' : outlier === 'low' ? 'text-green-600 font-bold' : ''}`}>
                                                    {(item as any).precoUnitario > 0 ? formatCurrency(item.precoUnitario) : <span className="text-slate-400 italic text-xs">Sob Consulta</span>}
                                                    {outlier === 'high' && <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded flex items-center gap-0.5"><AlertCircle className="h-2 w-2"/> +25%</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDetails(item); }}>Detalhes</Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                }
                                
                                // BPS Enhanced Render
                                const price = item.precoUnitario || parseFloat((item as any).valorItemCompra || '0');
                                const outlier = isOutlier(price);
                                return (
                                    <TableRow key={idx} className={`group cursor-pointer hover:bg-slate-50/80 ${selectedItems.has(String(item.idItemCompra)) ? 'bg-blue-50/50' : ''}`} onClick={() => handleOpenDetails(item)}>
                                        <TableCell className="pl-4" onClick={(e) => { e.stopPropagation(); toggleSelection(String(item.idItemCompra)); }}>
                                            <Checkbox checked={selectedItems.has(String(item.idItemCompra))} />
                                        </TableCell>
                                        <TableCell className="text-center text-xs text-slate-400 font-mono">
                                            {idx + 1}
                                        </TableCell>
                                        {/* Data Homologacao */}
                                        <TableCell className="whitespace-nowrap text-xs">
                                            {item.dataCompra ? new Date(item.dataCompra).toLocaleDateString('pt-BR') : '-'}
                                        </TableCell>
                                        
                                        {/* CATMAT */}
                                        <TableCell className="max-w-[200px]">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xs font-bold text-slate-600">{item.codigoCatmat || item.idItemCompra}</span>
                                                <span className="text-xs truncate" title={item.descricaoCatmat || item.descricaoItem}>{item.descricaoCatmat || item.descricaoItem || '-'}</span>
                                            </div>
                                        </TableCell>

                                        {/* Unidade */}
                                        <TableCell className="text-xs">{item.unidade}</TableCell>

                                        {/* Modalidade */}
                                        <TableCell className="text-xs">{item.modalidade || '-'}</TableCell>

                                        {/* Comprador */}
                                        <TableCell className="max-w-[200px]">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium truncate" title={item.nomeInstituicao || item.nomeUasg}>{item.nomeInstituicao || item.nomeUasg}</span>
                                                <span className="text-[10px] text-slate-400">{item.cnpjComprador || item.cnpjOrgao || '-'}</span>
                                            </div>
                                        </TableCell>

                                        {/* Local */}
                                        <TableCell className="text-xs">
                                            {item.municipio}/{item.uf}
                                        </TableCell>

                                        {/* Val. Unit */}
                                        <TableCell className="text-right whitespace-nowrap text-xs font-medium">
                                             <div className={`flex flex-col items-end ${outlier === 'high' ? 'text-red-600 font-bold' : outlier === 'low' ? 'text-green-600 font-bold' : 'text-green-700'}`}>
                                                {formatCurrency(price)}
                                                {outlier === 'high' && <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded flex items-center gap-0.5"><AlertCircle className="h-2 w-2"/> +25%</span>}
                                             </div>
                                        </TableCell>

                                        {/* Qtd */}
                                        <TableCell className="text-right whitespace-nowrap text-xs text-slate-700">
                                            {item.quantidadeItemCompra || item.quantidade}
                                        </TableCell>

                                        {/* Total */}
                                        <TableCell className="text-right whitespace-nowrap text-xs font-bold text-slate-900">
                                            {formatCurrency((item.precoUnitario || 0) * (item.quantidadeItemCompra || item.quantidade || 1))}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => handleOpenDetails(item)}>
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            
                            {rowVirtualizer.getVirtualItems().length > 0 && (rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end) > 0 && (
                                <tr><td colSpan={incluirBps ? 13 : 10} style={{ height: `${rowVirtualizer.getTotalSize() - rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end}px` }} /></tr>
                            )}
                            
                            {/* Streaming Loader Indicator */}
                            {loading && results.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={incluirBps ? 12 : 10} className="py-4 text-center bg-slate-50/50">
                                        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-600"/>
                                            <span>Carregando mais resultados...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            </>
                        )}

                    </TableBody>
                </Table>
                </div>
                
                {/* Pagination Controls */}
                {!loading && results.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-end space-x-2 p-4 border-t bg-slate-50">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <div className="text-sm font-medium text-slate-600">
                            Página {currentPage} de {Math.ceil(results.length / ITEMS_PER_PAGE)}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(Math.ceil(results.length / ITEMS_PER_PAGE), p + 1))}
                            disabled={currentPage >= Math.ceil(results.length / ITEMS_PER_PAGE)}
                        >
                            Próxima
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      )}

      {/* Sheet */}
      <PriceDetailsSheet 
        open={sheetOpen} 
        onOpenChange={setSheetOpen} 
        item={selectedItem} 
      />
      
      {/* Evidence Modal (Screenshot) */}
      <BpsEvidenceDialog 
        open={evidenceOpen} 
        onOpenChange={setEvidenceOpen}
        screenshotBase64={selectedItem?.linkAtaPNCP || undefined} // mapped field
        itemDescription={selectedItem?.descricaoItem || (selectedItem as any)?.marca}
        timestamp={selectedItem?.dataCompra}
      />
      
      {/* Toast Notification */}
      {toastMessage && (
          <div className={`fixed bottom-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all transform translate-y-0 opacity-100 flex items-center gap-2 ${
            toastMessage.type === 'error' ? 'bg-red-600' : 
            toastMessage.type === 'warning' ? 'bg-yellow-500 text-black' : 'bg-green-600'
          }`}>
              {toastMessage.type === 'error' && <AlertCircle className="h-5 w-5" />}
              {toastMessage.type === 'warning' && <AlertCircle className="h-5 w-5" />}
              {toastMessage.type === 'success' && <CheckCircle className="h-5 w-5" />}
              {toastMessage.msg}
          </div>
      )}
    </div>
  );
}

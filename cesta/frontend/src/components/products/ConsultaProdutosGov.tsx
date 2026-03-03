import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Layers, 
  PackageSearch, 
  Loader2,
  ChevronsUpDown,
  Check,
  Leaf
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface GrupoMaterial {
  codigoGrupo: number;
  nomeGrupo: string;
  statusGrupo: string;
}

interface ClasseMaterial {
  codigoClasse: number;
  nomeClasse: string;
  statusClasse: string;
}

interface PdmMaterial {
  codigoPdm: number;
  nomePdm: string;
  statusPdm: string;
}

interface ItemMaterial {
  codigoItem: number;
  descricaoItem: string;
  statusItem: string;
  itemSustentavel: boolean;
  codigoNcm?: string;
}

interface NaturezaDespesa {
  codigoNaturezaDespesa: number;
  descricaoNaturezaDespesa: string;
}

interface UnidadeFornecimento {
  codigoUnidade: string;
  nomeUnidade: string;
}

interface CaracteristicaMaterial {
  codigoCaracteristica: number;
  descricaoCaracteristica: string;
}

export function ConsultaProdutosGov() {
  const [grupos, setGrupos] = useState<GrupoMaterial[]>([]);
  const [classes, setClasses] = useState<ClasseMaterial[]>([]);
  const [pdms, setPdms] = useState<PdmMaterial[]>([]);
  const [itens, setItens] = useState<ItemMaterial[]>([]);
  const [naturezas, setNaturezas] = useState<NaturezaDespesa[]>([]);
  const [unidades, setUnidades] = useState<UnidadeFornecimento[]>([]);
  const [caracteristicas, setCaracteristicas] = useState<CaracteristicaMaterial[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingPdms, setIsLoadingPdms] = useState(false);
  const [isLoadingItens, setIsLoadingItens] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<GrupoMaterial | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClasseMaterial | null>(null);
  const [selectedPdm, setSelectedPdm] = useState<PdmMaterial | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemMaterial | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnidadeFornecimento | null>(null);
  
  const [openGroup, setOpenGroup] = useState(false);
  const [openClass, setOpenClass] = useState(false);
  const [openPdm, setOpenPdm] = useState(false);
  const [openItem, setOpenItem] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await fetch("/api/compras-gov/grupos");
        if (!response.ok) throw new Error("Falha ao buscar grupos");
        const data = await response.json();
        setGrupos(data);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar dados do Governo Federal.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrupos();
  }, []);

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  const resetCascade = (level: 'group' | 'class' | 'pdm' | 'item') => {
    if (level === 'group') {
      setSelectedClass(null); setClasses([]);
      setSelectedPdm(null); setPdms([]);
      setSelectedItem(null); setItens([]);
      setNaturezas([]); setUnidades([]);
      setCaracteristicas([]);
    } else if (level === 'class') {
      setSelectedPdm(null); setPdms([]);
      setSelectedItem(null); setItens([]);
      setNaturezas([]); setUnidades([]);
      setCaracteristicas([]);
    } else if (level === 'pdm') {
      setSelectedItem(null); setItens([]);
      setNaturezas([]); setUnidades([]);
      setCaracteristicas([]);
    } else if (level === 'item') {
       setCaracteristicas([]);
    }
  };

  const handleGroupChange = async (group: GrupoMaterial) => {
    setSelectedGroup(group);
    setOpenGroup(false);
    resetCascade('group');
    setIsLoadingClasses(true);
    try {
      const res = await fetch(`/api/compras-gov/classes?codigoGrupo=${group.codigoGrupo}`);
      if (res.ok) setClasses(await res.json());
    } finally { setIsLoadingClasses(false); }
  };

  const handleClassChange = async (classe: ClasseMaterial) => {
    setSelectedClass(classe);
    setOpenClass(false);
    resetCascade('class');
    setIsLoadingPdms(true);
    try {
      const res = await fetch(`/api/compras-gov/pdms?codigoClasse=${classe.codigoClasse}`);
      if (res.ok) setPdms(await res.json());
    } finally { setIsLoadingPdms(false); }
  };

  const handlePdmChange = async (pdm: PdmMaterial) => {
    setSelectedPdm(pdm);
    setOpenPdm(false);
    resetCascade('pdm');
    setIsLoadingItens(true);
    setIsLoadingDetails(true);
    
    // Fetch Items, Naturezas, Unidades in parallel
    try {
      const [resItens, resNaturezas, resUnidades] = await Promise.all([
        fetch(`/api/compras-gov/itens?codigoPdm=${pdm.codigoPdm}`),
        fetch(`/api/compras-gov/naturezas?codigoPdm=${pdm.codigoPdm}`),
        fetch(`/api/compras-gov/unidades?codigoPdm=${pdm.codigoPdm}`)
      ]);
      
      if (resItens.ok) setItens(await resItens.json());
      if (resNaturezas.ok) setNaturezas(await resNaturezas.json());
      if (resUnidades.ok) setUnidades(await resUnidades.json());
      
    } finally { 
      setIsLoadingItens(false); 
      setIsLoadingDetails(false);
    }
  };

  const handleItemChange = async (item: ItemMaterial) => {
    setSelectedItem(item);
    setOpenItem(false);
    resetCascade('item');
    setIsLoadingSpecs(true);
    try {
        const res = await fetch(`/api/compras-gov/caracteristicas?codigoItem=${item.codigoItem}`);
        if(res.ok) setCaracteristicas(await res.json());
    } finally { setIsLoadingSpecs(false); }
  };

  const handleReset = () => {
    setSelectedGroup(null);
    resetCascade('group');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 font-inter text-slate-900">
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <PackageSearch className="h-8 w-8 text-blue-600" />
            Consulta Oficial
          </h1>
          <p className="text-slate-500 mt-1">Busca integrada ao Catálogo de Materiais do Compras.gov.br (CATMAT).</p>
        </div>
        {(selectedGroup) && (
          <Button variant="outline" size="sm" onClick={handleReset} className="text-slate-500 hover:text-slate-900">
            Limpar Seleção
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                {/* 1. Grupo */}
                <div className="space-y-2">
                    <Label>1. Grupo de Material</Label>
                    <Combobox 
                        items={grupos} 
                        selected={selectedGroup} 
                        onSelect={handleGroupChange} 
                        isLoading={isLoading}
                        labelKey="nomeGrupo"
                        valueKey="codigoGrupo"
                        placeholder="Buscar grupo..."
                        open={openGroup}
                        setOpen={setOpenGroup}
                    />
                </div>

                {/* 2. Classe */}
                <div className="space-y-2">
                    <Label className={!selectedGroup ? "text-slate-400" : ""}>2. Classe de Material</Label>
                    <Combobox 
                        items={classes} 
                        selected={selectedClass} 
                        onSelect={handleClassChange} 
                        isLoading={isLoadingClasses}
                        disabled={!selectedGroup}
                        labelKey="nomeClasse"
                        valueKey="codigoClasse"
                        placeholder="Buscar classe..."
                        open={openClass}
                        setOpen={setOpenClass}
                    />
                </div>

                {/* 3. PDM */}
                <div className="space-y-2">
                    <Label className={!selectedClass ? "text-slate-400" : ""}>3. PDM</Label>
                    <Combobox 
                        items={pdms} 
                        selected={selectedPdm} 
                        onSelect={handlePdmChange} 
                        isLoading={isLoadingPdms}
                        disabled={!selectedClass}
                        labelKey="nomePdm"
                        valueKey="codigoPdm"
                        placeholder="Buscar PDM..."
                         open={openPdm}
                        setOpen={setOpenPdm}
                    />
                </div>
                
                 {/* 4. Item */}
                <div className="space-y-2">
                    <Label className={!selectedPdm ? "text-slate-400" : ""}>4. Item (Material Específico)</Label>
                    <Combobox 
                        items={itens} 
                        selected={selectedItem} 
                        onSelect={handleItemChange} 
                        isLoading={isLoadingItens}
                        disabled={!selectedPdm}
                        labelKey="descricaoItem"
                        valueKey="codigoItem"
                        placeholder="Buscar item..."
                        open={openItem}
                        setOpen={setOpenItem}
                        renderExtra={(item) => item.itemSustentavel && (
                            <Leaf className="h-3 w-3 text-green-600 ml-2" />
                        )}
                    />
                </div>
                
                {/* 5. Unidade de Fornecimento */}
                <div className="space-y-2">
                    <Label className={!selectedPdm ? "text-slate-400" : ""}>5. Unidade de Fornecimento</Label>
                    <Combobox 
                        items={unidades} 
                        selected={selectedUnit} 
                        onSelect={setSelectedUnit} 
                        isLoading={isLoadingDetails}
                        disabled={!selectedPdm} // Depending on API flow, sometimes unit is tied to PDM or Item
                        labelKey="nomeUnidade"
                        valueKey="codigoUnidade"
                        placeholder="Selecione a unidade..."
                        open={openUnit}
                        setOpen={setOpenUnit}
                    />
                </div>
            </div>
            
            <Button 
                className="w-full h-12 text-lg" 
                disabled={!selectedItem || !selectedUnit}
            >
                Finalizar Cadastro
            </Button>
        </div>

        {/* Right Column: Context Card */}
        <div className="lg:col-span-1">
            <Card className="border-slate-200 shadow-sm bg-slate-50/50 sticky top-8">
                <CardHeader className="pb-3 border-b border-slate-200/60">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Resumo do Item
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                    {!selectedGroup ? (
                        <div className="py-8 text-center text-slate-400">
                             <PackageSearch className="h-10 w-10 mx-auto mb-2 opacity-30" />
                             <p className="text-sm">Inicie a seleção para ver o resumo.</p>
                        </div>
                    ) : (
                        <>
                             <SummaryItem label="Grupo" value={selectedGroup.nomeGrupo} code={selectedGroup.codigoGrupo} />
                             {selectedClass && <SummaryItem label="Classe" value={selectedClass.nomeClasse} code={selectedClass.codigoClasse} />}
                             {selectedPdm && <SummaryItem label="PDM" value={selectedPdm.nomePdm} code={selectedPdm.codigoPdm} />}
                             
                             {naturezas.length > 0 && (
                                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Natureza de Despesa</div>
                                    <p className="text-sm text-blue-900 font-medium">{naturezas[0].descricaoNaturezaDespesa}</p>
                                    <p className="text-xs text-blue-500 font-mono mt-1">Cód. {naturezas[0].codigoNaturezaDespesa}</p>
                                </div>
                             )}

                             {selectedItem && (
                                <>
                                    <div className="h-px bg-slate-200" />
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Item Selecionado</div>
                                                <p className="text-sm font-bold text-slate-900 leading-tight">{selectedItem.descricaoItem}</p>
                                            </div>
                                            {selectedItem.itemSustentavel && (
                                                <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 gap-1">
                                                    <Leaf className="h-3 w-3" /> Sustentável
                                                </Badge>
                                            )}
                                        </div>
                                         <div className="flex gap-2 text-xs">
                                             <span className="font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">Item {selectedItem.codigoItem}</span>
                                             {selectedItem.codigoNcm && <span className="font-mono bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">NCM {selectedItem.codigoNcm}</span>}
                                         </div>
                                    </div>
                                </>
                             )}
                             
                             {isLoadingSpecs ? (
                                <div className="py-4 flex justify-center text-slate-400">
                                   <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                             ) : caracteristicas.length > 0 && (
                                 <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="specs" className="border-slate-200">
                                        <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-slate-500 py-2">
                                            Especificações Técnicas
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="text-sm space-y-1 text-slate-600 list-disc pl-4 marker:text-slate-400">
                                                {caracteristicas.map(c => (
                                                    <li key={c.codigoCaracteristica}>{c.descricaoCaracteristica}</li>
                                                ))}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                 </Accordion>
                             )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

// Reusable Sub-components
function SummaryItem({label, value, code}: {label: string, value: string, code: number | string}) {
    return (
        <div className="space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
            <div className="text-sm font-medium text-slate-800 leading-tight flex justify-between items-start gap-2">
                <span>{value}</span>
                <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-500 shrink-0">{code}</span>
            </div>
        </div>
    );
}

// Generic Combobox Component
function Combobox({ items, selected, onSelect, isLoading, disabled, labelKey, valueKey, placeholder, open, setOpen, renderExtra }: {
    items: any[],
    selected: any,
    onSelect: (item: any) => void,
    isLoading: boolean,
    disabled?: boolean,
    labelKey: string,
    valueKey: string,
    placeholder: string,
    open: boolean,
    setOpen: (open: boolean) => void,
    renderExtra?: (item: any) => React.ReactNode
}) {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled || isLoading}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 border-slate-200 text-base font-normal hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
        >
          {isLoading ? (
             <div className="flex items-center gap-2 text-slate-500">
               <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
             </div>
          ) : selected ? (
             <span className="truncate">{selected[valueKey]} - {selected[labelKey]}</span>
          ) : (
             <span className="text-slate-500">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado.</CommandEmpty>
            <CommandGroup>
              <ScrollArea className="h-64">
                {items?.map((item: any) => (
                    <CommandItem
                    key={item[valueKey]}
                    value={`${item[valueKey]} ${item[labelKey]}`}
                    onSelect={() => onSelect(item)}
                    >
                    <Check
                        className={cn(
                        "mr-2 h-4 w-4",
                        selected?.[valueKey] === item[valueKey] ? "opacity-100" : "opacity-0"
                        )}
                    />
                    <div className="flex flex-col">
                        <span className="font-medium">{item[labelKey]}</span>
                        <span className="text-xs text-slate-500 font-mono">Cód. {item[valueKey]}</span>
                    </div>
                    {renderExtra && renderExtra(item)}
                    </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

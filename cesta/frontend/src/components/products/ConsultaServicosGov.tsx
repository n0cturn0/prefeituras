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
  Loader2,
  ChevronsUpDown,
  Check,
  Briefcase
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

// --- Interfaces ---
interface SecaoServico { codigoSecao: number; nomeSecao: string; }
interface DivisaoServico { codigoDivisao: number; nomeDivisao: string; }
interface GrupoServico { codigoGrupo: number; nomeGrupo: string; }
interface ClasseServico { codigoClasse: number; nomeClasse: string; }
interface SubclasseServico { codigoSubclasse: number; nomeSubclasse: string; }
interface ServicoCatalogo { codigoServico: number; nomeServico: string; exclusivoCentralCompras: boolean; }
interface UnidadeMedida { codigoUnidadeMedida: string; nomeUnidadeMedida: string; }
interface NaturezaDespesa { codigoNaturezaDespesa: number; descricaoNaturezaDespesa: string; }

export function ConsultaServicosGov() {
  // --- State for Data ---
  const [secoes, setSecoes] = useState<SecaoServico[]>([]);
  const [divisoes, setDivisoes] = useState<DivisaoServico[]>([]);
  const [grupos, setGrupos] = useState<GrupoServico[]>([]);
  const [classes, setClasses] = useState<ClasseServico[]>([]);
  const [subclasses, setSubclasses] = useState<SubclasseServico[]>([]);
  const [servicos, setServicos] = useState<ServicoCatalogo[]>([]);
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([]);
  const [naturezas, setNaturezas] = useState<NaturezaDespesa[]>([]);

  // --- Loading States ---
  const [isLoading, setIsLoading] = useState(true); // Initial load (secoes)
  const [loadingStep, setLoadingStep] = useState<number>(0); 

  // --- Selected Values ---
  const [selectedSecao, setSelectedSecao] = useState<SecaoServico | null>(null);
  const [selectedDivisao, setSelectedDivisao] = useState<DivisaoServico | null>(null);
  const [selectedGrupo, setSelectedGrupo] = useState<GrupoServico | null>(null);
  const [selectedClasse, setSelectedClasse] = useState<ClasseServico | null>(null);
  const [selectedSubclasse, setSelectedSubclasse] = useState<SubclasseServico | null>(null);
  const [selectedServico, setSelectedServico] = useState<ServicoCatalogo | null>(null);
  const [selectedUnidade, setSelectedUnidade] = useState<UnidadeMedida | null>(null);
  const [selectedNatureza, setSelectedNatureza] = useState<NaturezaDespesa | null>(null);

  // --- Popover Open States ---
  const [openSecao, setOpenSecao] = useState(false);
  const [openDivisao, setOpenDivisao] = useState(false);
  const [openGrupo, setOpenGrupo] = useState(false);
  const [openClasse, setOpenClasse] = useState(false);
  const [openSubclasse, setOpenSubclasse] = useState(false);
  const [openServico, setOpenServico] = useState(false);
  const [openUnidade, setOpenUnidade] = useState(false);
  const [openNatureza, setOpenNatureza] = useState(false);

  // --- Effects ---
  useEffect(() => {
    fetch("/api/catser/secoes")
      .then(res => res.json())
      .then(data => setSecoes(data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const resetFrom = (level: number) => {
    if (level <= 1) { setSelectedDivisao(null); setDivisoes([]); }
    if (level <= 2) { setSelectedGrupo(null); setGrupos([]); }
    if (level <= 3) { setSelectedClasse(null); setClasses([]); }
    if (level <= 4) { setSelectedSubclasse(null); setSubclasses([]); }
    if (level <= 5) { setSelectedServico(null); setServicos([]); }
    if (level <= 6) { 
        setSelectedUnidade(null); setUnidades([]);
        setSelectedNatureza(null); setNaturezas([]);
    }
  };

  const handleSelectSecao = async (item: SecaoServico) => {
    setSelectedSecao(item); setOpenSecao(false); resetFrom(1);
    setLoadingStep(2);
    try {
        const res = await fetch(`/api/catser/divisoes?codigoSecao=${item.codigoSecao}`);
        if(res.ok) setDivisoes(await res.json());
    } finally { setLoadingStep(0); }
  };

  const handleSelectDivisao = async (item: DivisaoServico) => {
    setSelectedDivisao(item); setOpenDivisao(false); resetFrom(2);
    setLoadingStep(3);
    try {
        const res = await fetch(`/api/catser/grupos?codigoDivisao=${item.codigoDivisao}`);
        if(res.ok) setGrupos(await res.json());
    } finally { setLoadingStep(0); }
  };

  const handleSelectGrupo = async (item: GrupoServico) => {
    setSelectedGrupo(item); setOpenGrupo(false); resetFrom(3);
    setLoadingStep(4);
    try {
        const res = await fetch(`/api/catser/classes?codigoGrupo=${item.codigoGrupo}`);
        if(res.ok) setClasses(await res.json());
    } finally { setLoadingStep(0); }
  };

  const handleSelectClasse = async (item: ClasseServico) => {
    setSelectedClasse(item); setOpenClasse(false); resetFrom(4);
    setLoadingStep(5);
    try {
        const res = await fetch(`/api/catser/subclasses?codigoClasse=${item.codigoClasse}`);
        if(res.ok) setSubclasses(await res.json());
    } finally { setLoadingStep(0); }
  };

  const handleSelectSubclasse = async (item: SubclasseServico) => {
    setSelectedSubclasse(item); setOpenSubclasse(false); resetFrom(5);
    setLoadingStep(6);
    try {
        const res = await fetch(`/api/catser/servicos?codigoSubclasse=${item.codigoSubclasse}`);
        if(res.ok) setServicos(await res.json());
    } finally { setLoadingStep(0); }
  };

  const handleSelectServico = async (item: ServicoCatalogo) => {
    setSelectedServico(item); setOpenServico(false); resetFrom(6);
    setLoadingStep(7);
    try {
        const [resUnidades, resNaturezas] = await Promise.all([
            fetch(`/api/catser/unidades?codigoServico=${item.codigoServico}`),
            fetch(`/api/catser/naturezas?codigoServico=${item.codigoServico}`)
        ]);
        if(resUnidades.ok) setUnidades(await resUnidades.json());
        if(resNaturezas.ok) setNaturezas(await resNaturezas.json());
    } finally { setLoadingStep(0); }
  };

  const handleSave = () => {
    console.log("Salvando Serviço:", {
        selectedServico,
        selectedUnidade,
        selectedNatureza,
        hierarchy: { selectedSecao, selectedDivisao, selectedGrupo, selectedClasse, selectedSubclasse }
    });
    alert("Serviço pronto para persistência!");
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 font-inter text-slate-900">
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            Catálogo de Serviços (CATSER)
          </h1>
          <p className="text-slate-500 mt-1">Busca hierárquica de Serviços do Governo Federal.</p>
        </div>
        {selectedSecao && (
            <Button variant="outline" onClick={() => { setSelectedSecao(null); resetFrom(0); }}>
                Limpar
            </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="1. Seção" selected={!!selectedSecao}>
                        <Combobox items={secoes} selected={selectedSecao} onSelect={handleSelectSecao} labelKey="nomeSecao" valueKey="codigoSecao" placeholder="Selecione Seção..." open={openSecao} setOpen={setOpenSecao} isLoading={isLoading} />
                    </Field>
                    
                    <Field label="2. Divisão" selected={!!selectedDivisao}>
                        <Combobox items={divisoes} selected={selectedDivisao} onSelect={handleSelectDivisao} labelKey="nomeDivisao" valueKey="codigoDivisao" placeholder="Selecione Divisão..." open={openDivisao} setOpen={setOpenDivisao} isLoading={loadingStep === 2} disabled={!selectedSecao} />
                    </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="3. Grupo" selected={!!selectedGrupo}>
                        <Combobox items={grupos} selected={selectedGrupo} onSelect={handleSelectGrupo} labelKey="nomeGrupo" valueKey="codigoGrupo" placeholder="Selecione Grupo..." open={openGrupo} setOpen={setOpenGrupo} isLoading={loadingStep === 3} disabled={!selectedDivisao} />
                    </Field>
                    <Field label="4. Classe" selected={!!selectedClasse}>
                        <Combobox items={classes} selected={selectedClasse} onSelect={handleSelectClasse} labelKey="nomeClasse" valueKey="codigoClasse" placeholder="Selecione Classe..." open={openClasse} setOpen={setOpenClasse} isLoading={loadingStep === 4} disabled={!selectedGrupo} />
                    </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="5. Subclasse" selected={!!selectedSubclasse}>
                         <Combobox items={subclasses} selected={selectedSubclasse} onSelect={handleSelectSubclasse} labelKey="nomeSubclasse" valueKey="codigoSubclasse" placeholder="Selecione Subclasse..." open={openSubclasse} setOpen={setOpenSubclasse} isLoading={loadingStep === 5} disabled={!selectedClasse} />
                    </Field>
                    <Field label="6. Serviço" selected={!!selectedServico}>
                        <Combobox 
                            items={servicos} selected={selectedServico} onSelect={handleSelectServico} labelKey="nomeServico" valueKey="codigoServico" placeholder="Selecione Serviço..." open={openServico} setOpen={setOpenServico} isLoading={loadingStep === 6} disabled={!selectedSubclasse} 
                            renderExtra={(item: ServicoCatalogo) => item.exclusivoCentralCompras && (
                                <Badge variant="secondary" className="ml-2 text-xs bg-amber-100 text-amber-800">Central Compras</Badge>
                            )}
                        />
                    </Field>
                </div>

                {(selectedServico || loadingStep === 7) && (
                    <div className="pt-4 border-t border-slate-100">
                        <Label className="text-sm font-semibold text-slate-700 mb-3 block">Dados Complementares Obrigatórios</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="7. Unidade de Medida" selected={!!selectedUnidade} isRequired>
                                <Combobox items={unidades} selected={selectedUnidade} onSelect={setSelectedUnidade} labelKey="nomeUnidadeMedida" valueKey="codigoUnidadeMedida" placeholder="Selecione Unidade..." open={openUnidade} setOpen={setOpenUnidade} isLoading={loadingStep === 7} disabled={!selectedServico} />
                            </Field>
                            <Field label="8. Natureza de Despesa" selected={!!selectedNatureza} isRequired>
                                 <Combobox items={naturezas} selected={selectedNatureza} onSelect={setSelectedNatureza} labelKey="descricaoNaturezaDespesa" valueKey="codigoNaturezaDespesa" placeholder="Selecione Natureza..." open={openNatureza} setOpen={setOpenNatureza} isLoading={loadingStep === 7} disabled={!selectedServico} />
                            </Field>
                        </div>
                    </div>
                )}
            </div>

            <Button className="w-full h-12" disabled={!selectedUnidade || !selectedNatureza} onClick={handleSave}>
                Salvar Serviço no Catálogo
            </Button>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-1">
             <Card className="border-slate-200 shadow-sm bg-slate-50/50 sticky top-8">
                <CardHeader className="pb-3 border-b border-slate-200/60">
                    <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500 flex items-center gap-2">
                         <Layers className="h-4 w-4" />
                         Caminho do Serviço
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 px-4 space-y-4">
                    <div className="space-y-3 relative">
                        {/* Vertical Line */}
                        <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 z-0"></div>

                        <StepIndicator label="Seção" value={selectedSecao?.nomeSecao} code={selectedSecao?.codigoSecao} active={!!selectedSecao} />
                        <StepIndicator label="Divisão" value={selectedDivisao?.nomeDivisao} code={selectedDivisao?.codigoDivisao} active={!!selectedDivisao} />
                        <StepIndicator label="Grupo" value={selectedGrupo?.nomeGrupo} code={selectedGrupo?.codigoGrupo} active={!!selectedGrupo} />
                        <StepIndicator label="Classe" value={selectedClasse?.nomeClasse} code={selectedClasse?.codigoClasse} active={!!selectedClasse} />
                        <StepIndicator label="Subclasse" value={selectedSubclasse?.nomeSubclasse} code={selectedSubclasse?.codigoSubclasse} active={!!selectedSubclasse} />
                        <StepIndicator label="Serviço" value={selectedServico?.nomeServico} code={selectedServico?.codigoServico} active={!!selectedServico} highlight />
                    </div>

                    {selectedServico && selectedServico.exclusivoCentralCompras && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex gap-2 items-start mt-4">
                            <span className="font-bold">Atenção:</span> Este serviço é exclusivo da Central de Compras.
                        </div>
                    )}
                </CardContent>
             </Card>
        </div>

      </div>
    </div>
  );
}

function Field({label, children, selected, isRequired}: {label: string, children: React.ReactNode, selected: boolean, isRequired?: boolean}) {
    return (
        <div className="space-y-1.5">
            <Label className={cn("text-xs uppercase tracking-wide font-medium", selected ? "text-blue-600" : "text-slate-500")}>
                {label} {isRequired && <span className="text-red-500">*</span>}
            </Label>
            {children}
        </div>
    );
}

function StepIndicator({label, value, code, active, highlight}: {label: string, value?: string, code?: number|string, active: boolean, highlight?: boolean}) {
    return (
        <div className={cn("relative z-10 flex gap-3 items-start", !active && "opacity-50 grayscale")}>
             <div className={cn("mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors", 
                active ? (highlight ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-blue-500 text-blue-500") : "bg-slate-100 border-slate-200 text-slate-300"
             )}>
                 {active ? <Check className="h-3 w-3" /> : <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />}
             </div>
             <div className="flex-1 pb-1">
                 <div className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">{label}</div>
                 {active ? (
                     <div className={cn("text-sm font-medium leading-snug", highlight ? "text-slate-900 font-bold" : "text-slate-700")}>
                        {highlight && <span className="mr-1 text-blue-600 font-mono text-xs">[{code}]</span>}
                        {value}
                        {!highlight && <span className="ml-1 text-slate-400 font-mono text-[10px]">({code})</span>}
                     </div>
                 ) : (
                     <div className="text-xs text-slate-300 italic h-4">Pendente...</div>
                 )}
             </div>
        </div>
    )
}

// Reuse Combobox (Copy-paste or import if shared)
// Importing Generic Combobox here to make it self-contained for this task, 
// usually I would move it to a shared file.
function Combobox({ items, selected, onSelect, isLoading, disabled, labelKey, valueKey, placeholder, open, setOpen, renderExtra }: any) {
    // Simplified version reusing the logic from shared/copied component
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild disabled={disabled || isLoading}>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11 border-slate-200 text-sm font-normal hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 text-left px-3"
          >
            {isLoading ? (
               <div className="flex items-center gap-2 text-slate-500">
                 <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando...
               </div>
            ) : selected ? (
               <span className="truncate block w-full pr-4">{selected[labelKey]}</span>
            ) : (
               <span className="text-slate-400">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-30 absolute right-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Filtrar..." />
            <CommandList>
              <CommandEmpty>Nada encontrado.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-60">
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
                          <span className="font-medium text-sm">{item[labelKey]}</span>
                          <span className="text-[10px] text-slate-400 font-mono">Cód. {item[valueKey]}</span>
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

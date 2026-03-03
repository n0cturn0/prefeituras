import * as React from "react"
import { Loader2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface ItemSearchComboboxProps {
    onSelect: (item: { id: string, label: string, type: 'MATERIAL' | 'SERVICO' | 'PDM' | 'SERVICO_CLASS' }) => void;
    type: "material" | "servico";
    value?: string;
    onChange?: (val: string) => void;
}

export function ItemSearchCombobox({ onSelect, type, value: externalValue, onChange: externalOnChange }: ItemSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  // Use external value if provided, else local default (though we really want controlled)
  const isControlled = externalValue !== undefined;
  const [internalValue, setInternalValue] = React.useState("")
  
  const query = isControlled ? externalValue : internalValue;
  const setQuery = (val: string) => {
      if (externalOnChange) externalOnChange(val);
      else setInternalValue(val);
  }

  const [loading, setLoading] = React.useState(false)
  const [options, setOptions] = React.useState<{id: string, label: string, type: string}[]>([])

  // Reset when type changes
  React.useEffect(() => {
    setQuery("");
    setOptions([]);
  }, [type]);

  // Debounce logic
  React.useEffect(() => {
      const timer = setTimeout(() => {
          if (query.length >= 3) {
              fetchSuggestions(query);
          } else {
              setOptions([]);
          }
      }, 500);
      return () => clearTimeout(timer);
  }, [query]);

  const fetchSuggestions = async (term: string) => {
      setLoading(true);
      try {
          console.log(`Buscando sugestões para: ${term}, tipo: ${type}`);
          // Pass type to backend
          const res = await fetch(`/api/pesquisa-preco/autocomplete?term=${encodeURIComponent(term)}&type=${type.toUpperCase()}`);
          if (res.ok) {
              const data = await res.json();
              console.log("Sugestões recebidas:", data);
              setOptions(data);
          } else {
              console.error("Erro busca:", res.status);
              setOptions([]);
          }
      } catch (e) {
          console.error("Erro requisição:", e);
          setOptions([]);
      } finally {
          setLoading(false);
      }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 text-base px-4 font-normal text-slate-500 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          {query
            ? <span className="font-semibold text-slate-900 truncate">{query}</span>
            : `Pesquisar ${type === 'material' ? 'material por nome ou CATMAT' : 'serviço por nome ou CATSER'}...`}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Digite para buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <CommandList>
            {loading && <div className="p-4 text-center text-sm text-slate-500 flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/> Buscando...</div>}
            
            {/* Always show Manual Search Option if query is long enough */}
            {!loading && query.length >= 3 && (
                 <CommandGroup heading="Busca Manual">
                    <CommandItem
                        value={`custom-search-${query}`}
                        onSelect={() => {
                            setOpen(false);
                            onSelect({ 
                                id: query, 
                                label: query, 
                                type: type.toUpperCase() as any 
                            });
                        }}
                        className="cursor-pointer aria-selected:bg-blue-50 aria-selected:text-blue-700 py-3"
                    >
                        <div className="flex flex-col gap-0.5 w-full">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-900">Buscar por "{query}"</span>
                                <Badge variant="outline" className="text-[10px] ml-2 shrink-0 border-blue-200 text-blue-700 bg-blue-50">Busca Manual</Badge>
                            </div>
                            <span className="text-[10px] text-slate-400">Clique para pesquisar externamente (ex: BPS) por descrição</span>
                        </div>
                    </CommandItem>
                 </CommandGroup>
            )}
            
            {!loading && query.length < 3 && (
                <div className="py-6 text-center text-sm text-slate-500">
                    Digite pelo menos 3 caracteres
                </div>
            )}

            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  value={item.label} // Value used for internal tracking, but we handle select manually
                  onSelect={() => {
                    setOpen(false)
                    onSelect({ id: item.id, label: item.label, type: item.type as any })
                  }}
                  className="cursor-pointer aria-selected:bg-blue-50 aria-selected:text-blue-700 py-3"
                >
                  <div className="flex flex-col gap-0.5 w-full">
                      <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 line-clamp-1">{item.label}</span>
                          <Badge variant="secondary" className="text-[10px] ml-2 shrink-0">{item.type}</Badge>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Cód: {item.id}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

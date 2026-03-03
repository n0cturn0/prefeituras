import { useState } from "react";
import { Search, Plus, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: number;
  description: string; // Descrição Padronizada
  unit: string; // Unidade de Medida
  category: string; // Categoria/Objeto
  code: string; // Código de Identificação
  brand?: string; // Marca Ofertada
  anvisaNumber?: string; // Registro ANVISA (Obrigatório para medicamentos)
  status: "Ativo" | "Inativo";
}

const initialProducts: Product[] = [
  {
    id: 1,
    description: "Amoxicilina 500mg - Caixa com 30 comprimidos",
    unit: "CX",
    category: "Medicamentos",
    code: "BR-AMX-500",
    brand: "Medley",
    anvisaNumber: "1.0181.0001.001-1",
    status: "Ativo",
  },
  {
    id: 2,
    description: "Papel A4 Alcalino 75g/m² - Resma 500 folhas",
    unit: "RESMA",
    category: "Material de Escritório",
    code: "MAT-PAP-A4",
    brand: "Chamex",
    status: "Ativo",
  },
  {
    id: 3,
    description: "Cimento Portland CP II - Saco 50kg",
    unit: "SC",
    category: "Construção",
    code: "IM-CIM-50",
    brand: "Votoran",
    status: "Ativo",
  },
];

export function ProductRegistration() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredProducts = initialProducts.filter((product) =>
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-inter text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Catálogo de Produtos
          </h1>
          <p className="text-slate-500 mt-1">
            Gestão padronizada de itens para composição de cestas de preços.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                <Plus className="mr-2 h-4 w-4" /> Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-white text-slate-900 border-slate-200">
              <DialogHeader>
                <DialogTitle>Novo Produto</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes técnicos do item conforme padronização do Tribunal de Contas.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                
                {/* Descrição Padronizada */}
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição Padronizada</Label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Amoxicilina 500mg, cápsula gelatinosa dura..."
                    className="border-slate-200 focus-visible:ring-slate-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Código */}
                  <div className="grid gap-2">
                    <Label htmlFor="code">Código Identificação (BR/Interno)</Label>
                    <Input
                      id="code"
                      placeholder="Ex: BR-000123"
                      className="border-slate-200 focus-visible:ring-slate-400"
                    />
                  </div>
                  
                  {/* Unidade */}
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unidade de Medida</Label>
                    <Select>
                      <SelectTrigger className="border-slate-200 focus:ring-slate-400">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="un">Unidade (UN)</SelectItem>
                        <SelectItem value="cx">Caixa (CX)</SelectItem>
                        <SelectItem value="fr">Frasco (FR)</SelectItem>
                        <SelectItem value="resma">Resma</SelectItem>
                        <SelectItem value="kg">Quilograma (KG)</SelectItem>
                        <SelectItem value="l">Litro (L)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                    {/* Categoria */}
                    <div className="grid gap-2">
                      <Label htmlFor="category">Categoria / Objeto</Label>
                      <Select onValueChange={setSelectedCategory}>
                        <SelectTrigger className="border-slate-200 focus:ring-slate-400">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                          <SelectItem value="Gêneros Alimentícios">Gêneros Alimentícios</SelectItem>
                          <SelectItem value="Construção">Materiais de Construção</SelectItem>
                          <SelectItem value="Material de Escritório">Material de Escritório</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Marca (Opcional/Referência) */}
                    <div className="grid gap-2">
                      <Label htmlFor="brand">Marca de Referência</Label>
                       <Input
                        id="brand"
                        placeholder="Ex: Medley, 3M"
                        className="border-slate-200 focus-visible:ring-slate-400"
                      />
                    </div>
                </div>

                {/* Registro ANVISA (Condicional) */}
                {selectedCategory === "Medicamentos" && (
                   <div className="grid gap-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                         <Label htmlFor="anvisa" className="text-blue-900 font-medium">Registro ANVISA</Label>
                      </div>
                      <Input
                        id="anvisa"
                        placeholder="Ex: 1.0000.0000.000-0"
                        className="border-blue-200 focus-visible:ring-blue-400 bg-white"
                      />
                      <p className="text-[10px] text-blue-600">Obrigatório para itens da categoria Medicamentos.</p>
                   </div>
                )}

              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewProductOpen(false)}
                  className="border-slate-200 hover:bg-slate-100 text-slate-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Salvar Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Buscar por descrição ou código..."
            className="pl-9 border-slate-200 focus-visible:ring-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px]">Código</TableHead>
              <TableHead className="w-[400px]">Descrição Padronizada</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Marca Ref.</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-slate-50/50">
                 <TableCell className="font-mono text-xs text-slate-500">{product.code}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{product.description}</span>
                    {product.anvisaNumber && (
                       <span className="text-[10px] text-slate-400">ANVISA: {product.anvisaNumber}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="font-normal bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    {product.unit}
                  </Badge>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                 <TableCell className="text-slate-500 text-sm">{product.brand || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-slate-900"
                  >
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

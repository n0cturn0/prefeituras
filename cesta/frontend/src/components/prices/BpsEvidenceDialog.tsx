import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface BpsEvidenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screenshotBase64?: string;
  itemDescription?: string;
  timestamp?: string;
}

export function BpsEvidenceDialog({ open, onOpenChange, screenshotBase64, itemDescription, timestamp }: BpsEvidenceDialogProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Comprovante de Consulta - BPS</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .meta { margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 5px; }
              .evidence-img { width: 100%; border: 1px solid #ddd; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Comprovante de Consulta</h1>
              <h2>Banco de Preços em Saúde (BPS)</h2>
            </div>
            <div class="meta">
              <p><strong>Item Pesquisado:</strong> ${itemDescription || 'N/A'}</p>
              <p><strong>Data da Extração:</strong> ${timestamp || new Date().toLocaleString()}</p>
              <p><strong>Origem:</strong> Ministérios da Saúde / BPS</p>
            </div>
            <h3>Evidência Visual (Screenshot)</h3>
            ${screenshotBase64 
                ? `<img src="data:image/png;base64,${screenshotBase64}" class="evidence-img" />` 
                : '<p>Nenhuma imagem disponível.</p>'}
            <div class="footer">
              <p>Gerado automaticamente pelo Sistema Cesta de Preços - Licitacao.SaaS</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evidência de Consulta - BPS</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-md border flex justify-between items-center">
                <div>
                   <p className="font-medium text-sm text-slate-700">Item: {itemDescription}</p>
                   <p className="text-xs text-slate-500">Consulta realizada em: {timestamp || new Date().toLocaleString()}</p>
                </div>
                <Button onClick={handlePrint} size="sm" variant="outline">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Comprovante
                </Button>
            </div>
            
            <div className="border rounded-md overflow-hidden">
                {screenshotBase64 ? (
                    <img 
                        src={`data:image/png;base64,${screenshotBase64}`} 
                        alt="Screenshot BPS" 
                        className="w-full h-auto object-contain"
                    />
                ) : (
                    <div className="h-64 flex items-center justify-center bg-slate-100 text-slate-400">
                        Screenshot indisponível
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

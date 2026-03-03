package com.licitacao.saas.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.licitacao.saas.service.integration.dto.PesquisaMaterialDTO;
import com.licitacao.saas.web.dto.RelatorioCestaRequestDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class RelatorioService {

    public void gerarRelatorioMapaPrecos(com.licitacao.saas.domain.CestaPreco cesta, java.io.OutputStream outputStream) {
        try {
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate());
            document.setMargins(20, 20, 20, 20);

            // Title
            document.add(new Paragraph("Mapa de Apuração de Preços - Lei 14.133/2021")
                    .setFontSize(18)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            // Meta Info
            document.add(new Paragraph("Processo Administrativo: " + (cesta.getProcesso().getNumeroProcesso() != null ? cesta.getProcesso().getNumeroProcesso() : "N/A"))
                    .setFontSize(12));
            document.add(new Paragraph("Responsável: " + (cesta.getProcesso().getResponsavel() != null ? cesta.getProcesso().getResponsavel() : "N/A"))
                    .setFontSize(12));
            document.add(new Paragraph("Data de Referência: " + cesta.getDataReferencia().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")))
                    .setFontSize(12));
             document.add(new Paragraph("Método de Cálculo: " + cesta.getTipoCalculo())
                    .setFontSize(12));
            document.add(new Paragraph("\n"));

            // Table Structure
            // Columns: Date, Source Type, Supplier, Location, Unit Price, Qty, Total
            float[] columnWidths = {2, 2, 4, 3, 2, 1, 2}; 
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            // Headers
            addHeaderCell(table, "Data");
            addHeaderCell(table, "Fonte");
            addHeaderCell(table, "Fornecedor / Identificação");
            addHeaderCell(table, "Local (UF)");
            addHeaderCell(table, "Valor Unit.");
            addHeaderCell(table, "Qtd");
            addHeaderCell(table, "Total");

            // Iterate Groups (ItemCesta)
            for (com.licitacao.saas.domain.ItemCesta item : cesta.getItens()) {
                // Group Header
                Cell headerCell = new Cell(1, 7)
                        .add(new Paragraph("Item: " + item.getDescricao() + " (" + item.getCodigoMaterialServico() + ") - Mediana Est.: R$ " + String.format("%.2f", item.getValorEstimado())))
                        .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                        .setBold();
                table.addCell(headerCell);

                // Sources (FonteItemCesta)
                for (com.licitacao.saas.domain.FonteItemCesta fonte : item.getFontes()) {
                    table.addCell(new Cell().add(new Paragraph(fonte.getDataFonte().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")))).setFontSize(9));
                    table.addCell(new Cell().add(new Paragraph(fonte.getTipoFonte().toString())).setFontSize(9));
                    
                    String fornecedor = fonte.getNomeFornecedor();
                    if (fonte.getCnpjFornecedor() != null) fornecedor += "\n" + fonte.getCnpjFornecedor();
                    table.addCell(new Cell().add(new Paragraph(fornecedor)).setFontSize(9));
                    
                    table.addCell(new Cell().add(new Paragraph(fonte.getNomeMunicipio() + "/" + fonte.getUfOrigem())).setFontSize(9));
                    
                    table.addCell(new Cell().add(new Paragraph(String.format("R$ %.2f", fonte.getValorUnitario()))).setFontSize(9).setTextAlignment(TextAlignment.RIGHT));
                    table.addCell(new Cell().add(new Paragraph(String.format("%.0f", item.getQuantidade()))).setFontSize(9).setTextAlignment(TextAlignment.RIGHT));
                    
                    double total = fonte.getValorUnitario().doubleValue() * item.getQuantidade().doubleValue();
                    table.addCell(new Cell().add(new Paragraph(String.format("R$ %.2f", total))).setFontSize(9).setTextAlignment(TextAlignment.RIGHT));
                }
                
                // Flush occasionally
                if (table.getNumberOfRows() > 100) {
                     document.add(table);
                     table = new Table(UnitValue.createPercentArray(columnWidths));
                     table.setWidth(UnitValue.createPercentValue(100));
                }
            }

            document.add(table);
            document.close();
            
        } catch (Exception e) {
            log.error("Erro ao gerar PDF", e);
            throw new RuntimeException("Erro na geração do relatório", e);
        }
    }

    private void addHeaderCell(Table table, String text) {
        table.addHeaderCell(new Cell().add(new Paragraph(text).setBold()).setBackgroundColor(ColorConstants.LIGHT_GRAY).setFontSize(10));
    }
}

package com.licitacao.saas.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fonte_item_cesta")
public class FonteItemCesta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_cesta_id", nullable = false)
    @ToString.Exclude
    private ItemCesta itemCesta;

    @Column(name = "tipo_fonte", nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoFonte tipoFonte;

    @Column(name = "nome_fornecedor", nullable = false)
    private String nomeFornecedor;

    @Column(name = "cnpj_fornecedor", length = 18)
    private String cnpjFornecedor;

    @Column(name = "uf_origem", length = 2)
    private String ufOrigem;

    @Column(name = "nome_municipio")
    private String nomeMunicipio;

    @Column(name = "valor_unitario", nullable = false, precision = 19, scale = 4)
    private BigDecimal valorUnitario;

    @Column(name = "data_fonte", nullable = false)
    private LocalDate dataFonte;

    @Column(name = "numero_controle_pncp")
    private String numeroControlePncp;

    @Column(name = "link_comprovante", columnDefinition = "TEXT")
    private String linkComprovante;

    @Column(nullable = false)
    @Builder.Default
    private Boolean desconsiderado = false;

    @Column(name = "justificativa_desconsideracao", columnDefinition = "TEXT")
    private String justificativaDesconsideracao;
}

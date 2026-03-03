package com.licitacao.saas.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "item_cesta")
public class ItemCesta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cesta_id", nullable = false)
    @ToString.Exclude
    private CestaPreco cestaPreco;

    // Snapshot fields to ensure immutability reference
    @Column(name = "codigo_material_servico", length = 50)
    private String codigoMaterialServico;

    @Column(name = "descricao_original", columnDefinition = "TEXT")
    private String descricaoOriginal;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "unidade_medida", nullable = false, length = 50)
    private String unidadeMedida;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantidade;

    @Column(name = "valor_estimado", precision = 19, scale = 4)
    private BigDecimal valorEstimado;

    @OneToMany(mappedBy = "itemCesta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FonteItemCesta> fontes = new ArrayList<>();
}

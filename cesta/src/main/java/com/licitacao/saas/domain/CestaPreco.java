package com.licitacao.saas.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cesta_preco")
public class CestaPreco {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String objeto;

    @Column(name = "data_referencia", nullable = false)
    private LocalDateTime dataReferencia;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_calculo", nullable = false)
    private TipoCalculo tipoCalculo;

    @Enumerated(EnumType.STRING)
    @Column(name = "indice_reajuste", nullable = false)
    private IndiceCorrecao indiceReajuste;

    @Column(name = "usuario_id", nullable = false)
    private UUID usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusCesta status;
    
    @Column(name = "uf_prioritaria", length = 2)
    private String ufPrioritaria;

    @Column(name = "created_by")
    private String createdBy; // Simple string for now, could be UUID or related to User entity

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @jakarta.persistence.ManyToOne(optional = false)
    @jakarta.persistence.JoinColumn(name = "processo_id", nullable = false)
    private ProcessoAdministrativo processo;

    @OneToMany(mappedBy = "cestaPreco", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemCesta> itens = new ArrayList<>();
}

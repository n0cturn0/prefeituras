package com.licitacao.saas.repository;

import com.licitacao.saas.domain.ProcessoAdministrativo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProcessoAdministrativoRepository extends JpaRepository<ProcessoAdministrativo, UUID> {
    Optional<ProcessoAdministrativo> findByNumeroProcesso(String numeroProcesso);
}

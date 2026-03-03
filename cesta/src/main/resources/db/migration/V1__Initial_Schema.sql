CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Enums
CREATE TYPE tipo_calculo AS ENUM ('MEDIA', 'MEDIANA', 'MENOR_PRECO');
CREATE TYPE indice_correcao AS ENUM ('IPCA', 'IGPM', 'NENHUM');
CREATE TYPE status_cesta AS ENUM ('EM_ELABORACAO', 'CONCLUIDA', 'ARQUIVADA');

-- 2. Tabela cesta_preco
CREATE TABLE cesta_preco (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    objeto TEXT NOT NULL,
    data_referencia TIMESTAMP NOT NULL,
    tipo_calculo tipo_calculo NOT NULL,
    indice_reajuste indice_correcao NOT NULL,
    usuario_id UUID NOT NULL,
    status status_cesta NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela item_cesta
CREATE TABLE item_cesta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cesta_id UUID NOT NULL,
    descricao TEXT NOT NULL,
    unidade_medida VARCHAR(50) NOT NULL,
    quantidade DECIMAL(19,4) NOT NULL,
    valor_estimado DECIMAL(19,2),
    CONSTRAINT fk_cesta FOREIGN KEY (cesta_id) REFERENCES cesta_preco(id) ON DELETE CASCADE
);

-- 4. Tabela fonte_preco
CREATE TABLE fonte_preco (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL,
    origem VARCHAR(100) NOT NULL,
    valor_unitario DECIMAL(19,2) NOT NULL,
    data_fonte DATE NOT NULL,
    desconsiderado BOOLEAN DEFAULT FALSE,
    justificativa_desconsideracao TEXT,
    arquivo_url TEXT,
    CONSTRAINT fk_item FOREIGN KEY (item_id) REFERENCES item_cesta(id) ON DELETE CASCADE
);

-- 1. Create Processo Table
CREATE TABLE processo_administrativo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_processo VARCHAR(100) NOT NULL UNIQUE,
    objeto TEXT NOT NULL,
    responsavel VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Alter Cesta Preco to add Processo FK
ALTER TABLE cesta_preco ADD COLUMN processo_id UUID;
ALTER TABLE cesta_preco ADD CONSTRAINT fk_processo FOREIGN KEY (processo_id) REFERENCES processo_administrativo(id);

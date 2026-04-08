---
name: QualitySistemas API Scraper
description: How to extract data from QualitySistemas transparent portals by bypassing the frontend SPA and consuming the native JSON API (EntityDataFinder).
---

# QualitySistemas API Scraper

A maioria dos portais da Transparência providos pela "QualitySistemas" exibem os dados de entidades, contratos, servidores e organograma em uma interface renderizada client-side via Ajax/SPA usando Javascript.

Por conta disso, web scrapers tradicionais (como `Symfony\Component\DomCrawler` usando cURL padrão ou `Http::get`) falharão ao não encontrar as rotas e tabelas HTML físicas (que só existem em memória após o load). A maneira mais segura e rápida de realizar raspagem nesses portais não é subindo um Chromium *headless*, mas utilizando o **próprio conector de API interno** das páginas em favor de um payload JSON perfeitamente formatado.

Use esta skill como fundação sempre que precisar raspar dados (entidades, despesas, folha de pagamento, etc) de páginas da QualitySistemas.

## 1. Como Identificar um Portal QualitySistemas

Pode-se buscar no código-fonte principal (via Scraper simples) as seguintes chaves que confirmam o provedor:

- Inputs do tipo form-hidden como `<input type="hidden" id="entityLink" ...>` e `<input type="hidden" id="base-url" ...>`.
- Scripts incluindo `/portal/public/js/...` ou `.../js/Acessibilidade.js` no `head`.
- Rodapé contendo as referências copyright da *QualitySistemas*.

## 2. A Mecânica da API de Dados (EntityDataFinder)

Nas páginas de entidade (Prefeitura e Secretarias), ao invés de buscar tabelas no HTML como `table.tabela`, a estratégia correta é realizar uma requisição POST diretamente para a controladora interna via Ajax.

### Parâmetros Extras

O que você precisará extrair da página base do município (o DOM puro, pré-renderização):
1. **Valor do `entityLink`:** Está localizado em `<input type="hidden" id="entityLink" value="nome_do_municipio">`.
2. **Valor do `base-url`:** Está localizado em `<input type="hidden" id="base-url" value="url_base_da_entidade/">`.

### Como fazer a requisição

A API responderá em requisições feitas no endereço concatenado `$baseUrl . '/EntityDataFinder'`, e ela **exige** que seja um request POST Ajax válido (`XMLHttpRequest`). 

**Exemplo em Laravel (`Http` Facade):**

```php
$ajaxResponse = Http::withoutVerifying()->asForm()->withHeaders([
    'X-Requested-With' => 'XMLHttpRequest',
    'User-Agent' => 'Mozilla/5.0 ...'
])->post($baseUrl . '/EntityDataFinder', [
    'entity' => $entityLink // (ex: prefeitura_municipal_de_corguinho)
]);

$dados = $ajaxResponse->json();
```

## 3. Retorno JSON da API e Dados Chaves

A resposta virá não criptografada como uma *Array* contendo as informações das entidades agrupadas.
Dada a natureza relacional, normalmente a raiz (Prefeitura) será o primeiro ou principal índice, e as Secretarias/Fundos são as demais chaves.

**Exemplo do Payload esperado:**
```json
[
  {
    "codigo": 1,
    "nome": "PREFEITURA MUNICIPAL DE CORGUINHO",
    "cep": "79.460-000",
    "logradouro": "RUA ANTONIO FURTADO DE MENDONÇA",
    "bairro": "CENTRO",
    "gestor": "MARCIO NOVAES PEREIRA",
    "telefone": "(67) 3250-1439",
    "fax": "",
    "email": "gabineteprefeitacorguinhoms@gmail.com",
    "site": "",
    "horarioAtendimento": [
      {
        "DIA": "Segunda-feira",
        "AGE_MANHA_INCIO": "07:00:00",
        "AGE_MANHA_TERMINO": "13:00:00",
        "AGE_TARDE_INICIO": null,
        "AGE_TARDE_TERMINO": null
      }
    ],
    "representanteGestor": "MARCIO NOVAES PEREIRA"
  }
]
```

## 4. Dicas de Implementação Futura
- **Limpeza de Strings Livres**: As APIs de terceiros não sanitizam o contato antes de enviar. Pode haver `tel:(67) ...` do backend deles. Em implementações de banco próprias, limpe `tel:` e `mailto:`.
- **Certificados SSL**: Muitos domínios `.gov.br` e sub-domínios mantidos por prefeituras usam certificados não válidos universalmente ou vencidos em redes internas. Ao automatizar a busca, invocar verificações desabilitadas (ex: `withoutVerifying()`) no cURL prevenirá falsos erros de indisponibilidade (`cURL error 60`).
- **Arquitetura Baseada em AJAX em outros módulos**: Se a QualitySistemas usa `/EntityDataFinder` para entidades, saiba que para raspagem de Editais, Portarias, ou Diários as lógicas costumam ser em rotas como `/DespesasDataFinder` ou `/DiariosDataFinder`. Para descobrir as rotas futuras, basta buscar arquivos javascript presentes no DOM puro principal da sub-seção (ex: `organograma.js` ou `principal.js`).

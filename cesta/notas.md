Estes endpoints são necessários para cumprir o roteiro de 2 horas da apresentação:


08 - ARP (Atas de Registro de Preços) e 09 - CONTRATOS:


Relação na POC: O item "O" do roteiro exige expressamente que o sistema apresente os documentos comprobatórios das fontes (Atas e Contratos).






Funcionalidade: Sem esses endpoints, você não conseguiria realizar a extração automática dos arquivos para anexá-los à cesta, o que resultaria em desclassificação.


07 - CONTRATAÇÕES:


Relação na POC: Essencial para buscar os "Preços Praticados" sob a nova Lei 14.133/2021, que é a base legal deste pregão.



10 - FORNECEDOR:


Relação na POC: O item "B" do roteiro pede a apresentação do catálogo de fornecedores. Além disso, para simular o envio de e-mails de cotação (item F), você precisará de dados de fornecedores válidos.





05 - UASG:


Relação na POC: Necessário para identificar o órgão comprador em cada fonte de preço exibida no Mapa de Apuração (item N).

Ponto de conversão:
Acesse /pesquisa-precos



Endereco completo:https://pncp.gov.br/api/
Ata
Consultas de Atas de Registro de Preços
/v1/atas
exemple return:
{
  "data": [
    {
      "numeroControlePNCPAta": "string",
      "numeroAtaRegistroPreco": "string",
      "anoAta": 0,
      "numeroControlePNCPCompra": "string",
      "cancelado": true,
      "dataCancelamento": "2026-01-23T22:49:54.653Z",
      "dataAssinatura": "2026-01-23T22:49:54.653Z",
      "vigenciaInicio": "2026-01-23T22:49:54.653Z",
      "vigenciaFim": "2026-01-23T22:49:54.653Z",
      "dataPublicacaoPncp": "2026-01-23T22:49:54.653Z",
      "dataInclusao": "2026-01-23T22:49:54.653Z",
      "dataAtualizacao": "2026-01-23T22:49:54.653Z",
      "dataAtualizacaoGlobal": "2026-01-23T22:49:54.653Z",
      "usuario": "string",
      "objetoContratacao": "string",
      "cnpjOrgao": "string",
      "nomeOrgao": "string",
      "cnpjOrgaoSubrogado": "string",
      "nomeOrgaoSubrogado": "string",
      "codigoUnidadeOrgao": "string",
      "nomeUnidadeOrgao": "string",
      "codigoUnidadeOrgaoSubrogado": "string",
      "nomeUnidadeOrgaoSubrogado": "string"
    }
  ],
  "totalRegistros": 0,
  "totalPaginas": 0,
  "numeroPagina": 0,
  "paginasRestantes": 0,
  "empty": true
}

/v1/atas/atualizacao
exemple return:
{
  "data": [
    {
      "numeroControlePNCPAta": "string",
      "numeroAtaRegistroPreco": "string",
      "anoAta": 0,
      "numeroControlePNCPCompra": "string",
      "cancelado": true,
      "dataCancelamento": "2026-01-23T22:51:56.860Z",
      "dataAssinatura": "2026-01-23T22:51:56.860Z",
      "vigenciaInicio": "2026-01-23T22:51:56.860Z",
      "vigenciaFim": "2026-01-23T22:51:56.860Z",
      "dataPublicacaoPncp": "2026-01-23T22:51:56.860Z",
      "dataInclusao": "2026-01-23T22:51:56.860Z",
      "dataAtualizacao": "2026-01-23T22:51:56.860Z",
      "dataAtualizacaoGlobal": "2026-01-23T22:51:56.860Z",
      "usuario": "string",
      "objetoContratacao": "string",
      "cnpjOrgao": "string",
      "nomeOrgao": "string",
      "cnpjOrgaoSubrogado": "string",
      "nomeOrgaoSubrogado": "string",
      "codigoUnidadeOrgao": "string",
      "nomeUnidadeOrgao": "string",
      "codigoUnidadeOrgaoSubrogado": "string",
      "nomeUnidadeOrgaoSubrogado": "string"
    }
  ],
  "totalRegistros": 0,
  "totalPaginas": 0,
  "numeroPagina": 0,
  "paginasRestantes": 0,
  "empty": true
}


Prepare um cenário de teste real para a banca: "Vou pesquisar 'Amoxicilina'. Vejam que o sistema traz o histórico do PNCP, mas como é um item de saúde, ele também aciona nosso robô no BPS. Eu seleciono as 3 melhores fontes, e o sistema já me entrega o Mapa de Apuração pronto para o pregoeiro assinar."

Qual dessas funcionalidades você quer que eu detalhe o código agora: a Lógica de Cálculo da Mediana ou a Geração do PDF do Mapa de Preços?
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model DotacaoDespesaLoa
 * Classificação funcional-programática conforme Lei 4.320/1964 Art. 2º §2º,
 * Portaria 42/1999 (funções/subfunções) e Art. 15 da LRF (adequação orçamentária).
 * Vincula-se a Programa e Ação do PPA vigente (integração obrigatória).
 * Leiaute e-Sfinge TCE-MS v2.0 2026.
 */
class DotacaoDespesaLoa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'dotacoes_despesas_loa';

    protected $fillable = [
        'loa_id',
        'funcao_codigo',
        'subfuncao_codigo',
        'programa_codigo',
        'acao_codigo',
        'unidade_orcamentaria',
        'natureza_despesa',
        'fonte_recursos',
        'valor_dotado',
        'projeto_atividade',
    ];

    /** Fontes de recursos conforme SEFAZ-MS / STN */
    public const FONTES_RECURSOS = [
        '1500'  => '1500 - Recursos não Vinculados de Impostos',
        '1501'  => '1501 - Outros Recursos não Vinculados',
        '1540'  => '1540 - Transferências do FUNDEB – Impostos 70%',
        '1541'  => '1541 - Transferências do FUNDEB – Impostos 30%',
        '1550'  => '1550 - Transferência do Salário-Educação',
        '1570'  => '1570 - Transferências do Governo Federal - SUS',
        '1571'  => '1571 - Transferências do Governo Federal - SUAS',
        '1600'  => '1600 - Transferências Fundo a Fundo - SUS',
        '1621'  => '1621 - Transferências Fundo a Fundo - SUAS',
        '1700'  => '1700 - Outras Transferências de Convênios',
        '1750'  => '1750 - Recursos de Operações de Crédito',
        '1800'  => '1800 - Recursos de Alienação de Bens/Ativos',
        '1899'  => '1899 - Outros Recursos Vinculados',
    ];

    /** Naturezas de despesa principais conforme MTO / SEFAZ-MS */
    public const NATUREZAS_DESPESA = [
        '3.1.90.11' => 'Vencimentos e Vantagens Fixas',
        '3.1.90.13' => 'Obrigações Patronais',
        '3.1.90.16' => 'Outras Despesas Variáveis – Pessoal Civil',
        '3.3.90.14' => 'Diárias – Civil',
        '3.3.90.30' => 'Material de Consumo',
        '3.3.90.33' => 'Passagens e Despesas com Locomoção',
        '3.3.90.36' => 'Outros Serviços de Terceiros – Pessoa Física',
        '3.3.90.39' => 'Outros Serviços de Terceiros – Pessoa Jurídica',
        '3.3.90.40' => 'Serviços de Tecnologia da Informação',
        '3.3.90.47' => 'Obrigações Tributárias e Contributivas',
        '3.3.90.92' => 'Despesas de Exercícios Anteriores',
        '3.3.90.93' => 'Indenizações e Restituições',
        '4.4.90.51' => 'Obras e Instalações',
        '4.4.90.52' => 'Equipamentos e Material Permanente',
        '4.4.90.61' => 'Aquisição de Imóveis',
        '4.6.90.71' => 'Principal da Dívida Contratual Resgatado',
    ];

    public function loa()
    {
        return $this->belongsTo(Loa::class);
    }

    /** Relacionamento com a Função (Portaria 42/1999 – seeder do PPA) */
    public function funcao()
    {
        return Funcao::where('codigo', $this->funcao_codigo)->first();
    }

    /** Relacionamento com a Subfunção */
    public function subfuncao()
    {
        return Subfuncao::where('codigo', $this->subfuncao_codigo)->first();
    }
}

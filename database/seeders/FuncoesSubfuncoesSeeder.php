<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Funcao;
use App\Models\Subfuncao;

class FuncoesSubfuncoesSeeder extends Seeder
{
    public function run(): void
    {
        $json = '{ "funcoes": [ {"codigo": "01", "nome": "Legislativa", "subfuncoes": [{"codigo": "031", "nome": "Ação Legislativa"}, {"codigo": "032", "nome": "Controle Externo"}]}, {"codigo": "02", "nome": "Judiciária", "subfuncoes": [{"codigo": "061", "nome": "Ação Judiciária"}, {"codigo": "062", "nome": "Defesa do Interesse Público no Processo Judiciário"}]}, {"codigo": "03", "nome": "Essencial à Justiça", "subfuncoes": [{"codigo": "091", "nome": "Defesa da Ordem Jurídica"}, {"codigo": "092", "nome": "Representação Judicial e Extrajudicial"}]}, {"codigo": "04", "nome": "Administração", "subfuncoes": [{"codigo": "121", "nome": "Planejamento e Orçamento"}, {"codigo": "122", "nome": "Administração Geral"}, {"codigo": "123", "nome": "Administração Financeira"}, {"codigo": "124", "nome": "Controle Interno"}, {"codigo": "125", "nome": "Normatização e Fiscalização"}, {"codigo": "126", "nome": "Tecnologia da Informação"}, {"codigo": "127", "nome": "Ordenamento Territorial"}, {"codigo": "128", "nome": "Formação de Recursos Humanos"}, {"codigo": "129", "nome": "Administração de Receitas"}, {"codigo": "130", "nome": "Administração de Concessões"}, {"codigo": "131", "nome": "Comunicação Social"}]}, {"codigo": "05", "nome": "Defesa Nacional", "subfuncoes": [{"codigo": "151", "nome": "Defesa Aérea"}, {"codigo": "152", "nome": "Defesa Naval"}, {"codigo": "153", "nome": "Defesa Terrestre"}]}, {"codigo": "06", "nome": "Segurança Pública", "subfuncoes": [{"codigo": "181", "nome": "Policiamento"}, {"codigo": "182", "nome": "Defesa Civil"}, {"codigo": "183", "nome": "Informação e Inteligência"}]}, {"codigo": "07", "nome": "Relações Exteriores", "subfuncoes": [{"codigo": "211", "nome": "Relações Diplomáticas"}, {"codigo": "212", "nome": "Cooperação Internacional"}]}, {"codigo": "08", "nome": "Assistência Social", "subfuncoes": [{"codigo": "241", "nome": "Assistência ao Idoso"}, {"codigo": "242", "nome": "Assistência ao Portador de Deficiência"}, {"codigo": "243", "nome": "Assistência à Criança e ao Adolescente"}, {"codigo": "244", "nome": "Assistência Comunitária"}]}, {"codigo": "09", "nome": "Previdência Social", "subfuncoes": [{"codigo": "271", "nome": "Previdência Básica"}, {"codigo": "272", "nome": "Previdência do Regime Estatutário"}, {"codigo": "273", "nome": "Previdência Complementar"}, {"codigo": "274", "nome": "Previdência Especial"}]}, {"codigo": "10", "nome": "Saúde", "subfuncoes": [{"codigo": "301", "nome": "Atenção Básica"}, {"codigo": "302", "nome": "Assistência Hospitalar e Ambulatorial"}, {"codigo": "303", "nome": "Suporte Profilático e Terapêutico"}, {"codigo": "304", "nome": "Vigilância Sanitária"}, {"codigo": "305", "nome": "Vigilância Epidemiológica"}, {"codigo": "306", "nome": "Alimentação e Nutrição"}]}, {"codigo": "11", "nome": "Trabalho", "subfuncoes": [{"codigo": "331", "nome": "Proteção e Benefícios ao Trabalhador"}, {"codigo": "332", "nome": "Relações de Trabalho"}, {"codigo": "333", "nome": "Empregabilidade"}, {"codigo": "334", "nome": "Fomento ao Trabalho"}]}, {"codigo": "12", "nome": "Educação", "subfuncoes": [{"codigo": "361", "nome": "Ensino Fundamental"}, {"codigo": "362", "nome": "Ensino Médio"}, {"codigo": "363", "nome": "Ensino Profissional"}, {"codigo": "364", "nome": "Ensino Superior"}, {"codigo": "365", "nome": "Educação Infantil"}, {"codigo": "366", "nome": "Educação de Jovens e Adultos"}, {"codigo": "367", "nome": "Educação Especial"}, {"codigo": "368", "nome": "Educação Básica"}]}, {"codigo": "13", "nome": "Cultura", "subfuncoes": [{"codigo": "391", "nome": "Patrimônio Histórico, Artístico e Arqueológico"}, {"codigo": "392", "nome": "Difusão Cultural"}]}, {"codigo": "14", "nome": "Direitos da Cidadania", "subfuncoes": [{"codigo": "421", "nome": "Custódia e Reintegração Social"}, {"codigo": "422", "nome": "Direitos Individuais, Coletivos e Difusos"}, {"codigo": "423", "nome": "Assistência aos Povos Indígenas"}]}, {"codigo": "15", "nome": "Urbanismo", "subfuncoes": [{"codigo": "451", "nome": "Infra-Estrutura Urbana"}, {"codigo": "452", "nome": "Serviços Urbanos"}, {"codigo": "453", "nome": "Transportes Coletivos Urbanos"}]}, {"codigo": "16", "nome": "Habitação", "subfuncoes": [{"codigo": "481", "nome": "Habitação Rural"}, {"codigo": "482", "nome": "Habitação Urbana"}]}, {"codigo": "17", "nome": "Saneamento", "subfuncoes": [{"codigo": "511", "nome": "Saneamento Básico Rural"}, {"codigo": "512", "nome": "Saneamento Básico Urbano"}]}, {"codigo": "18", "nome": "Gestão Ambiental", "subfuncoes": [{"codigo": "541", "nome": "Preservação e Conservação Ambiental"}, {"codigo": "542", "nome": "Controle Ambiental"}, {"codigo": "543", "nome": "Recuperação de Áreas Degradadas"}]}, {"codigo": "19", "nome": "Ciência e Tecnologia", "subfuncoes": [{"codigo": "571", "nome": "Desenvolvimento Científico"}, {"codigo": "572", "nome": "Desenvolvimento Tecnológico"}]}, {"codigo": "20", "nome": "Agricultura", "subfuncoes": [{"codigo": "601", "nome": "Promoção da Agricultura"}, {"codigo": "602", "nome": "Extensão Rural"}]}, {"codigo": "21", "nome": "Comunicação", "subfuncoes": [{"codigo": "631", "nome": "Comunicação Social"}]}, {"codigo": "22", "nome": "Desporto e Lazer", "subfuncoes": [{"codigo": "661", "nome": "Desporto de Rendimento"}, {"codigo": "662", "nome": "Desporto Comunitário"}, {"codigo": "663", "nome": "Lazer"}]}, {"codigo": "23", "nome": "Encargos Especiais", "subfuncoes": [{"codigo": "841", "nome": "Refinanciamento da Dívida Interna"}, {"codigo": "842", "nome": "Refinanciamento da Dívida Externa"}, {"codigo": "843", "nome": "Serviço da Dívida Interna"}, {"codigo": "844", "nome": "Serviço da Dívida Externa"}, {"codigo": "845", "nome": "Outras Transferências"}, {"codigo": "846", "nome": "Outros Encargos Especiais"}, {"codigo": "847", "nome": "Transferências para a Educação Básica"}]}, {"codigo": "28", "nome": "Encargos Especiais (reserva)", "subfuncoes": [{"codigo": "999", "nome": "Reserva de Contingência"}]} ] }';

        $data = json_decode($json, true);

        foreach ($data['funcoes'] as $funcaoData) {
            $funcao = Funcao::updateOrCreate(
                ['codigo' => $funcaoData['codigo']],
                ['nome' => $funcaoData['nome']]
            );

            foreach ($funcaoData['subfuncoes'] as $subfuncaoData) {
                Subfuncao::updateOrCreate(
                    ['codigo' => $subfuncaoData['codigo']],
                    [
                        'funcao_id' => $funcao->id,
                        'nome' => $subfuncaoData['nome']
                    ]
                );
            }
        }
    }
}

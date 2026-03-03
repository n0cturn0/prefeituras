<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuPublicacoesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Main Menu: Publicações Oficiais
        $menuId = Str::uuid();
        DB::table('site_menus')->insert([
            'id' => $menuId,
            'name' => 'Publicações Oficiais',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Submenus
        $submenus = [
            'Licitações' => [
                'items' => [
                    'Licitantes e/ou Contratados Sancionados',
                    'Chamada Pública',
                    'Chamamento Público',
                    'Concorrência Pública',
                    'Convite',
                    'Dispensa de Licitação',
                    'Inexigibilidade',
                    'Leilão',
                    'Pregão Eletrônico',
                    'Pregão Presencial',
                    'Tomada de Preço'
                ]
            ],
            'Concursos' => [
                'items' => [
                    'Concurso',
                    'Convocação',
                    'Processo Seletivo'
                ]
            ],
            'Legislação' => [
                'items' => [
                    'Código de Obras',
                    'Código Tributário Municipal',
                    'Decretos',
                    'Estatuto do Servidor',
                    'Lei Ordinária',
                    'Lei Orgânica',
                    'Leis',
                    'Plano Diretor - PDDI',
                    'Plano Plurianual',
                    'Portaria'
                ]
            ],
            'Destaques' => [ // This will map to the 4th column (Diário Oficial etc)
                'items' => [
                    'Diário Oficial',
                    'Contratos',
                    'Convênios',
                    'Parcerias',
                    'Patrocínios'
                ]
            ]
        ];

        foreach ($submenus as $submenuName => $data) {
            $submenuId = Str::uuid();
            DB::table('site_submenus')->insert([
                'id' => $submenuId,
                'menu_id' => $menuId,
                'name' => $submenuName,
                'url' => '#',
                'status' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $position = 0;
            foreach ($data['items'] as $itemName) {
                DB::table('site_url_submenus')->insert([
                    'id' => Str::uuid(),
                    'submenu_id' => $submenuId,
                    'name' => $itemName,
                    'url' => '/publicacoes-oficiais/' . Str::slug($submenuName) . '/' . Str::slug($itemName),
                    'position' => ++$position,
                    'status' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuSistemaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Main Menu: Departamentos
        $menuId = Str::uuid();
        DB::table('site_menus')->insert([
            'id' => $menuId,
            'name' => 'Departamentos',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Submenus
        $submenus = [
            'Geral' => [
                'items' => [
                    'Estrutura Organizacional',
                    'Gabinete do Prefeito'
                ]
            ],
            'Secretarias' => [
                'items' => [
                    'Secretaria da Administração',
                    'Secretaria da Fazenda',
                    'Secretaria da Saúde',
                    'Secretaria de Coordenação e Planejamento',
                    'Secretaria de Educação',
                    'Secretaria de Obras, Viação e Trânsito',
                    'Secretaria do Esporte, Cultura e Lazer',
                    'Secretaria do Meio Ambiente'
                ]
            ],
            'Subsecretarias' => [
                'items' => [
                    'Departamento de Trânsito',
                    'Subsecretaria de Administração'
                ]
            ],
            'Conselhos e Comitês' => [
                'items' => [
                    'Conselho do Idoso',
                    'Conselho Municipal de Educação'
                ]
            ]
        ];

        foreach ($submenus as $submenuName => $data) {
            $submenuId = Str::uuid();
            DB::table('site_submenus')->insert([
                'id' => $submenuId,
                'menu_id' => $menuId,
                'name' => $submenuName,
                'url' => '#', // Submenu header usually not clickable or points to section
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
                    'url' => '/departamentos/' . Str::slug($itemName),
                    'position' => ++$position,
                    'status' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

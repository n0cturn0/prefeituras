<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuInformativosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Main Menu: Informativos
        $menuId = Str::uuid();
        DB::table('site_menus')->insert([
            'id' => $menuId,
            'name' => 'Informativos',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Submenus
        $submenus = [
            'Geral' => [ // 1st Column (items like Notícias, Eventos)
                'items' => [
                    'Notícias',
                    'Eventos',
                    'Enquetes anteriores',
                    'Links Úteis'
                ]
            ],
            'Multimídia' => [ // 2nd Column
                'items' => [
                    'Galeria de Fotos',
                    'Galeria de Vídeos',
                    'Áudios',
                    'Documentos'
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
                    'url' => '/informativos/' . Str::slug($submenuName) . '/' . Str::slug($itemName),
                    'position' => ++$position,
                    'status' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MenuContatosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Main Menu: Contatos
        $menuId = Str::uuid();
        DB::table('site_menus')->insert([
            'id' => $menuId,
            'name' => 'Contatos',
            'status' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Submenus - Using 'Geral' as a container for the simple dropdown items
        $submenus = [
            'Geral' => [ 
                'items' => [
                    'Telefones e Endereços',
                    'Fale Conosco',
                    'Ouvidoria'
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
                    'url' => '/contatos/' . Str::slug($itemName),
                    'position' => ++$position,
                    'status' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}

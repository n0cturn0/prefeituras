<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use App\Models\Department;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Limpar cache de permissões (Boa prática do Spatie)
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 2. Definir Permissões do Sistema
        $permissions = [
            // Módulo de Usuários e RH
            'gerenciar_usuarios', // Required for Users menu
            'gerenciar_secoes',
            'view-logs',
            'gerenciar_departamentos',

            // Módulo de CMS (Notícias e Conteúdo)
            'criar_conteudo',
            'editar_conteudo',
            'publicar_conteudo', // Apenas gestores podem publicar
            'arquivar_conteudo',

            // Módulo LAI (e-SIC e Transparência)
            'ver_pedidos_sic',
            'responder_pedidos_sic',
            'gerenciar_licitacoes',
            'publicar_documentos_oficiais',

            // Auditoria
            'ver_logs_auditoria',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // 3. Criar a primeira Secretaria (Gabinete do Prefeito ou TI)
        $deptTI = Department::firstOrCreate(
            ['slug' => 'ti'],
            [
                'name' => 'Departamento de Tecnologia da Informação',
                'description' => 'Responsável pela manutenção do portal'
            ]
        );

        // 4. Criar Roles e Atribuir Permissões

        // Role: Super Admin (Tem tudo)
        $roleAdmin = Role::firstOrCreate(['name' => 'Admin']);
        $roleAdmin->syncPermissions(Permission::all());

        // Role: Gestor de Secretaria (Pode publicar e gerenciar sua área)
        $roleGestor = Role::firstOrCreate(['name' => 'Gestor']);
        $roleGestor->syncPermissions([
            'criar_conteudo',
            'editar_conteudo',
            'publicar_conteudo',
            'ver_pedidos_sic',
            'responder_pedidos_sic'
        ]);

        // Role: Redator (Só cria e edita, não publica)
        $roleRedator = Role::firstOrCreate(['name' => 'Redator']);
        $roleRedator->syncPermissions(['criar_conteudo', 'editar_conteudo']);

        // 5. Criar o Usuário Administrador Inicial
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@prefeitura.gov.br'],
            [
                'name' => 'Administrador do Sistema',
                'password' => 'password', // Altere após o primeiro login
                'department_id' => $deptTI->id,
                'is_active' => true,
            ]
        );

        if (!$adminUser->hasRole('Admin')) {
            $adminUser->assignRole($roleAdmin);
        }

        $this->command->info('Usuário Admin verificado/criado com sucesso!');

        // 6. Criar Usuário Gestor (Para testes)
        $gestorUser = User::firstOrCreate(
            ['email' => 'gestor@prefeitura.gov.br'],
            [
                'name' => 'Gestor da Secretaria',
                'password' => 'password',
                'department_id' => $deptTI->id,
                'is_active' => true,
            ]
        );
        if (!$gestorUser->hasRole('Gestor')) {
            $gestorUser->assignRole($roleGestor);
        }

        // 7. Criar Usuário Redator (Para testes)
        $redatorUser = User::firstOrCreate(
            ['email' => 'redator@prefeitura.gov.br'],
            [
                'name' => 'Redator de Conteúdo',
                'password' => 'password',
                'department_id' => $deptTI->id,
                'is_active' => true,
            ]
        );
        if (!$redatorUser->hasRole('Redator')) {
            $redatorUser->assignRole($roleRedator);
        }

        $this->command->info('Usuários de teste (Gestor e Redator) verificados/criados com sucesso!');
    }
}
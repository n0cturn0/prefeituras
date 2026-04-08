<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Symfony\Component\DomCrawler\Crawler;

class DepartmentController extends Controller
{
    /**
     * Lista todos os departments com informações hierárquicas.
     */
    public function index()
    {
        $departments = Department::with('parent')
            ->orderByDesc('is_root')
            ->orderBy('name')
            ->get();

        return Inertia::render('Departments/Index', [
            'departments' => $departments,
        ]);
    }

    /**
     * Exibe o formulário de criação.
     */
    public function create()
    {
        $parents = Department::orderByDesc('is_root')->orderBy('name')->get(['id', 'name', 'is_root']);

        return Inertia::render('Departments/Create', [
            'parents' => $parents,
        ]);
    }

    /**
     * Salva um novo department.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                 => 'required|string|max:255|unique:departments,name',
            'acronym'              => 'nullable|string|max:20',
            'description'          => 'nullable|string|max:2000',
            'is_root'              => 'boolean',
            'parent_id'            => 'nullable|exists:departments,id',
            'gestor'               => 'nullable|string|max:255',
            'representante_gestor' => 'nullable|string|max:255',
            'phone'                => 'nullable|string|max:30',
            'fax'                  => 'nullable|string|max:30',
            'email'                => 'nullable|email|max:255',
            'site'                 => 'nullable|url|max:255',
            'cep'                  => 'nullable|string|max:10',
            'logradouro'           => 'nullable|string|max:255',
            'bairro'               => 'nullable|string|max:255',
            'horario_atendimento'  => 'nullable|array',
        ]);

        $validated['is_root'] = filter_var($request->input('is_root', false), FILTER_VALIDATE_BOOLEAN);

        if ($validated['is_root']) {
            $validated['parent_id'] = null;
        }

        $validated['slug'] = Str::slug($validated['name']);

        Department::create($validated);

        return redirect()->route('departments.index')
            ->with('success', 'Entidade criada com sucesso!');
    }

    /**
     * Exibe o formulário de edição.
     */
    public function edit(string $id)
    {
        $department = Department::findOrFail($id);

        $parents = Department::where('id', '!=', $id)
            ->orderByDesc('is_root')
            ->orderBy('name')
            ->get(['id', 'name', 'is_root']);

        return Inertia::render('Departments/Edit', [
            'department' => $department,
            'parents'    => $parents,
        ]);
    }

    /**
     * Atualiza um department existente.
     */
    public function update(Request $request, string $id)
    {
        $department = Department::findOrFail($id);

        $validated = $request->validate([
            'name'                 => "required|string|max:255|unique:departments,name,{$id}",
            'acronym'              => 'nullable|string|max:20',
            'description'          => 'nullable|string|max:2000',
            'is_root'              => 'boolean',
            'parent_id'            => "nullable|exists:departments,id|different:{$id}",
            'gestor'               => 'nullable|string|max:255',
            'representante_gestor' => 'nullable|string|max:255',
            'phone'                => 'nullable|string|max:30',
            'fax'                  => 'nullable|string|max:30',
            'email'                => 'nullable|email|max:255',
            'site'                 => 'nullable|url|max:255',
            'cep'                  => 'nullable|string|max:10',
            'logradouro'           => 'nullable|string|max:255',
            'bairro'               => 'nullable|string|max:255',
            'horario_atendimento'  => 'nullable|array',
        ]);

        $validated['is_root'] = filter_var($request->input('is_root', false), FILTER_VALIDATE_BOOLEAN);

        if ($validated['is_root']) {
            $validated['parent_id'] = null;
        }

        $validated['slug'] = Str::slug($validated['name']);

        $department->update($validated);

        return redirect()->route('departments.index')
            ->with('success', 'Entidade atualizada com sucesso!');
    }

    /**
     * Remove um department (impede exclusão se houver filhos).
     */
    public function destroy(string $id)
    {
        $department = Department::withCount('children')->findOrFail($id);

        if ($department->children_count > 0) {
            return back()->with('error', 'Não é possível excluir uma entidade que possui secretarias vinculadas.');
        }

        $department->delete();

        return redirect()->route('departments.index')
            ->with('success', 'Entidade removida com sucesso!');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // WEB SCRAPING
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Acessa uma URL e tenta extrair dados do organograma via DomCrawler.
     * Salva a prefeitura (entidade principal) e as secretarias (que estão listadas
     * na mesma página).
     *
     * POST /departments/scrape
     */
    public function scrape(Request $request)
    {
        $request->validate([
            'url' => 'required|url|max:2048',
        ]);

        $mainUrl = rtrim($request->input('url'), '/');
        
        \Illuminate\Support\Facades\Log::info("Iniciando scraping da URL principal: {$mainUrl}");

        try {
            // Adicionado withoutVerifying() para evitar que certificados inválidos em portais de prefeituras bloqueiem a requisição
            $response = Http::withoutVerifying()->withHeaders([
                'User-Agent'      => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept'          => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language' => 'pt-BR,pt;q=0.9,en;q=0.8',
            ])->timeout(20)->get($mainUrl);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Falha ao tentar executar HTTP GET em {$mainUrl}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Não foi possível acessar a URL. Verifique se ela está acessível: ' . $e->getMessage(),
            ], 422);
        }

        if (!$response->successful()) {
            return response()->json([
                'success' => false,
                'message' => "O servidor retornou o código HTTP {$response->status()}. O site pode estar bloqueando o acesso ou fora do ar.",
            ], 422);
        }

        $html    = $response->body();
        $crawler = new Crawler($html, $mainUrl);

        $tables = $crawler->filter('table.tabela');

        $prefeituraId = null;
        $secretariasSalvas = 0;
        $prefeituraSalva = false;

        // ── Verifica se é um portal QualitySistemas (dados via AJAX) ──
        $entityLinkNode = $crawler->filter('#entityLink');
        $baseUrlNode = $crawler->filter('#base-url');
        
        if ($tables->count() === 0 && $entityLinkNode->count() > 0 && $baseUrlNode->count() > 0) {
            $entityVal = trim($entityLinkNode->attr('value'));
            $baseUrlVal = rtrim(trim($baseUrlNode->attr('value')), '/');
            
            \Illuminate\Support\Facades\Log::info("Detectado portal via AJAX (QualitySistemas). Buscando JSON em: {$baseUrlVal}/EntityDataFinder");
            
            try {
                $ajaxResponse = Http::withoutVerifying()
                    ->asForm()
                    ->withHeaders([
                        'X-Requested-With' => 'XMLHttpRequest',
                        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    ])
                    ->timeout(20)
                    ->post($baseUrlVal . '/EntityDataFinder', [
                        'entity' => $entityVal
                    ]);
                    
                if ($ajaxResponse->successful()) {
                    $jsonData = $ajaxResponse->json();
                    
                    if (is_array($jsonData)) {
                        foreach ($jsonData as $item) {
                            if (empty($item['nome'])) continue;
                            
                            $name = $item['nome'];
                            $isRoot = false;
                            
                            if ($prefeituraId === null || str_contains(mb_strtoupper($name, 'UTF-8'), 'PREFEITURA')) {
                                $isRoot = true;
                            }
                            
                            $horarios = [];
                            if (isset($item['horarioAtendimento']) && is_array($item['horarioAtendimento'])) {
                                foreach ($item['horarioAtendimento'] as $horario) {
                                    $dia = match (mb_strtolower(trim($horario['DIA'] ?? ''), 'UTF-8')) {
                                        'segunda-feira' => 'seg',
                                        'terça-feira' => 'ter',
                                        'quarta-feira' => 'qua',
                                        'quinta-feira' => 'qui',
                                        'sexta-feira' => 'sex',
                                        'sábado' => 'sab',
                                        'domingo' => 'dom',
                                        default => null,
                                    };
                                    
                                    if ($dia && !empty($horario['AGE_MANHA_INCIO']) && !empty($horario['AGE_MANHA_TERMINO'])) {
                                        $inicio = substr($horario['AGE_MANHA_INCIO'], 0, 5); // pega HH:MM
                                        // Usa o horario da tarde caso preenchido como termino, senão da manha
                                        $fim = !empty($horario['AGE_TARDE_TERMINO']) 
                                            ? substr($horario['AGE_TARDE_TERMINO'], 0, 5) 
                                            : substr($horario['AGE_MANHA_TERMINO'], 0, 5);
                                            
                                        $horarios[$dia] = [
                                            'ativo' => true,
                                            'inicio' => $inicio,
                                            'fim' => $fim,
                                        ];
                                    }
                                }
                            }
                            
                            $entityData = [
                                'name'                 => $name,
                                'gestor'               => $item['gestor'] ?? null,
                                'representante_gestor' => $item['representanteGestor'] ?? null,
                                'phone'                => $item['telefone'] ?? null,
                                'fax'                  => $item['fax'] ?? null,
                                'email'                => $item['email'] ?? null,
                                'site'                 => !empty($item['site']) ? $item['site'] : $mainUrl,
                                'cep'                  => $item['cep'] ?? null,
                                'logradouro'           => $item['logradouro'] ?? null,
                                'bairro'               => $item['bairro'] ?? null,
                                'horario_atendimento'  => !empty($horarios) ? $horarios : null,
                            ];
                            
                            // Limpa e salva
                            if (isset($entityData['email'])) $entityData['email'] = str_replace('mailto:', '', $entityData['email']);
                            if (isset($entityData['phone'])) $entityData['phone'] = str_replace('tel:', '', $entityData['phone']);
                            
                            $entityData = array_filter($entityData, fn($v) => !is_null($v) && $v !== '');
                            
                            try {
                                $entity = Department::updateOrCreate(
                                    ['name' => $entityData['name']],
                                    array_merge($entityData, [
                                        'is_root' => $isRoot,
                                        'parent_id' => $isRoot ? null : $prefeituraId,
                                        'slug' => Str::slug($entityData['name'])
                                    ])
                                );
                
                                if ($isRoot) {
                                    $prefeituraId = $entity->id;
                                    $prefeituraSalva = true;
                                    \Illuminate\Support\Facades\Log::info("Prefeitura salva (AJAX): {$entity->name}");
                                } else {
                                    $secretariasSalvas++;
                                    \Illuminate\Support\Facades\Log::info("Secretaria salva (AJAX): {$entity->name}");
                                }
                            } catch (\Exception $e) {
                                \Illuminate\Support\Facades\Log::error("Erro ao salvar entidade AJAX ({$name}): " . $e->getMessage());
                            }
                        }
                    }
                }
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error("Erro na request AJAX do QualitySistemas: " . $e->getMessage());
            }
        }
        else if ($tables->count() > 0) {
            $tables->each(function (Crawler $tableCrawler, $i) use (&$prefeituraId, &$secretariasSalvas, &$prefeituraSalva, $mainUrl) {
                // Extrai o nome da entidade do cabeçalho da tabela
                $nameNode = $tableCrawler->filter('thead tr th')->eq(1);
                $name = $nameNode->count() > 0 ? trim($nameNode->text('')) : null;

                if (!$name) {
                    return; // Ignora tabela sem nome
                }

                $entityData = [
                    'name'                 => $name,
                    'gestor'               => null,
                    'representante_gestor' => null,
                    'phone'                => null,
                    'fax'                  => null,
                    'email'                => null,
                    'site'                 => $mainUrl, // Default fallback
                    'cep'                  => null,
                    'logradouro'           => null,
                    'bairro'               => null,
                    'description'          => null,
                    'horario_atendimento'  => null,
                ];

                // Analisa as linhas do corpo da tabela
                $tableCrawler->filter('tbody tr')->each(function (Crawler $tr) use (&$entityData) {
                    $tds = $tr->filter('td');
                    if ($tds->count() !== 2) return;

                    $keyStr = mb_strtolower(trim($tds->eq(0)->text('')), 'UTF-8');
                    $valTd = $tds->eq(1);
                    $valStr = trim($valTd->text(''));

                    if (str_contains($keyStr, 'cep')) $entityData['cep'] = $valStr;
                    elseif (str_contains($keyStr, 'logradouro')) $entityData['logradouro'] = $valStr;
                    elseif (str_contains($keyStr, 'bairro')) $entityData['bairro'] = $valStr;
                    elseif (str_contains($keyStr, 'representante')) $entityData['representante_gestor'] = $valStr;
                    elseif (str_contains($keyStr, 'gestor')) $entityData['gestor'] = $valStr;
                    elseif (str_contains($keyStr, 'telefone')) {
                        $entityData['phone'] = str_replace('tel:', '', $valStr);
                    }
                    elseif (str_contains($keyStr, 'fax')) $entityData['fax'] = $valStr;
                    elseif (str_contains($keyStr, 'e-mail') || str_contains($keyStr, 'email')) {
                        $entityData['email'] = str_replace('mailto:', '', $valStr);
                    }
                    elseif (str_contains($keyStr, 'site')) {
                        $entityData['site'] = !empty($valStr) ? $valStr : $entityData['site'];
                    }
                    elseif (str_contains($keyStr, 'atendimento') || str_contains($keyStr, 'horário')) {
                        $horarios = [];
                        $valTd->filter('ul.lista-horarios li')->each(function (Crawler $li) use (&$horarios) {
                            $dia = mb_strtolower(trim($li->filter('.diaSemana')->text('')), 'UTF-8');
                            $horaContext = mb_strtolower(trim($li->filter('.horariosDia')->text('')), 'UTF-8');
                            
                            preg_match('/das (\d{2}h\d{2}) às (\d{2}h\d{2})/', $horaContext, $matches);
                            if (count($matches) === 3) {
                                $inicio = str_replace('h', ':', $matches[1]);
                                $fim = str_replace('h', ':', $matches[2]);
                                
                                $key = match($dia) {
                                    'segunda-feira' => 'seg',
                                    'terça-feira' => 'ter',
                                    'quarta-feira' => 'qua',
                                    'quinta-feira' => 'qui',
                                    'sexta-feira' => 'sex',
                                    'sábado' => 'sab',
                                    'domingo' => 'dom',
                                    default => null,
                                };
                                if ($key) {
                                    $horarios[$key] = [
                                        'ativo' => true,
                                        'inicio' => $inicio,
                                        'fim' => $fim,
                                    ];
                                }
                            }
                        });
                        if (!empty($horarios)) $entityData['horario_atendimento'] = $horarios;
                    }
                });

                // Limpa strings vazias
                $entityData = array_filter($entityData, fn($v) => !is_null($v) && $v !== '');

                // ── Verifica se é a prefeitura (raiz) ou secretaria (filho) ──
                $isRoot = false;
                if ($prefeituraId === null || str_contains(mb_strtoupper($name, 'UTF-8'), 'PREFEITURA')) {
                    $isRoot = true;
                }

                try {
                    $entity = Department::updateOrCreate(
                        ['name' => $entityData['name']],
                        array_merge($entityData, [
                            'is_root' => $isRoot,
                            'parent_id' => $isRoot ? null : $prefeituraId,
                            'slug' => Str::slug($entityData['name'])
                        ])
                    );

                    if ($isRoot) {
                        $prefeituraId = $entity->id;
                        $prefeituraSalva = true;
                        \Illuminate\Support\Facades\Log::info("Prefeitura salva: {$entity->name}");
                    } else {
                        $secretariasSalvas++;
                        \Illuminate\Support\Facades\Log::info("Secretaria salva: {$entity->name}");
                    }
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error("Erro ao salvar entidade ({$name}): " . $e->getMessage());
                }
            });
        }
        else {
            \Illuminate\Support\Facades\Log::error("Não foi possível extrair dados: Nem tabelas DOM nem inputs de API AJAX foram encontrados em {$mainUrl}");
            return response()->json([
                'success' => false,
                'message' => 'Não foi possível extrair os dados. A estrutura da página é incompatível (nenhuma tabela física ou link de conexão QualitySistemas encontrado).',
            ], 422);
        }

        if (!$prefeituraSalva && $secretariasSalvas === 0) {
            \Illuminate\Support\Facades\Log::warning("Processo de scraping concluído, mas nenhuma entidade foi salva.");
            return response()->json([
                'success' => false,
                'message' => 'Nenhuma entidade encontrada ou todas falharam ao salvar.',
            ]);
        }

        $totalEntities = ($prefeituraSalva ? 1 : 0) + $secretariasSalvas;
        \Illuminate\Support\Facades\Log::info("Processo de scraping concluído com sucesso. {$totalEntities} entidades salvas.");

        return response()->json([
            'success' => true,
            'message' => "Importação concluída! " . ($prefeituraSalva ? "Prefeitura e " : "") . "{$secretariasSalvas} entidade(s)/secretaria(s) foram salvas com sucesso no banco de dados.",
        ]);
    }
}

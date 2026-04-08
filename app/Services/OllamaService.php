<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OllamaService
{
    protected string $host;

    protected string $defaultModel;

    protected int $timeout;

    public function __construct()
    {
        $this->host = config('llm.ollama.host', 'http://192.168.237.64:11434');
        $this->defaultModel = config('llm.ollama.default_model', 'qwen3.5:latest');
        $this->timeout = config('llm.ollama.timeout', 120);
    }

    public function listModels(): array
    {
        try {
            $response = Http::timeout($this->timeout)
                ->get("{$this->host}/api/tags");

            if ($response->successful()) {
                $data = $response->json();

                return $data['models'] ?? [];
            }

            Log::error('[OllamaService] Failed to list models', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [];
        } catch (\Exception $e) {
            Log::error('[OllamaService] Exception listing models', [
                'error' => $e->getMessage(),
            ]);

            return [];
        }
    }

    public function generate(string $prompt, ?string $model = null): ?string
    {
        $model = $model ?? $this->defaultModel;

        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->host}/api/generate", [
                    'model' => $model,
                    'prompt' => $prompt,
                    'stream' => false,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                return $data['response'] ?? null;
            }

            Log::error('[OllamaService] Failed to generate', [
                'status' => $response->status(),
                'model' => $model,
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('[OllamaService] Exception generating', [
                'error' => $e->getMessage(),
                'model' => $model,
            ]);

            return null;
        }
    }

    public function chat(string $message, array $history = [], ?string $model = null): ?string
    {
        $model = $model ?? $this->defaultModel;

        $messages = [];

        foreach ($history as $h) {
            $messages[] = [
                'role' => $h['role'] ?? 'user',
                'content' => $h['content'] ?? '',
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $message,
        ];

        try {
            $response = Http::timeout($this->timeout)
                ->post("{$this->host}/api/chat", [
                    'model' => $model,
                    'messages' => $messages,
                    'stream' => false,
                ]);

            if ($response->successful()) {
                $data = $response->json();

                return $data['message']['content'] ?? null;
            }

            Log::error('[OllamaService] Failed to chat', [
                'status' => $response->status(),
                'model' => $model,
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('[OllamaService] Exception chatting', [
                'error' => $e->getMessage(),
                'model' => $model,
            ]);

            return null;
        }
    }

    public function isConnected(): bool
    {
        try {
            $response = Http::timeout(5)
                ->get("{$this->host}/api/tags");

            return $response->successful();
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getDefaultModel(): string
    {
        return $this->defaultModel;
    }

    public function getHost(): string
    {
        return $this->host;
    }
}

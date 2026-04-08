<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Ollama AI Service Configuration
    |--------------------------------------------------------------------------
    */

    'ollama' => [
        'host' => env('OLLAMA_HOST', 'http://192.168.237.64:11434'),
        'timeout' => env('OLLAMA_TIMEOUT', 120),
        'default_model' => env('OLLAMA_DEFAULT_MODEL', 'qwen3.5:latest'),
    ],
];

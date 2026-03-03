<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class WeatherService
{
    protected $apiKey;
    protected $lat;
    protected $lon;

    public function __construct()
    {
        // Using the provided key and coordinates directly or from config
        $this->apiKey = '2scI9TPBOxEDt7nH';
        $this->lat = '-20.4428';
        $this->lon = '-54.6464';
    }

    public function getCurrentWeather()
    {
        return Cache::remember('weather_current', 3600, function () { // Cache for 1 hour
            try {
                $response = Http::get("https://my.meteoblue.com/packages/basic-1h_basic-day", [
                    'lat' => $this->lat,
                    'lon' => $this->lon,
                    'apikey' => $this->apiKey,
                    'temperature_units' => 'C',
                    'windspeed_units' => 'kmh',
                    'precipitation_units' => 'mm',
                    'format' => 'json'
                ]);

                if ($response->successful()) {
                    $uData = $response->json();
                    
                    // Basic 1h package usually has 'data_1h' with arrays
                    // We need the current hour.
                    
                    if (isset($uData['data_1h'])) {
                        // Meteoblue returns arrays of data. We just want the first one or the one matching current time.
                        // For simplicity in this package, index 0 is usually the start time requested which defaults to now.
                        
                        $temp = $uData['data_1h']['temperature'][0] ?? null;
                        $pictocode = $uData['data_1h']['pictocode'][0] ?? 1; // Default to sunny/clear if missing
                        
                        // Map pictocode to text/icon if needed, or just return raw
                        // https://content.meteoblue.com/en/specifications/weather-model-theory/picticode
                        
                        return [
                            'temp' => round($temp),
                            'pictocode' => $pictocode,
                            // Basic mapping for "Sun", "Rain", etc can be done here or frontend
                            'status' => $this->getPictocodeLabel($pictocode)
                        ];
                    }
                }
                
                Log::error('Meteoblue API failed: ' . $response->body());
                return null;

            } catch (\Exception $e) {
                Log::error('WeatherService Exception: ' . $e->getMessage());
                return null;
            }
        });
    }

    private function getPictocodeLabel($code)
    {
        // Simple mapping based on meteoblue pictocodes
        $codes = [
            1 => 'Ensolarado',
            2 => 'Ensolarado',
            3 => 'Parcialmente Nublado',
            4 => 'Nublado',
            5 => 'Neblina',
            6 => 'Chuva',
            7 => 'Chuva com Neve',
            8 => 'Neve',
            9 => 'Tempestade',
            10 => 'Chuva',
            11 => 'Tempestade',
            12 => 'Chuva Fraca',
            // ... extensive list, simplified for MVP
        ];

        return $codes[$code] ?? 'Sol';
    }
}

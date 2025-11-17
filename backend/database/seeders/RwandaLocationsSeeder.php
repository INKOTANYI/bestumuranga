<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RwandaLocationsSeeder extends Seeder
{
    public function run(): void
    {
        // Try to load full dataset from env URL first
        $full = null;
        $remote = env('RWANDA_LOCATIONS_URL');
        if ($remote) {
            try {
                $raw = @file_get_contents($remote);
                $full = $raw ? json_decode($raw, true) : null;
            } catch (\Throwable $e) { /* ignore */ }
        }

        // Try to load full dataset from frontend/public/rwanda-locations.json
        // Try both: inside backend (monorepo) and sibling ../frontend
        $candidates = [
            base_path('frontend/public/rwanda-locations.json'),
            realpath(base_path('../frontend/public/rwanda-locations.json')) ?: null,
        ];
        $jsonPath = null;
        foreach ($candidates as $p) {
            if ($p && is_file($p)) { $jsonPath = $p; break; }
        }
        if (!$full && is_file($jsonPath)) {
            $raw = @file_get_contents($jsonPath);
            $full = $raw ? json_decode($raw, true) : null;
        }

        if (is_array($full) && isset($full['provinces']) && is_array($full['provinces'])) {
            foreach ($full['provinces'] as $pRow) {
                $pName = $pRow['name'];
                DB::table('provinces')->updateOrInsert(
                    ['name' => $pName],
                    ['name' => $pName, 'created_at' => now(), 'updated_at' => now()]
                );
                $p = DB::table('provinces')->where('name', $pName)->first();
                if (!$p) continue;
                foreach (($pRow['districts'] ?? []) as $dRow) {
                    $dName = is_array($dRow) ? ($dRow['name'] ?? null) : (string)$dRow;
                    if (!$dName) continue;
                    DB::table('districts')->updateOrInsert(
                        ['province_id' => $p->id, 'name' => $dName],
                        ['province_id' => $p->id, 'name' => $dName, 'created_at' => now(), 'updated_at' => now()]
                    );
                    $d = DB::table('districts')->where('province_id', $p->id)->where('name', $dName)->first();
                    if (!$d) continue;
                    $sectors = [];
                    if (is_array($dRow) && isset($dRow['sectors'])) {
                        $sectors = $dRow['sectors'];
                    } elseif (is_array($dRow) && isset($dRow['children'])) {
                        $sectors = $dRow['children'];
                    }
                    foreach ($sectors as $sRow) {
                        $sName = is_array($sRow) ? ($sRow['name'] ?? null) : (string)$sRow;
                        if (!$sName) continue;
                        DB::table('sectors')->updateOrInsert(
                            ['district_id' => $d->id, 'name' => $sName],
                            ['district_id' => $d->id, 'name' => $sName, 'created_at' => now(), 'updated_at' => now()]
                        );
                    }
                }
            }
            return;
        }

        // Fallback minimal map if JSON missing
        $data = [
            'Kigali City' => [
                'Gasabo' => ["Bumbogo","Gatsata","Gikomero","Gisozi","Jabana","Jali","Kacyiru","Kimihurura","Kimironko","Ndera","Nduba","Remera","Rusororo","Rutunga"],
            ],
        ];

        foreach ($data as $provinceName => $districts) {
            $provinceId = DB::table('provinces')->updateOrInsert(
                ['name' => $provinceName],
                ['name' => $provinceName, 'created_at' => now(), 'updated_at' => now()]
            );
            // fetch id (updateOrInsert returns bool), so ensure fetch
            $p = DB::table('provinces')->where('name', $provinceName)->first();
            if (!$p) continue;
            foreach ($districts as $districtName => $sectors) {
                DB::table('districts')->updateOrInsert(
                    ['province_id' => $p->id, 'name' => $districtName],
                    ['province_id' => $p->id, 'name' => $districtName, 'created_at' => now(), 'updated_at' => now()]
                );
                $d = DB::table('districts')->where('province_id', $p->id)->where('name', $districtName)->first();
                if (!$d) continue;
                foreach ($sectors as $sectorName) {
                    DB::table('sectors')->updateOrInsert(
                        ['district_id' => $d->id, 'name' => $sectorName],
                        ['district_id' => $d->id, 'name' => $sectorName, 'created_at' => now(), 'updated_at' => now()]
                    );
                }
            }
        }
    }
}

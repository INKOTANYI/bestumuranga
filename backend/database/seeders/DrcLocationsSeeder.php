<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DrcLocationsSeeder extends Seeder
{
    public function run(): void
    {
        // North Kivu
        $northKivuId = DB::table('provinces')->updateOrInsert(
            ['name' => 'North Kivu'],
            ['name' => 'North Kivu', 'country' => 'DRC', 'created_at' => now(), 'updated_at' => now()]
        );
        $north = DB::table('provinces')->where('name', 'North Kivu')->first();
        if ($north) {
            $cities = ['Goma', 'Butembo', 'Beni'];
            foreach ($cities as $name) {
                DB::table('cities')->updateOrInsert(
                    ['province_id' => $north->id, 'name' => $name],
                    ['province_id' => $north->id, 'name' => $name, 'created_at' => now(), 'updated_at' => now()]
                );
            }
            $territories = ['Beni', 'Lubero', 'Masisi', 'Rutshuru', 'Nyiragongo', 'Walikale'];
            foreach ($territories as $name) {
                DB::table('territories')->updateOrInsert(
                    ['province_id' => $north->id, 'name' => $name],
                    ['province_id' => $north->id, 'name' => $name, 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }

        // South Kivu
        $southKivuId = DB::table('provinces')->updateOrInsert(
            ['name' => 'South Kivu'],
            ['name' => 'South Kivu', 'country' => 'DRC', 'created_at' => now(), 'updated_at' => now()]
        );
        $south = DB::table('provinces')->where('name', 'South Kivu')->first();
        if ($south) {
            $cities = ['Bukavu', 'Uvira', 'Baraka', 'Kamituga'];
            foreach ($cities as $name) {
                DB::table('cities')->updateOrInsert(
                    ['province_id' => $south->id, 'name' => $name],
                    ['province_id' => $south->id, 'name' => $name, 'created_at' => now(), 'updated_at' => now()]
                );
            }
            $territories = ['Fizi', 'Idjwi', 'Kabare', 'Kalehe', 'Mwenga', 'Shabunda', 'Uvira', 'Walungu'];
            foreach ($territories as $name) {
                DB::table('territories')->updateOrInsert(
                    ['province_id' => $south->id, 'name' => $name],
                    ['province_id' => $south->id, 'name' => $name, 'created_at' => now(), 'updated_at' => now()]
                );
            }
        }
    }
}

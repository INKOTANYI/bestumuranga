<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'sebakire@gmail.com'],
            [
                'name' => 'Admin',
                'first_name' => 'Admin',
                'last_name' => 'User',
                'phone' => '+250783163187',
                'password' => Hash::make('Inkotanyi123@'),
                'role' => 'admin',
                'broker_status' => null,
                'quota_items' => 100,
                'quota_storage_mb' => 2048,
                'storage_used_mb' => 0,
            ]
        );
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('id');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('phone')->nullable()->after('email');
            $table->string('address')->nullable()->after('phone');

            $table->string('role')->default('user')->after('password'); // admin|broker|user
            $table->string('broker_status')->nullable()->after('role'); // pending|approved|rejected|null

            $table->unsignedInteger('quota_items')->default(100)->after('broker_status');
            $table->unsignedInteger('quota_storage_mb')->default(2048)->after('quota_items');
            $table->unsignedInteger('storage_used_mb')->default(0)->after('quota_storage_mb');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'phone',
                'address',
                'role',
                'broker_status',
                'quota_items',
                'quota_storage_mb',
                'storage_used_mb',
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            if (!Schema::hasColumn('listings', 'category')) {
                $table->enum('category', ['house', 'car'])->default('house')->after('broker_id');
            }

            if (!Schema::hasColumn('listings', 'purpose')) {
                $table->enum('purpose', ['rent', 'sell'])->default('rent')->after('category');
            }
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn(['category', 'purpose']);
        });
    }
};

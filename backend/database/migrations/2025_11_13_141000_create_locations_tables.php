<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('provinces')) {
            Schema::create('provinces', function (Blueprint $table) {
                $table->id();
                $table->string('name', 100)->unique();
                $table->timestamps();
            });
        }
        if (!Schema::hasTable('districts')) {
            Schema::create('districts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('province_id')->constrained('provinces')->cascadeOnDelete();
                $table->string('name', 100);
                $table->timestamps();
                $table->unique(['province_id','name']);
            });
        }
        if (!Schema::hasTable('sectors')) {
            Schema::create('sectors', function (Blueprint $table) {
                $table->id();
                $table->foreignId('district_id')->constrained('districts')->cascadeOnDelete();
                $table->string('name', 100);
                $table->timestamps();
                $table->unique(['district_id','name']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('sectors');
        Schema::dropIfExists('districts');
        Schema::dropIfExists('provinces');
    }
};

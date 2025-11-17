<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Add country to provinces (RW / DRC)
        if (Schema::hasTable('provinces') && !Schema::hasColumn('provinces', 'country')) {
            Schema::table('provinces', function (Blueprint $table) {
                $table->string('country', 8)->default('RW')->after('id');
            });

            // Default existing provinces to Rwanda
            DB::table('provinces')->whereNull('country')->update(['country' => 'RW']);
        }

        // Cities table for DRC
        if (!Schema::hasTable('cities')) {
            Schema::create('cities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('province_id')->constrained('provinces')->cascadeOnDelete();
                $table->string('name', 150);
                $table->timestamps();
                $table->unique(['province_id', 'name']);
            });
        }

        // Territories table for DRC
        if (!Schema::hasTable('territories')) {
            Schema::create('territories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('province_id')->constrained('provinces')->cascadeOnDelete();
                $table->string('name', 150);
                $table->timestamps();
                $table->unique(['province_id', 'name']);
            });
        }

        // Add country + city / territory references to users for brokers
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'country')) {
                    $table->string('country', 8)->nullable()->after('address');
                }
                if (!Schema::hasColumn('users', 'city_id')) {
                    $table->unsignedBigInteger('city_id')->nullable()->after('broker_sector');
                }
                if (!Schema::hasColumn('users', 'territory_id')) {
                    $table->unsignedBigInteger('territory_id')->nullable()->after('city_id');
                }
            });

            // Add foreign keys for city_id / territory_id if columns exist
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'city_id')) {
                    $table->foreign('city_id')->references('id')->on('cities')->nullOnDelete();
                }
                if (Schema::hasColumn('users', 'territory_id')) {
                    $table->foreign('territory_id')->references('id')->on('territories')->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'territory_id')) {
                    $table->dropForeign(['territory_id']);
                    $table->dropColumn('territory_id');
                }
                if (Schema::hasColumn('users', 'city_id')) {
                    $table->dropForeign(['city_id']);
                    $table->dropColumn('city_id');
                }
                if (Schema::hasColumn('users', 'country')) {
                    $table->dropColumn('country');
                }
            });
        }

        if (Schema::hasTable('territories')) {
            Schema::dropIfExists('territories');
        }
        if (Schema::hasTable('cities')) {
            Schema::dropIfExists('cities');
        }

        if (Schema::hasTable('provinces') && Schema::hasColumn('provinces', 'country')) {
            Schema::table('provinces', function (Blueprint $table) {
                $table->dropColumn('country');
            });
        }
    }
};

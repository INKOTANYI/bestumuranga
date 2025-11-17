<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('listings')) {
            Schema::table('listings', function (Blueprint $table) {
                if (!Schema::hasColumn('listings', 'location_province')) {
                    $table->string('location_province', 100)->nullable()->after('location');
                }
                if (!Schema::hasColumn('listings', 'location_district')) {
                    $table->string('location_district', 100)->nullable()->after('location_province');
                }
                if (!Schema::hasColumn('listings', 'location_sector')) {
                    $table->string('location_sector', 100)->nullable()->after('location_district');
                }
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'broker_province')) {
                    $table->string('broker_province', 100)->nullable()->after('broker_status');
                }
                if (!Schema::hasColumn('users', 'broker_district')) {
                    $table->string('broker_district', 100)->nullable()->after('broker_province');
                }
                if (!Schema::hasColumn('users', 'broker_sector')) {
                    $table->string('broker_sector', 100)->nullable()->after('broker_district');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('listings')) {
            Schema::table('listings', function (Blueprint $table) {
                if (Schema::hasColumn('listings', 'location_sector')) {
                    $table->dropColumn('location_sector');
                }
                if (Schema::hasColumn('listings', 'location_district')) {
                    $table->dropColumn('location_district');
                }
                if (Schema::hasColumn('listings', 'location_province')) {
                    $table->dropColumn('location_province');
                }
            });
        }

        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (Schema::hasColumn('users', 'broker_sector')) {
                    $table->dropColumn('broker_sector');
                }
                if (Schema::hasColumn('users', 'broker_district')) {
                    $table->dropColumn('broker_district');
                }
                if (Schema::hasColumn('users', 'broker_province')) {
                    $table->dropColumn('broker_province');
                }
            });
        }
    }
};

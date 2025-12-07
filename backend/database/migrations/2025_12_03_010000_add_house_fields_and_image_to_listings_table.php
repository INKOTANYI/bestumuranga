<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            if (!Schema::hasColumn('listings', 'bedrooms')) {
                $table->unsignedTinyInteger('bedrooms')->nullable()->after('status');
            }
            if (!Schema::hasColumn('listings', 'beds')) {
                $table->unsignedTinyInteger('beds')->nullable()->after('bedrooms');
            }
            if (!Schema::hasColumn('listings', 'bathrooms')) {
                $table->unsignedTinyInteger('bathrooms')->nullable()->after('beds');
            }
            if (!Schema::hasColumn('listings', 'has_garden')) {
                $table->boolean('has_garden')->default(false)->after('bathrooms');
            }
            if (!Schema::hasColumn('listings', 'has_kitchen')) {
                $table->boolean('has_kitchen')->default(false)->after('has_garden');
            }
            if (!Schema::hasColumn('listings', 'has_garage')) {
                $table->boolean('has_garage')->default(false)->after('has_kitchen');
            }
            if (!Schema::hasColumn('listings', 'has_cctv')) {
                $table->boolean('has_cctv')->default(false)->after('has_garage');
            }
            if (!Schema::hasColumn('listings', 'province')) {
                $table->string('province')->nullable()->after('has_cctv');
            }
            if (!Schema::hasColumn('listings', 'district')) {
                $table->string('district')->nullable()->after('province');
            }
            if (!Schema::hasColumn('listings', 'sector')) {
                $table->string('sector')->nullable()->after('district');
            }
            if (!Schema::hasColumn('listings', 'extra_notes')) {
                $table->text('extra_notes')->nullable()->after('sector');
            }
            if (!Schema::hasColumn('listings', 'description')) {
                $table->text('description')->nullable()->after('extra_notes');
            }
            if (!Schema::hasColumn('listings', 'image_path')) {
                $table->string('image_path')->nullable()->after('description');
            }
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            if (Schema::hasColumn('listings', 'image_path')) {
                $table->dropColumn('image_path');
            }
            if (Schema::hasColumn('listings', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('listings', 'extra_notes')) {
                $table->dropColumn('extra_notes');
            }
            if (Schema::hasColumn('listings', 'sector')) {
                $table->dropColumn('sector');
            }
            if (Schema::hasColumn('listings', 'district')) {
                $table->dropColumn('district');
            }
            if (Schema::hasColumn('listings', 'province')) {
                $table->dropColumn('province');
            }
            if (Schema::hasColumn('listings', 'has_cctv')) {
                $table->dropColumn('has_cctv');
            }
            if (Schema::hasColumn('listings', 'has_garage')) {
                $table->dropColumn('has_garage');
            }
            if (Schema::hasColumn('listings', 'has_kitchen')) {
                $table->dropColumn('has_kitchen');
            }
            if (Schema::hasColumn('listings', 'has_garden')) {
                $table->dropColumn('has_garden');
            }
            if (Schema::hasColumn('listings', 'bathrooms')) {
                $table->dropColumn('bathrooms');
            }
            if (Schema::hasColumn('listings', 'beds')) {
                $table->dropColumn('beds');
            }
            if (Schema::hasColumn('listings', 'bedrooms')) {
                $table->dropColumn('bedrooms');
            }
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('categories')) {
            Schema::table('categories', function (Blueprint $table) {
                if (!Schema::hasColumn('categories', 'parent_id')) {
                    $table->unsignedBigInteger('parent_id')->nullable()->after('id')->index();
                }
                if (!Schema::hasColumn('categories', 'sort_order')) {
                    $table->integer('sort_order')->default(0)->after('slug');
                }
            });
        } else {
            Schema::create('categories', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('parent_id')->nullable()->index();
                $table->string('name');
                $table->string('slug')->unique();
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('categories')) {
            Schema::table('categories', function (Blueprint $table) {
                if (Schema::hasColumn('categories', 'sort_order')) {
                    $table->dropColumn('sort_order');
                }
                if (Schema::hasColumn('categories', 'parent_id')) {
                    $table->dropColumn('parent_id');
                }
            });
        }
    }
};

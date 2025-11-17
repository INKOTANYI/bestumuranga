<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            if (!Schema::hasColumn('inquiries', 'listing_id')) {
                $table->unsignedBigInteger('listing_id')->nullable()->after('broker_id');
            }
            if (!Schema::hasColumn('inquiries', 'client_name')) {
                $table->string('client_name', 191)->nullable()->after('details');
            }
            if (!Schema::hasColumn('inquiries', 'client_phone')) {
                $table->string('client_phone', 50)->nullable()->after('client_name');
            }
            if (!Schema::hasColumn('inquiries', 'client_email')) {
                $table->string('client_email', 191)->nullable()->after('client_phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('inquiries', function (Blueprint $table) {
            $table->dropColumn(['listing_id', 'client_name', 'client_phone', 'client_email']);
        });
    }
};

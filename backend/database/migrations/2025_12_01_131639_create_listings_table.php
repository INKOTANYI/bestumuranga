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
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('broker_id');
            $table->enum('category', ['house', 'car'])->default('house');
            $table->enum('purpose', ['rent', 'sell'])->default('rent');
            $table->string('title');
            $table->string('city');
            $table->decimal('price', 12, 2);
            $table->string('status')->default('active');
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->unsignedTinyInteger('beds')->nullable();
            $table->unsignedTinyInteger('bathrooms')->nullable();
            $table->boolean('has_garden')->default(false);
            $table->boolean('has_kitchen')->default(false);
            $table->boolean('has_garage')->default(false);
            $table->boolean('has_cctv')->default(false);
            $table->string('province')->nullable();
            $table->string('district')->nullable();
            $table->string('sector')->nullable();
            $table->text('extra_notes')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();

            $table->foreign('broker_id')->references('id')->on('brokers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};

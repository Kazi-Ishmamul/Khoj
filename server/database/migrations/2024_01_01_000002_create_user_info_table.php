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
        Schema::create('user_info', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->text('bio')->nullable();
            $table->string('fb_url', 255)->nullable();
            $table->string('x_url', 255)->nullable();
            $table->string('insta_url', 255)->nullable();
            $table->string('linkedin_url', 255)->nullable();
            $table->integer('items_lost_count')->default(0);
            $table->integer('items_found_count')->default(0);
            $table->integer('report_strikes')->default(0);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_info');
    }
};

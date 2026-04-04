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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('item_name', 255);
            $table->string('category', 100)->nullable();
            $table->text('description');
            $table->dateTime('date_time');
            $table->string('location', 255);
            $table->enum('status', ['lost', 'found']);
            $table->string('contact_info', 255);
            $table->string('item_image_url', 512)->default('https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400');
            $table->enum('resolution_status', ['not_claimed', 'claimed', 'resolved'])->default('not_claimed');
            $table->boolean('valid')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};

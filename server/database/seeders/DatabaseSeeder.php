<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserInfo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'phone' => '01234567890',
                'address' => '123 Test Street',
                'password' => Hash::make('Test@123'),
                'role' => 'user',
            ]
        );

        UserInfo::updateOrCreate(
            ['user_id' => $user->id],
            [
                'bio' => '',
                'fb_url' => '',
                'x_url' => '',
                'insta_url' => '',
                'linkedin_url' => '',
            ]
        );
    }
}

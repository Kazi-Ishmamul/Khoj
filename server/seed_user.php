<?php
require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\UserInfo;
use Illuminate\Support\Facades\Hash;

$user = User::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'phone' => '01234567890',
    'address' => '123 Test Street',
    'password' => Hash::make('Test@123'),
    'role' => 'user'
]);

UserInfo::create([
    'user_id' => $user->id,
    'bio' => '',
    'fb_url' => '',
    'x_url' => '',
    'insta_url' => '',
    'linkedin_url' => ''
]);

echo "User created successfully with ID: " . $user->id . "\n";

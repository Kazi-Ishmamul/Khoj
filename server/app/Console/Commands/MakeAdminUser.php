<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\UserInfo;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class MakeAdminUser extends Command
{
    protected $signature = 'khoj:admin-user
                            {email : Admin email address}
                            {password : Plain-text password (min 6 chars)}
                            {--name=Administrator : Display name}';

    protected $description = 'Create or promote a user to admin (for /admin/login Blade dashboard).';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        $password = (string) $this->argument('password');
        $name = (string) $this->option('name');

        if (strlen($password) < 6) {
            $this->error('Password must be at least 6 characters.');

            return self::FAILURE;
        }

        $user = User::query()->whereRaw('LOWER(TRIM(email)) = ?', [$email])->first();

        if ($user) {
            $user->password = Hash::make($password);
            $user->role = 'admin';
            if ($name !== '') {
                $user->name = $name;
            }
            $user->save();
            $this->info("Updated existing user [{$email}] to admin and set a new password.");
        } else {
            $user = User::create([
                'name' => $name ?: 'Administrator',
                'email' => $email,
                'phone' => '00000000000',
                'address' => '—',
                'password' => Hash::make($password),
                'role' => 'admin',
            ]);

            UserInfo::create([
                'user_id' => $user->id,
                'bio' => '',
                'fb_url' => '',
                'x_url' => '',
                'insta_url' => '',
                'linkedin_url' => '',
            ]);

            $this->info("Created admin user [{$email}].");
        }

        $this->line('Sign in at: ' . url('/admin/login'));

        return self::SUCCESS;
    }
}

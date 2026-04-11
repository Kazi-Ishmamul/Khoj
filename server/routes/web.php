<?php

use App\Http\Controllers\Admin\AdminAnalyticsController;
use App\Http\Controllers\Admin\AdminLoginController;
use App\Http\Controllers\LocaleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/locale/{locale}', [LocaleController::class, 'switchWeb'])
    ->where('locale', 'en|bn')
    ->name('locale.switch');

Route::get('/api/locale/current', [LocaleController::class, 'current'])
    ->name('locale.current');

Route::get('/api/locale/use/{locale}', [LocaleController::class, 'useLocale'])
    ->where('locale', 'en|bn')
    ->name('locale.use');

/*
| Admin analytics (Blade + session auth; register before SPA catch-all)
*/
Route::prefix('admin')->name('admin.')->group(function () {
    Route::get('login', [AdminLoginController::class, 'showLoginForm'])->name('login');
    Route::post('login', [AdminLoginController::class, 'login'])->name('login.perform');
    Route::post('logout', [AdminLoginController::class, 'logout'])->middleware('admin.web')->name('logout');

    Route::middleware('admin.web')->group(function () {
        Route::get('analytics', [AdminAnalyticsController::class, 'index'])->name('analytics');
    });
});

Route::get('{any}', function () {
    return file_get_contents(public_path('index.html'));
})->where('any', '.*');

require __DIR__ . '/auth.php';

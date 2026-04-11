<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SessionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/register', [App\Http\Controllers\ApiAuthController::class, 'register']);
Route::post('/login', [App\Http\Controllers\ApiAuthController::class, 'login']);

Route::get('/items', [App\Http\Controllers\ItemController::class, 'index']);
Route::get('/items/search', [App\Http\Controllers\ItemController::class, 'geminiSearch']);

Route::middleware('jwt.auth')->group(function () {
    Route::post('/logout', [App\Http\Controllers\ApiAuthController::class, 'logout']);
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'show']);
    Route::post('/profile', [App\Http\Controllers\ProfileController::class, 'update']);
    Route::post('/profile/password', [App\Http\Controllers\ProfileController::class, 'updatePassword']);
});

Route::middleware(['jwt.auth', 'role:admin'])->group(function () {
    Route::get('/users', [App\Http\Controllers\UserController::class, 'index']);
    Route::get('/admin/items/active', [App\Http\Controllers\ItemController::class, 'adminActivePosts']);
    Route::post('/admin/items/{id}/strike', [App\Http\Controllers\ItemController::class, 'adminStrikeItem']);

    // Admin report management
    Route::get('/reports', [App\Http\Controllers\ReportController::class, 'index']);
    Route::get('/reports/stats', [App\Http\Controllers\ReportController::class, 'getStats']);
    Route::post('/reports/{reportId}/strike', [App\Http\Controllers\ReportController::class, 'strike']);
    Route::post('/reports/{reportId}/dismiss', [App\Http\Controllers\ReportController::class, 'dismiss']);
});

Route::middleware(['jwt.auth', 'role:user'])->group(function () {
    Route::post('/items', [App\Http\Controllers\ItemController::class, 'store']);
    Route::put('/items/{id}', [App\Http\Controllers\ItemController::class, 'update']);
    Route::delete('/items/{id}', [App\Http\Controllers\ItemController::class, 'destroy']);
    Route::get('/items/suggestions/match', [App\Http\Controllers\ItemController::class, 'geminiSuggestions']);
    Route::put('/items/{id}/claim', [App\Http\Controllers\ItemController::class, 'toggleClaim']);
    Route::get('/my-activity', [App\Http\Controllers\ActivityController::class, 'myActivity']);
    Route::post('/claims/{claimId}/accept', [App\Http\Controllers\ClaimController::class, 'acceptClaim']);
    Route::post('/claims/{claimId}/decline', [App\Http\Controllers\ClaimController::class, 'declineClaim']);

    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{notificationId}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);

    // User can report items
    Route::post('/reports', [App\Http\Controllers\ReportController::class, 'store']);
    Route::get('/items/{itemId}/reports', [App\Http\Controllers\ReportController::class, 'getItemReports']);
    Route::get('/my-reports', [App\Http\Controllers\ReportController::class, 'myReports']);
});

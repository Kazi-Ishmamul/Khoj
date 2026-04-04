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

Route::middleware('jwt.auth')->group(function () {
    Route::post('/logout', [App\Http\Controllers\ApiAuthController::class, 'logout']);
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'show']);
    Route::post('/profile', [App\Http\Controllers\ProfileController::class, 'update']);
    Route::get('/users', [App\Http\Controllers\UserController::class, 'index']);
    Route::post('/items', [App\Http\Controllers\ItemController::class, 'store']);
    Route::put('/items/{id}/claim', [App\Http\Controllers\ItemController::class, 'toggleClaim']);
    Route::get('/my-activity', [App\Http\Controllers\ActivityController::class, 'myActivity']);
    Route::post('/claims/{claimId}/accept', [App\Http\Controllers\ClaimController::class, 'acceptClaim']);
    Route::post('/claims/{claimId}/decline', [App\Http\Controllers\ClaimController::class, 'declineClaim']);
});

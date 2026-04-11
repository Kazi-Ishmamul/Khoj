<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class ApiAuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'required|string|email|max:150|unique:users',
            'address' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            Log::error('Validation failed: ' . json_encode($validator->errors()));
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 400);
        }

        try {

        $userData = [
            'name' => $request->name,
            'phone' => $request->phone,
            'email' => $request->email,
            'address' => $request->address,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ];

        // If profile pic URL is omitted, let the DB default value be used.
        if (!empty($request->pic_url)) {
            $userData['pic_url'] = $request->pic_url;
        }

        $user = User::create($userData);

        \App\Models\UserInfo::create([
            'user_id' => $user->id,
            'bio' => '',
            'fb_url' => '',
            'x_url' => '',
            'insta_url' => '',
            'linkedin_url' => '',
        ]);

            $token = JWTAuth::fromUser($user);

            return response()->json([
                'message' => 'User successfully registered',
                'user' => $user,
                'token' => $token
            ], 201);
        } catch (\Exception $e) {
            Log::error('Registration exception: ' . $e->getMessage());
            return response()->json([
                'message' => 'User Registration Failed! Server Error: ' . $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (!$token = JWTAuth::attempt($validator->validated())) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $this->createNewToken($token);
    }

    public function logout()
    {
        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'User successfully signed out']);
    }

    protected function createNewToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => config('jwt.ttl') * 60,
            'user' => auth()->user()
        ]);
    }
}

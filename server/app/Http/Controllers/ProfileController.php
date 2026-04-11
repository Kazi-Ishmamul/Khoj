<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's profile with their info.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(Request $request)
    {
        $user = $request->user()->load('info');
        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Update the user's profile and info.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string',
            'bio' => 'nullable|string',
            'linkedin' => 'nullable|string|max:255',
            'github' => 'nullable|string|max:255',
            // Note: DB schema has fb_url, x_url, insta_url, linkedin_url.
            // Based on UI we use: linkedin, github (mapped to fb_url, etc or we can add it to DB)
            // The UI provided has input for linkedin and github.
            // Wait, schema has fb_url, x_url, insta_url, linkedin_url. Let's map github to x_url or fb_url?
            // Or just save github to fb_url since it's just a VARCHAR(255).
            // Actually, let's just use the column names properly.
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // Update users table fields
            if ($request->has('name'))
                $user->name = $request->name;
            if ($request->has('phone'))
                $user->phone = $request->phone;
            if ($request->has('address'))
                $user->address = $request->address;

            // Handle Profile Picture Update
            if ($request->has('pic_url')) {
                $user->pic_url = $request->pic_url;
            }

            $user->save();

            // Update user_info table fields
            $info = $user->info;
            if (!$info) {
                $info = new \App\Models\UserInfo(['user_id' => $user->id]);
            }

            if ($request->has('bio'))
                $info->bio = $request->bio;
            if ($request->has('linkedin'))
                $info->linkedin_url = $request->linkedin;
            if ($request->has('github'))
                $info->x_url = $request->github; // Mapping github to x_url to reuse the column

            $info->save();

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user->load('info')
            ]);
        }
        catch (\Exception $e) {
            Log::error('Profile update failed: ' . $e->getMessage());
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update the user's password securely.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['The provided password does not match your current password.']]
            ], 422);
        }

        try {
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json([
                'message' => 'Password updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Password update failed: ' . $e->getMessage());
            return response()->json(['message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }
}

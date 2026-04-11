<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Claim;
use App\Models\Report;
use App\Models\UserInfo;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class ItemController extends Controller
{
    public function adminActivePosts()
    {
        try {
            $items = Item::where('valid', 1)
                ->where('resolution_status', '!=', 'resolved')
                ->with(['user', 'user.info'])
                ->orderByDesc('created_at')
                ->get();

            return response()->json([
                'success' => true,
                'items' => $items
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch active posts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function adminStrikeItem($id)
    {
        DB::beginTransaction();

        try {
            $admin = auth()->user();
            if (!$admin) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            $item = Item::findOrFail($id);
            $notifications = app(NotificationService::class);

            if ((int) $item->valid !== 1 || $item->resolution_status === 'resolved') {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Only active unresolved posts can be struck'
                ], 422);
            }

            $item->update([
                'valid' => 0,
                'resolution_status' => 'not_claimed'
            ]);

            // Always create an admin moderation report first, then mark all reports as struck.
            Report::create([
                'item_id' => $item->id,
                'r_user_id' => (int) $admin->id,
                'reason' => 'Direct strike by admin from Manage Posts',
                'status' => 0,
            ]);

            Claim::where('item_id', $item->id)->update(['validity' => -1]);

            Report::where('item_id', $item->id)->update(['status' => -1]);

            $notifications->notifyUser(
                (int) $item->user_id,
                'item_struck',
                "Your post \"{$item->item_name}\" was struck by an admin.",
                'item',
                (int) $item->id
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Post struck successfully. The post is hidden and related claims/reports were updated.',
                'item' => $item->fresh(['user', 'user.info'])
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Item not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to strike post',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $query = Item::where('valid', 1)
            ->where('resolution_status', '!=', 'resolved');

        try {
            if ($request->bearerToken()) {
                $user = auth('api')->user();
                if ($user) {
                    $query->where('user_id', '!=', $user->id);
                }
            }
        } catch (\Exception $e) {
            // Unauthenticated requests just see all valid items
        }

        $items = $query->with(['user', 'user.info'])->get();
        return response()->json(['items' => $items]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'required|string',
            'date_time' => 'required|date',
            'location' => 'required|string|max:255',
            'status' => 'required|in:lost,found',
            'contact_info' => 'required|string|max:255',
            'item_image_url' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 400);
        }

        // Must be authenticated to report
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $itemData = $request->all();
        $itemData['user_id'] = $user->id;

        // Default values will be handled by DB if not provided, but we can set them explicitly just in case
        $itemData['valid'] = 1;
        $itemData['resolution_status'] = 'not_claimed';

        if (!isset($itemData['item_image_url']) || empty($itemData['item_image_url'])) {
            $itemData['item_image_url'] = 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400';
        }

        $item = Item::create($itemData);

        return response()->json(['message' => 'Item reported successfully', 'item' => $item], 201);
    }

    public function toggleClaim(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $item = Item::find($id);
        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        // Cannot claim your own items
        if ($item->user_id === $user->id) {
            return response()->json(['message' => 'Cannot claim your own items'], 403);
        }

        if ($item->resolution_status === 'resolved' || (int) $item->valid !== 1) {
            return response()->json(['message' => 'This item is not claimable'], 400);
        }

        // Check if user already has a pending claim on this item.
        $existingPendingClaim = Claim::where('item_id', $id)
            ->where('claimed_by_id', $user->id)
            ->where('validity', 0)
            ->first();

        if ($existingPendingClaim) {
            // Release claim: mark this claim as declined (-1) instead of deleting row.
            $existingPendingClaim->validity = -1;
            $existingPendingClaim->save();

            // Item remains claimed while there is any other pending claim.
            $hasPendingClaims = Claim::where('item_id', $id)
                ->where('validity', 0)
                ->exists();

            $item->resolution_status = $hasPendingClaims ? 'claimed' : 'not_claimed';
            $item->save();

            return response()->json([
                'message' => 'Claim released successfully',
                'claimed' => false,
                'resolution_status' => $item->resolution_status
            ], 200);
        } else {
            // Re-open previously declined claim if available, otherwise create a new pending claim.
            $existingDeclinedClaim = Claim::where('item_id', $id)
                ->where('claimed_by_id', $user->id)
                ->where('validity', -1)
                ->orderByDesc('claim_id')
                ->first();

            if ($existingDeclinedClaim) {
                $existingDeclinedClaim->validity = 0;
                $existingDeclinedClaim->save();
            } else {
                Claim::create([
                    'item_id' => $id,
                    'claimed_by_id' => $user->id,
                    'validity' => 0 // pending
                ]);
            }

            app(NotificationService::class)->notifyUser(
                (int) $item->user_id,
                'item_claimed',
                "Someone has claimed your post \"{$item->item_name}\".",
                'item',
                (int) $item->id,
                (int) $user->id
            );

            // Update item resolution_status to claimed
            $item->resolution_status = 'claimed';
            $item->save();

            return response()->json([
                'message' => 'Item claimed successfully',
                'claimed' => true,
                'resolution_status' => $item->resolution_status
            ], 201);
        }
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $item = Item::find($id);
        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        if ((int) $item->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($item->resolution_status === 'resolved' || (int) $item->valid !== 1) {
            return response()->json(['message' => 'Only active unresolved items can be edited'], 400);
        }

        $validator = Validator::make($request->all(), [
            'item_name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'required|string',
            'date_time' => 'required|date',
            'location' => 'required|string|max:255',
            'contact_info' => 'required|string|max:255',
            'item_image_url' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 400);
        }

        $item->update($validator->validated());

        return response()->json([
            'message' => 'Item updated successfully',
            'item' => $item->fresh(['user', 'user.info'])
        ], 200);
    }

    public function destroy(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $item = Item::find($id);
        if (!$item) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        if ((int) $item->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        if ($item->resolution_status === 'resolved') {
            return response()->json(['message' => 'Only unresolved items can be deleted'], 400);
        }

        $item->valid = 0;
        $item->save();

        return response()->json([
            'message' => 'Item deleted successfully'
        ], 200);
    }

    public function geminiSearch(Request $request)
    {
        $query = $request->query('q');
        $filter = $request->query('filter', 'all'); // 'all', 'lost', 'found'

        if (!$query || empty(trim($query))) {
            return response()->json(['items' => []]);
        }

        // Get authenticated user to exclude their own items
        $user = auth()->user();
        $currentUserId = $user ? $user->id : null;

        // Fetch all active items
        $itemsQuery = Item::where('valid', 1)
            ->where('resolution_status', '!=', 'resolved');

        if ($currentUserId) {
            $itemsQuery->where('user_id', '!=', $currentUserId);
        }

        $items = $itemsQuery->with(['user', 'user.info'])->get();

        if ($items->isEmpty()) {
            return response()->json(['items' => []]);
        }

        // Prepare items JSON for Gemini
        $itemsJson = json_encode($items->map(function ($item) {
            return [
                'id' => $item->id,
                'item_name' => $item->item_name,
                'category' => $item->category,
                'description' => $item->description,
                'location' => $item->location,
                'status' => $item->status,
                'date_time' => $item->date_time
            ];
        })->toArray());

        // Call Gemini API for semantic search
        $matchedIds = $this->callGeminiSearch($itemsJson, $query);

        if ($matchedIds === null) {
            return response()->json(['message' => 'AI Service is currently experiencing high demand. Please try again in a few moments.'], 503);
        }

        if (empty($matchedIds)) {
            return response()->json(['items' => []]);
        }

        // Filter by matched IDs and apply status filter
        $filteredItems = $items->filter(function ($item) use ($matchedIds, $filter) {
            if (!in_array($item->id, $matchedIds)) {
                return false;
            }
            if ($filter !== 'all' && $item->status !== $filter) {
                return false;
            }
            return true;
        })->values();

        return response()->json(['items' => $filteredItems]);
    }

    private function callGeminiSearch($itemsJson, $userQuery)
    {
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            \Log::error('Gemini API Error: GEMINI_API_KEY is not set in .env');
            return [];
        }

        $systemPrompt = "
        ### ROLE
        You are the Intelligent Discovery Engine for 'Khoj', a specialized Lost and Found platform. Your goal is to connect users with items that likely belong to them.

        ### DATA SOURCE
        - You will receive a JSON array of items from our database.
        - Each item has: id, item_name, category, description, location, and status (lost/found).

        ### SEARCH INTELLIGENCE & SEMANTICS
        1. **Cross-Status Matching:** If a user says 'I lost...', your primary goal is to find items where status is 'found'. However, if no 'found' items match, still return 'lost' items that are highly similar in case of duplicate reporting.
        2. **Entity Recognition:** Understand that brands represent categories. 'Casio' or 'Scientific' = Calculator; 'iPhone' or 'Samsung' = Mobile/Phone.
        3. **Spatial Intelligence:** Treat 'AUST', 'Aust Campus', 'Ahsanullah University', and 'Tejgaon' (if applicable) as related locations.
        4. **Fuzzy Logic:** Be lenient with spelling (e.g., 'calculattor' matches 'calculator').

        ### FILTERING GUIDELINES
        - **Strict Relevance:** If a user asks for a 'calculator', DO NOT return 'laptops' or 'chargers' just because they are in 'Electronics'.
        - **Contextual Weighting:** An item found at 'AUST' is a much stronger match for a user at 'AUST' than a similar item found in 'Banani'.

        ### MULTILINGUAL & PHONETIC RULES
        1. **Language Agnostic:** Treat English and Bengali (বাংলা) as interchangeable. If a user searches for 'ছাতা', it is a perfect match for 'Umbrella' or 'Chata'.
        2. **Banglish Phonetics:** Recognize Bengali words written in English letters. 
           - 'Chata' or 'Sata' = Umbrella
           - 'Manibag' = Wallet/Money bag
           - 'Ghori' = Watch
           - 'Choshma' = Glasses/Spectacles
        3. **Intent Extraction:** If the user types a full sentence like 'Amar chata khuje pacchi na' (I can't find my umbrella), ignore the filler words and focus only on the item 'Umbrella/Chata'.

        ### OUTPUT REQUIREMENTS
        - Return ONLY a raw JSON array of integers representing the matching 'id's.
        - Order the IDs by relevance (Highest probability of being the user's item first).
        - If no logical match is found, return an empty array [].
        - DO NOT include markdown blocks, text, or explanations.
        ";


        $userPrompt = "### DATABASE ITEMS (JSON)\n$itemsJson\n\n### USER QUERY\n'$userQuery'";
        $userPrompt .= "";
        \Log::info("=== SENDING TO GEMINI ===");
        \Log::info($userPrompt);

        try {
            $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey;
            
            $maxRetries = 3;
            $response = null;

            for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post($url, [
                            'systemInstruction' => [
                                'parts' => [['text' => $systemPrompt]]
                            ],
                            'contents' => [
                                ['parts' => [['text' => $userPrompt]]]
                            ],
                            'generationConfig' => [
                                'temperature' => 0.2,
                                'topK' => 40,
                                'topP' => 0.95,
                                'maxOutputTokens' => 800,
                            ]
                        ]);

                if ($response->successful()) {
                    break;
                }
                
                if ($attempt < $maxRetries - 1) {
                    sleep(2); // Wait 2 seconds before retrying
                }
            }

            if (!$response || !$response->successful()) {
                \Log::error('Gemini API Non-200 Response: ' . ($response ? $response->body() : 'null'));
                return null;
            }

            $responseData = $response->json();

            // Extract text from Gemini response
            $text = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '[]';

            \Log::info("=== GEMINI RESPONSE ===");
            \Log::info($text);

            // Extract only the array part by finding the first [ and last ]
            if (preg_match('/\[.*\]/s', $text, $matches)) {
                $text = $matches[0];
            } else {
                // Failsafe if it somehow returns a plain number or weird text
                $text = '[]';
            }

            // Parse JSON response
            $matchedIds = json_decode($text, true);

            if (!is_array($matchedIds)) {
                \Log::error('Gemini API Error: Invalid JSON returned. Text was: ' . $text);
                return null;
            }

            // Ensure all IDs are integers
            return array_map(function ($id) {
                return (int) $id;
            }, $matchedIds);
        } catch (\Exception $e) {
            \Log::error('Gemini API Error: ' . $e->getMessage());
            return null;
        }
    }

    public function geminiSuggestions(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['items' => []], 401);
        }
        $currentUserId = $user->id;

        // Fetch user active items
        $userItems = Item::where('user_id', $currentUserId)
            ->where('valid', 1)
            ->where('resolution_status', '!=', 'resolved')
            ->get();

        if ($userItems->isEmpty()) {
            return response()->json(['items' => []]);
        }

        // Fetch other users' items
        $otherItemsQuery = Item::where('user_id', '!=', $currentUserId)
            ->where('valid', 1)
            ->where('resolution_status', '!=', 'resolved');

        $otherItems = $otherItemsQuery->with(['user', 'user.info'])->get();

        if ($otherItems->isEmpty()) {
            return response()->json(['items' => []]);
        }

        $userItemsJson = json_encode($userItems->map(fn($item) => [
            'id' => $item->id,
            'item_name' => $item->item_name,
            'category' => $item->category,
            'description' => $item->description,
            'location' => $item->location,
            'status' => $item->status,
            'date_time' => $item->date_time
        ])->toArray());

        $otherItemsJson = json_encode($otherItems->map(fn($item) => [
            'id' => $item->id,
            'item_name' => $item->item_name,
            'category' => $item->category,
            'description' => $item->description,
            'location' => $item->location,
            'status' => $item->status,
            'date_time' => $item->date_time
        ])->toArray());

        $matchedIds = $this->callGeminiSuggestions($userItemsJson, $otherItemsJson);

        if ($matchedIds === null) {
            return response()->json(['message' => 'AI Service is currently experiencing high demand. Please try again in a few moments.'], 503);
        }

        if (empty($matchedIds)) {
            return response()->json(['items' => []]);
        }

        $filteredItems = $otherItems->filter(function ($item) use ($matchedIds) {
            return in_array($item->id, $matchedIds);
        })->values();

        return response()->json(['items' => $filteredItems]);
    }






    private function callGeminiSuggestions($userItemsJson, $otherItemsJson)
    {
        $apiKey = env('GEMINI_API_KEY');
        if (!$apiKey) {
            return [];
        }

        $systemPrompt = "
        ### ROLE
        You are the Suggestions Engine for 'Khoj'. Your goal is to match a user's items with potential items reported by others.

        ### DATA SOURCE
        - 'USER ITEMS': items reported by the current user.
        - 'OTHER ITEMS': items reported by other people.

        ### SEARCH LOGIC
        - For any 'lost' item in USER ITEMS, find highly similar 'found' items in OTHER ITEMS.
        - For any 'found' item in USER ITEMS, find highly similar 'lost' items in OTHER ITEMS.
        - Consider location similarity, brand logic (e.g. Casio is a Calculator), and descriptions.

        ### MULTILINGUAL & PHONETIC RULES
        1. **Language Agnostic:** Treat English and Bengali (বাংলা) as interchangeable. Match 'ছাতা' to 'Umbrella' or 'Chata'.
        2. **Banglish Phonetics:** Recognize Bengali words written in English letters. 
           - 'Chata' or 'Sata' = Umbrella
           - 'Manibag' = Wallet/Money bag
           - 'Ghori' = Watch
           - 'Choshma' = Glasses/Spectacles
        3. **Intent Extraction:** If the user types a full sentence like 'Amar chata khuje pacchi na', ignore the filler words and focus only on the item itself.
        
        ### OUTPUT
        - Return ONLY a JSON array of integers representing the matching 'id's from 'OTHER ITEMS'.
        - If no logical match is found, return [].
        - DO NOT include markdown blocks, text, or explanations.
        ";

        $userPrompt = "### USER ITEMS\n$userItemsJson\n\n### OTHER ITEMS\n$otherItemsJson";

        \Log::info("=== SENDING TO GEMINI ===");
        \Log::info($userPrompt);

        try {
            $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . $apiKey;
            
            $maxRetries = 3;
            $response = null;

            for ($attempt = 0; $attempt < $maxRetries; $attempt++) {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->post($url, [
                            'systemInstruction' => ['parts' => [['text' => $systemPrompt]]],
                            'contents' => [['parts' => [['text' => $userPrompt]]]],
                            'generationConfig' => [
                                'temperature' => 0.2,
                                'topK' => 40,
                                'topP' => 0.95,
                                'maxOutputTokens' => 800,
                            ]
                        ]);

                if ($response->successful()) {
                    break;
                }
                
                if ($attempt < $maxRetries - 1) {
                    sleep(2); // Wait 2 seconds before retrying
                }
            }

            if (!$response || !$response->successful()) {
                \Log::error('Gemini Suggestions API Non-200 Response: ' . ($response ? $response->body() : 'null'));
                return null;
            }

            $responseData = $response->json();
            $text = $responseData['candidates'][0]['content']['parts'][0]['text'] ?? '[]';

            \Log::info("=== GEMINI RESPONSE ===");
            \Log::info($text);

            // Extract only the array part by finding the first [ and last ]
            if (preg_match('/\[.*\]/s', $text, $matches)) {
                $text = $matches[0];
            } else {
                $text = '[]';
            }

            $matchedIds = json_decode($text, true);
            if (!is_array($matchedIds)) {
                \Log::error('Gemini Suggestions API Error: Invalid JSON returned. Text was: ' . $text);
                return null;
            }

            return array_map(function ($id) {
                return (int) $id;
            }, $matchedIds);
        } catch (\Exception $e) {
            return null;
        }
    }
}


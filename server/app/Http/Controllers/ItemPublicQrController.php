<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ItemPublicQrController extends Controller
{
    /**
     * Public page when someone scans the item QR code (opens in any phone camera / scanner).
     */
    public function show(string $token)
    {
        $item = Item::query()
            ->where('qr_token', $token)
            ->where('valid', 1)
            ->with(['user' => function ($q) {
                $q->select('id', 'name', 'pic_url');
            }])
            ->first();

        if (! $item || $item->resolution_status === 'resolved') {
            abort(404, 'Item not found or no longer available.');
        }

        $frontend = rtrim(config('app.frontend_url', config('app.url')), '/');

        return view('items.scan', [
            'item' => $item,
            'frontendItemsUrl' => $frontend.'/user-dashboard/items',
        ]);
    }

    /**
     * Download the stored PNG (optional print flow).
     */
    public function downloadImage(string $token)
    {
        $item = Item::where('qr_token', $token)->where('valid', 1)->first();
        if (! $item || ! $item->qr_image_path || ! Storage::disk('public')->exists($item->qr_image_path)) {
            abort(404);
        }

        return Storage::disk('public')->download(
            $item->qr_image_path,
            'khoj-item-'.$item->id.'-qr.png'
        );
    }
}

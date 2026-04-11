<?php

namespace App\Services;

use App\Models\Item;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ItemQrService
{
    /**
     * Generate a unique token, public scan URL, and PNG QR image in storage/app/public.
     */
    public function generateForItem(Item $item): void
    {
        if ($item->qr_token && $item->qr_image_path && Storage::disk('public')->exists($item->qr_image_path)) {
            return;
        }

        $token = $this->makeUniqueToken();
        $scanUrl = url('/scan/'.$token);

        $relativePath = 'qrcode_items/item_'.$item->id.'.png';
        $absolutePath = storage_path('app/public/'.$relativePath);

        if (! File::isDirectory(dirname($absolutePath))) {
            File::makeDirectory(dirname($absolutePath), 0755, true);
        }

        try {
            if (! class_exists(\SimpleSoftwareIO\QrCode\Facades\QrCode::class)) {
                Log::warning('ItemQrService: simplesoftwareio/simple-qrcode not installed. Run: composer require simplesoftwareio/simple-qrcode');

                $item->forceFill(['qr_token' => $token])->save();

                return;
            }

            \SimpleSoftwareIO\QrCode\Facades\QrCode::format('png')
                ->size(320)
                ->margin(2)
                ->errorCorrection('H')
                ->generate($scanUrl, $absolutePath);
        } catch (\Throwable $e) {
            Log::error('ItemQrService: QR generation failed: '.$e->getMessage());
            $item->forceFill(['qr_token' => $token])->save();

            return;
        }

        $item->forceFill([
            'qr_token' => $token,
            'qr_image_path' => $relativePath,
        ])->save();
    }

    private function makeUniqueToken(): string
    {
        do {
            $token = Str::random(48);
        } while (Item::where('qr_token', $token)->exists());

        return $token;
    }
}

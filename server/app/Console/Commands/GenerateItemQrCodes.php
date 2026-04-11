<?php

namespace App\Console\Commands;

use App\Models\Item;
use App\Services\ItemQrService;
use Illuminate\Console\Command;

class GenerateItemQrCodes extends Command
{
    protected $signature = 'items:generate-qr-codes {--force : Regenerate even if QR exists}';

    protected $description = 'Generate QR tokens and PNG files for items missing them';

    public function handle(ItemQrService $qr): int
    {
        $query = Item::query()->where('valid', 1);
        if (! $this->option('force')) {
            $query->whereNull('qr_token');
        }

        $items = $query->get();
        $bar = $this->output->createProgressBar($items->count());
        $bar->start();

        foreach ($items as $item) {
            if ($this->option('force') && $item->qr_token) {
                $item->forceFill(['qr_token' => null, 'qr_image_path' => null])->save();
                $item->refresh();
            }
            $qr->generateForItem($item->fresh());
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info('Done.');

        return self::SUCCESS;
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Middleware\SetLocale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;

class LocaleController extends Controller
{
    protected function messagesPath(string $locale): string
    {
        if (! in_array($locale, SetLocale::SUPPORTED, true)) {
            $locale = 'en';
        }

        $path = resource_path("lang/{$locale}.json");

        return File::isReadable($path) ? $path : resource_path('lang/en.json');
    }

    /**
     * Load homepage UI strings from JSON (en.json / bn.json).
     *
     * @return array<string, mixed>
     */
    public function loadMessages(string $locale): array
    {
        $path = $this->messagesPath($locale);
        $raw = File::get($path);
        $data = json_decode($raw, true);

        return is_array($data) ? $data : [];
    }

    /**
     * Full browser redirect (Blade or direct hit). Sets session locale.
     */
    public function switchWeb(Request $request, string $locale)
    {
        if (! in_array($locale, SetLocale::SUPPORTED, true)) {
            abort(404);
        }

        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        $back = $request->headers->get('Referer');
        if ($back && $this->isSameHostReferer($request, $back)) {
            return redirect()->to($back);
        }

        return redirect('/');
    }

    protected function isSameHostReferer(Request $request, string $referer): bool
    {
        $host = parse_url($referer, PHP_URL_HOST);
        $appHost = $request->getHost();

        return $host === $appHost || $host === 'localhost' || $host === '127.0.0.1';
    }

    /**
     * SPA-friendly: set session locale and return messages (GET avoids CSRF).
     */
    public function useLocale(Request $request, string $locale)
    {
        if (! in_array($locale, SetLocale::SUPPORTED, true)) {
            return response()->json(['error' => 'Unsupported locale'], 422);
        }

        $request->session()->put('locale', $locale);
        App::setLocale($locale);

        return response()->json([
            'locale' => $locale,
            'messages' => $this->loadMessages($locale),
        ]);
    }

    /**
     * Current session locale + messages (for initial SPA load).
     */
    public function current(Request $request)
    {
        $locale = $request->session()->get('locale', config('app.locale', 'en'));
        if (! in_array($locale, SetLocale::SUPPORTED, true)) {
            $locale = 'en';
        }
        App::setLocale($locale);

        return response()->json([
            'locale' => $locale,
            'messages' => $this->loadMessages($locale),
        ]);
    }
}

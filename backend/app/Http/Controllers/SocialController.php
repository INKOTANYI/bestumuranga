<?php

namespace App\Http\Controllers;

use App\Jobs\SocialShareJob;
use App\Models\SocialPost;
use Illuminate\Http\Request;

class SocialController extends Controller
{
    public function posts(Request $request)
    {
        $limit = (int) $request->query('limit', 10);
        $platform = $request->query('platform');

        $q = SocialPost::query()->latest();
        if ($platform) { $q->where('platform', $platform); }
        $items = $q->limit(max(1, min($limit, 50)))->get()->map(function($p){
            return [
                'id' => (string) $p->id,
                'platform' => $p->platform,
                'media_url' => is_array($p->media_urls) && count($p->media_urls) ? $p->media_urls[0] : null,
                'caption' => null,
                'timestamp' => $p->created_at?->toIso8601String(),
                'link' => null,
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'count' => $items->count(),
                'platform' => $platform,
            ],
        ]);
    }

    public function share(Request $request)
    {
        $data = $request->validate([
            'listing_id' => ['required','integer'],
            'platforms' => ['required','array','min:1'],
            'platforms.*' => ['string'],
            'message' => ['nullable','string'],
            'media_urls' => ['nullable','array'],
            'media_urls.*' => ['string'],
        ]);

        $created = [];
        foreach ($data['platforms'] as $plat) {
            $post = SocialPost::create([
                'listing_id' => $data['listing_id'],
                'platform' => $plat,
                'status' => 'queued',
                'media_urls' => $data['media_urls'] ?? [],
            ]);
            SocialShareJob::dispatch($post->id, $data['message'] ?? '');
            $created[] = $post->platform;
        }

        return response()->json([
            'status' => 'queued',
            'share_id' => 'sh'.uniqid(),
            'platforms' => $created,
        ], 201);
    }
}

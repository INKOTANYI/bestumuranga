<?php

namespace App\Http\Controllers;

use App\Models\AIChat;
use App\Models\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    public function generateListingDescription(Request $request)
    {
        // Public access allowed for description generation
        $data = $request->validate([
            'category' => ['required','string'],
            'title' => ['required','string','max:191'],
            'location' => ['nullable','string','max:191'],
            'price_info' => ['nullable','string','max:191'],
            'key_features' => ['nullable','array'],
            'key_features.*' => ['string'],
            'transaction' => ['nullable','in:sell,rent'],
            'tone' => ['nullable','string','max:50'],
            'extras' => ['nullable','array'],
        ]);
        // If an external LLM is configured, try generating via provider
        $apiKey = env('OPENAI_API_KEY');
        if ($apiKey) {
            try {
                $prompt = $this->buildPrompt($data);
                $resp = Http::withToken($apiKey)
                    ->timeout(20)
                    ->post('https://api.openai.com/v1/chat/completions', [
                        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
                        'messages' => [
                            ['role' => 'system', 'content' => 'You are a professional advertising copywriter for Wiser Wide Mind Classifieds. Output only the advertisement text.'],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'temperature' => 0.7,
                        'max_tokens' => 300,
                    ]);
                if ($resp->ok()) {
                    $desc = data_get($resp->json(), 'choices.0.message.content');
                    if ($desc) {
                        return response()->json(['description' => trim($desc)]);
                    }

        // If no extras/features, add sensible defaults based on category
        if (!$extrasText) {
            if (str_contains($category, 'car')) {
                $extrasText = 'Reliable performance, comfortable interior and excellent fuel efficiency—ideal for city and weekend drives.';
            } elseif (str_contains($category, 'house') || str_contains($category, 'apartment') || str_contains($category, 'home')) {
                $extrasText = 'Comfortable living with bright rooms, practical layout and easy access to nearby amenities—ideal for families and professionals.';
            }
        }
                }
            } catch (\Throwable $e) {
                // fall through to simple generation
            }
        }

        // Fallback simple description using structured template
        $tone = strtolower((string) ($data['tone'] ?? 'professional'));
        $openingPrefix = $tone === 'luxury' ? 'Impeccable' : ($tone === 'friendly' ? 'Great offer' : 'Discover');

        $title = trim($data['title']);
        $category = strtolower($data['category']);
        $categoryLabel = ucfirst($category);
        if (str_contains($category, 'apartment')) $categoryLabel = 'Apartment';
        elseif (str_contains($category, 'house') || str_contains($category, 'home')) $categoryLabel = 'House';
        elseif (str_contains($category, 'car') || str_contains($category, 'vehicle') || str_contains($category, 'auto')) $categoryLabel = 'Car';
        $tx = ($data['transaction'] ?? 'sell') === 'rent' ? 'For Rent' : 'For Sale';
        $price = trim((string) ($data['price_info'] ?? ''));
        if ($price !== '' && !preg_match('/^\s*(rwf|frw|rfw)/i', $price)) {
            $price = 'RWF ' . $price;
        }

        $loc = trim((string) ($data['location'] ?? ''));
        $locText = $loc ? "Located in {$loc}, Rwanda" : '';

        $featuresList = array_filter(($data['key_features'] ?? []), fn($v) => is_string($v) && strlen(trim($v)) > 0);
        $featuresText = $featuresList ? 'Key features: ' . implode(', ', $featuresList) . '.' : '';

        $extras = is_array($data['extras'] ?? null) ? $data['extras'] : [];
        $extrasText = '';
        if (str_contains($category, 'car') || str_contains($category, 'vehicle') || str_contains($category, 'auto')) {
            $colour = $extras['colour'] ?? $extras['color'] ?? null;
            $mileage = $extras['mileage'] ?? null;
            $trans = $extras['transmission'] ?? null;
            $year = $extras['year'] ?? null;
            $parts = [];
            if ($colour) $parts[] = strtolower($colour) . ' exterior';
            if ($mileage) $parts[] = $mileage . ' km mileage';
            if ($trans) $parts[] = strtolower($trans) . ' transmission';
            if ($year) $parts[] = (string)$year;
            if ($parts) $extrasText = 'Features ' . implode(', ', $parts) . '.';
        } elseif (str_contains($category, 'house') || str_contains($category, 'apartment') || str_contains($category, 'home')) {
            $beds = $extras['bedrooms'] ?? null;
            $baths = $extras['bathrooms'] ?? null;
            $hood = $extras['neighbourhood'] ?? $extras['neighborhood'] ?? null;
            $area = $extras['area_sqm'] ?? $extras['area'] ?? null;
            $parts = [];
            if ($beds) $parts[] = $beds . ' bedroom' . ((int)$beds > 1 ? 's' : '');
            if ($baths) $parts[] = $baths . ' bathroom' . ((int)$baths > 1 ? 's' : '');
            if ($area) $parts[] = $area . ' sqm';
            if ($hood) $parts[] = 'in ' . $hood;
            if ($parts) $extrasText = 'This property offers ' . implode(', ', $parts) . '.';
        }

        // Simple SEO-style keyword helpers for cars based on location and title
        $seoText = '';
        if (str_contains($category, 'car') || str_contains($category, 'vehicle') || str_contains($category, 'auto')) {
            $city = null;
            $area = null;
            if ($loc !== '') {
                $parts = array_values(array_filter(array_map('trim', explode(',', $loc))));
                // Heuristic: second part often looks like city, third/fourth as area/sector
                if (isset($parts[1])) {
                    $city = $parts[1];
                } elseif (isset($parts[0])) {
                    $city = $parts[0];
                }
                if (isset($parts[2])) {
                    $area = $parts[2];
                } elseif (isset($parts[3])) {
                    $area = $parts[3];
                }
            }

            $keywords = [];
            if ($city) {
                $keywords[] = 'cheap cars in ' . $city;
            }
            if ($area && $title) {
                $keywords[] = $title . ' ' . $area;
            } elseif ($area) {
                $keywords[] = 'cars in ' . $area;
            }

            if ($keywords) {
                $seoText = 'Great for buyers searching online for ' . implode(', ', $keywords) . '.';
            }
        }

        $opening = trim("{$openingPrefix} {$categoryLabel}: {$title}!");
        $bodyParts = [];
        if ($locText) $bodyParts[] = $locText . '. '
            . (str_contains($category, 'car') ? 'Enjoy convenient access to key roads and services around the area.' : 'Close to essential services, shops and transport for convenient daily living.');
        if ($extrasText) $bodyParts[] = $extrasText . ' '
            . (str_contains($category, 'car') ? 'Comfort and practicality meet style, making it ideal for both city commutes and weekend escapes.' : 'Its layout balances comfort and utility, offering flexible spaces suited to work, family and entertaining.');
        if ($featuresText) $bodyParts[] = $featuresText . ' '
            . (str_contains($category, 'car') ? 'Well kept and ready for the road.' : 'Thoughtful finishes add a warm, modern feel.');
        if ($seoText) $bodyParts[] = $seoText;

        // Add persuasive paragraph tailored by category
        if (str_contains($category, 'car')) {
            $bodyParts[] = 'This vehicle provides responsive handling and dependable performance, supported by efficient fuel economy to keep running costs in check. The interior is designed for comfort on longer trips, with supportive seating and useful storage throughout. Safety and peace of mind come standard, making it a smart choice for buyers seeking value without compromise.';
        } else {
            $bodyParts[] = 'The surrounding neighbourhood offers a welcoming community atmosphere with access to schools, local markets and recreational spots. Whether you are moving in with family or looking for a calm base for work, the property balances privacy with convenience and presents a solid long-term investment in a growing area.';
        }

        $pricing = $price ? "{$tx}: {$price}" : $tx;
        $cta = (str_contains($category, 'car'))
            ? 'Don’t miss this excellent value—contact us today to schedule a test drive!'
            : 'Ready for viewing—book your visit today.';

        // Assemble paragraphs and pad to ~200 words if needed
        $paragraphs = array_map('trim', array_filter([$opening, ...$bodyParts, $pricing, $cta]));
        $desc = implode("\n\n", $paragraphs);

        $wordCount = str_word_count(strip_tags($desc));
        if ($wordCount < 180) {
            $padding = [
                'Please note that availability is subject to change; early viewing is recommended to secure this opportunity.',
                'All details provided are for guidance and may be verified during your visit or inquiry for complete assurance.',
                'Flexible scheduling is available—reach out with your preferred time and we will be glad to assist you.'
            ];
            foreach ($padding as $p) {
                if ($wordCount >= 190) break;
                $desc .= "\n\n" . $p;
                $wordCount = str_word_count(strip_tags($desc));
            }
        }

        return response()->json(['description' => $desc]);
    }

    public function recommendations(Request $request)
    {
        $listingId = (int) $request->query('listing_id');
        $limit = (int) $request->query('limit', 3);
        $limit = max(1, min($limit, 10));

        $base = Listing::with('category')->find($listingId);
        if (! $base) {
            return response()->json(['data' => []]);
        }

        $q = Listing::query()->with('images')
            ->where('is_active', true)
            ->where('id', '!=', $listingId)
            ->when($base->category_id, fn($qq) => $qq->where('category_id', $base->category_id))
            ->orderByDesc('id')
            ->limit($limit)
            ->get();

        $data = $q->map(function($l){
            return [
                'id' => $l->id,
                'title' => $l->title,
                'price_info' => $l->price ? $l->price : null,
                'image_url' => $l->images?->first()?->file_path,
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function chatSessions(Request $request)
    {
        $data = $request->validate([
            'session_id' => ['required','string','max:191'],
            'user_id' => ['nullable','integer'],
            'message' => ['required','string'],
        ]);

        $msg = trim($data['message']);
        $reply = $this->simpleReply($msg);

        $row = AIChat::create([
            'session_id' => $data['session_id'],
            'user_id' => $data['user_id'] ?? $request->user()?->id,
            'broker_id' => null,
            'message' => $msg,
            'reply' => $reply,
        ]);

        return response()->json(['session_id' => $row->session_id, 'reply' => $row->reply]);
    }

    private function authorizeBroker(Request $request): void
    {
        $u = $request->user();
        if (! $u || !in_array($u->role, ['broker','admin'], true)) {
            abort(403, 'Broker auth required');
        }
    }

    private function simpleReply(string $msg): string
    {
        $lower = strtolower($msg);
        if (str_contains($lower, 'car')) {
            return 'We have several cars for rent. What is your budget and preferred dates?';
        }
        if (str_contains($lower, 'house') || str_contains($lower, 'apartment')) {
            return 'Great! Which neighborhood and price range are you targeting?';
        }
        return 'Thanks! Could you provide more details like category and budget?';
    }
}

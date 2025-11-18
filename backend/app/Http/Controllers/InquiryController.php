<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\Request;
use App\Services\SmsService;

class InquiryController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'broker_id' => ['required','integer','exists:users,id'],
            'listing_id' => ['required','integer','exists:listings,id'],
            'category_id' => ['nullable','integer','exists:categories,id'],
            'details' => ['required','string'],
            'client_name' => ['required','string','max:191'],
            'client_phone' => ['required','string','max:50'],
            'client_email' => ['required','string','max:191'],
        ]);

        $user = $request->user();

        // Enforce: one open inquiry per client (same broker + same listing)
        $phone = $data['client_phone'];
        $email = $data['client_email'];

        $alreadyOpenQuery = Inquiry::where('broker_id', $data['broker_id'])
            ->where('listing_id', $data['listing_id'])
            ->where('status', 'open');

        $alreadyOpenQuery->where(function ($q) use ($user, $phone, $email) {
            if ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere(function ($q2) use ($phone, $email) {
                      $q2->where('client_phone', $phone)
                         ->where('client_email', $email);
                  });
            } else {
                $q->where('client_phone', $phone)
                  ->where('client_email', $email);
            }
        });

        if ($alreadyOpenQuery->exists()) {
            return response()->json([
                'message' => 'Please be patient, our broker will contact you as soon as possible. We still have your enquiry on file.',
            ], 422);
        }

        // Enrich details with client contact info so broker sees everything
        $details = $data['details'];
        $extra = ['Name: '.$data['client_name'], 'Phone: '.$data['client_phone'], 'Email: '.$data['client_email']];
        $details = implode(" | ", $extra)."\n\n".$details;

        $inq = Inquiry::create([
            'user_id' => $user?->id,
            'broker_id' => $data['broker_id'],
            'listing_id' => $data['listing_id'],
            'category_id' => $data['category_id'] ?? null,
            'details' => $details,
            'client_name' => $data['client_name'],
            'client_phone' => $data['client_phone'],
            'client_email' => $data['client_email'],
            'status' => 'open',
        ]);

        return response()->json(['data' => $inq]);
    }

    // Broker: list own inquiries (recent first)
    public function brokerIndex(Request $request)
    {
        $user = $request->user();
        $inquiries = Inquiry::with(['user'])
            ->where('broker_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return response()->json(['data' => $inquiries]);
    }

    // Broker: mark an inquiry as responded
    public function markResponded(Request $request, $id)
    {
        $user = $request->user();
        $inq = Inquiry::where('broker_id', $user->id)->findOrFail($id);
        $inq->status = 'responded';
        $inq->save();

        // Optional SMS notification to the client when broker responds
        if ($inq->client_phone) {
            $msg = 'BestUmuranga: Your enquiry has been updated. Our broker has responded or started processing your request.';
            SmsService::send($inq->client_phone, $msg);
        }

        return response()->json(['data' => $inq]);
    }
}

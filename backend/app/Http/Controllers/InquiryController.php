<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\Request;

class InquiryController extends Controller
{
    public function index(Request $request)
    {
        $query = Inquiry::query()->latest();

        if ($request->filled('category')) {
            $query->where('category', $request->string('category'));
        }

        if ($request->filled('purpose')) {
            $query->where('purpose', $request->string('purpose'));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:50',
            'category' => 'required|in:house,car',
            'purpose' => 'required|in:rent,buy,sell',
            'bedrooms' => 'nullable|integer|min:0|max:20',
            'bathrooms' => 'nullable|integer|min:0|max:20',
            'location' => 'nullable|string|max:255',
            'make' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'year' => 'nullable|string|max:10',
            'mileage' => 'nullable|string|max:50',
            'amount' => 'nullable|numeric|min:0',
            'status' => 'sometimes|string|max:50',
            'return_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $existing = Inquiry::where('email', $data['email'])
            ->where('phone', $data['phone'])
            ->where('status', 'open')
            ->latest()
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'We already have your previous inquiry and our team is working on it.',
            ], 422);
        }

        $data['status'] = $data['status'] ?? 'open';

        $inquiry = Inquiry::create($data);

        return response()->json([
            'message' => 'Inquiry submitted successfully.',
            'data' => $inquiry,
        ], 201);
    }
}

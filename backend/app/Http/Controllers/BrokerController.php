<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Broker;

class BrokerController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|max:255|unique:brokers,email',
            'phone'      => 'required|string|max:50|unique:brokers,phone',
        ]);

        $broker = Broker::create($data);

        return response()->json([
            'message' => 'Broker registered successfully',
            'broker'  => $broker,
        ], 201);
    }

    public function index()
    {
        $brokers = Broker::orderByDesc('id')->get();

        return response()->json($brokers);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'phone' => 'required|string',
        ]);

        $broker = Broker::where('email', $credentials['email'])
            ->where('phone', $credentials['phone'])
            ->first();

        if (! $broker) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        if (! $broker->is_active) {
            return response()->json([
                'message' => 'Your broker account is disabled. Please contact the admin.',
            ], 403);
        }

        return response()->json([
            'message' => 'Login successful',
            'broker'  => $broker,
        ]);
    }

    public function toggleStatus(Broker $broker)
    {
        $broker->is_active = ! (bool) $broker->is_active;
        $broker->save();

        return response()->json([
            'message' => $broker->is_active ? 'Broker enabled' : 'Broker disabled',
            'broker'  => $broker,
        ]);
    }

    public function checkUnique(Request $request)
    {
        $email = $request->query('email');
        $phone = $request->query('phone');

        $emailTaken = $email ? Broker::where('email', $email)->exists() : false;
        $phoneTaken = $phone ? Broker::where('phone', $phone)->exists() : false;

        return response()->json([
            'email_taken' => $emailTaken,
            'phone_taken' => $phoneTaken,
        ]);
    }
}

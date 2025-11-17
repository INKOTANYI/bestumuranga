<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'first_name' => ['nullable','string','max:100'],
            'last_name'  => ['nullable','string','max:100'],
            'name'       => ['nullable','string','max:191'],
            'email'      => ['required','email','max:191','unique:users,email'],
            // Rwanda: +25072/73/78xxxxxxx (e.g. +250783163187), DRC: +243 followed by 9 digits
            'phone'      => [
                'required',
                'string',
                'regex:/^(\+2507(2|3|8)[0-9]{7}|\+243[0-9]{9})$/',
                'unique:users,phone',
            ],
            'address'    => ['nullable','string','max:255'],
            'password'   => ['required','confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'role'       => ['nullable','in:admin,broker,user'],
            'country'    => ['required','string','in:RW,DRC'],
            'province_id' => ['required','integer','exists:provinces,id'],
            // For Rwanda we expect district/sector; for DRC we expect city/territory.
            'district_id' => ['nullable','integer','exists:districts,id'],
            'sector_id'   => ['nullable','integer','exists:sectors,id'],
            'city_id'     => ['nullable','integer','exists:cities,id'],
            'territory_id'=> ['nullable','integer','exists:territories,id'],
        ]);

        // Default everyone to 'broker' for the demo/presentation
        $role = $data['role'] ?? 'broker';

        // Resolve location names for storage on the user profile
        $provinceName = DB::table('provinces')->where('id', $data['province_id'])->value('name');

        $districtName = null;
        $sectorName   = null;

        if (($data['country'] ?? 'RW') === 'RW') {
            // Rwanda: province / district / sector
            $districtName = DB::table('districts')->where('id', $data['district_id'])->value('name');
            $sectorName   = DB::table('sectors')->where('id', $data['sector_id'])->value('name');
        } else {
            // DRC: province / city / territory — we map to broker_district / broker_sector for display
            $districtName = DB::table('cities')->where('id', $data['city_id'])->value('name');
            $sectorName   = DB::table('territories')->where('id', $data['territory_id'])->value('name');
        }

        $user = User::create([
            'first_name' => $data['first_name'] ?? null,
            'last_name'  => $data['last_name'] ?? null,
            'name'       => $data['name'] ?? (($data['first_name'] ?? '').' '.($data['last_name'] ?? '')),
            'email'      => $data['email'],
            'phone'      => $data['phone'] ?? null,
            'address'    => $data['address'] ?? null,
            'country'    => $data['country'] ?? null,
            'password'   => Hash::make($data['password']),
            'role'       => $role,
            // New brokers are auto-approved with a free quota of 30 listings
            'broker_status' => $role === 'broker' ? 'approved' : null,
            'quota_items'   => $role === 'broker' ? 30 : null,
            'broker_province' => $provinceName,
            'broker_district' => $districtName,
            'broker_sector'   => $sectorName,
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['user' => $user]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required','email'],
            'password' => ['required','string'],
        ]);

        if (! Auth::attempt($credentials, true)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $request->session()->regenerate();
        return response()->json(['user' => Auth::user()]);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return response()->json(['ok' => true]);
    }

    public function requestBroker(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $user->role = 'broker';
        $user->broker_status = 'pending';
        $user->save();
        return response()->json(['user' => $user]);
    }

    public function checkEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required','email'],
        ]);
        $exists = User::where('email', $validated['email'])->exists();
        return response()->json(['available' => ! $exists]);
    }

    public function checkPhone(Request $request)
    {
        $validated = $request->validate([
            // Same strict pattern as register(): Rwanda +2507(2/3/8)xxxxxxx, DRC +243xxxxxxxxx
            'phone' => ['required','regex:/^(\+2507(2|3|8)[0-9]{7}|\+243[0-9]{9})$/'],
        ]);
        $exists = User::where('phone', $validated['phone'])->exists();
        return response()->json(['available' => ! $exists]);
    }

    public function socialLogin(Request $request)
    {
        $data = $request->validate([
            'provider' => ['required','string','in:google,facebook,twitter,github'],
            'token' => ['required','string'],
        ]);

        $provider = $data['provider'];
        $providerId = substr(hash('sha256', $data['token']), 0, 32);

        $user = User::where('provider', $provider)->where('provider_id', $providerId)->first();
        if (! $user) {
            $user = User::create([
                'name' => ucfirst($provider).' User',
                'email' => $provider.'_'.$providerId.'@example.local',
                'password' => Hash::make(bin2hex(random_bytes(8))),
                'role' => 'user',
                'broker_status' => null,
                'quota_items' => 100,
                'quota_storage_mb' => 2048,
                'storage_used_mb' => 0,
                'provider' => $provider,
                'provider_id' => $providerId,
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        $pat = $user->createToken('social')->plainTextToken;
        return response()->json([
            'token' => $pat,
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'role' => $user->role,
            ],
        ]);
    }
}
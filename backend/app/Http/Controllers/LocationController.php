<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LocationController extends Controller
{
    public function provinces(Request $request)
    {
        $country = $request->query('country'); // e.g. RW, DRC
        $q = DB::table('provinces');
        if ($country) {
            $q->where('country', $country);
        }
        $rows = $q->orderBy('name')->get(['id','name']);
        return response()->json(['data' => $rows]);
    }

    public function districts(Request $request)
    {
        $request->validate(['province_id' => ['required','integer','exists:provinces,id']]);
        $rows = DB::table('districts')->where('province_id', $request->integer('province_id'))
            ->orderBy('name')->get(['id','name']);
        return response()->json(['data' => $rows]);
    }

    public function sectors(Request $request)
    {
        $request->validate(['district_id' => ['required','integer','exists:districts,id']]);
        $rows = DB::table('sectors')->where('district_id', $request->integer('district_id'))
            ->orderBy('name')->get(['id','name']);
        return response()->json(['data' => $rows]);
    }

    // DRC-specific helpers

    public function cities(Request $request)
    {
        $request->validate(['province_id' => ['required','integer','exists:provinces,id']]);
        $rows = DB::table('cities')->where('province_id', $request->integer('province_id'))
            ->orderBy('name')->get(['id','name']);
        return response()->json(['data' => $rows]);
    }

    public function territories(Request $request)
    {
        $request->validate(['province_id' => ['required','integer','exists:provinces,id']]);
        $rows = DB::table('territories')->where('province_id', $request->integer('province_id'))
            ->orderBy('name')->get(['id','name']);
        return response()->json(['data' => $rows]);
    }
}

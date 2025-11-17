<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Listing;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function pendingBrokers()
    {
        $pending = User::where('role', 'broker')->where('broker_status', 'pending')->get();
        return response()->json(['data' => $pending]);
    }

    public function approveBroker($id)
    {
        $user = User::findOrFail($id);
        $user->role = 'broker';
        $user->broker_status = 'approved';
        $user->save();
        return response()->json(['user' => $user]);
    }

    public function rejectBroker($id)
    {
        $user = User::findOrFail($id);
        $user->role = 'broker';
        $user->broker_status = 'rejected';
        $user->save();
        return response()->json(['user' => $user]);
    }

    public function updateQuota(Request $request, $id)
    {
        $data = $request->validate([
            'quota_items' => ['required','integer','min:0'],
            'quota_storage_mb' => ['required','integer','min:0'],
        ]);
        $user = User::findOrFail($id);
        $user->quota_items = $data['quota_items'];
        $user->quota_storage_mb = $data['quota_storage_mb'];
        $user->save();
        return response()->json(['user' => $user]);
    }

    public function listings7d(Request $request)
    {
        $u = $request->user();
        $start = Carbon::today()->subDays(6);
        $base = Listing::query()->where('created_at', '>=', $start);
        if ($u && $u->role !== 'admin') {
            $base->where('user_id', $u->id);
        }
        $rows = $base->selectRaw("DATE(created_at) as d, COUNT(*) as c")
            ->groupBy('d')
            ->orderBy('d')
            ->get()
            ->keyBy('d');

        $days = [];
        $counts = [];
        for ($i = 0; $i < 7; $i++) {
            $day = Carbon::today()->subDays(6 - $i)->toDateString();
            $days[] = $day;
            $counts[] = (int) ($rows[$day]->c ?? 0);
        }
        $total = array_sum($counts);
        return response()->json(['days' => $days, 'counts' => $counts, 'total' => $total]);
    }

    // Placeholder Admin endpoints — replace with real data sources later
    public function supportInbox()
    {
        return response()->json([
            'open' => 2,
            'items' => [
                [ 'id' => 101, 'subject' => 'Payment receipt missing', 'from' => 'user1@example.com', 'status' => 'open', 'created_at' => now()->subHours(5)->toDateTimeString() ],
                [ 'id' => 102, 'subject' => 'Account verification', 'from' => 'user2@example.com', 'status' => 'open', 'created_at' => now()->subDay()->toDateTimeString() ],
            ],
        ]);
    }

    public function projectsList()
    {
        return response()->json([
            'pending' => 3,
            'items' => [
                [ 'id' => 201, 'name' => 'Project Alpha', 'status' => 'review' ],
                [ 'id' => 202, 'name' => 'Project Beta', 'status' => 'review' ],
                [ 'id' => 203, 'name' => 'Project Gamma', 'status' => 'review' ],
            ],
        ]);
    }

    public function propertiesPending()
    {
        return response()->json([
            'pending' => 3,
            'items' => [
                [ 'id' => 301, 'title' => '2BR Apartment - Kigali', 'status' => 'pending' ],
                [ 'id' => 302, 'title' => 'Family House - Remera', 'status' => 'pending' ],
                [ 'id' => 303, 'title' => 'Commercial Plot - Kicukiro', 'status' => 'pending' ],
            ],
        ]);
    }

    // Category metric cards: houses, apartments, plots, cars
    public function categoryCounts()
    {
        // Using category name keywords; adjust to your actual category taxonomy if needed
        $houses = Listing::whereHas('category', function($q){
            $q->where('name', 'like', '%house%');
        })->count();
        $apartments = Listing::whereHas('category', function($q){
            $q->where('name', 'like', '%apartment%');
        })->count();
        $plots = Listing::whereHas('category', function($q){ $q->where('name', 'like', '%plot%')->orWhere('name', 'like', '%land%'); })->count();
        $cars = Listing::whereHas('category', function($q){ $q->where('name', 'like', '%car%')->orWhere('name', 'like', '%vehicle%'); })->count();
        return response()->json(['houses' => (int)$houses, 'apartments' => (int)$apartments, 'plots' => (int)$plots, 'cars' => (int)$cars]);
    }

    public function listingsByCategory(Request $request)
    {
        $categoryId = $request->integer('category_id');
        $cat = strtolower($request->query('category', ''));
        $perPage = max(1, min((int) $request->query('per_page', 10), 100));
        $page = max(1, (int) $request->query('page', 1));

        $query = Listing::with(['category','user']);
        if ($categoryId) {
            $query->where('category_id', $categoryId);
        } else {
            $map = [
                'houses' => ['house','apartment'],
                'apartments' => ['apartment'],
                'plots' => ['plot','land'],
                'cars' => ['car','vehicle'],
            ];
            if (!isset($map[$cat])) {
                return response()->json(['data' => [], 'current_page' => 1, 'last_page' => 1, 'per_page' => $perPage, 'total' => 0]);
            }
            $keywords = $map[$cat];
            $query->whereHas('category', function($q) use ($keywords) {
                $q->where(function($qq) use ($keywords){
                    foreach ($keywords as $i => $kw) {
                        $method = $i === 0 ? 'where' : 'orWhere';
                        $qq->$method('name', 'like', '%'.$kw.'%');
                    }
                });
            });
        }
        $query->orderByDesc('id');
        $p = $query->paginate($perPage, ['*'], 'page', $page);
        $p->getCollection()->transform(function($l){
            return [
                'id' => $l->id,
                'title' => $l->title,
                'price' => $l->price,
                'location' => $l->location,
                'category' => optional($l->category)->name,
                'owner' => optional($l->user)->email,
                'created_at' => optional($l->created_at)->toDateTimeString(),
            ];
        });
        return response()->json($p);
    }

    // Brokers totals
    public function brokersCounts()
    {
        $total = User::where('role', 'broker')->count();
        $pending = User::where('role', 'broker')->where('broker_status', 'pending')->count();
        return response()->json(['total' => (int)$total, 'pending' => (int)$pending]);
    }

    // Brokers list (admin): paginated
    public function brokersList(Request $request)
    {
        $perPage = max(1, min((int) $request->query('per_page', 20), 100));
        $page = max(1, (int) $request->query('page', 1));
        $q = User::where('role', 'broker')->orderByDesc('id');
        if ($request->filled('status')) {
            $q->where('broker_status', $request->query('status'));
        }
        $p = $q->paginate($perPage, ['*'], 'page', $page);
        $p->getCollection()->transform(function($u){
            return [
                'id' => $u->id,
                'name' => $u->name ?? trim(($u->first_name.' '.$u->last_name)) ?: $u->email,
                'email' => $u->email,
                'phone' => $u->phone,
                'status' => $u->broker_status,
                'quota_items' => $u->quota_items,
                'quota_storage_mb' => $u->quota_storage_mb,
                'created_at' => optional($u->created_at)->toDateTimeString(),
            ];
        });
        return response()->json($p);
    }

    // All users list (admin): paginated, optional role filter
    public function usersList(Request $request)
    {
        $perPage = max(1, min((int) $request->query('per_page', 20), 100));
        $page = max(1, (int) $request->query('page', 1));
        $q = User::query()->orderByDesc('id');
        if ($request->filled('role')) {
            $q->where('role', $request->query('role'));
        }
        if ($request->filled('search')) {
            $s = $request->query('search');
            $q->where(function($qq) use ($s){
                $qq->where('email','like','%'.$s.'%')
                   ->orWhere('name','like','%'.$s.'%')
                   ->orWhere('first_name','like','%'.$s.'%')
                   ->orWhere('last_name','like','%'.$s.'%');
            });
        }
        $p = $q->paginate($perPage, ['*'], 'page', $page);
        $p->getCollection()->transform(function($u){
            return [
                'id' => $u->id,
                'name' => $u->name ?? trim(($u->first_name.' '.$u->last_name)) ?: $u->email,
                'email' => $u->email,
                'role' => $u->role,
                'broker_status' => $u->broker_status,
                'created_at' => optional($u->created_at)->toDateTimeString(),
            ];
        });
        return response()->json($p);
    }
}

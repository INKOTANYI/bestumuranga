<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\Listing;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ListingController extends Controller
{
    public function publicIndex(Request $request)
    {
        // Public listings with category, owner and images for homepage/promoted ads
        $q = Listing::with(['category','user','images'])
            ->where('is_active', true);

        if ($request->filled('category_id')) $q->where('category_id', $request->integer('category_id'));
        if ($request->filled('type')) $q->where('type', $request->string('type'));
        if ($request->filled('min_price')) $q->where('price', '>=', $request->float('min_price'));
        if ($request->filled('max_price')) $q->where('price', '<=', $request->float('max_price'));
        if ($request->filled('location')) $q->where('location', 'like', '%'.$request->string('location').'%');
        if ($request->filled('broker_id')) $q->where('user_id', $request->integer('broker_id'));

        return response()->json($q->orderByDesc('id')->paginate(20));
    }

    public function show($id)
    {
        $listing = Listing::with(['images','category','user'])->findOrFail($id);
        return response()->json(['data' => $listing]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $listings = Listing::with(['images','category'])->where('user_id', $user->id)->orderByDesc('id')->paginate(20);
        return response()->json($listings);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        // Allow both admin and broker to create listings for the demo
        if (!in_array($user->role, ['admin','broker'], true)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $acting = $user;

        // Quota: items count (only enforce if quota_items is set > 0)
        $count = Listing::where('user_id', $acting->id)->count();
        $quotaItems = (int) ($acting->quota_items ?? 0);
        if ($quotaItems > 0 && $count >= $quotaItems) {
            return response()->json(['message' => 'Quota exceeded: items'], 422);
        }

        $data = $request->validate([
            'category_id' => ['required','integer','exists:categories,id'],
            'title' => ['required','string','max:191'],
            'description' => ['nullable','string'],
            'price' => ['nullable','numeric','min:0'],
            'type' => ['nullable','in:sell,rent'],
            'location' => ['nullable','string','max:191'],
            'location_province' => ['sometimes','nullable','string','max:100'],
            'location_district' => ['sometimes','nullable','string','max:100'],
            'location_sector' => ['sometimes','nullable','string','max:100'],
            'attributes' => ['nullable','array'],
            'images.*' => ['nullable','file','mimes:jpg,jpeg,png,webp','max:8192'],
        ]);

        // Per-category validation for extras/attributes
        $cat = Category::find($data['category_id']);
        $catName = $cat ? strtolower($cat->name) : null;
        $attrs = $request->input('attributes', []);
        if (!is_array($attrs)) $attrs = [];
        switch ($catName) {
            case 'car':
                // Legacy car category support (colour, mileage, transmission, engine_size, year)
                $request->validate([
                    'attributes.colour' => ['nullable','string','max:50'],
                    'attributes.mileage' => ['nullable','numeric','min:0'],
                    'attributes.transmission' => ['nullable','in:automatic,manual'],
                    'attributes.engine_size' => ['nullable','string','max:50'],
                    'attributes.year' => ['nullable','integer','min:1900','max:2100'],
                ]);
                break;
            case 'house':
            case 'houses':
            case 'apartment':
                $request->validate([
                    'attributes.bedrooms' => ['nullable','integer','min:0','max:100'],
                    'attributes.bathrooms' => ['nullable','integer','min:0','max:100'],
                    'attributes.area_sqm' => ['nullable','numeric','min:0'],
                    'attributes.garden' => ['nullable','boolean'],
                    'attributes.garage' => ['nullable','boolean'],
                    'attributes.kitchen' => ['nullable','boolean'],
                    'attributes.wifi' => ['nullable','boolean'],
                    'attributes.other_features' => ['nullable','string','max:255'],
                    'attributes.neighbourhood' => ['nullable','string','max:100'],
                ]);
                break;
            case 'furniture':
                $request->validate([
                    'attributes.material' => ['nullable','string','max:100'],
                    'attributes.condition' => ['nullable','string','max:100'],
                    'attributes.seats_or_size' => ['nullable','string','max:100'],
                ]);
                break;
            case 'plot':
                $request->validate([
                    'attributes.size_value' => ['nullable','numeric','min:0'],
                    'attributes.size_unit' => ['nullable','in:acre,are'],
                    'attributes.zoning' => ['nullable','in:event,commercial,residential'],
                    'attributes.road_access' => ['nullable'],
                ]);
                break;
            case 'vehicles':
                // Modern vehicles category with subcategories and rich specs.
                $sub = $request->input('attributes.subcategory');

                // Common vehicle attributes
                $request->validate([
                    'attributes.subcategory' => ['required','string','in:cars_for_sale,cars_for_rent,car_accessories,spare_parts,wheels_rims'],
                    'attributes.make' => ['required','string','max:100'],
                    'attributes.model' => ['required','string','max:100'],
                    'attributes.year' => ['required','integer','min:1900','max:2100'],
                    'attributes.condition' => ['required','in:new,used,certified_pre_owned'],
                    'attributes.vin' => ['nullable','string','max:50'],
                ]);

                if (in_array($sub, ['cars_for_sale','cars_for_rent'], true)) {
                    $request->validate([
                        'attributes.mileage' => ['nullable','numeric','min:0'],
                        'attributes.transmission' => ['nullable','in:Manual,Automatic'],
                        'attributes.fuel_type' => ['nullable','string','max:50'],
                        'attributes.engine_size' => ['nullable','string','max:50'],
                        'attributes.drive_type' => ['nullable','string','max:20'],
                        'attributes.exterior_color' => ['nullable','string','max:50'],
                        'attributes.interior_color' => ['nullable','string','max:50'],
                        'attributes.doors' => ['nullable','integer','min:1','max:10'],
                        'attributes.seats' => ['nullable','integer','min:1','max:20'],
                        'attributes.negotiable' => ['nullable','boolean'],
                        'attributes.available_from' => ['nullable','date'],
                        'attributes.insurance_included' => ['nullable','boolean'],
                        'attributes.rental_period' => ['nullable','in:daily,weekly,monthly'],
                    ]);
                }

                if (in_array($sub, ['car_accessories','spare_parts'], true)) {
                    $request->validate([
                        'attributes.part_name' => ['required','string','max:150'],
                        'attributes.compatible_models' => ['nullable','string','max:255'],
                        'attributes.part_condition' => ['nullable','in:new,used'],
                        'attributes.quantity' => ['nullable','integer','min:1'],
                        'attributes.part_type' => ['nullable','string','max:100'],
                        // Extended metadata for parts / accessories (all optional)
                        'attributes.brand' => ['nullable','string','max:100'],
                        'attributes.part_number' => ['nullable','string','max:100'],
                        'attributes.oem_type' => ['nullable','in:oem,aftermarket'],
                        'attributes.shipping_option' => ['nullable','in:pickup_only,shipping_available,local_delivery,international_shipping'],
                        'attributes.availability' => ['nullable','in:in_stock,out_of_stock,on_order'],
                        'attributes.compatibility_notes' => ['nullable','string','max:500'],
                        'attributes.fitment_notes' => ['nullable','string','max:500'],
                        'attributes.color_finish' => ['nullable','string','max:100'],
                    ]);
                }

                if ($sub === 'wheels_rims') {
                    $request->validate([
                        'attributes.rim_size' => ['required','numeric','min:8','max:30'],
                        'attributes.bolt_pattern' => ['nullable','string','max:50'],
                        'attributes.offset' => ['nullable','string','max:50'],
                        'attributes.material' => ['nullable','string','max:50'],
                        'attributes.wheel_condition' => ['nullable','in:new,used'],
                        'attributes.finish' => ['nullable','string','max:100'],
                        'attributes.tire_included' => ['nullable','boolean'],
                    ]);
                }
                break;
        }

        $listing = Listing::create([
            'user_id' => $acting->id,
            'category_id' => $data['category_id'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'] ?? null,
            'type' => $data['type'] ?? null,
            'location' => $data['location'] ?? null,
            'attributes' => $data['attributes'] ?? null,
        ]);

        // If new location columns exist, try to set them (ignore if columns missing)
        foreach (['location_province','location_district','location_sector'] as $lk) {
            if (array_key_exists($lk, $data)) {
                $listing->$lk = $data[$lk];
            }
        }
        $listing->save();

        // Handle images + storage quota
        $uploaded = $request->file('images', []);
        $totalNewMb = 0;
        foreach ($uploaded as $file) {
            $totalNewMb += (int) ceil($file->getSize() / (1024*1024));
        }
        $quotaStorage = (int) ($acting->quota_storage_mb ?? 0);
        if ($quotaStorage > 0 && ((int)($acting->storage_used_mb ?? 0) + $totalNewMb) > $quotaStorage) {
            $listing->delete();
            return response()->json(['message' => 'Quota exceeded: storage'], 422);
        }

        foreach ($uploaded as $file) {
            // Store on the public disk so files are accessible via the /storage symlink
            $path = $file->store('listings/'.$acting->id, ['disk' => 'public']);
            $sizeMb = (int) ceil($file->getSize() / (1024*1024));
            Image::create([
                'listing_id' => $listing->id,
                'file_path' => $path,
                'size_mb' => $sizeMb,
            ]);
            $acting->storage_used_mb = (int) ($acting->storage_used_mb ?? 0) + $sizeMb;
        }
        $acting->save();

        return response()->json(['data' => $listing->load('images')]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $listing = Listing::where('user_id', $user->id)->findOrFail($id);
        $data = $request->validate([
            'title' => ['sometimes','string','max:191'],
            'description' => ['sometimes','nullable','string'],
            'price' => ['sometimes','nullable','numeric','min:0'],
            'type' => ['sometimes','nullable','in:sell,rent'],
            'location' => ['sometimes','nullable','string','max:191'],
            'attributes' => ['sometimes','nullable','array'],
            'is_active' => ['sometimes','boolean'],
            'images.*' => ['nullable','file','mimes:jpg,jpeg,png,webp','max:8192'],
        ]);

        // Apply per-category validation on update as well
        $cat = $listing->category; // already linked
        $catName = $cat ? strtolower($cat->name) : null;
        $attrs = $request->input('attributes', []);
        if (!is_array($attrs)) $attrs = [];
        switch ($catName) {
            case 'house':
            case 'houses':
            case 'apartment':
                $request->validate([
                    'attributes.bedrooms' => ['sometimes','nullable','integer','min:0','max:100'],
                    'attributes.bathrooms' => ['sometimes','nullable','integer','min:0','max:100'],
                    'attributes.area_sqm' => ['sometimes','nullable','numeric','min:0'],
                    'attributes.garden' => ['sometimes','nullable','boolean'],
                    'attributes.garage' => ['sometimes','nullable','boolean'],
                    'attributes.kitchen' => ['sometimes','nullable','boolean'],
                    'attributes.wifi' => ['sometimes','nullable','boolean'],
                    'attributes.other_features' => ['sometimes','nullable','string','max:255'],
                    'attributes.neighbourhood' => ['sometimes','nullable','string','max:100'],
                ]);
                break;
            case 'vehicles':
                // Only validate keys we might receive on update; keep lighter than store()
                $request->validate([
                    'attributes.subcategory' => ['sometimes','string'],
                    'attributes.make' => ['sometimes','string','max:100'],
                    'attributes.model' => ['sometimes','string','max:100'],
                    'attributes.year' => ['sometimes','integer','min:1900','max:2100'],
                ]);
                break;
        }

        $listing->update($data);

        // Optional: handle new images (same quota logic)
        $uploaded = $request->file('images', []);
        $totalNewMb = 0;
        foreach ($uploaded as $file) { $totalNewMb += (int) ceil($file->getSize() / (1024*1024)); }
        if (($user->storage_used_mb + $totalNewMb) > $user->quota_storage_mb) {
            return response()->json(['message' => 'Quota exceeded: storage'], 422);
        }
        foreach ($uploaded as $file) {
            // Store on the public disk so files are accessible via the /storage symlink
            $path = $file->store('listings/'.$user->id, ['disk' => 'public']);
            $sizeMb = (int) ceil($file->getSize() / (1024*1024));
            Image::create([
                'listing_id' => $listing->id,
                'file_path' => $path,
                'size_mb' => $sizeMb,
            ]);
            $user->storage_used_mb += $sizeMb;
        }
        if ($totalNewMb > 0) $user->save();

        return response()->json(['data' => $listing->load('images')]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $listing = Listing::where('user_id', $user->id)->with('images')->findOrFail($id);

        // Free up storage_used_mb based on images being deleted
        foreach ($listing->images as $img) {
            $user->storage_used_mb = max(0, $user->storage_used_mb - (int) $img->size_mb);
            Storage::delete($img->file_path);
            $img->delete();
        }
        $user->save();

        $listing->delete();
        return response()->json(['ok' => true]);
    }
}

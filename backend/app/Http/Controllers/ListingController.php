<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Listing;

class ListingController extends Controller
{
    public function index(Request $request)
    {
        $brokerId = $request->query('broker_id');
        $category = $request->query('category');
        $purpose = $request->query('purpose');

        $query = Listing::query();
        if ($brokerId) {
            $query->where('broker_id', $brokerId);
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($purpose) {
            $query->where('purpose', $purpose);
        }

        $listings = $query->orderByDesc('created_at')->get();

        return response()->json($listings);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'broker_id'    => 'required|exists:brokers,id',
            'category'     => 'required|in:house,car',
            'purpose'      => 'required|in:rent,sell',
            'title'        => 'required|string|max:255',
            'city'         => 'required|string|max:255',
            'price'        => 'required|numeric|min:0',
            'status'       => 'nullable|string|max:50',
            'bedrooms'     => 'nullable|integer|min:0|max:50',
            'area'         => 'nullable|integer|min:0|max:1000000',
            'bathrooms'    => 'nullable|integer|min:0|max:50',
            'has_garden'   => 'boolean',
            'has_kitchen'  => 'boolean',
            'has_garage'   => 'boolean',
            'has_cctv'     => 'boolean',
            'province'     => 'nullable|string|max:255',
            'district'     => 'nullable|string|max:255',
            'sector'       => 'nullable|string|max:255',
            'extra_notes'  => 'nullable|string',
            'description'  => 'nullable|string',
            // car-specific attributes (optional)
            'make'         => 'nullable|string|max:255',
            'model'        => 'nullable|string|max:255',
            'year'         => 'nullable|integer|min:1900|max:2100',
            'mileage'      => 'nullable|integer|min:0',
            'transmission' => 'nullable|string|max:50',
            'fuel'         => 'nullable|string|max:50',
            'image'        => 'required|image|max:2048',
        ]);

        if (empty($data['status'])) {
            $data['status'] = 'active';
        }

        // Handle optional main image upload (from multipart/form-data)
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('listings', 'public');
            $data['image_path'] = $path;
        }

        $listing = Listing::create($data);

        // Handle multiple images (images[])
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('listings', 'public');
                $listing->images()->create(['path' => $path]);
            }
        }

        return response()->json([
            'message' => 'Listing created successfully',
            'listing' => $listing,
        ], 201);
    }

    public function show(Listing $listing)
    {
        $listing->load('images');

        return response()->json($listing);
    }

    public function update(Request $request, Listing $listing)
    {
        $data = $request->validate([
            'category'     => 'sometimes|in:house,car',
            'purpose'      => 'sometimes|in:rent,sell',
            'title'        => 'sometimes|required|string|max:255',
            'city'         => 'sometimes|required|string|max:255',
            'price'        => 'sometimes|required|numeric|min:0',
            'status'       => 'sometimes|nullable|string|max:50',
            // car-specific attributes
            'make'         => 'sometimes|nullable|string|max:255',
            'model'        => 'sometimes|nullable|string|max:255',
            'year'         => 'sometimes|nullable|integer|min:1900|max:2100',
            'mileage'      => 'sometimes|nullable|integer|min:0',
            'transmission' => 'sometimes|nullable|string|max:50',
            'fuel'         => 'sometimes|nullable|string|max:50',
            'image'        => 'sometimes|nullable|image|max:2048',
            'images.*'     => 'sometimes|nullable|image|max:2048',
        ]);

        // If a new main image is uploaded, store it and update image_path
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('listings', 'public');
            $data['image_path'] = $path;
        }

        $listing->update($data);

        // Append any new gallery images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('listings', 'public');
                $listing->images()->create(['path' => $path]);
            }
        }

        $listing->load('images');

        return response()->json([
            'message' => 'Listing updated successfully',
            'listing' => $listing,
        ]);
    }

    public function destroy(Listing $listing)
    {
        $listing->delete();

        return response()->json([
            'message' => 'Listing deleted successfully',
        ]);
    }
}

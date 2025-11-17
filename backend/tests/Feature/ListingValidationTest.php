<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ListingValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function makeAdmin(): User
    {
        return User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'quota_items' => 100,
            'quota_storage_mb' => 2048,
            'storage_used_mb' => 0,
            'phone' => '+250700000000',
        ]);
    }

    protected function makeCategory(string $name): Category
    {
        return Category::factory()->create([
            'name' => $name,
        ]);
    }

    public function test_admin_can_create_valid_car_listing(): void
    {
        $admin = $this->makeAdmin();
        $car = $this->makeCategory('Car');
        $this->actingAs($admin);

        $payload = [
            'category_id' => $car->id,
            'title' => 'Toyota Corolla',
            'description' => 'Nice car',
            'price' => 5000,
            'type' => 'sell',
            'location' => 'Kigali, Gasabo, Kimironko',
            'location_province' => 'Kigali City',
            'location_district' => 'Gasabo',
            'location_sector' => 'Kimironko',
            'attributes' => [
                'colour' => 'white',
                'mileage' => 120000,
                'transmission' => 'automatic',
                'engine_size' => '1.6L',
                'year' => 2015,
                'fuel_type' => 'petrol',
            ],
        ];

        $res = $this->postJson('/api/broker/listings', $payload);
        $res->assertOk()->assertJsonStructure(['data' => ['id','title','user_id']]);
    }

    public function test_car_invalid_transmission_rejected(): void
    {
        $admin = $this->makeAdmin();
        $car = $this->makeCategory('Car');
        $this->actingAs($admin);

        $payload = [
            'category_id' => $car->id,
            'title' => 'Toyota',
            'type' => 'sell',
            'attributes' => [
                'transmission' => 'semi-auto',
            ],
        ];

        $this->postJson('/api/broker/listings', $payload)->assertStatus(422);
    }

    public function test_house_validation_for_bedrooms_boolean_fields(): void
    {
        $admin = $this->makeAdmin();
        $house = $this->makeCategory('House');
        $this->actingAs($admin);

        // invalid: garden as string
        $bad = [
            'category_id' => $house->id,
            'title' => 'Family House',
            'type' => 'rent',
            'attributes' => [
                'bedrooms' => 3,
                'bathrooms' => 2,
                'garden' => 'yes',
            ],
        ];
        $this->postJson('/api/broker/listings', $bad)->assertStatus(422);

        // valid: garden boolean, area optional
        $ok = [
            'category_id' => $house->id,
            'title' => 'Family House',
            'type' => 'rent',
            'attributes' => [
                'bedrooms' => 3,
                'bathrooms' => 2,
                'garden' => true,
                'neighbourhood' => 'Remera',
                'area_sqm' => 120,
            ],
        ];
        $this->postJson('/api/broker/listings', $ok)->assertOk();
    }
}

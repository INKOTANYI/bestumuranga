<?php

namespace Tests\Feature;

use Database\Seeders\RwandaLocationsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LocationApiTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->seed(RwandaLocationsSeeder::class);
    }

    public function test_provinces_endpoint_returns_list(): void
    {
        $res = $this->getJson('/api/locations/provinces');
        $res->assertOk()->assertJsonStructure(['data' => [['id','name']]]);
        $this->assertGreaterThan(0, count($res->json('data')));
    }

    public function test_districts_requires_province_id(): void
    {
        $this->getJson('/api/locations/districts')->assertStatus(422);
    }

    public function test_sectors_requires_district_id(): void
    {
        $this->getJson('/api/locations/sectors')->assertStatus(422);
    }

    public function test_cascade_districts_and_sectors(): void
    {
        $provinces = $this->getJson('/api/locations/provinces')->json('data');
        $provinceId = $provinces[0]['id'];
        $districts = $this->getJson('/api/locations/districts?province_id='.$provinceId)->json('data');
        $this->assertIsArray($districts);
        if (count($districts) > 0) {
            $districtId = $districts[0]['id'];
            $sectors = $this->getJson('/api/locations/sectors?district_id='.$districtId)->json('data');
            $this->assertIsArray($sectors);
        }
    }
}

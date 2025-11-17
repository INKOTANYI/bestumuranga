<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\SocialController;
use App\Http\Controllers\AIController;
use App\Http\Controllers\LocationController;

Route::get('/ping', function () {
    return response()->json(['ok' => true]);
});

// Auth routes for SPA (Sanctum, stateful cookies)
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/check-email', [AuthController::class, 'checkEmail']);
Route::get('/auth/check-phone', [AuthController::class, 'checkPhone']);

// For the demo: accept session-authenticated users as well
Route::middleware('auth')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/request-broker', [AuthController::class, 'requestBroker']);

    // Metrics (broker sees own, admin sees global)
    Route::get('/metrics/listings-7d', [AdminController::class, 'listings7d']);

    // Broker-only (approved) listings management + inquiries
    Route::middleware('role:broker,admin')->group(function () {
        Route::get('/broker/listings', [ListingController::class, 'index']);
        Route::post('/broker/listings', [ListingController::class, 'store']);
        Route::put('/broker/listings/{id}', [ListingController::class, 'update']);
        Route::delete('/broker/listings/{id}', [ListingController::class, 'destroy']);

        // Broker inquiries
        Route::get('/broker/inquiries', [InquiryController::class, 'brokerIndex']);
        Route::post('/broker/inquiries/{id}/respond', [InquiryController::class, 'markResponded']);
    });

    // Admin endpoints
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/brokers/pending', [AdminController::class, 'pendingBrokers']);
        Route::post('/admin/brokers/{id}/approve', [AdminController::class, 'approveBroker']);
        Route::post('/admin/brokers/{id}/reject', [AdminController::class, 'rejectBroker']);
        Route::post('/admin/brokers/{id}/quota', [AdminController::class, 'updateQuota']);

        // Placeholder admin data (to be replaced later)
        Route::get('/admin/support/inbox', [AdminController::class, 'supportInbox']);
        Route::get('/admin/projects', [AdminController::class, 'projectsList']);
        Route::get('/admin/properties/pending', [AdminController::class, 'propertiesPending']);

        // Category metrics and listings
        Route::get('/admin/categories/counts', [AdminController::class, 'categoryCounts']);
        Route::get('/admin/categories/listings', [AdminController::class, 'listingsByCategory']);

        // Brokers counts (total, pending)
        Route::get('/admin/brokers/counts', [AdminController::class, 'brokersCounts']);
        Route::get('/admin/brokers', [AdminController::class, 'brokersList']);

        // All users
        Route::get('/admin/users', [AdminController::class, 'usersList']);
    });
});

// Public endpoints
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/listings', [ListingController::class, 'publicIndex']);
Route::get('/listings/{id}', [ListingController::class, 'show']);
// Locations (public). Provinces can be filtered by country=RW|DRC.
Route::get('/locations/provinces', [LocationController::class, 'provinces']);
Route::get('/locations/districts', [LocationController::class, 'districts']); // Rwanda
Route::get('/locations/sectors', [LocationController::class, 'sectors']);     // Rwanda
Route::get('/locations/cities', [LocationController::class, 'cities']);       // DRC
Route::get('/locations/territories', [LocationController::class, 'territories']); // DRC

// Inquiries: allow guest or logged in users
Route::post('/inquiries', [InquiryController::class, 'store']);

// API v1: Social and AI endpoints
Route::prefix('v1')->group(function () {
    // Social login (public)
    Route::post('/auth/social-login', [AuthController::class, 'socialLogin']);

    // Social: admin protected
    Route::middleware(['auth','role:admin'])->group(function () {
        Route::get('/social/posts', [SocialController::class, 'posts']);
        Route::post('/social/shares', [SocialController::class, 'share']);
    });

    // AI (public): listing description generator (bypass CSRF and stateful cookies)
    Route::post('/ai/listing-descriptions', [AIController::class, 'generateListingDescription'])
        ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class, \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class]);
    Route::get('/ai/recommendations', [AIController::class, 'recommendations']);
    Route::post('/ai/chat-sessions', [AIController::class, 'chatSessions']);
});


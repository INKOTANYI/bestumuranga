<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BrokerController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\InquiryController;

Route::post('/brokers/register', [BrokerController::class, 'store']);
Route::post('/brokers/login', [BrokerController::class, 'login']);
Route::get('/brokers/check-unique', [BrokerController::class, 'checkUnique']);

// Simple admin broker management (protected only by frontend hardcoded admin credentials)
Route::get('/admin/brokers', [BrokerController::class, 'index']);
Route::patch('/admin/brokers/{broker}/toggle', [BrokerController::class, 'toggleStatus']);

Route::get('/listings', [ListingController::class, 'index']);
Route::post('/listings', [ListingController::class, 'store']);
Route::get('/listings/{listing}', [ListingController::class, 'show']);
Route::put('/listings/{listing}', [ListingController::class, 'update']);
Route::delete('/listings/{listing}', [ListingController::class, 'destroy']);

Route::post('/contact-messages', [ContactMessageController::class, 'store']);
Route::get('/inquiries', [InquiryController::class, 'index']);
Route::post('/inquiries', [InquiryController::class, 'store']);

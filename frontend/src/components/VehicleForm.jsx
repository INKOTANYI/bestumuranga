import React from 'react'

export default function VehicleForm({
  vehicleSubcat,
  setVehicleSubcat,
  vehicleMake,
  setVehicleMake,
  vehicleModel,
  setVehicleModel,
  vehicleYear,
  setVehicleYear,
  vehicleCondition,
  setVehicleCondition,
  showStep2Errors,
  vehicleMileage,
  setVehicleMileage,
  vehicleTransmission,
  setVehicleTransmission,
  vehicleFuel,
  setVehicleFuel,
  vehicleEngineSize,
  setVehicleEngineSize,
  vehicleDriveType,
  setVehicleDriveType,
  vehicleExterior,
  setVehicleExterior,
  vehicleInterior,
  setVehicleInterior,
  vehicleDoors,
  setVehicleDoors,
  vehicleSeats,
  setVehicleSeats,
  vehicleAvailableFrom,
  setVehicleAvailableFrom,
  vehicleNegotiable,
  setVehicleNegotiable,
  vehicleInsuranceIncluded,
  setVehicleInsuranceIncluded,
  partName,
  setPartName,
  partCompatible,
  setPartCompatible,
  partCondition,
  setPartCondition,
  partQuantity,
  setPartQuantity,
  partType,
  setPartType,
  partBrand,
  setPartBrand,
  partNumber,
  setPartNumber,
  partOemType,
  setPartOemType,
  partShippingOption,
  setPartShippingOption,
  partAvailability,
  setPartAvailability,
  partCompatibilityNotes,
  setPartCompatibilityNotes,
  partFitmentNotes,
  setPartFitmentNotes,
  partColorFinish,
  setPartColorFinish,
  rimSize,
  setRimSize,
  boltPattern,
  setBoltPattern,
  rimOffset,
  setRimOffset,
  rimMaterial,
  setRimMaterial,
  rimFinish,
  setRimFinish,
  rimCondition,
  setRimCondition,
  tireIncluded,
  setTireIncluded,
  vehicleRentalPeriod,
  setVehicleRentalPeriod,
}) {
  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-4 md:p-6 space-y-6 shadow-sm">
      <div>
        <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-1">Vehicle details</h4>
        <p className="text-[11px] md:text-xs text-gray-500">
          Fill in specific details about this vehicle or part so buyers can easily find it.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">
            Vehicle sub-category
          </label>
          <select
            value={vehicleSubcat}
            onChange={e => setVehicleSubcat(e.target.value)}
            className="mt-1 block w-full rounded-full bg-white border border-gray-300 px-3 py-2 text-sm text-gray-900"
          >
            <option value="">Select</option>
            <option value="cars_for_sale">Car for Sale</option>
            <option value="cars_for_rent">Car for Rent</option>
          </select>
          {showStep2Errors && !vehicleSubcat && (
            <p className="mt-1 text-[11px] text-red-500">Vehicle type is required.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Make</label>
            <input
              type="text"
              value={vehicleMake}
              onChange={e => setVehicleMake(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
            />
            {showStep2Errors && !vehicleMake && (
              <p className="mt-1 text-[11px] text-red-500">Make is required.</p>
            )}
          </div>
          <div>
            <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Model</label>
            <input
              type="text"
              value={vehicleModel}
              onChange={e => setVehicleModel(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text[14px] text-gray-900"
            />
            {showStep2Errors && !vehicleModel && (
              <p className="mt-1 text-[11px] text-red-500">Model is required.</p>
            )}
          </div>
          <div>
            <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Year</label>
            <input
              type="number"
              value={vehicleYear}
              onChange={e => setVehicleYear(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
            />
            {showStep2Errors && !vehicleYear && (
              <p className="mt-1 text-[11px] text-red-500">Year is required.</p>
            )}
          </div>
          <div>
            <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Condition</label>
            <select
              value={vehicleCondition}
              onChange={e => setVehicleCondition(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
            >
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="certified_pre_owned">Certified pre-owned</option>
            </select>
          </div>
          
        </div>
      </div>

      {(vehicleSubcat === 'cars_for_sale' || vehicleSubcat === 'cars_for_rent') && (
        <div className="border-t border-gray-200 pt-4 mt-2 space-y-4 bg-gray-100 p-4">
          <h5 className="text-xs md:text-sm font-semibold text-gray-900">Car details</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Mileage (km)</label>
              <input
                type="number"
                value={vehicleMileage}
                onChange={e => setVehicleMileage(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
              />
              <p className="mt-1 text-[11px] text-gray-400">Approximate total distance driven.</p>
            </div>
            <div>
              <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Transmission</label>
              <select
                value={vehicleTransmission}
                onChange={e => setVehicleTransmission(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
              >
                <option value="">Select</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Fuel type</label>
              <input
                type="text"
                value={vehicleFuel}
                onChange={e => setVehicleFuel(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
              />
              <p className="mt-1 text-[11px] text-gray-400">Example: Petrol, Diesel, Hybrid, Electric.</p>
            </div>
            <div>
              <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Engine size</label>
              <input
                type="text"
                value={vehicleEngineSize}
                onChange={e => setVehicleEngineSize(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
              />
              <p className="mt-1 text-[11px] text-gray-400">For example: 1.8L, 2000cc.</p>
            </div>
            <div>
              <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Drive type</label>
              <input
                type="text"
                value={vehicleDriveType}
                onChange={e => setVehicleDriveType(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Exterior colour</label>
              <input
                type="text"
                value={vehicleExterior}
                onChange={e => setVehicleExterior(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Interior colour</label>
              <input
                type="text"
                value={vehicleInterior}
                onChange={e => setVehicleInterior(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Doors</label>
              <input
                type="number"
                value={vehicleDoors}
                onChange={e => setVehicleDoors(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
              />
              {showStep2Errors && !vehicleYear && (
                <p className="mt-1 text-sm text-red-500">Year is required.</p>
              )}
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-900 mb-1">Condition</label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={vehicleNegotiable}
                onChange={e => setVehicleNegotiable(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Negotiable
            </label>
            <label className="inline-flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={vehicleInsuranceIncluded}
                onChange={e => setVehicleInsuranceIncluded(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Insurance included
            </label>
          </div>
        </div>
      )}

      {(vehicleSubcat === 'car_accessories' || vehicleSubcat === 'spare_parts') && (
        <div className="border-t border-gray-200 pt-4 mt-2">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs md:text-sm font-semibold text-gray-900">Car accessories / Spare parts</h5>
                <p className="text-[11px] md:text-xs text-gray-500">
                  Add clear details so buyers know exactly which part or accessory they are getting.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              <div>
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">
                  Part / accessory name
                </label>
                <input
                  type="text"
                  value={partName}
                  onChange={e => setPartName(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Quantity</label>
                <input
                  type="number"
                  value={partQuantity}
                  onChange={e => setPartQuantity(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Condition</label>
                <select
                  value={partCondition}
                  onChange={e => setPartCondition(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Category / type</label>
                <input
                  type="text"
                  value={partType}
                  onChange={e => setPartType(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Brand / Manufacturer</label>
                <input
                  type="text"
                  value={partBrand}
                  onChange={e => setPartBrand(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Part number / SKU</label>
                <input
                  type="text"
                  value={partNumber}
                  onChange={e => setPartNumber(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                />
              </div>

              <div>
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">OEM vs Aftermarket</label>
                <select
                  value={partOemType}
                  onChange={e => setPartOemType(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="oem">OEM (original)</option>
                  <option value="aftermarket">Aftermarket</option>
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Availability</label>
                <select
                  value={partAvailability}
                  onChange={e => setPartAvailability(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="in_stock">In stock</option>
                  <option value="out_of_stock">Out of stock</option>
                  <option value="on_order">On order</option>
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Shipping / pickup</label>
                <select
                  value={partShippingOption}
                  onChange={e => setPartShippingOption(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                >
                  <option value="">Select</option>
                  <option value="pickup_only">Pickup only</option>
                  <option value="shipping_available">Shipping available</option>
                  <option value="local_delivery">Local delivery</option>
                  <option value="international_shipping">International shipping</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">
                  Compatible models (optional)
                </label>
                <input
                  type="text"
                  value={partCompatible}
                  onChange={e => setPartCompatible(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                />
                <p className="mt-1 text-[11px] text-gray-400">
                  Example: Toyota Corolla 2010-2018, Honda Civic 2012-2016.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">
                  Compatibility / fitment notes (optional)
                </label>
                <textarea
                  value={partCompatibilityNotes}
                  onChange={e => setPartCompatibilityNotes(e.target.value)}
                  rows={2}
                  className="mt-1 w-full rounded-2xl border border-gray-300 bg-white p-2 text-sm md:text-[13px] text-gray-900"
                  placeholder="Model years, trim levels, VIN notes, left/right side, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">
                  Color / finish (optional)
                </label>
                <input
                  type="text"
                  value={partColorFinish}
                  onChange={e => setPartColorFinish(e.target.value)}
                  className="mt-1 w-full rounded-full border border-gray-300 bg-white p-2 text-sm md:text-[14px] text-gray-900"
                  placeholder="e.g. Black, Chrome, Silver"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {vehicleSubcat === 'wheels_rims' && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <h5 className="text-xs font-semibold text-gray-700">Wheels / Rims</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rim size (inches)</label>
              <input
                type="number"
                value={rimSize}
                onChange={e => setRimSize(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bolt pattern</label>
              <input
                type="text"
                value={boltPattern}
                onChange={e => setBoltPattern(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
              />
              <p className="mt-1 text-[11px] text-gray-400">Example: 5x114.3, 4x100.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Offset (ET)</label>
              <input
                type="text"
                value={rimOffset}
                onChange={e => setRimOffset(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
              />
              <p className="mt-1 text-[11px] text-gray-400">Positive or negative ET value, e.g. +35.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Material</label>
              <input
                type="text"
                value={rimMaterial}
                onChange={e => setRimMaterial(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Finish</label>
              <input
                type="text"
                value={rimFinish}
                onChange={e => setRimFinish(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={rimCondition}
                onChange={e => setRimCondition(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <label className="inline-flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={tireIncluded}
                onChange={e => setTireIncluded(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Tires included
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

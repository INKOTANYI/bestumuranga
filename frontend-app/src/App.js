import { useEffect, useState } from 'react';
import { FaBed, FaBath, FaHome, FaBuilding, FaUserTie, FaEnvelope } from 'react-icons/fa';
import './App.css';
import rwandaLocations from './data/rwanda-locations.json';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bestumuranga.com/api';

function BrokerDashboard({ broker }) {
  const [listings, setListings] = useState([]);
  const [editListing, setEditListing] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    city: '',
    price: '',
    image: null,
    images: [],
  });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [listingError, setListingError] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    category: 'house',
    purpose: 'rent',
    title: '',
    city: '',
    price: '',
    bedrooms: '',
    area: '',
    bathrooms: '',
    has_garden: false,
    has_kitchen: false,
    has_garage: false,
    has_cctv: false,
    province: '',
    district: '',
    sector: '',
    extra_notes: '',
    description: '',
    // car-specific fields
    make: '',
    model: '',
    year: '',
    mileage: '',
    transmission: '',
    fuel: '',
    image: null,
    images: [],
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchListings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/listings?broker_id=${broker.id}`);
      if (!res.ok) {
        throw new Error('Failed to load listings');
      }
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error(err);
      setListingError(err.message);
    }
  };

  useEffect(() => {
    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [broker.id]);

  const startEditListing = (listing) => {
    setEditListing(listing);
    setEditForm({
      title: listing.title || '',
      city: listing.city || '',
      price: String(listing.price ?? ''),
      image: null,
      images: [],
    });
    setListingError(null);
  };

  const handleCreateChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setCreateForm((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'file'
          ? name === 'images'
            ? Array.from(files || [])
            : (files && files[0]) || null
          : value,
      // reset dependent fields when parent changes
      ...(name === 'province' ? { district: '', sector: '' } : {}),
      ...(name === 'district' ? { sector: '' } : {}),
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.image) {
      setCreateError('Main image is required. Please select a main image.');
      return;
    }
    setCreateLoading(true);
    setCreateError(null);

    try {
      const formData = new FormData();
      formData.append('broker_id', broker.id);
      formData.append('category', createForm.category);
      formData.append('purpose', createForm.purpose);
      formData.append('title', createForm.title);
      formData.append('city', createForm.city);
      formData.append('price', createForm.price || '0');

      if (createForm.category === 'house') {
        if (createForm.bedrooms !== '') formData.append('bedrooms', String(createForm.bedrooms));
        if (createForm.area !== '') formData.append('area', String(createForm.area));
        if (createForm.bathrooms !== '') formData.append('bathrooms', String(createForm.bathrooms));
        formData.append('has_garden', createForm.has_garden ? '1' : '0');
        formData.append('has_kitchen', createForm.has_kitchen ? '1' : '0');
        formData.append('has_garage', createForm.has_garage ? '1' : '0');
        formData.append('has_cctv', createForm.has_cctv ? '1' : '0');
        if (createForm.province) formData.append('province', createForm.province);
        if (createForm.district) formData.append('district', createForm.district);
        if (createForm.sector) formData.append('sector', createForm.sector);
      }

      if (createForm.extra_notes) formData.append('extra_notes', createForm.extra_notes);

      if (createForm.category === 'car') {
        if (createForm.make) formData.append('make', createForm.make);
        if (createForm.model) formData.append('model', createForm.model);
        if (createForm.year) formData.append('year', String(createForm.year));
        if (createForm.mileage) formData.append('mileage', String(createForm.mileage));
        if (createForm.transmission) formData.append('transmission', createForm.transmission);
        if (createForm.fuel) formData.append('fuel', createForm.fuel);
      }

      let descriptionToSend = createForm.description;
      if (createForm.category === 'car' && !descriptionToSend) {
        const bits = [];
        if (createForm.year) bits.push(createForm.year);
        if (createForm.make) bits.push(createForm.make);
        if (createForm.model) bits.push(createForm.model);
        const main = bits.length > 0 ? bits.join(' ') : 'Car listing';
        const mileageText = createForm.mileage ? ` with mileage of about ${createForm.mileage} km` : '';
        descriptionToSend = `${main}${mileageText}. Listed ${createForm.purpose === 'sell' ? 'for sale' : 'for rent'} in ${createForm.city || 'Rwanda'}.`;
      }
      if (descriptionToSend) {
        formData.append('description', descriptionToSend);
      }
      if (createForm.image) {
        formData.append('image', createForm.image);
      }
      if (createForm.images && createForm.images.length > 0) {
        createForm.images.forEach((file) => {
          formData.append('images[]', file);
        });
      }

      const response = await fetch(`${API_BASE_URL}/listings`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to create listing');
      }

      setCreateForm({
        category: createForm.category,
        purpose: createForm.purpose,
        title: '',
        city: '',
        price: '',
        bedrooms: '',
        area: '',
        bathrooms: '',
        has_garden: false,
        has_kitchen: false,
        has_garage: false,
        has_cctv: false,
        province: '',
        district: '',
        sector: '',
        extra_notes: '',
        description: '',
        make: '',
        model: '',
        year: '',
        mileage: '',
        transmission: '',
        fuel: '',
        image: null,
        images: [],
      });

      await fetchListings();
    } catch (err) {
      console.error(err);
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFileChange = (e) => {
    const { name, files } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === 'images'
          ? Array.from(files || [])
          : (files && files[0]) || null,
    }));
  };

  const saveEditListing = async (e) => {
    e.preventDefault();
    if (!editListing) return;
    setListingLoading(true);
    setListingError(null);

    try {
      const hasFiles = editForm.image || (editForm.images && editForm.images.length > 0);

      let response;
      if (hasFiles) {
        const formData = new FormData();
        formData.append('title', editForm.title);
        formData.append('city', editForm.city);
        formData.append('price', parseFloat(editForm.price || '0'));
        if (editForm.image) {
          formData.append('image', editForm.image);
        }
        if (editForm.images && editForm.images.length > 0) {
          editForm.images.forEach((file) => {
            formData.append('images[]', file);
          });
        }

        response = await fetch(`${API_BASE_URL}/listings/${editListing.id}`, {
          method: 'PUT',
          headers: {
            Accept: 'application/json',
          },
          body: formData,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/listings/${editListing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            title: editForm.title,
            city: editForm.city,
            price: parseFloat(editForm.price || '0'),
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update listing');
      }

      setEditListing(null);
      await fetchListings();
    } catch (err) {
      console.error(err);
      setListingError(err.message);
    } finally {
      setListingLoading(false);
    }
  };

  const deleteListing = async (listingId) => {
    setListingLoading(true);
    setListingError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to delete listing');
      }

      await fetchListings();
    } catch (err) {
      console.error(err);
      setListingError(err.message);
    } finally {
      setListingLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const targetId = confirmDelete.id;
    setConfirmDelete(null);
    await deleteListing(targetId);
  };

  const totalListings = listings.length;
  const totalValue = listings.reduce((sum, l) => sum + Number(l.price || 0), 0);

  const provinces = rwandaLocations.provinces || [];
  const selectedProvince = provinces.find((p) => p.name === createForm.province);
  const districts = selectedProvince ? selectedProvince.districts : [];
  const selectedDistrict = districts.find((d) => d.name === createForm.district);
  const sectors = selectedDistrict ? selectedDistrict.sectors : [];

  const generateHouseDescription = () => {
    if (createForm.category !== 'house') return;

    const parts = [];
    const { purpose, bedrooms, bathrooms, province, district, sector } = createForm;

    // Sentence 1: overview
    const purposeText = purpose === 'sell' ? 'for sale' : 'for rent';
    const bedText = bedrooms ? `${bedrooms} bedroom` : 'spacious';
    const locationBits = [sector, district, province].filter(Boolean).join(', ');
    parts.push(
      `Beautiful ${bedText} house ${purposeText}${locationBits ? ` in ${locationBits}` : ''}.`
    );

    // Sentence 2: interior
    const interiorBits = [];
    if (bathrooms) interiorBits.push(`${bathrooms} bathrooms`);
    interiorBits.push('bright living areas');
    parts.push(`It offers ${interiorBits.join(', ')}.`);

    // Sentence 3: amenities
    const amenityBits = [];
    if (createForm.has_garden) amenityBits.push('a private garden');
    if (createForm.has_kitchen) amenityBits.push('an indoor kitchen');
    if (createForm.has_garage) amenityBits.push('a secure garage');
    if (createForm.has_cctv) amenityBits.push('CCTV cameras for added security');
    if (amenityBits.length > 0) {
      parts.push(`Outside and around the property you will find ${amenityBits.join(', ')}.`);
    }

    // Sentence 4: extra notes + call to action
    if (createForm.extra_notes) {
      parts.push(`Additional details: ${createForm.extra_notes.trim()}.`);
    }
    parts.push('This home offers great value in a calm neighbourhood for serious clients.');

    let text = parts.join(' ');
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount < 90) {
      text +=
        ' It is ideal for families or professionals looking for comfort, accessibility and a safe environment in Kigali.';
    }

    setCreateForm((prev) => ({ ...prev, description: text }));
  };

  const generateCarDescription = () => {
    if (createForm.category !== 'car') return;

    const parts = [];
    const { make, model, year, mileage, transmission, fuel, purpose, city, extra_notes } = createForm;

    const titleBits = [];
    if (year) titleBits.push(year);
    if (make) titleBits.push(make);
    if (model) titleBits.push(model);
    const mainLabel = titleBits.length > 0 ? titleBits.join(' ') : 'Car';

    const purposeText = purpose === 'sell' ? 'for sale' : 'for rent';
    const locationText = city ? ` in ${city}` : '';

    parts.push(`${mainLabel} ${purposeText}${locationText}.`);

    const specBits = [];
    if (mileage) specBits.push(`around ${mileage} km mileage`);
    if (transmission) specBits.push(`${transmission} transmission`);
    if (fuel) specBits.push(`${fuel} engine`);
    if (specBits.length > 0) {
      parts.push(`It comes with ${specBits.join(', ')}.`);
    }

    if (extra_notes) {
      parts.push(`Additional notes: ${extra_notes.trim()}.`);
    }

    parts.push('Ideal for serious clients looking for a reliable vehicle in good condition.');

    const text = parts.join(' ');
    setCreateForm((prev) => ({ ...prev, description: text }));
  };

  return (
    <div className="layout-content">
      <div className="widget-row">
        <button
          type="button"
          className="widget-card clickable hover:shadow-lg hover:-translate-y-0.5 transition transform bg-slate-900/70 border border-slate-700/70"
          onClick={() => setShowCreate((prev) => !prev)}
        >
          <div className="widget-title">Listings</div>
          <div className="widget-value">{totalListings}</div>
          <div className="widget-sub">Manage your property listings</div>
        </button>
        <div className="widget-card clickable">
          <div className="widget-title">Update broker info</div>
          <div className="widget-sub">Profile & contact details</div>
        </div>
        <div className="widget-card clickable">
          <div className="widget-title">Settings</div>
          <div className="widget-sub">Account & preferences</div>
        </div>
      </div>

      {showCreate && (
        <div className="card mt-4 max-w-4xl mx-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 shadow-2xl rounded-2xl p-6 md:p-8">
          <div className="card-header mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-sky-500/20 text-sky-100 border border-sky-400/80 text-lg shadow shadow-sky-500/40">
                +
              </div>
              <div>
                <h2 className="card-title text-xl md:text-2xl font-semibold text-slate-50 tracking-tight">
                  Create new listing
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
                  Fill in the details below to publish a new house or car listing on BestUmuranga.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-1 text-[11px]">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 text-sky-200 px-3 py-1 border border-sky-400/70 shadow-sm">
                <span className="h-6 w-6 flex items-center justify-center rounded-full bg-sky-500/80 text-white text-xs font-semibold">
                  BK
                </span>
                <span className="font-semibold tracking-wide uppercase">{broker.first_name} {broker.last_name}</span>
              </span>
              <span className="text-slate-500">
                New listings are visible immediately in your dashboard.
              </span>
            </div>
          </div>
          {createError && (
            <div className="error-text mb-3 text-sm text-red-400 bg-red-900/40 border border-red-700/60 rounded px-3 py-2">
              {createError}
            </div>
          )}
          <form
            onSubmit={handleCreateSubmit}
            className="form-inline-grid grid gap-4 md:grid-cols-2 text-xs md:text-sm"
          >
            <div className="form-group flex flex-col">
              <label
                htmlFor="create_category"
                className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase"
              >
                Category
              </label>
              <select
                id="create_category"
                name="category"
                value={createForm.category}
                onChange={handleCreateChange}
                required
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
              >
                <option value="house">House</option>
                <option value="car">Car</option>
              </select>
            </div>
            <div className="form-group flex flex-col">
              <label
                htmlFor="create_purpose"
                className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase"
              >
                Purpose
              </label>
              <select
                id="create_purpose"
                name="purpose"
                value={createForm.purpose}
                onChange={handleCreateChange}
                required
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
              >
                <option value="rent">Rent</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div className="form-group flex flex-col md:col-span-2">
              <label
                htmlFor="create_title"
                className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase"
              >
                Listing title
              </label>
              <input
                id="create_title"
                type="text"
                name="title"
                value={createForm.title}
                onChange={handleCreateChange}
                required
                placeholder="e.g. 3 bedroom house in Remera, Kigali"
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
              />
            </div>
            <div className="form-group flex flex-col">
              <label
                htmlFor="create_city"
                className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase"
              >
                City
              </label>
              <input
                id="create_city"
                type="text"
                name="city"
                value={createForm.city}
                onChange={handleCreateChange}
                required
                placeholder="e.g. Kigali"
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
              />
            </div>
            <div className="form-group flex flex-col">
              <label
                htmlFor="create_price"
                className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase"
              >
                Price (RWF)
              </label>
              <input
                id="create_price"
                type="number"
                name="price"
                value={createForm.price}
                onChange={handleCreateChange}
                min="0"
                step="1"
                required
                placeholder="e.g. 500000"
                className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
              />
            </div>

            {createForm.category === 'house' ? (
              <>
                <div className="form-group flex flex-col md:flex-row md:items-end md:col-span-2 gap-4">
                  <div className="flex-1 flex flex-col">
                    <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      min="0"
                      value={createForm.bedrooms}
                      onChange={handleCreateChange}
                      placeholder="e.g. 3"
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                      Area (m²)
                    </label>
                    <input
                      type="number"
                      name="area"
                      min="0"
                      value={createForm.area}
                      onChange={handleCreateChange}
                      placeholder="e.g. 120"
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      min="0"
                      value={createForm.bathrooms}
                      onChange={handleCreateChange}
                      placeholder="e.g. 2"
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    />
                  </div>
                </div>

                <div className="form-group flex flex-wrap md:col-span-2 gap-4 text-[11px] md:text-xs text-slate-200">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="has_garden"
                      checked={createForm.has_garden}
                      onChange={handleCreateChange}
                      className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500/60"
                    />
                    <span>Garden</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="has_kitchen"
                      checked={createForm.has_kitchen}
                      onChange={handleCreateChange}
                      className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500/60"
                    />
                    <span>Kitchen inside</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="has_garage"
                      checked={createForm.has_garage}
                      onChange={handleCreateChange}
                      className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500/60"
                    />
                    <span>Garage</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="has_cctv"
                      checked={createForm.has_cctv}
                      onChange={handleCreateChange}
                      className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-sky-500 focus:ring-sky-500/60"
                    />
                    <span>CCTV camera</span>
                  </label>
                </div>

                <div className="form-group flex flex-col md:col-span-2 md:grid md:grid-cols-3 md:gap-4">
                  <div className="flex flex-col">
                    <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                      Province
                    </label>
                    <select
                      name="province"
                      value={createForm.province}
                      onChange={handleCreateChange}
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    >
                      <option value="">Select province</option>
                      {provinces.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col mt-3 md:mt-0">
                    <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                      District
                    </label>
                    <select
                      name="district"
                      value={createForm.district}
                      onChange={handleCreateChange}
                      disabled={!createForm.province}
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm disabled:opacity-50"
                    >
                      <option value="">Select district</option>
                      {districts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col mt-3 md:mt-0">
                    <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                      Sector
                    </label>
                    <select
                      name="sector"
                      value={createForm.sector}
                      onChange={handleCreateChange}
                      disabled={!createForm.district}
                      className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm disabled:opacity-50"
                    >
                      <option value="">Select sector</option>
                      {sectors.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group flex flex-col md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                    Extra notes (optional)
                  </label>
                  <textarea
                    name="extra_notes"
                    rows={2}
                    value={createForm.extra_notes}
                    onChange={handleCreateChange}
                    placeholder="Anything special about this property (close to tarmac, furnished, etc.)"
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                  />
                </div>

                <div className="form-group flex flex-col md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
                      Listing description
                    </label>
                    <button
                      type="button"
                      onClick={generateHouseDescription}
                      className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-sky-500/40 hover:bg-sky-400 hover:shadow-sky-400/50 border border-sky-300 cursor-pointer transition"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[9px] font-bold text-white">
                        AI
                      </span>
                      <span>Generate description</span>
                    </button>
                  </div>
                  <textarea
                    name="description"
                    rows={4}
                    value={createForm.description}
                    onChange={handleCreateChange}
                    placeholder="AI-generated description will appear here. You can still edit before publishing."
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group flex flex-col md:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                    Car details
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-1">
                    <input
                      type="text"
                      name="make"
                      value={createForm.make}
                      onChange={handleCreateChange}
                      placeholder="Make (e.g. Toyota)"
                      className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    />
                    <input
                      type="text"
                      name="model"
                      value={createForm.model}
                      onChange={handleCreateChange}
                      placeholder="Model (e.g. RAV4)"
                      className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    />
                    <input
                      type="number"
                      name="year"
                      value={createForm.year}
                      onChange={handleCreateChange}
                      placeholder="Year"
                      className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    />
                    <input
                      type="number"
                      name="mileage"
                      value={createForm.mileage}
                      onChange={handleCreateChange}
                      placeholder="Mileage (km)"
                      className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <select
                      name="transmission"
                      value={createForm.transmission}
                      onChange={handleCreateChange}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    >
                      <option value="">Transmission</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Manual">Manual</option>
                    </select>
                    <select
                      name="fuel"
                      value={createForm.fuel}
                      onChange={handleCreateChange}
                      className="block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                    >
                      <option value="">Fuel type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Electric">Electric</option>
                    </select>
                  </div>
                </div>

                <div className="form-group flex flex-col md:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={generateCarDescription}
                      className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-sky-500/40 hover:bg-sky-400 hover:shadow-sky-400/50 border border-sky-300 cursor-pointer transition"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[9px] font-bold text-white">
                        AI
                      </span>
                      <span>Generate description</span>
                    </button>
                  </div>
                  <textarea
                    name="description"
                    rows={3}
                    value={createForm.description}
                    onChange={handleCreateChange}
                    placeholder="Short description of this car (condition, transmission, fuel, etc.)"
                    className="mt-1 block w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/60 text-xs md:text-sm"
                  />
                </div>
              </>
            )}
            <div className="form-group flex flex-col md:col-span-2 mt-1 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                  Main image (required)
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  required
                  onChange={handleCreateChange}
                  className="block w-full text-xs md:text-sm text-slate-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-500/90 file:text-white hover:file:bg-sky-400 cursor-pointer bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1.5"
                />
                {createForm.image && (
                  <p className="mt-1 text-[11px] text-slate-400 truncate">
                    Selected main: {createForm.image.name}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 mb-1 tracking-wide uppercase">
                  Gallery images (multiple, optional)
                </label>
                <input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleCreateChange}
                  className="block w-full text-xs md:text-sm text-slate-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-500/90 file:text-white hover:file:bg-sky-400 cursor-pointer bg-slate-900/80 border border-slate-700 rounded-lg px-2 py-1.5"
                />
                {createForm.images && createForm.images.length > 0 && (
                  <p className="mt-1 text-[11px] text-slate-400 truncate">
                    {createForm.images.length} gallery image(s) selected
                  </p>
                )}
              </div>
            </div>
            <div className="form-actions-right md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                className="table-btn primary inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs md:text-sm font-semibold tracking-wide text-white shadow-md hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-slate-100 bg-slate-50/80">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-1">
                Delete listing
              </p>
              <h3 className="text-base font-semibold text-slate-900">
                Are you sure you want to delete this listing?
              </h3>
              <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                {confirmDelete.title}
              </p>
            </div>
            <div className="px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2 rounded-full bg-red-500 hover:bg-red-400 text-xs font-semibold text-white shadow-sm hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleConfirmDelete}
                disabled={listingLoading}
              >
                {listingLoading ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card mt-4 bg-slate-950/95 border border-slate-800/80 shadow-xl rounded-2xl overflow-hidden">
        <div className="card-header flex items-center justify-between px-4 md:px-5 py-3 border-b border-slate-800/80">
          <div>
            <h2 className="card-title text-sm md:text-base font-semibold text-slate-50">My listings</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Manage and update all properties you have published.</p>
          </div>
          <div className="text-[11px] text-slate-400">
            Total: <span className="font-semibold text-sky-400">{listings.length}</span>
          </div>
        </div>
        {listingError && (
          <div className="error-text mb-2 px-4 md:px-5 pt-3 text-sm text-red-400 bg-red-900/40 border-b border-red-700/60">
            {listingError}
          </div>
        )}
        <div className="listings-table-wrapper">
          <table className="listings-table">
            <thead>
              <tr>
                <th style={{ width: 60 }}>ID</th>
                <th>Title</th>
                <th>City</th>
                <th style={{ whiteSpace: 'nowrap' }}>Price (RWF)</th>
                <th style={{ width: 160 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="listings-empty">You have no listings yet.</td>
                </tr>
              ) : (
                listings.map((l) => (
                  <tr key={l.id}>
                    <td>{l.id}</td>
                    <td>{l.title}</td>
                    <td>{l.city}</td>
                    <td>RWF {Number(l.price).toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-sky-500 text-[11px] font-semibold text-white shadow-md shadow-sky-500/40 hover:bg-sky-400 hover:shadow-sky-400/50 cursor-pointer transition"
                          onClick={() => startEditListing(l)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-red-500 text-[11px] font-semibold text-white shadow-md shadow-red-500/40 hover:bg-red-400 hover:shadow-red-400/50 cursor-pointer transition"
                          onClick={() => setConfirmDelete({ id: l.id, title: l.title })}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editListing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 pt-5 pb-3 border-b border-slate-100 bg-slate-50/80">
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-1">
                Edit listing
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Edit listing #{editListing.id}
              </h3>
            </div>
            <form onSubmit={saveEditListing} className="px-6 pt-4 pb-5 space-y-4 text-sm">
              <div className="flex flex-col gap-1">
                <label htmlFor="edit_title" className="text-xs font-medium text-slate-700">
                  Title
                </label>
                <input
                  id="edit_title"
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  required
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="edit_city" className="text-xs font-medium text-slate-700">
                  City
                </label>
                <input
                  id="edit_city"
                  type="text"
                  name="city"
                  value={editForm.city}
                  onChange={handleEditChange}
                  required
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="edit_price" className="text-xs font-medium text-slate-700">
                  Price (RWF)
                </label>
                <input
                  id="edit_price"
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditChange}
                  required
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
                />
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-medium text-slate-700">
                    Main image (optional)
                  </label>
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="mt-1 block w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-500/90 file:text-white hover:file:bg-sky-400 cursor-pointer bg-white border border-slate-300 rounded-lg px-2 py-1.5"
                  />
                  {editForm.image && (
                    <p className="mt-1 text-[11px] text-slate-500 truncate">
                      New main image: {editForm.image.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-700">
                    Gallery images (optional)
                  </label>
                  <input
                    type="file"
                    name="images"
                    accept="image/*"
                    multiple
                    onChange={handleEditFileChange}
                    className="mt-1 block w-full text-xs text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-500/90 file:text-white hover:file:bg-sky-400 cursor-pointer bg-white border border-slate-300 rounded-lg px-2 py-1.5"
                  />
                  {editForm.images && editForm.images.length > 0 && (
                    <p className="mt-1 text-[11px] text-slate-500 truncate">
                      {editForm.images.length} new gallery image(s) selected
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 transition"
                  onClick={() => setEditListing(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-sm hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={listingLoading}
                >
                  {listingLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function refreshFullPage(delayMs = 0) {
  if (typeof window === 'undefined') return;
  if (delayMs <= 0) {
    window.location.reload();
  } else {
    setTimeout(() => {
      try {
        window.location.reload();
      } catch (_) {
        // ignore
      }
    }, delayMs);
  }
}

function App() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    label: 'Very weak',
    percent: 20,
    colorClass: 'bg-red-400',
  });
  const [fieldErrors, setFieldErrors] = useState({ email: null, phone: null });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [broker, setBroker] = useState(null);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [showAuth, setShowAuth] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'house',
    purpose: 'rent',
    location: '',
    amount: '',
    return_date: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
  });
  const [contactStatus, setContactStatus] = useState({ loading: false, error: null, success: null });
  const [navOpen, setNavOpen] = useState(false);
  // When empty: show all listings. When set: filter by category/purpose.
  const [selectedCategory, setSelectedCategory] = useState('');
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [listingsError, setListingsError] = useState(null);
  const [homeListingsLimit, setHomeListingsLimit] = useState(() => {
    if (typeof window === 'undefined') return 16;
    return window.innerWidth < 768 ? 10 : 16;
  });
  const [activeListing, setActiveListing] = useState(null);
  const [activeListingLoading, setActiveListingLoading] = useState(false);
  const [activeListingError, setActiveListingError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'house',
    purpose: 'rent',
    bedrooms: '',
    bathrooms: '',
    location: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
    amount: '',
    return_date: '',
    description: '',
  });
  const [inquiryStatus, setInquiryStatus] = useState({ loading: false, error: null, success: null });
  const [inquiryModal, setInquiryModal] = useState({
    open: false,
    type: 'success', // 'success' | 'error'
    title: '',
    message: '',
  });

  const [isAdmin, setIsAdmin] = useState(false);

  const currentYear = new Date().getFullYear();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [adminAuthError, setAdminAuthError] = useState(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [adminBrokers, setAdminBrokers] = useState([]);
  const [adminInquiries, setAdminInquiries] = useState([]);
  const [adminListings, setAdminListings] = useState([]);
  const [adminDataLoading, setAdminDataLoading] = useState(false);
  const [adminDataError, setAdminDataError] = useState(null);
  const [adminActiveTab, setAdminActiveTab] = useState('dashboard'); // 'dashboard' | 'inquiries' | 'listings' | 'brokers'

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openListingDetails = async (listingId) => {
    setActiveImageIndex(0);
    const found = listings.find((l) => l.id === listingId);
    if (found) {
      // Show something immediately while we load full details
      setActiveListing(found);
    }
    setActiveListingError(null);
    setActiveListingLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/listings/${listingId}`);
      if (!res.ok) {
        throw new Error('Failed to load listing details');
      }
      const data = await res.json();
      setActiveListing(data);
    } catch (err) {
      console.error(err);
      setActiveListingError('Could not load full listing details.');
    } finally {
      setActiveListingLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordInput(value);

    // Basic strength rules
    let score = 0;
    if (value.length >= 8) score += 1;
    if (/[a-z]/.test(value)) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    let label = 'Very weak';
    let percent = 20;
    let colorClass = 'bg-red-400';

    if (score >= 4) {
      label = 'Strong';
      percent = 100;
      colorClass = 'bg-emerald-500';
    } else if (score === 3) {
      label = 'Medium';
      percent = 70;
      colorClass = 'bg-yellow-400';
    } else if (score === 2) {
      label = 'Weak';
      percent = 45;
      colorClass = 'bg-orange-400';
    }

    setPasswordStrength({ label, percent, colorClass });
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInquiryChange = (e) => {
    const { name, value } = e.target;
    setInquiryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    setInquiryStatus({ loading: true, error: null, success: null });

    const payload = {
      ...inquiryForm,
      bedrooms: inquiryForm.bedrooms ? Number(inquiryForm.bedrooms) : null,
      bathrooms: inquiryForm.bathrooms ? Number(inquiryForm.bathrooms) : null,
      amount: inquiryForm.amount ? Number(inquiryForm.amount) : null,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const backendMessage = errorData?.message;
        throw new Error(backendMessage || 'Failed to submit inquiry');
      }

      const successMessage = 'Thank you, we have received your inquiry.';
      setInquiryStatus({
        loading: false,
        error: null,
        success: successMessage,
      });
      // Open smart success modal with a gentle confirmation
      setInquiryModal({
        open: true,
        type: 'success',
        title: 'Inquiry received',
        message: successMessage,
      });
      setInquiryForm({
        name: '',
        email: '',
        phone: '',
        category: inquiryForm.category,
        purpose: inquiryForm.purpose,
        bedrooms: '',
        bathrooms: '',
        location: '',
        make: '',
        model: '',
        year: '',
        mileage: '',
        amount: '',
        return_date: '',
        description: '',
      });
    } catch (err) {
      console.error(err);
      const message = err?.message || 'Something went wrong while sending your inquiry.';
      // Special-case: backend may say we already have this inquiry; show it inline, without opening the popup
      if (message === 'We already have your previous inquiry and our team is working on it.') {
        setInquiryStatus({ loading: false, error: null, success: message });
      } else {
        setInquiryStatus({ loading: false, error: message, success: null });
        // Show smart modal when inquiry fails, using backend message when available
        setInquiryModal({
          open: true,
          type: 'error',
          title: 'Inquiry not completed',
          message,
        });
      }
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ loading: true, error: null, success: null });

    try {
      const isCar = contactForm.category === 'car';
      const inquiryPayload = {
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        category: contactForm.category || 'house',
        purpose: contactForm.purpose || 'rent',
        location: contactForm.location || null,
        amount: contactForm.amount ? Number(contactForm.amount) : null,
        return_date: contactForm.return_date || null,
        // car-specific fields (only meaningful when category = car)
        make: isCar && contactForm.make ? contactForm.make : null,
        model: isCar && contactForm.model ? contactForm.model : null,
        year: isCar && contactForm.year ? contactForm.year : null,
        mileage: isCar && contactForm.mileage ? contactForm.mileage : null,
        description: [contactForm.subject, contactForm.message].filter(Boolean).join(' - '),
      };

      const response = await fetch(`${API_BASE_URL}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(inquiryPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to submit contact inquiry');
      }

      setContactStatus({
        loading: false,
        error: null,
        success: 'Thank you, we have received your inquiry.',
      });
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'house',
        purpose: 'rent',
        location: '',
        amount: '',
        return_date: '',
        make: '',
        model: '',
        year: '',
        mileage: '',
      });
    } catch (err) {
      console.error(err);
      setContactStatus({ loading: false, error: err.message, success: null });
    }
  };

  const handleCloseInquiryModal = () => {
    const shouldRefresh = inquiryModal.type === 'success';
    setInquiryModal((prev) => ({ ...prev, open: false }));

    if (shouldRefresh) {
      refreshFullPage(800);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isLogin = mode === 'login';

      // Hardcoded admin login using the same Sign in form
      if (
        isLogin &&
        form.email.trim().toLowerCase() === 'admin@bestumuranga.com' &&
        form.phone === 'Inkotanyi@BestUmuranga123'
      ) {
        setIsAdmin(true);
        setShowAuth(false);
        await loadAdminData();
        return;
      }

      if (!isLogin && (fieldErrors.email || fieldErrors.phone)) {
        throw new Error(fieldErrors.email || fieldErrors.phone);
      }
      const url = isLogin
        ? `${API_BASE_URL}/brokers/login`
        : `${API_BASE_URL}/brokers/register`;

      const payload = isLogin
        ? { email: form.email, phone: form.phone }
        : form;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || (isLogin ? 'Failed to login' : 'Failed to register broker')
        );
      }

      const data = await response.json();
      setBroker(data.broker);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setBroker(null);
    setShowAuth(false);
    setForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    });
    setPasswordInput('');
    setPasswordStrength({ label: 'Very weak', percent: 20, colorClass: 'bg-red-400' });
    setFieldErrors({ email: null, phone: null });
    setError(null);
  };

  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const loadAdminData = async () => {
    setAdminDataLoading(true);
    setAdminDataError(null);
    try {
      const [inquiriesRes, brokersRes, listingsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/inquiries`),
        fetch(`${API_BASE_URL}/admin/brokers`),
        fetch(`${API_BASE_URL}/listings`),
      ]);

      if (!inquiriesRes.ok) {
        throw new Error('Failed to load inquiries');
      }
      if (!brokersRes.ok) {
        throw new Error('Failed to load brokers');
      }
      if (!listingsRes.ok) {
        throw new Error('Failed to load listings');
      }

      const inquiriesData = await inquiriesRes.json();
      const brokersData = await brokersRes.json();
      const listingsData = await listingsRes.json();
      setAdminInquiries(Array.isArray(inquiriesData) ? inquiriesData : []);
      setAdminBrokers(Array.isArray(brokersData) ? brokersData : []);
      setAdminListings(Array.isArray(listingsData) ? listingsData : []);
    } catch (err) {
      console.error(err);
      setAdminDataError(err.message || 'Failed to load admin data');
    } finally {
      setAdminDataLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminAuthError(null);

    const emailOk = adminForm.email.trim().toLowerCase() === 'admin@bestumuranga.com';
    const passwordOk = adminForm.password === 'Inkotanyi@BestUmuranga123';

    if (!emailOk || !passwordOk) {
      setAdminAuthError('Invalid admin credentials.');
      return;
    }

    setAdminAuthLoading(true);
    try {
      setIsAdmin(true);
      setShowAdminLogin(false);
      await loadAdminData();
    } finally {
      setAdminAuthLoading(false);
    }
  };

  const toggleBrokerStatus = async (brokerId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/brokers/${brokerId}/toggle`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update broker status');
      }

      const data = await response.json();
      const updated = data?.broker;
      if (updated) {
        setAdminBrokers((prev) =>
          prev.map((b) => (b.id === updated.id ? { ...b, ...updated } : b))
        );
      } else {
        // Fallback: refetch
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
      setAdminDataError(err.message || 'Failed to update broker status');
    }
  };

  useEffect(() => {
    // Load listings from backend; if no category is selected, load all.
    const map = {
      'houses-sale': { category: 'house', purpose: 'sell' },
      'houses-rent': { category: 'house', purpose: 'rent' },
      'cars-sale': { category: 'car', purpose: 'sell' },
      'cars-rent': { category: 'car', purpose: 'rent' },
    };

    const controller = new AbortController();
    const run = async () => {
      try {
        setListingsLoading(true);
        setListingsError(null);

        let url = `${API_BASE_URL}/listings`;
        const params = selectedCategory ? map[selectedCategory] : null;
        if (params) {
          const query = new URLSearchParams(params).toString();
          url += `?${query}`;
        }

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load listings');
        }

        const data = await response.json();
        setListings(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setListingsError('Could not load listings. Please try again.');
      } finally {
        setListingsLoading(false);
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [selectedCategory]);

  const checkUniqueField = async (field, value) => {
    if (!value) return;
    try {
      const params = new URLSearchParams({ [field]: value }).toString();
      const res = await fetch(`${API_BASE_URL}/brokers/check-unique?${params}`);
      if (!res.ok) return;
      const data = await res.json();

      if (field === 'email') {
        setFieldErrors((prev) => ({
          ...prev,
          email: data.email_taken ? 'This email is already registered.' : null,
        }));
      }
      if (field === 'phone') {
        setFieldErrors((prev) => ({
          ...prev,
          phone: data.phone_taken ? 'This phone number is already registered.' : null,
        }));
      }
    } catch (err) {
      // ignore network errors here; backend validation will still protect
    }
  };

  if (isAdmin) {
    return (
      <div className="App">
        <aside className="layout-sidebar">
          <div className="sidebar-brand">BestUmuranga.com</div>
          <ul className="sidebar-nav">
            <li className="sidebar-nav-item">
              <button
                className={
                  adminActiveTab === 'dashboard'
                    ? 'sidebar-nav-link active'
                    : 'sidebar-nav-link'
                }
                type="button"
                onClick={() => setAdminActiveTab('dashboard')}
              >
                Dashboard
              </button>
            </li>
            <li className="sidebar-nav-item">
              <button
                className={
                  adminActiveTab === 'inquiries'
                    ? 'sidebar-nav-link active'
                    : 'sidebar-nav-link'
                }
                type="button"
                onClick={() => setAdminActiveTab('inquiries')}
              >
                Inquiries
              </button>
            </li>
            <li className="sidebar-nav-item">
              <button
                className={
                  adminActiveTab === 'listings'
                    ? 'sidebar-nav-link active'
                    : 'sidebar-nav-link'
                }
                type="button"
                onClick={() => setAdminActiveTab('listings')}
              >
                Listings
              </button>
            </li>
            <li className="sidebar-nav-item">
              <button
                className={
                  adminActiveTab === 'brokers'
                    ? 'sidebar-nav-link active'
                    : 'sidebar-nav-link'
                }
                type="button"
                onClick={() => setAdminActiveTab('brokers')}
              >
                Brokers
              </button>
            </li>
          </ul>
          <div className="sidebar-card-group">
            <button type="button" className="sidebar-card-item">
              <span className="sidebar-card-title">Live chat</span>
              <span className="sidebar-card-sub">Talk to your clients in real time</span>
            </button>
            <button type="button" className="sidebar-card-item">
              <span className="sidebar-card-title">Support</span>
              <span className="sidebar-card-sub">Help center & FAQs</span>
            </button>
            <button type="button" className="sidebar-card-item">
              <span className="sidebar-card-title">Contact admin</span>
              <span className="sidebar-card-sub">Message to system admin</span>
            </button>
            <button type="button" className="sidebar-card-item">
              <span className="sidebar-card-title">Notifications</span>
              <span className="sidebar-card-sub">New messages & requests</span>
            </button>
          </div>
        </aside>
        <main className="layout-main">
          <header className="layout-navbar">
            <div className="navbar-title">Admin Dashboard</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 4, fontSize: 11 }}>
                <button type="button" className="nav-pill">EN</button>
                <button type="button" className="nav-pill">FR</button>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: '#4b5563' }} />
              <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#9ca3af' }}>
                <span>in</span>
                <span>X</span>
                <span>f</span>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: '#4b5563' }} />
              <button
                type="button"
                className="nav-button danger"
                onClick={() => {
                  setIsAdmin(false);
                  setAdminForm({ email: '', password: '' });
                }}
              >
                Logout
              </button>
            </div>
          </header>
          <div className="layout-content">
            <div className="widget-row">
              <div
                className="widget-card clickable hover:shadow-lg hover:-translate-y-0.5 transition transform bg-slate-900/70 border border-slate-700/70"
                onClick={() => setAdminActiveTab('inquiries')}
              >
                <div className="widget-title">Inquiries</div>
                <div className="widget-value">{adminInquiries.length}</div>
                <div className="widget-sub">All client inquiries</div>
              </div>
              <div
                className="widget-card clickable hover:shadow-lg hover:-translate-y-0.5 transition transform bg-slate-900/70 border border-slate-700/70"
                onClick={() => setAdminActiveTab('listings')}
              >
                <div className="widget-title">Listings</div>
                <div className="widget-value">{adminListings.length}</div>
                <div className="widget-sub">All properties & cars</div>
              </div>
              <div
                className="widget-card clickable hover:shadow-lg hover:-translate-y-0.5 transition transform bg-slate-900/70 border border-slate-700/70"
                onClick={() => setAdminActiveTab('brokers')}
              >
                <div className="widget-title">Brokers</div>
                <div className="widget-value">{adminBrokers.length}</div>
                <div className="widget-sub">Registered brokers</div>
              </div>
            </div>

            {adminDataError && (
              <div className="error-text" style={{ marginTop: 12 }}>
                {adminDataError}
              </div>
            )}

            {adminActiveTab === 'inquiries' && (
              <div className="card" style={{ marginTop: 16 }}>
              <div className="card-header" style={{ marginBottom: 8 }}>
                <h2 className="card-title" style={{ fontSize: 18 }}>Inquiries</h2>
                {adminDataLoading && (
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>Loading...</span>
                )}
              </div>
              <div className="listings-table-wrapper">
                <table className="listings-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Contact</th>
                      <th>Category</th>
                      <th>Purpose</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="listings-empty">
                          No inquiries yet.
                        </td>
                      </tr>
                    ) : (
                      adminInquiries.map((inq, index) => (
                        <tr key={inq.id || index}>
                          <td style={{ fontWeight: 500, color: '#111827' }}>{inq.id || index + 1}</td>
                          <td style={{ fontWeight: 500, color: '#111827' }}>{inq.name}</td>
                          <td>
                            <div style={{ color: '#111827' }}>{inq.phone}</div>
                            <div style={{ fontSize: 12, color: '#6b7280' }}>{inq.email}</div>
                          </td>
                          <td style={{ color: '#111827' }}>{inq.category}</td>
                          <td style={{ color: '#111827' }}>{inq.purpose}</td>
                          <td style={{ color: '#111827' }}>
                            {inq.amount != null ? Number(inq.amount).toLocaleString() : '-'}
                          </td>
                          <td style={{ color: '#111827' }}>{inq.status || 'open'}</td>
                          <td style={{ color: '#111827' }}>{inq.created_at || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {adminActiveTab === 'listings' && (
              <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header" style={{ marginBottom: 8 }}>
                <h2 className="card-title" style={{ fontSize: 18 }}>Listings</h2>
              </div>
              <div className="listings-table-wrapper">
                <table className="listings-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Purpose</th>
                      <th>Location</th>
                      <th>Price</th>
                      <th>Broker</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminListings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="listings-empty">
                          No listings yet.
                        </td>
                      </tr>
                    ) : (
                      adminListings.map((listing) => (
                        <tr key={listing.id}>
                          <td style={{ fontWeight: 500, color: '#111827' }}>{listing.id}</td>
                          <td style={{ color: '#111827' }}>{listing.title}</td>
                          <td style={{ color: '#111827' }}>{listing.category}</td>
                          <td style={{ color: '#111827' }}>{listing.purpose}</td>
                          <td style={{ color: '#111827' }}>
                            {listing.city}
                            {listing.sector ? ` · ${listing.sector}` : ''}
                          </td>
                          <td style={{ color: '#111827' }}>
                            {listing.price != null
                              ? Number(listing.price).toLocaleString()
                              : '-'}
                          </td>
                          <td style={{ color: '#111827' }}>{listing.broker_name || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {adminActiveTab === 'brokers' && (
              <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header" style={{ marginBottom: 8 }}>
                  <h2 className="card-title" style={{ fontSize: 18 }}>Brokers</h2>
                </div>
                <div className="listings-table-wrapper">
                  <table className="listings-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminBrokers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="listings-empty">
                            No brokers registered yet.
                          </td>
                        </tr>
                      ) : (
                        adminBrokers.map((b) => {
                          const active = b.is_active !== false && b.is_active !== 0;
                          return (
                            <tr key={b.id}>
                              <td>{b.id}</td>
                              <td>
                                {b.first_name} {b.last_name}
                              </td>
                              <td>
                                <div>{b.phone}</div>
                                <div style={{ fontSize: 12, color: '#6b7280' }}>{b.email}</div>
                              </td>
                              <td>
                                <span
                                  className={
                                    active
                                      ? 'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700'
                                      : 'inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700'
                                  }
                                >
                                  {active ? 'Active' : 'Disabled'}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={
                                    active
                                      ? 'table-btn danger'
                                      : 'table-btn primary'
                                  }
                                  onClick={() => toggleBrokerStatus(b.id)}
                                >
                                  {active ? 'Disable' : 'Enable'}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <footer className="layout-footer">
            <div className="footer-main">
              <div className="footer-brand">BestUmuranga.com Admin Dashboard</div>
              <div className="footer-links">Privacy · Terms · Contact</div>
            </div>
            <div className="footer-actions">
              <div className="footer-action-item">
                <span className="footer-action-label">Live chat</span>
                <span className="footer-action-sub">Talk to your clients in real time</span>
              </div>
              <div className="footer-action-item">
                <span className="footer-action-label">Support</span>
                <span className="footer-action-sub">Help center & FAQs</span>
              </div>
              <div className="footer-action-item">
                <span className="footer-action-label">Contact admin</span>
                <span className="footer-action-sub">Message to system admin</span>
              </div>
              <div className="footer-action-item">
                <span className="footer-action-label">Notifications</span>
                <span className="footer-action-sub">New messages & requests</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  if (broker) {
    return (
      <div className="App">
        <aside className="layout-sidebar">
          <div className="sidebar-brand">BestUmuranga.com</div>
          <ul className="sidebar-nav">
            <li className="sidebar-nav-item">
              <button className="sidebar-nav-link active" type="button">
                Dashboard
              </button>
            </li>
            <li className="sidebar-nav-item">
              <button className="sidebar-nav-link" type="button">
                Properties
              </button>
            </li>
            <li className="sidebar-nav-item">
              <button className="sidebar-nav-link" type="button">
                Leads
              </button>
            </li>
          </ul>
          <div className="sidebar-card-group">
            <button type="button" className="sidebar-card-item">
              <span className="sidebar-card-title">Live chat</span>
              <span className="sidebar-card-sub">Talk to your clients in real time</span>
            </button>
            <button type="button" className="sidebar-card-item">
              <span className="sidebar-card-title">Support</span>
              <span className="sidebar-card-sub">Help center & FAQs</span>
            </button>
            <button type="button" className="sidebar-card-item">
              <span className="sidebar-card-title">Contact admin</span>
              <span className="sidebar-card-sub">Message to system admin</span>
            </button>
            <button type="button" className="sidebar-card-item">
              <span className="sidebar-card-title">Notifications</span>
              <span className="sidebar-card-sub">New messages & requests</span>
            </button>
          </div>
        </aside>
        <main className="layout-main">
          <header className="layout-navbar">
            <div className="navbar-title">Broker Dashboard</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 4, fontSize: 11 }}>
                <button type="button" className="nav-pill">EN</button>
                <button type="button" className="nav-pill">FR</button>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: '#4b5563' }} />
              <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#9ca3af' }}>
                <span>in</span>
                <span>X</span>
                <span>f</span>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: '#4b5563' }} />
              <button type="button" className="nav-button subtle">User dashboard</button>
              <button
                type="button"
                className="nav-button danger"
                onClick={handleLogout}
              >
                Logout
              </button>
              <div className="navbar-user">
                {broker.first_name} {broker.last_name}
              </div>
            </div>
          </header>
          <BrokerDashboard broker={broker} />
          <footer className="layout-footer">
            <div className="footer-main">
              <div className="footer-brand">BestUmuranga.com Broker Dashboard</div>
              <div className="footer-links">Privacy · Terms · Contact</div>
            </div>
            <div className="footer-actions">
              <div className="footer-action-item">
                <span className="footer-action-label">Live chat</span>
                <span className="footer-action-sub">Talk to your clients in real time</span>
              </div>
              <div className="footer-action-item">
                <span className="footer-action-label">Support</span>
                <span className="footer-action-sub">Help center & FAQs</span>
              </div>
              <div className="footer-action-item">
                <span className="footer-action-label">Contact admin</span>
                <span className="footer-action-sub">Message to system admin</span>
              </div>
              <div className="footer-action-item">
                <span className="footer-action-label">Notifications</span>
                <span className="footer-action-sub">New messages & requests</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <div className="home-root">
      <div className="home-topbar">
        <div className="home-topbar-left">
          <span>Welcome to Best Umuranga.com</span>
        </div>
        <div className="home-topbar-right">
          <span className="home-topbar-contact">Call us: +250 783 163 187</span>
          <span className="home-topbar-divider">|</span>
          <span className="home-topbar-contact">Email: info@bestumuranga.com</span>
          <span className="home-topbar-divider">|</span>
          <span>Location: Kigali, Rwanda</span>
        </div>
      </div>
      <header className="home-navbar">
        <div className="home-navbar-left">
          <div className="home-logo-wrap">
            <div className="home-logo-avatar">B</div>
            <div>
              <div className="home-logo">
                <span className="home-logo-main">Best</span>
                <span className="home-logo-dotcom">Umuranga.com</span>
              </div>
              <div className="home-logo-tagline">Buy · Sell · Rent across Rwanda</div>
            </div>
          </div>
          <nav className="home-nav-links">
            <button
              type="button"
              className="home-nav-link active"
              onClick={() => refreshFullPage(0)}
            >
              Home
            </button>
            <button
              type="button"
              className="home-nav-link"
              onClick={() => {
                setSelectedCategory('houses-sale');
                scrollToSection('home-properties');
              }}
            >
              Properties
            </button>
            <button
              type="button"
              className="home-nav-link"
              onClick={() => scrollToSection('home-realtors')}
            >
              Realtors
            </button>
            <button
              type="button"
              className="home-nav-link"
              onClick={() => scrollToSection('home-contact')}
            >
              Contact
            </button>
          </nav>
        </div>
        <div className="home-navbar-right">
          <button
            type="button"
            className="home-nav-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setNavOpen((prev) => !prev)}
          >
            ☰
          </button>
          <button
            type="button"
            className="home-cta secondary"
            onClick={() => {
              setMode('login');
              setShowAuth(true);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className="home-cta primary"
            onClick={() => {
              const el = document.getElementById('home-contact-inquiry');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            Submit your inquiry
          </button>
        </div>
      </header>

      {navOpen && (
        <nav className="home-nav-links-mobile">
          <button
            type="button"
            className="home-nav-link active"
            onClick={() => {
              refreshFullPage(0);
              setNavOpen(false);
            }}
          >
            Home
          </button>
          <button
            type="button"
            className="home-nav-link"
            onClick={() => {
              setSelectedCategory('houses-sale');
              scrollToSection('home-properties');
              setNavOpen(false);
            }}
          >
            Properties
          </button>
          <button
            type="button"
            className="home-nav-link"
            onClick={() => {
              scrollToSection('home-realtors');
              setNavOpen(false);
            }}
          >
            Realtors
          </button>
          <button
            type="button"
            className="home-nav-link"
            onClick={() => {
              scrollToSection('home-contact');
              setNavOpen(false);
            }}
          >
            Contact
          </button>
        </nav>
      )}

      <section
        id="home-hero"
        className="home-hero"
        style={{ backgroundImage: "url('/kigali-photo.jpg')" }}
      >
        <div className="home-hero-overlay" />
      </section>
      <section id="home-properties" className="home-section home-categories">
        <div className="home-section-header">
          <h2 className="home-section-title">Browse by category</h2>
          <p className="home-section-sub">Quickly jump to the type of listings you need.</p>
        </div>
        <div className="home-categories-grid">
          <button
            type="button"
            className={
              selectedCategory === 'houses-sale'
                ? 'home-category-card home-category-card-active'
                : 'home-category-card'
            }
            onClick={() => setSelectedCategory('houses-sale')}
          >
            <div className="home-category-icon">🏠</div>
            <div className="home-category-title">Houses for sale</div>
          </button>
          <button
            type="button"
            className={
              selectedCategory === 'houses-rent'
                ? 'home-category-card home-category-card-active'
                : 'home-category-card'
            }
            onClick={() => setSelectedCategory('houses-rent')}
          >
            <div className="home-category-icon">🏡</div>
            <div className="home-category-title">Houses for rent</div>
          </button>
          <button
            type="button"
            className={
              selectedCategory === 'cars-sale'
                ? 'home-category-card home-category-card-active'
                : 'home-category-card'
            }
            onClick={() => setSelectedCategory('cars-sale')}
          >
            <div className="home-category-icon">🚗</div>
            <div className="home-category-title">Cars for sale</div>
          </button>
          <button
            type="button"
            className={
              selectedCategory === 'cars-rent'
                ? 'home-category-card home-category-card-active'
                : 'home-category-card'
            }
            onClick={() => setSelectedCategory('cars-rent')}
          >
            <div className="home-category-icon">🚘</div>
            <div className="home-category-title">Cars for rent</div>
          </button>
        </div>
      </section>

      <section className="home-section home-deals">
        {listingsError && (
          <div className="home-deals-message error-text">{listingsError}</div>
        )}
        {!listingsError && listingsLoading && (
          <div className="home-deals-message">Loading listings...</div>
        )}
        {!listingsError && !listingsLoading && selectedCategory && listings.length === 0 && (
          <div className="home-deals-message">No listings found for this category yet.</div>
        )}
        <div className="home-deals-grid">
          {listings.slice(0, homeListingsLimit).map((listing) => {
            const imageUrl = listing.image_path
              ? `http://127.0.0.1:8000/storage/${listing.image_path}`
              : '/placeholder-house.jpg';

            const isRent = listing.purpose === 'rent';
            const listingTypeLabel = isRent ? 'For Rent' : 'For Sale';
            const locationText = `${listing.city || ''}${listing.sector ? ` · ${listing.sector}` : ''}`;

            return (
              <div
                key={listing.id}
                className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer bg-white border border-slate-100"
                onClick={() => openListingDetails(listing.id)}
              >
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt={listing.title}
                    className="w-full h-72 sm:h-80 md:h-72 lg:h-80 object-cover group-hover:scale-105 transition-all duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

                  <div className="absolute top-3 left-3 flex gap-2 text-[11px] font-semibold">
                    <span className="bg-emerald-600 text-white px-3 py-1 rounded-full shadow-md">
                      FEATURED
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full shadow-md text-white ${
                        isRent ? 'bg-sky-600' : 'bg-amber-500'
                      }`}
                    >
                      {listingTypeLabel}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-base md:text-lg font-bold text-slate-900">
                      RWF {Number(listing.price).toLocaleString()}
                      {isRent && <span className="text-xs md:text-sm text-slate-600"> /mo</span>}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-white">
                  <h3 className="text-sm md:text-base font-semibold text-slate-900 group-hover:text-sky-600 transition line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-1 flex items-center gap-1">
                    <span>📍</span>
                    <span>{locationText}</span>
                  </p>

                  <div className="mt-3 flex items-center gap-6 text-[11px] md:text-xs text-slate-600 border-t border-slate-100 pt-3">
                    {listing.category === 'car' ? (
                      <>
                        <span className="flex flex-col">
                          <span className="uppercase tracking-[0.14em] text-[9px] text-slate-400">
                            Year
                          </span>
                          <span className="font-semibold text-slate-700">
                            {listing.year || '--'}
                          </span>
                        </span>
                        <span className="flex flex-col">
                          <span className="uppercase tracking-[0.14em] text-[9px] text-slate-400">
                            Mileage
                          </span>
                          <span className="font-semibold text-slate-700">
                            {listing.mileage ? `${listing.mileage} km` : '--'}
                          </span>
                        </span>
                        <span className="flex flex-col">
                          <span className="uppercase tracking-[0.14em] text-[9px] text-slate-400">
                            Transmission
                          </span>
                          <span className="font-semibold text-slate-700">
                            {listing.transmission || '--'}
                          </span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5">
                          <FaBed className="text-slate-500 text-[16px]" />
                          <span>{listing.bedrooms ?? '--'}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaBath className="text-slate-500 text-[16px]" />
                          <span>{listing.bathrooms ?? '--'}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="text-[15px]">▢</span>
                          <span>{listing.area ? `${listing.area} m²` : '--'}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {listings.length > homeListingsLimit && (
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 rounded-full bg-slate-900/90 text-white text-xs md:text-sm font-semibold shadow hover:bg-slate-800 disabled:opacity-60"
              onClick={() =>
                setHomeListingsLimit((prev) =>
                  prev + (typeof window !== 'undefined' && window.innerWidth < 768 ? 10 : 16)
                )
              }
            >
              Load more listings
            </button>
          </div>
        )}
      </section>

      <section
        id="home-contact-inquiry"
        className="home-section bg-slate-950/95 border-t border-slate-800/70"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10 grid gap-8 md:grid-cols-2 items-start">
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">
              Visit or contact our Kigali team
            </h2>
            <p className="text-sm md:text-base text-slate-300 max-w-md">
              We are based in Kigali, Rwanda. Send us a quick message or visit us and our team will
              get back to you as soon as possible.
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-800 shadow-xl shadow-black/40">
              <iframe
                title="BestUmuranga Kigali location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63715.9472036204!2d30.01992335!3d-1.94407255!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca425d64c0fb7%3A0x466a8b3f0b98e65b!2sKigali!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw"
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <div>
            <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/95 to-slate-950 border border-slate-700/80 shadow-2xl shadow-black/40 p-5 md:p-6">
              <div className="mb-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300 mb-1">
                  Send us a message
                </p>
                <h3 className="text-lg md:text-xl font-semibold text-white">Talk to our team</h3>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Share a few details and we will reply on email or phone.
                </p>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs md:text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={contactForm.name}
                    onChange={handleContactChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone number"
                    value={contactForm.phone}
                    onChange={handleContactChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                  />
                  <input
                    type="text"
                    name="subject"
                    placeholder="Subject (optional)"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select
                    name="category"
                    value={contactForm.category}
                    onChange={handleContactChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500 text-xs md:text-sm"
                  >
                    <option value="house">House</option>
                    <option value="car">Car</option>
                  </select>
                  <select
                    name="purpose"
                    value={contactForm.purpose}
                    onChange={handleContactChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500 text-xs md:text-sm"
                  >
                    <option value="rent">For rent</option>
                    <option value="buy">To buy</option>
                    <option value="sell">To sell</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="location"
                    placeholder="Preferred location (city / area)"
                    value={contactForm.location}
                    onChange={handleContactChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                  />
                  <input
                    type="number"
                    name="amount"
                    placeholder="Budget amount (RWF)"
                    value={contactForm.amount}
                    onChange={handleContactChange}
                    min="0"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                  />
                </div>
                {contactForm.category === 'car' && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      name="make"
                      placeholder="Make (e.g. Toyota)"
                      value={contactForm.make}
                      onChange={handleContactChange}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-[11px] md:text-xs text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                    />
                    <input
                      type="text"
                      name="model"
                      placeholder="Model (e.g. RAV4)"
                      value={contactForm.model}
                      onChange={handleContactChange}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-[11px] md:text-xs text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                    />
                    <input
                      type="number"
                      name="year"
                      placeholder="Year"
                      value={contactForm.year}
                      onChange={handleContactChange}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-[11px] md:text-xs text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                    />
                    <input
                      type="number"
                      name="mileage"
                      placeholder="Mileage (km)"
                      value={contactForm.mileage}
                      onChange={handleContactChange}
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-2.5 py-2 text-[11px] md:text-xs text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="datetime-local"
                    name="return_date"
                    value={contactForm.return_date}
                    onChange={handleContactChange}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500 text-xs md:text-sm"
                  />
                </div>
                <div>
                  <textarea
                    name="message"
                    rows={3}
                    placeholder="Write your message here (what do you need, preferred location, budget, etc.)"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-slate-100 placeholder-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 focus:border-sky-500 resize-y min-h-[96px]"
                  />
                </div>
                {contactStatus.error && (
                  <p className="text-[11px] text-red-400 bg-red-900/30 border border-red-700/60 rounded px-2 py-1">
                    {contactStatus.error}
                  </p>
                )}
                {contactStatus.success && (
                  <p className="text-[11px] text-emerald-300 bg-emerald-900/20 border border-emerald-600/60 rounded px-2 py-1">
                    {contactStatus.success}
                  </p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-500 hidden md:block">
                    We usually reply within the same working day.
                  </p>
                  <button
                    type="submit"
                    disabled={contactStatus.loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-xs md:text-sm font-semibold text-white shadow-lg shadow-sky-500/40 hover:bg-sky-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {contactStatus.loading ? 'Sending...' : 'Send message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer id="home-contact" className="home-footer">
        <div className="home-footer-main">
          <div className="home-footer-col">
            <div className="home-footer-logo">BestUmuranga.com</div>
            <p className="home-footer-text">
              Your trusted classifieds hub to buy, sell and rent across Rwanda.
            </p>
            <div className="home-footer-social">
              <span>Facebook</span>
              <span>Twitter</span>
              <span>Instagram</span>
              <span>LinkedIn</span>
              <span>Youtube</span>
            </div>
          </div>
          <div className="home-footer-col">
            <h4 className="home-footer-heading">Quick links</h4>
            <ul className="home-footer-list">
              <li>
                <button type="button" onClick={() => refreshFullPage()}>
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('houses-sale');
                    scrollToSection('home-properties');
                  }}
                >
                  View listings
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('home-realtors')}>
                  Realtors
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection('home-contact')}>
                  Contact
                </button>
              </li>
            </ul>
          </div>
          <div className="home-footer-col">
            <h4 className="home-footer-heading">Contact</h4>
            <p className="home-footer-text">Kigali, Rwanda</p>
            <p className="home-footer-text">Phone: +250 783 163 187</p>
            <p className="home-footer-text">Email: info@bestumuranga.com</p>
            <p className="home-footer-text">Marketing: marketing@bestumuranga.com</p>
          </div>
        </div>
        <div className="home-footer-bottom">
          <span>&copy; {currentYear} BestUmuranga.com - All rights reserved</span>
          <a
            href="https://wa.me/250783163187"
            target="_blank"
            rel="noreferrer"
            className="home-footer-whatsapp"
          >
            Chat with us on WhatsApp
          </a>
        </div>
      </footer>

      {/* Listing details full-page style view (shared for public & broker) */}
      {activeListing && (
        <div className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="max-w-6xl mx-auto my-6 md:my-10 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header / top bar */}
            <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-slate-200 bg-slate-50/80">
              <div className="min-w-0">
                <p className="text-[11px] md:text-xs uppercase tracking-[0.12em] text-slate-400 mb-1">
                  Property details
                </p>
                <h1 className="text-base md:text-2xl font-semibold text-slate-900 truncate">
                  {activeListing.title}
                </h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] md:text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span>📍</span>
                    <span>
                      {activeListing.city}
                      {activeListing.sector ? ` · ${activeListing.sector}` : ''}
                    </span>
                  </span>
                  <span className="h-3 w-px bg-slate-300" />
                  <span className="inline-flex items-center gap-1">
                    <FaHome className="text-slate-500" />
                    <span>{activeListing.category === 'car' ? 'Car listing' : 'House listing'}</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm md:text-2xl font-semibold text-slate-900">
                      RWF {Number(activeListing.price).toLocaleString()}
                      {activeListing.purpose === 'rent' && (
                        <span className="text-[11px] md:text-sm text-slate-500"> /month</span>
                      )}
                    </div>
                    <p className="hidden md:block text-[11px] text-slate-500 mt-0.5">
                      Taxes, utilities and fees as per agreement.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ml-1 inline-flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 transition"
                    onClick={() => setActiveListing(null)}
                    aria-label="Close details"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </div>

            {/* Top gallery section */}
            <div className="bg-slate-950">
              <div className="max-w-6xl mx-auto">
                {(() => {
                  const gallery = [];
                  if (activeListing.image_path) {
                    gallery.push({
                      id: 'main',
                      path: activeListing.image_path,
                      alt: activeListing.title,
                    });
                  }
                  if (Array.isArray(activeListing.images) && activeListing.images.length > 0) {
                    activeListing.images.forEach((img) => {
                      if (img && img.path) {
                        gallery.push({
                          id: img.id || img.path,
                          path: img.path,
                          alt: 'Gallery image',
                        });
                      }
                    });
                  }

                  const hasPhotos = gallery.length > 0;
                  const safeIndex = hasPhotos
                    ? Math.min(Math.max(activeImageIndex, 0), gallery.length - 1)
                    : 0;
                  const current = hasPhotos ? gallery[safeIndex] : null;

                  const goPrev = () => {
                    if (!hasPhotos) return;
                    setActiveImageIndex((prev) =>
                      prev <= 0 ? gallery.length - 1 : prev - 1
                    );
                  };

                  const goNext = () => {
                    if (!hasPhotos) return;
                    setActiveImageIndex((prev) =>
                      prev >= gallery.length - 1 ? 0 : prev + 1
                    );
                  };

                  return (
                    <>
                      <div className="relative">
                        {hasPhotos ? (
                          <div className="h-60 md:h-80 lg:h-96 overflow-hidden">
                            <img
                              src={`http://127.0.0.1:8000/storage/${current.path}`}
                              alt={current.alt}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                            {gallery.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-black/45 text-white text-sm md:text-base hover:bg-black/70 transition border border-white/20"
                                  onClick={goPrev}
                                  aria-label="Previous photo"
                                >
                                  ‹
                                </button>
                                <button
                                  type="button"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 md:h-9 md:w-9 flex items-center justify-center rounded-full bg-black/45 text-white text-sm md:text-base hover:bg-black/70 transition border border-white/20"
                                  onClick={goNext}
                                  aria-label="Next photo"
                                >
                                  ›
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="h-60 md:h-80 lg:h-96 flex items-center justify-center text-slate-400 text-xs bg-slate-900">
                            No photos available
                          </div>
                        )}
                      </div>

                      {/* Gallery thumbnails strip at the bottom */}
                      <div className="border-t border-slate-800 bg-slate-950/80">
                        <div className="px-4 pt-3 pb-3 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="uppercase tracking-[0.14em]">Gallery</span>
                          <span>
                            {hasPhotos ? `${gallery.length} photos` : 'No photos'}
                          </span>
                        </div>
                        {hasPhotos && (
                          <div className="overflow-x-auto pb-3">
                            <div className="flex gap-2 px-4">
                              {gallery.map((img, index) => {
                                const isActive = index === safeIndex;
                                return (
                                  <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`relative h-16 md:h-20 w-24 md:w-28 rounded-lg overflow-hidden flex-shrink-0 border transition
                                      ${
                                        isActive
                                          ? 'border-sky-400 shadow-lg shadow-sky-700/40'
                                          : 'border-slate-800/80 hover:border-sky-500/70'
                                      }
                                    `}
                                  >
                                    <img
                                      src={`http://127.0.0.1:8000/storage/${img.path}`}
                                      alt={img.alt}
                                      className="w-full h-full object-cover"
                                    />
                                    {isActive && (
                                      <div className="absolute inset-0 ring-2 ring-sky-400 rounded-lg pointer-events-none" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Content section */}
            <div className="px-4 md:px-6 pt-5 md:pt-6 pb-6 md:pb-4 bg-white">
              <div className="grid md:grid-cols-[minmax(0,2.1fr)_minmax(0,1.2fr)] gap-6 md:gap-8 items-start">
                {/* Left column: description, overview, address */}
                <div className="space-y-5 md:space-y-6 text-xs md:text-sm text-slate-700">
                  <section>
                    <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2 md:mb-3">
                      Description
                    </h2>
                    <p className="whitespace-pre-line leading-relaxed">
                      {activeListing.description || 'No description provided for this listing.'}
                    </p>
                  </section>

                  <section>
                    <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2 md:mb-3">
                      Overview
                    </h2>
                    {activeListing.category === 'car' ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5 bg-slate-50/60">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Make & Model
                          </span>
                          <span className="font-semibold text-xs md:text-sm text-slate-900">
                            {activeListing.make || activeListing.model
                              ? `${activeListing.make || ''} ${activeListing.model || ''}`.trim()
                              : '--'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Year
                          </span>
                          <span className="font-semibold text-xs md:text-sm">
                            {activeListing.year || '--'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Mileage
                          </span>
                          <span className="font-semibold text-xs md:text-sm">
                            {activeListing.mileage ? `${activeListing.mileage} km` : '--'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Transmission
                          </span>
                          <span className="font-semibold text-xs md:text-sm">
                            {activeListing.transmission || '--'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Fuel
                          </span>
                          <span className="font-semibold text-xs md:text-sm">
                            {activeListing.fuel || '--'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Location
                          </span>
                          <span className="font-semibold text-xs md:text-sm">
                            {activeListing.city}
                            {activeListing.sector ? ` · ${activeListing.sector}` : ''}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5 bg-slate-50/60">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Property type
                          </span>
                          <span className="font-semibold text-xs md:text-sm text-slate-900 flex items-center gap-1.5">
                            <FaHome className="text-slate-500" />
                            {activeListing.category === 'car' ? 'Car' : 'House'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Bedrooms
                          </span>
                          <span className="font-semibold text-xs md:text-sm flex items-center gap-1.5">
                            <FaBed className="text-slate-500" /> {activeListing.bedrooms ?? '--'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Bathrooms
                          </span>
                          <span className="font-semibold text-xs md:text-sm flex items-center gap-1.5">
                            <FaBath className="text-slate-500" /> {activeListing.bathrooms ?? '--'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Area size
                          </span>
                          <span className="font-semibold text-xs md:text-sm">
                            {activeListing.area ? `${activeListing.area} m²` : '--'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Status
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-900 text-white">
                            {activeListing.purpose === 'sell' ? 'FOR SALE' : 'FOR RENT'}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 px-3 py-2.5 flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase text-slate-400 tracking-[0.12em]">
                            Location
                          </span>
                          <span className="font-semibold text-xs md:text-sm">
                            {activeListing.city}
                            {activeListing.sector ? ` · ${activeListing.sector}` : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </section>

                  <section>
                    <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-2 md:mb-3">
                      Address
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3 text-xs md:text-sm">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">City</p>
                        <p className="font-medium text-slate-800">{activeListing.city || '—'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Sector</p>
                        <p className="font-medium text-slate-800">{activeListing.sector || '—'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">District</p>
                        <p className="font-medium text-slate-800">{activeListing.district || '—'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Province</p>
                        <p className="font-medium text-slate-800">{activeListing.province || '—'}</p>
                      </div>
                    </div>
                  </section>
                </div>

                {/* Right column: broker information & contact form */}
                <aside className="w-full md:max-w-sm rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 md:px-5 md:py-5 space-y-4 md:space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 md:h-11 md:w-11 rounded-full bg-emerald-500/10 border border-emerald-400/60 flex items-center justify-center text-sm font-semibold text-emerald-700">
                      {`${activeListing.broker_name || 'Broker'}`.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400 mb-0.5">
                        Listing broker
                      </p>
                      <p className="text-sm md:text-base font-semibold text-slate-900 truncate">
                        {activeListing.broker_name || 'Verified broker'}
                      </p>
                      {activeListing.broker_phone && (
                        <p className="text-[11px] text-slate-600">
                          Phone: {activeListing.broker_phone}
                        </p>
                      )}
                      {activeListing.broker_email && (
                        <p className="text-[11px] text-slate-500 truncate">
                          Email: {activeListing.broker_email}
                        </p>
                      )}
                      <button
                        type="button"
                        className="mt-1 text-[11px] font-medium text-sky-600 hover:text-sky-700"
                      >
                        View listings
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs md:text-sm">
                    <p className="text-[11px] font-semibold text-slate-700 uppercase tracking-[0.16em]">
                      Contact about this property
                    </p>
                    <form onSubmit={handleContactSubmit} className="space-y-2.5">
                      <input
                        type="text"
                        name="name"
                        value={contactForm.name}
                        onChange={handleContactChange}
                        placeholder="Your name"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                        required
                      />
                      <input
                        type="tel"
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleContactChange}
                        placeholder="Phone number"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleContactChange}
                        placeholder="Email (optional)"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                      />
                      <textarea
                        name="message"
                        value={contactForm.message}
                        onChange={handleContactChange}
                        rows={3}
                        placeholder={`Hello, I am interested in [${activeListing.title}]`}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs md:text-sm font-semibold py-2.5 shadow-sm hover:shadow-md transition disabled:opacity-60"
                        disabled={contactStatus.loading}
                      >
                        {contactStatus.loading ? 'Sending...' : 'Send message'}
                      </button>
                    </form>
                    {contactStatus.error && (
                      <p className="text-[11px] text-red-500 mt-1">{contactStatus.error}</p>
                    )}
                    {contactStatus.success && (
                      <p className="text-[11px] text-emerald-600 mt-1">{contactStatus.success}</p>
                    )}
                  </div>

                  {(activeListing.broker_phone || activeListing.broker_whatsapp) && (
                    <div className="pt-2 border-t border-slate-200 mt-1 space-y-2">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-800 text-xs md:text-sm font-semibold py-2 hover:bg-slate-100 transition"
                      >
                        Call
                      </button>
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center rounded-lg bg-emerald-500 text-white text-xs md:text-sm font-semibold py-2 hover:bg-emerald-400 transition"
                      >
                        WhatsApp
                      </button>
                    </div>
                  )}
                </aside>
              </div>

              {/* Share section at bottom of listing details */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs md:text-sm">
                <div className="text-slate-500">
                  Share this listing with your clients on WhatsApp or social media.
                </div>
                <div className="flex flex-wrap gap-2 md:gap-2.5">
                  {(() => {
                    const href = typeof window !== 'undefined' ? window.location.href : '';
                    const shareUrl = href || '';
                    const priceText = Number(activeListing.price).toLocaleString();
                    const shareText = `${activeListing.title}  RWF ${priceText} on BestUmuranga`;

                    return (
                      <>
                        <a
                          href={`https://www.instagram.com/?url=${encodeURIComponent(
                            `${shareText} ${shareUrl}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-full bg-pink-500 text-[11px] font-semibold text-white hover:bg-pink-400 transition"
                        >
                          Instagram
                        </a>
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `${shareText} ${shareUrl}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-full bg-emerald-500 text-[11px] font-semibold text-white hover:bg-emerald-400 transition"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                            shareUrl
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-full bg-blue-600 text-[11px] font-semibold text-white hover:bg-blue-500 transition"
                        >
                          Facebook
                        </a>
                        <a
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                            shareText
                          )}&url=${encodeURIComponent(shareUrl)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-full bg-slate-800 text-[11px] font-semibold text-white hover:bg-slate-700 transition"
                        >
                          X / Twitter
                        </a>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setActiveListing(null);
                    setActiveImageIndex(0);
                  }}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs md:text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 transition"
                >
                  Close details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {inquiryModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm px-4"
          onClick={handleCloseInquiryModal}
        >
          <div
            className="w-full max-w-sm md:max-w-md rounded-2xl bg-slate-950 text-slate-50 shadow-2xl border border-slate-800/80 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 md:px-6 pt-4 pb-3 border-b border-slate-800/80 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-1">
                  Inquiry status
                </p>
                <h3 className="text-base md:text-lg font-semibold tracking-tight">
                  {inquiryModal.title || (inquiryModal.type === 'success' ? 'Inquiry received' : 'Something went wrong')}
                </h3>
              </div>
              <button
                type="button"
                className="ml-2 h-8 w-8 flex items-center justify-center rounded-full bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-slate-700/80 transition"
                onClick={handleCloseInquiryModal}
                aria-label="Close inquiry status"
              >
                &times;
              </button>
            </div>

            <div className="px-5 md:px-6 pt-3 pb-4 md:pb-5 space-y-4 text-xs md:text-sm">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-lg
                    ${
                      inquiryModal.type === 'success'
                        ? 'bg-emerald-500/15 border-emerald-400/70 text-emerald-300'
                        : 'bg-red-500/10 border-red-400/70 text-red-300'
                    }
                  `}
                >
                  {inquiryModal.type === 'success' ? '✓' : '!'}
                </div>
                <div className="space-y-2">
                  <p className="text-slate-200 leading-relaxed">
                    {inquiryModal.message ||
                      (inquiryModal.type === 'success'
                        ? 'Thank you, we have received your inquiry. Our Kigali team will contact you shortly by phone or email.'
                        : 'We could not send your inquiry. Please check your details and try again in a moment.')}
                  </p>
                  {inquiryModal.type === 'success' && (
                    <p className="text-[11px] text-slate-400">
                      You can continue browsing properties while we review your request.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {inquiryModal.type === 'error' && (
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-full border border-slate-700 text-[11px] font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 transition"
                    onClick={handleCloseInquiryModal}
                  >
                    Dismiss
                  </button>
                )}
                <button
                  type="button"
                  className={`px-4 py-1.5 rounded-full text-[11px] md:text-xs font-semibold shadow-sm transition
                    ${
                      inquiryModal.type === 'success'
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                        : 'bg-sky-500 text-white hover:bg-sky-400'
                    }
                  `}
                  onClick={handleCloseInquiryModal}
                >
                  {inquiryModal.type === 'success' ? 'Great, thanks' : 'Try again'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuth && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 overflow-hidden">
            {/* Tabs */}
            <div className="bg-slate-50 px-6 pt-5 pb-4 border-b border-slate-200">
              <div className="w-full rounded-full bg-white border border-slate-200 p-1 flex text-sm font-medium">
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-full transition
                    ${
                      mode === 'login'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  onClick={() => setMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 rounded-full transition
                    ${
                      mode === 'register'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  onClick={() => setMode('register')}
                >
                  Register
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 pt-4">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 text-center">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    {mode === 'login' ? 'Login to your account' : 'Create Account'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {mode === 'login'
                      ? 'Sign in to access your broker dashboard.'
                      : 'Join Umuganwa to post and find jobs'}
                  </p>
                </div>
                <button
                  type="button"
                  className="ml-3 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
                  onClick={() => setShowAuth(false)}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                {mode === 'register' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="first_name" className="text-xs font-semibold text-slate-700">
                          First name
                        </label>
                        <input
                          id="first_name"
                          type="text"
                          name="first_name"
                          value={form.first_name}
                          onChange={handleChange}
                          required={mode === 'register'}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="last_name" className="text-xs font-semibold text-slate-700">
                          Last name
                        </label>
                        <input
                          id="last_name"
                          type="text"
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                          required={mode === 'register'}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                        Phone
                      </label>
                      <input
                        id="phone"
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-700">Password</label>
                        <input
                          type="password"
                          value={passwordInput}
                          onChange={handlePasswordChange}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-700">Confirm Password</label>
                        <input
                          type="password"
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/70 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500">
                      <div className="flex items-center justify-between mb-1">
                        <span>Password strength</span>
                        <span>{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.colorClass}`}
                          style={{ width: `${passwordStrength.percent}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-slate-500">
                        Use at least 8 characters with upper/lowercase, numbers, and symbols.
                      </p>
                    </div>
                  </>
                )}

                {mode === 'login' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="phone_login" className="text-xs font-semibold text-slate-700">
                        Phone
                      </label>
                      <input
                        id="phone_login"
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        required
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="email_login" className="text-xs font-semibold text-slate-700">
                        Email
                      </label>
                      <input
                        id="email_login"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400/70 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`mt-3 w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold shadow-sm transition
                    ${
                      mode === 'register'
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-60 disabled:cursor-not-allowed'
                        : 'bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed'
                    }`}
                >
                  {loading
                    ? (mode === 'login' ? 'Logging in...' : 'Registering...')
                    : (mode === 'login' ? 'Login' : 'REGISTER')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

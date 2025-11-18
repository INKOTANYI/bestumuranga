import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  brokerList,
  brokerCreate,
  brokerUpdate,
  brokerDelete,
  requestBroker,
  me,
  getCategories,
  generateListingDescription,
  getProvinces,
  getDistricts,
  getSectors,
  getCities,
  getTerritories,
  logout,
} from '../lib/api'
import AdminShell from '../components/AdminShell'
import QuickActions from '../components/QuickActions'
import VehicleForm from '../components/VehicleForm'
import { toast } from 'sonner'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

export default function Broker() {
  const [list, setList] = useState({ data: [] })
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [categories, setCategories] = useState([])
  const [listingLocation, setListingLocation] = useState('')
  const [images, setImages] = useState([])
  const [status, setStatus] = useState('')
  const [user, setUser] = useState(null)
  const [errors, setErrors] = useState(null)
  const [features, setFeatures] = useState('')
  const [transaction, setTransaction] = useState('sell')
  const [currency, setCurrency] = useState('RWF')
  const [tone, setTone] = useState('friendly')
  const [desc, setDesc] = useState('')
  const descRef = useRef(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [formStep, setFormStep] = useState(1)
  const formCardRef = useRef(null)
  const [showFormModal, setShowFormModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [lastListing, setLastListing] = useState(null)
  const nav = useNavigate()
  const routerLocation = useLocation()

  // Editable profile location fields
  const [profileCountry, setProfileCountry] = useState('')
  const [profileProvince, setProfileProvince] = useState('')
  const [profileDistrict, setProfileDistrict] = useState('')
  const [profileSector, setProfileSector] = useState('')

  // Dynamic location options
  const [provinceOptions, setProvinceOptions] = useState([])
  const [districtOptions, setDistrictOptions] = useState([])
  const [sectorOptions, setSectorOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [territoryOptions, setTerritoryOptions] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [selectedDistrictId, setSelectedDistrictId] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [selectedTerritoryId, setSelectedTerritoryId] = useState('')

  // Local-only profile avatar preview
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('')

  // Listing-specific dynamic location (Rwanda: province/district/sector, DRC: province/city/territory)
  const [listingProvinceOptions, setListingProvinceOptions] = useState([])
  const [listingDistrictOptions, setListingDistrictOptions] = useState([])
  const [listingSectorOptions, setListingSectorOptions] = useState([])
  const [listingProvinceId, setListingProvinceId] = useState('')
  const [listingDistrictId, setListingDistrictId] = useState('')
  const [listingSectorName, setListingSectorName] = useState('')
  const [listingCityOptions, setListingCityOptions] = useState([])
  const [listingTerritoryOptions, setListingTerritoryOptions] = useState([])
  const [listingCityId, setListingCityId] = useState('')
  const [listingTerritoryId, setListingTerritoryId] = useState('')

  // Vehicles-specific state
  const [vehicleSubcat, setVehicleSubcat] = useState('')
  const [vehicleMake, setVehicleMake] = useState('')
  const [vehicleModel, setVehicleModel] = useState('')
  const [vehicleYear, setVehicleYear] = useState('')
  const [vehicleCondition, setVehicleCondition] = useState('used')
  const [vehicleMileage, setVehicleMileage] = useState('')
  const [vehicleTransmission, setVehicleTransmission] = useState('')
  const [vehicleFuel, setVehicleFuel] = useState('')
  const [vehicleEngineSize, setVehicleEngineSize] = useState('')
  const [vehicleDriveType, setVehicleDriveType] = useState('')
  const [vehicleExterior, setVehicleExterior] = useState('')
  const [vehicleInterior, setVehicleInterior] = useState('')
  const [vehicleDoors, setVehicleDoors] = useState('')
  const [vehicleSeats, setVehicleSeats] = useState('')
  const [vehicleRentalPeriod, setVehicleRentalPeriod] = useState('')
  const [vehicleNegotiable, setVehicleNegotiable] = useState(false)
  const [vehicleAvailableFrom, setVehicleAvailableFrom] = useState('')
  const [vehicleInsuranceIncluded, setVehicleInsuranceIncluded] = useState(false)

  // Parts / accessories
  const [partName, setPartName] = useState('')
  const [partCompatible, setPartCompatible] = useState('')
  const [partCondition, setPartCondition] = useState('used')
  const [partQuantity, setPartQuantity] = useState('')
  const [partType, setPartType] = useState('')
  const [partBrand, setPartBrand] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [partOemType, setPartOemType] = useState('')
  const [partShippingOption, setPartShippingOption] = useState('')
  const [partAvailability, setPartAvailability] = useState('')
  const [partCompatibilityNotes, setPartCompatibilityNotes] = useState('')
  const [partFitmentNotes, setPartFitmentNotes] = useState('')
  const [partColorFinish, setPartColorFinish] = useState('')

  // Wheels / rims
  const [rimSize, setRimSize] = useState('')
  const [boltPattern, setBoltPattern] = useState('')
  const [rimOffset, setRimOffset] = useState('')
  const [rimMaterial, setRimMaterial] = useState('')
  const [rimFinish, setRimFinish] = useState('')
  const [rimCondition, setRimCondition] = useState('used')
  const [tireIncluded, setTireIncluded] = useState(false)
  const [showStep1Errors, setShowStep1Errors] = useState(false)
  const [showStep2Errors, setShowStep2Errors] = useState(false)

  // Houses-specific state
  const [houseBedrooms, setHouseBedrooms] = useState('')
  const [houseBathrooms, setHouseBathrooms] = useState('')
  const [houseArea, setHouseArea] = useState('')
  const [houseNeighbourhood, setHouseNeighbourhood] = useState('')
  const [houseHasKitchen, setHouseHasKitchen] = useState(false)
  const [houseHasGarden, setHouseHasGarden] = useState(false)
  const [houseHasGarage, setHouseHasGarage] = useState(false)

  async function load() {
    try {
      const u = await me()
      setUser(u.user)
      const res = await brokerList()
      setList(res)
      const cats = await getCategories()
      const all = cats.data || []

      // For broker flow we only expose Vehicles and Houses categories in the UI
      const vehiclesCat =
        all.find(c => ['vehicles', 'vehicle', 'cars', 'car'].includes(String(c.name).toLowerCase())) || null
      const housesCat =
        all.find(c => ['houses', 'house'].includes(String(c.name).toLowerCase())) || null

      const demoCats = []
      if (vehiclesCat) demoCats.push({ id: vehiclesCat.id, name: 'Vehicles' })
      if (housesCat) demoCats.push({ id: housesCat.id, name: 'Houses' })

      setCategories(demoCats)
      if (demoCats.length > 0) {
        // Default to Vehicles if present, otherwise Houses
        const defaultId = vehiclesCat ? vehiclesCat.id : housesCat?.id
        setCategoryId(prev => (prev ? prev : String(defaultId)))
      } else {
        setCategoryId('')
      }

      // Auto-fill profile location fields from broker profile.
      // Backend stores country as code (RW/DRC) and broker_province/broker_district/broker_sector for display.
      if (u.user) {
        const rawCountry = u.user.country || ''
        const countryName = rawCountry === 'RW' ? 'Rwanda' : rawCountry === 'DRC' ? 'DRC' : rawCountry

        const provinceName = u.user.province || u.user.broker_province || ''
        const districtName = u.user.district || u.user.broker_district || ''
        const sectorName = u.user.sector || u.user.broker_sector || ''

        setProfileCountry(countryName)
        setProfileProvince(provinceName)
        setProfileDistrict(districtName)
        setProfileSector(sectorName)
      }
    } catch (e) {
      setStatus('Failed to load')
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    // Auto-open create listing modal when coming from sidebar Post new ad
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.origin + routerLocation.pathname + routerLocation.search)
      if (url.pathname === '/broker' && url.searchParams.get('new') === '1') {
        setFormStep(1)
        setShowFormModal(true)
      }
    }
  }, [routerLocation.pathname, routerLocation.search])

  // Load provinces dynamically when country changes (Rwanda / DRC)
  useEffect(() => {
    async function loadProvinces() {
      try {
        if (!profileCountry) {
          setProvinceOptions([])
          return
        }
        const code = profileCountry === 'Rwanda' ? 'RW' : profileCountry === 'DRC' ? 'DRC' : undefined
        if (!code) return
        const res = await getProvinces(code)
        const data = Array.isArray(res.data) ? res.data : []
        setProvinceOptions(data)
      } catch {
        // ignore for now
      }
    }
    loadProvinces()
    // reset selections when country changes
    setSelectedProvinceId('')
    setSelectedDistrictId('')
    setSelectedCityId('')
    setSelectedTerritoryId('')
    setDistrictOptions([])
    setSectorOptions([])
    setCityOptions([])
    setTerritoryOptions([])
  }, [profileCountry])

  // Load Rwanda districts when province changes
  useEffect(() => {
    async function loadDistricts() {
      try {
        if (!selectedProvinceId || profileCountry !== 'Rwanda') {
          setDistrictOptions([])
          setSectorOptions([])
          return
        }
        const res = await getDistricts(selectedProvinceId)
        const data = Array.isArray(res.data) ? res.data : []
        setDistrictOptions(data)
      } catch {
        // ignore
      }
    }
    loadDistricts()
    setSelectedDistrictId('')
    setSectorOptions([])
  }, [selectedProvinceId, profileCountry])

  // Load Rwanda sectors when district changes
  useEffect(() => {
    async function loadSectors() {
      try {
        if (!selectedDistrictId || profileCountry !== 'Rwanda') {
          setSectorOptions([])
          return
        }
        const res = await getSectors(selectedDistrictId)
        const data = Array.isArray(res.data) ? res.data : []
        setSectorOptions(data)
      } catch {
        // ignore
      }
    }
    loadSectors()
  }, [selectedDistrictId, profileCountry])

  // Load DRC cities and territories when province changes
  useEffect(() => {
    async function loadCitiesAndTerritories() {
      try {
        if (!selectedProvinceId || profileCountry !== 'DRC') {
          setCityOptions([])
          setTerritoryOptions([])
          return
        }
        const [citiesRes, territoriesRes] = await Promise.all([
          getCities(selectedProvinceId),
          getTerritories(selectedProvinceId),
        ])
        setCityOptions(Array.isArray(citiesRes.data) ? citiesRes.data : [])
        setTerritoryOptions(Array.isArray(territoriesRes.data) ? territoriesRes.data : [])
      } catch {
        // ignore
      }
    }
    loadCitiesAndTerritories()
    setSelectedCityId('')
    setSelectedTerritoryId('')
  }, [selectedProvinceId, profileCountry])

  // Listing location: load provinces when broker country is Rwanda or DRC
  useEffect(() => {
    async function loadListingProvinces() {
      try {
        if (profileCountry !== 'Rwanda' && profileCountry !== 'DRC') {
          setListingProvinceOptions([])
          setListingDistrictOptions([])
          setListingSectorOptions([])
          setListingCityOptions([])
          setListingTerritoryOptions([])
          setListingProvinceId('')
          setListingDistrictId('')
          setListingSectorName('')
          setListingCityId('')
          setListingTerritoryId('')
          return
        }
        const code = profileCountry === 'Rwanda' ? 'RW' : 'DRC'
        const res = await getProvinces(code)
        const data = Array.isArray(res.data) ? res.data : []
        setListingProvinceOptions(data)
      } catch {
        // ignore
      }
    }
    loadListingProvinces()
  }, [profileCountry])

  // Listing location: load Rwanda districts when listing province changes
  useEffect(() => {
    async function loadListingDistricts() {
      try {
        if (!listingProvinceId || profileCountry !== 'Rwanda') {
          setListingDistrictOptions([])
          setListingSectorOptions([])
          setListingDistrictId('')
          setListingSectorName('')
          return
        }
        const res = await getDistricts(listingProvinceId)
        const data = Array.isArray(res.data) ? res.data : []
        setListingDistrictOptions(data)
      } catch {
        // ignore
      }
    }
    loadListingDistricts()
  }, [listingProvinceId, profileCountry])

  // Listing location: load Rwanda sectors when listing district changes
  useEffect(() => {
    async function loadListingSectors() {
      try {
        if (!listingDistrictId || profileCountry !== 'Rwanda') {
          setListingSectorOptions([])
          setListingSectorName('')
          return
        }
        const res = await getSectors(listingDistrictId)
        const data = Array.isArray(res.data) ? res.data : []
        setListingSectorOptions(data)
      } catch {
        // ignore
      }
    }
    loadListingSectors()
  }, [listingDistrictId, profileCountry])

  // Listing location: load DRC cities & territories when listing province changes
  useEffect(() => {
    async function loadListingCitiesAndTerritories() {
      try {
        if (!listingProvinceId || profileCountry !== 'DRC') {
          setListingCityOptions([])
          setListingTerritoryOptions([])
          setListingCityId('')
          setListingTerritoryId('')
          return
        }
        const [citiesRes, territoriesRes] = await Promise.all([
          getCities(listingProvinceId),
          getTerritories(listingProvinceId),
        ])
        setListingCityOptions(Array.isArray(citiesRes.data) ? citiesRes.data : [])
        setListingTerritoryOptions(Array.isArray(territoriesRes.data) ? territoriesRes.data : [])
      } catch {
        // ignore
      }
    }
    loadListingCitiesAndTerritories()
  }, [listingProvinceId, profileCountry])

  // Build listingLocation string from selectors when applicable (Rwanda / DRC)
  useEffect(() => {
    if (profileCountry === 'Rwanda') {
      const provinceName = listingProvinceOptions.find(p => String(p.id) === String(listingProvinceId))?.name
      const districtName = listingDistrictOptions.find(d => String(d.id) === String(listingDistrictId))?.name
      const sectorName = listingSectorName || ''

      const parts = ['Rwanda', provinceName, districtName, sectorName].filter(Boolean)
      if (parts.length > 0) {
        setListingLocation(parts.join(', '))
      }
    } else if (profileCountry === 'DRC') {
      const provinceName = listingProvinceOptions.find(p => String(p.id) === String(listingProvinceId))?.name
      const cityName = listingCityOptions.find(c => String(c.id) === String(listingCityId))?.name
      const territoryName = listingTerritoryOptions.find(t => String(t.id) === String(listingTerritoryId))?.name

      const parts = ['DRC', provinceName, cityName ?? territoryName].filter(Boolean)
      if (parts.length > 0) {
        setListingLocation(parts.join(', '))
      }
    }
  }, [
    profileCountry,
    listingProvinceOptions,
    listingDistrictOptions,
    listingCityOptions,
    listingTerritoryOptions,
    listingProvinceId,
    listingDistrictId,
    listingSectorName,
    listingCityId,
    listingTerritoryId,
  ])

  function validateStep(step) {
    // Step 1: basic info required
    if (step === 1) {
      const needsSubcat = isVehicles || isHouses
      if (!categoryId || (needsSubcat && !vehicleSubcat) || !title || !price || !listingLocation) {
        const msg = 'Please choose category, subcategory, title, price and location before continuing.'
        setStatus(msg)
        toast.error(msg)
        setShowStep1Errors(true)
        return false
      }
    }

    // Step 2: vehicle key details when Vehicles
    if (step === 2 && isVehicles) {
      if (!vehicleSubcat || !vehicleMake || !vehicleModel || !vehicleYear) {
        const msg = 'Please choose vehicle type and fill Make, Model and Year.'
        setStatus(msg)
        toast.error(msg)
        setShowStep2Errors(true)
        return false
      }
    }

    // Step 2: basic house details when Houses
    if (step === 2 && isHouses) {
      if (!houseBedrooms || !houseBathrooms) {
        const msg = 'Please fill bedrooms and bathrooms for the house.'
        setStatus(msg)
        toast.error(msg)
        setShowStep2Errors(true)
        return false
      }
    }

    return true
  }

  function startEdit(it) {
    const attrs = it.attributes || {}

    setEditingId(it.id)
    setTitle(it.title || '')
    setPrice(it.price != null ? String(it.price) : '')
    if (it.category_id) {
      setCategoryId(String(it.category_id))
    }
    setListingLocation(it.location || '')
    setDesc(it.description || '')
    setStatus(`Editing listing #${it.id}`)
    setErrors(null)
    setShowStep1Errors(false)
    setShowStep2Errors(false)

    // Vehicles-only for now
    const rawSub = attrs.subcategory || ''
    setVehicleSubcat(rawSub === 'car_accessories' ? 'spare_parts' : rawSub)
    setVehicleMake(attrs.make || '')
    setVehicleModel(attrs.model || '')
    setVehicleYear(attrs.year ? String(attrs.year) : '')
    setVehicleCondition(attrs.condition || 'used')
    setVehicleMileage(attrs.mileage ? String(attrs.mileage) : '')
    setVehicleTransmission(attrs.transmission || '')
    setVehicleFuel(attrs.fuel_type || '')
    setVehicleEngineSize(attrs.engine_size || '')
    setVehicleDriveType(attrs.drive_type || '')
    setVehicleExterior(attrs.exterior_color || '')
    setVehicleInterior(attrs.interior_color || '')
    setVehicleDoors(attrs.doors ? String(attrs.doors) : '')
    setVehicleSeats(attrs.seats ? String(attrs.seats) : '')
    setVehicleRentalPeriod(attrs.rental_period || '')
    setVehicleNegotiable(attrs.negotiable === '1' || attrs.negotiable === 1 || attrs.negotiable === true)
    setVehicleAvailableFrom(attrs.available_from || '')
    setVehicleInsuranceIncluded(
      attrs.insurance_included === '1' || attrs.insurance_included === 1 || attrs.insurance_included === true,
    )

    // Parts / accessories
    setPartName(attrs.part_name || '')
    setPartCompatible(attrs.compatible_models || '')
    setPartCondition(attrs.part_condition || 'used')
    setPartQuantity(attrs.quantity ? String(attrs.quantity) : '')
    setPartType(attrs.part_type || '')
    setPartBrand(attrs.brand || '')
    setPartNumber(attrs.part_number || '')
    setPartOemType(attrs.oem_type || '')
    setPartShippingOption(attrs.shipping_option || '')
    setPartAvailability(attrs.availability || '')
    setPartCompatibilityNotes(attrs.compatibility_notes || '')
    setPartFitmentNotes(attrs.fitment_notes || '')
    setPartColorFinish(attrs.color_finish || '')

    // Wheels / rims
    setRimSize(attrs.rim_size ? String(attrs.rim_size) : '')
    setBoltPattern(attrs.bolt_pattern || '')
    setRimOffset(attrs.offset || '')
    setRimMaterial(attrs.material || '')
    setRimFinish(attrs.finish || '')
    setRimCondition(attrs.wheel_condition || 'used')
    setTireIncluded(attrs.tire_included === '1' || attrs.tire_included === 1 || attrs.tire_included === true)

    setFormStep(1)
    setShowFormModal(true)
  }

  async function submit(e) {
    e.preventDefault()
    setStatus('')
    setErrors(null)
    // Re-check critical steps before sending to backend
    if (!validateStep(1)) {
      setFormStep(1)
      return
    }
    if (isVehicles && !validateStep(2)) {
      setFormStep(2)
      return
    }
    try {
      const form = new FormData()
      form.append('title', title)
      form.append('price', price)
      form.append('category_id', categoryId)
      form.append('location', listingLocation)
      if (desc) form.append('description', desc)

      // Map subcategory to listing type (sell / rent) for vehicles and houses
      let typeValue = ''
      if (isVehicles) {
        if (vehicleSubcat === 'cars_for_sale') typeValue = 'sell'
        if (vehicleSubcat === 'cars_for_rent') typeValue = 'rent'
      } else if (isHouses) {
        if (vehicleSubcat === 'houses_for_sale') typeValue = 'sell'
        if (vehicleSubcat === 'houses_for_rent') typeValue = 'rent'
      }
      if (typeValue) {
        form.append('type', typeValue)
      }

      // Vehicles-specific attributes (sent only when category is Vehicles)
      if (isVehicles) {
        form.append('attributes[subcategory]', vehicleSubcat || '')
        if (currency) {
          form.append('attributes[currency]', currency)
        }
        form.append('attributes[make]', vehicleMake || '')
        form.append('attributes[model]', vehicleModel || '')
        form.append('attributes[year]', vehicleYear || '')
        form.append('attributes[condition]', vehicleCondition || '')

        if (vehicleSubcat === 'cars_for_sale' || vehicleSubcat === 'cars_for_rent') {
          if (vehicleMileage) form.append('attributes[mileage]', vehicleMileage)
          if (vehicleTransmission) form.append('attributes[transmission]', vehicleTransmission)
          if (vehicleFuel) form.append('attributes[fuel_type]', vehicleFuel)
          if (vehicleEngineSize) form.append('attributes[engine_size]', vehicleEngineSize)
          if (vehicleDriveType) form.append('attributes[drive_type]', vehicleDriveType)
          if (vehicleExterior) form.append('attributes[exterior_color]', vehicleExterior)
          if (vehicleInterior) form.append('attributes[interior_color]', vehicleInterior)
          if (vehicleDoors) form.append('attributes[doors]', vehicleDoors)
          if (vehicleSeats) form.append('attributes[seats]', vehicleSeats)
          form.append('attributes[negotiable]', vehicleNegotiable ? '1' : '0')
          if (vehicleAvailableFrom) form.append('attributes[available_from]', vehicleAvailableFrom)
          form.append('attributes[insurance_included]', vehicleInsuranceIncluded ? '1' : '0')
          if (vehicleSubcat === 'cars_for_rent' && vehicleRentalPeriod) {
            form.append('attributes[rental_period]', vehicleRentalPeriod)
          }
        }

        if (vehicleSubcat === 'car_accessories' || vehicleSubcat === 'spare_parts') {
          if (partName) form.append('attributes[part_name]', partName)
          if (partCompatible) form.append('attributes[compatible_models]', partCompatible)
          if (partCondition) form.append('attributes[part_condition]', partCondition)
          if (partQuantity) form.append('attributes[quantity]', partQuantity)
          if (partType) form.append('attributes[part_type]', partType)
          if (partBrand) form.append('attributes[brand]', partBrand)
          if (partNumber) form.append('attributes[part_number]', partNumber)
          if (partOemType) form.append('attributes[oem_type]', partOemType)
          if (partShippingOption) form.append('attributes[shipping_option]', partShippingOption)
          if (partAvailability) form.append('attributes[availability]', partAvailability)
          if (partCompatibilityNotes) form.append('attributes[compatibility_notes]', partCompatibilityNotes)
          if (partFitmentNotes) form.append('attributes[fitment_notes]', partFitmentNotes)
          if (partColorFinish) form.append('attributes[color_finish]', partColorFinish)
        }

        if (vehicleSubcat === 'wheels_rims') {
          if (rimSize) form.append('attributes[rim_size]', rimSize)
          if (boltPattern) form.append('attributes[bolt_pattern]', boltPattern)
          if (rimOffset) form.append('attributes[offset]', rimOffset)
          if (rimMaterial) form.append('attributes[material]', rimMaterial)
          if (rimFinish) form.append('attributes[finish]', rimFinish)
          if (rimCondition) form.append('attributes[wheel_condition]', rimCondition)
          form.append('attributes[tire_included]', tireIncluded ? '1' : '0')
        }
      }
      images.forEach(f => form.append('images[]', f))

      let res
      if (editingId) {
        res = await brokerUpdate(editingId, form)
      } else {
        res = await brokerCreate(form)
      }
      const createdOrUpdated = res && res.data ? res.data : null
      const successMsg = 'Ad submitted successfully'
      setStatus(successMsg)
      toast.success(successMsg)
      setLastListing(createdOrUpdated)
      setTitle('')
      setPrice('')
      setCategoryId('')
      setListingLocation('')
      setImages([])
      setDesc('')
      setCurrency('RWF')
      setEditingId(null)
      setShowStep1Errors(false)
      setShowStep2Errors(false)
      setFormStep(1)
      setVehicleSubcat('')
      setVehicleMake('')
      setVehicleModel('')
      setVehicleYear('')
      setVehicleCondition('used')
      setVehicleMileage('')
      setVehicleTransmission('')
      setVehicleFuel('')
      setVehicleEngineSize('')
      setVehicleDriveType('')
      setVehicleExterior('')
      setVehicleInterior('')
      setVehicleDoors('')
      setVehicleSeats('')
      setVehicleRentalPeriod('')
      setVehicleNegotiable(false)
      setVehicleAvailableFrom('')
      setVehicleInsuranceIncluded(false)
      setHouseBedrooms('')
      setHouseBathrooms('')
      setHouseArea('')
      setHouseNeighbourhood('')
      setHouseHasKitchen(false)
      setHouseHasGarden(false)
      setHouseHasGarage(false)
      setPartName('')
      setPartCompatible('')
      setPartCondition('used')
      setPartQuantity('')
      setPartType('')
      setPartBrand('')
      setPartNumber('')
      setPartOemType('')
      setPartShippingOption('')
      setPartAvailability('')
      setPartCompatibilityNotes('')
      setPartFitmentNotes('')
      setPartColorFinish('')
      setRimSize('')
      setBoltPattern('')
      setRimOffset('')
      setRimMaterial('')
      setRimFinish('')
      setRimCondition('used')
      setTireIncluded(false)
      setShowFormModal(false)
      setShowSuccessModal(true)
      await load()
    } catch (e) {
      const res = e?.response
      if (res?.status === 422 && res?.data) {
        setStatus(res.data.message || 'Validation failed')
        setErrors(res.data.errors || null)
      } else if (res?.data?.message) {
        setStatus(res.data.message)
      } else {
        setStatus('Create failed (check quotas or approval)')
      }
    }
  }

  async function handleGenerate() {
    const categoryName =
      categories.find(c => String(c.id) === String(categoryId))?.name || 'item'

    try {
      const preview = {
        title: title || 'New Listing',
        location: listingLocation || '',
        price_label:
          price && currency
            ? `${currency === 'USD' ? '$' : 'RWF'} ${Number(price).toLocaleString()}`
            : '',
        make: vehicleMake || '',
        model: vehicleModel || '',
        year: vehicleYear || '',
        mileage: vehicleMileage || '',
        fuel: vehicleFuel || '',
        transmission: vehicleTransmission || '',
      }

      const payload = {
        category: categoryName,
        title: preview.title,
        location: preview.location,
        price_info: preview.price_label,
        transaction,
        // Hint for backend AI: make text attractive and SEO / social friendly
        style: 'seo_social',
        preview,
        extras: {
          make: vehicleMake || undefined,
          model: vehicleModel || undefined,
          year: vehicleYear || undefined,
          mileage: vehicleMileage || undefined,
          fuel_type: vehicleFuel || undefined,
          transmission: vehicleTransmission || undefined,
        },
        // Simple variation flag so each click can produce a different suggestion
        variation: Date.now(),
      }

      // If Vehicles, enrich prompt with vehicle specs
      if (isVehicles) {
        payload.vehicle = {
          subcategory: vehicleSubcat || undefined,
          make: vehicleMake || undefined,
          model: vehicleModel || undefined,
          year: vehicleYear || undefined,
          condition: vehicleCondition || undefined,
          mileage: vehicleMileage || undefined,
          transmission: vehicleTransmission || undefined,
          fuel_type: vehicleFuel || undefined,
          engine_size: vehicleEngineSize || undefined,
          drive_type: vehicleDriveType || undefined,
          exterior_color: vehicleExterior || undefined,
          interior_color: vehicleInterior || undefined,
          doors: vehicleDoors || undefined,
          seats: vehicleSeats || undefined,
        }
      }

      const res = await generateListingDescription(payload)
      setDesc(res.description || '')
      toast.success('AI description generated')
    } catch (e) {
      toast.error('AI description failed')
    }
  }

  const toneOptions = [
    { k: 'friendly', label: 'Friendly' },
    { k: 'professional', label: 'Professional' },
    { k: 'luxury', label: 'Luxury' },
    { k: 'budget', label: 'Budget' },
    { k: 'eco', label: 'Eco' },
    { k: 'family', label: 'Family' },
    { k: 'investor', label: 'Investor' },
    { k: 'urgent', label: 'Urgent' },
  ]

  const items = Array.isArray(list.data) ? list.data : []
  const totalAds = items.length
  const quotaTotal = 50
  const remainingAds = Math.max(quotaTotal - totalAds, 0)

  const selectedCategory = categories.find(c => String(c.id) === String(categoryId))
  const isVehicles = selectedCategory && selectedCategory.name === 'Vehicles'
  const isHouses = selectedCategory && selectedCategory.name === 'Houses'

  const now = new Date()
  const last30 = new Date()
  last30.setDate(now.getDate() - 30)

  const adsLast30 = items.filter(it => it.created_at && new Date(it.created_at) >= last30).length
  const approvedAds = items.filter(it => it.status === 'approved').length
  const pendingAds = items.filter(it => it.status === 'pending').length

  const recentActivity = [...items]
    .filter(it => it.created_at)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  async function handleLogout() {
    try {
      await logout()
      toast.success('Logged out')
      nav('/', { replace: true })
    } catch {
      toast.error('Logout failed')
    }
  }

  return (
    <AdminShell role="broker">
      <div className="space-y-4 max-w-6xl mx-auto">
        <div className="relative mt-4">
          <div className="rounded-2xl bg-white shadow-xl border border-gray-100 px-5 md:px-8 pt-6 pb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-20 h-20 rounded-full border-4 border-amber-400 overflow-hidden bg-gray-100 flex items-center justify-center text-2xl font-semibold text-gray-800">
                  {profileAvatarUrl ? (
                    <img src={profileAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.first_name?.[0] || user?.name?.[0] || 'B'
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 truncate">
                    {user?.first_name || user?.name || 'Broker'} {user?.last_name}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Verified</span>
                    </span>
                    {user?.created_at && (
                      <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                    )}
                    {(() => {
                      const rawCountry = user?.country || ''
                      if (!rawCountry) return null
                      const label = rawCountry === 'RW' ? 'Rwanda' : rawCountry === 'DRC' ? 'DRC' : rawCountry
                      return <span>Country: {label}</span>
                    })()}
                    {(() => {
                      const province = user?.province || user?.broker_province
                      const district = user?.district || user?.broker_district
                      const sector = user?.sector || user?.broker_sector
                      const parts = [province, district, sector].filter(Boolean)
                      if (parts.length === 0) return null
                      return <span>Location: {parts.join(' - ')}</span>
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 justify-end gap-4">
                <div className="flex-1 max-w-[220px] bg-rose-500 text-white rounded-2xl px-5 py-4 flex flex-col justify-center items-start shadow">
                  <div className="text-[11px] uppercase tracking-wide opacity-90 mb-1">Total ads</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-semibold leading-none">{totalAds}</div>
                    <div className="text-xs opacity-80">/ {quotaTotal}</div>
                  </div>
                  <div className="mt-1 text-[11px] opacity-90">Remaining: {remainingAds}</div>
                </div>
                <div className="flex-1 max-w-[200px] bg-emerald-500 text-white rounded-2xl px-5 py-4 flex flex-col justify-center items-start shadow">
                  <div className="text-xs opacity-80 mb-1">Total Followers</div>
                  <div className="text-2xl font-semibold leading-none">0</div>
                </div>
                <div className="hidden md:flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('dashboard')
                      const el = document.getElementById('broker-my-listings')
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                    className="px-4 py-2 rounded-full bg-sky-600 hover:bg-sky-700 text-xs md:text-sm font-semibold text-white shadow"
                  >
                    View my listings
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs md:text-sm font-semibold text-gray-500 border-t border-gray-100">
              <div className="flex flex-wrap gap-4">
                {[
                  { key: 'dashboard', label: 'DASHBOARD' },
                  { key: 'profile', label: 'PROFILE' },
                  { key: 'common', label: 'ADS' },
                  { key: 'settings', label: 'SETTINGS' },
                  { key: 'chats', label: 'CHATS' },
                  { key: 'messages', label: 'NOTIFICATIONS' },
                ].map(t => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`relative py-3 transition-colors ${
                      activeTab === t.key
                        ? 'text-amber-600'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {t.label}
                    {activeTab === t.key && (
                      <span className="absolute left-0 -bottom-[1px] h-[3px] w-full bg-amber-500 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-3">
                <QuickActions
                  className="mt-0"
                  actions={[
                    {
                      label: 'Request Broker',
                      variant: 'default',
                      onClick: async () => {
                        try {
                          await requestBroker()
                          setStatus('Requested broker')
                          toast.success('Broker request sent')
                          await load()
                        } catch {
                          setStatus('Request failed')
                          toast.error('Request failed')
                        }
                      },
                    },
                    {
                      label: 'Refresh',
                      variant: 'default',
                      onClick: () => {
                        load()
                        toast.message('Refreshed')
                      },
                    },
                  ]}
                />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="py-3 text-gray-500 hover:text-rose-600 text-xs md:text-sm font-semibold"
                >
                  LOGOUT
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <div id="broker-my-listings" className="pt-4 md:pt-6 space-y-4">
              <div className="mt-1 rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold tracking-wide text-gray-700">
                  My listings
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormStep(1)
                      setShowFormModal(true)
                    }}
                    className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-[11px] text-white shadow-sm"
                  >
                    Post ad
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormStep(1)
                      setShowFormModal(true)
                    }}
                    className="px-3 py-1.5 rounded-full bg-indigo-600/10 hover:bg-indigo-600/20 text-[11px] text-indigo-800 shadow-sm"
                  >
                    Create listing
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">ID</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Image</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Title</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Location</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Description</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-600">Category</th>
                      <th className="px-3 py-2 text-right font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-4 border-b text-center text-xs md:text-sm text-gray-500"
                        >
                          You have no listings yet.
                        </td>
                      </tr>
                    ) : (
                      items.map(it => {
                        const firstImage = Array.isArray(it.images) && it.images.length > 0 ? it.images[0] : null
                        const rawLocation = it.location || ''
                        const locationParts = rawLocation.split(',').map(p => p.trim()).filter(Boolean)
                        const shortLocation =
                          locationParts.length > 1 ? locationParts.slice(1).join(', ') : rawLocation || '—'
                        const imgSrc =
                          firstImage && firstImage.file_path
                            ? firstImage.file_path.startsWith('http')
                              ? firstImage.file_path
                              : `${BACKEND_URL}/storage/${firstImage.file_path}`
                            : null
                        return (
                          <tr key={it.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 border-b align-top text-gray-500 text-[11px] md:text-xs">
                              {it.id}
                            </td>
                            <td className="px-3 py-2 border-b align-top">
                              {imgSrc ? (
                                <div className="w-14 h-10 overflow-hidden rounded border border-gray-200 bg-gray-100">
                                  <img
                                    src={imgSrc}
                                    alt={it.title || 'Listing image'}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-14 h-10 rounded border border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                                  No image
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 border-b align-top">
                              <div className="font-medium text-gray-900 truncate max-w-[160px] md:max-w-xs">
                                {it.title}
                              </div>
                            </td>
                            <td className="px-3 py-2 border-b align-top text-gray-600">
                              {shortLocation}
                            </td>
                          <td className="px-3 py-2 border-b align-top text-gray-600">
                            <div className="max-w-[220px] md:max-w-sm truncate">
                              {it.description || '—'}
                            </div>
                          </td>
                            <td className="px-3 py-2 border-b align-top text-gray-600">
                              {it.category?.name || '—'}
                            </td>
                            <td className="px-3 py-2 border-b align-top text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  className="text-[11px] md:text-xs text-indigo-600 hover:text-indigo-800"
                                  onClick={() => startEdit(it)}
                                >
                                  Update
                                </button>
                                <button
                                  className="text-[11px] md:text-xs text-rose-600 hover:text-rose-700"
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await brokerDelete(it.id)
                                      toast.success('Listing deleted')
                                      await load()
                                    } catch {
                                      toast.error('Delete failed')
                                    }
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
        )}

        {activeTab === 'profile' && (
          <div className="pt-6 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
              <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-3">
                Profile details
              </h2>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-800">
                    {profileAvatarUrl ? (
                      <img src={profileAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.first_name?.[0] || user?.name?.[0] || 'B'
                    )}
                  </div>
                  <div>
                    <div>
                      <span className="font-medium">Name:</span> {user?.first_name} {user?.last_name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {user?.email}
                    </div>
                  </div>
                </div>
                {user?.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {user.phone}
                  </div>
                )}
                {user?.created_at && (
                  <div>
                    <span className="font-medium">Member since:</span>{' '}
                    {new Date(user.created_at).toLocaleDateString()}
                  </div>
                )}

                <form
                  className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs"
                  onSubmit={e => {
                    e.preventDefault()
                    const locParts = [profileCountry, profileProvince, profileDistrict, profileSector]
                      .filter(Boolean)
                    setListingLocation(locParts.join(', '))
                    setUser(prev =>
                      prev
                        ? {
                            ...prev,
                            country: profileCountry,
                            province: profileProvince,
                            district: profileDistrict,
                            sector: profileSector,
                          }
                        : prev,
                    )
                    toast.success('Profile location updated (local)')
                  }}
                >
                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-medium text-gray-500">Country</label>
                    <select
                      value={profileCountry}
                      onChange={e => setProfileCountry(e.target.value)}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900"
                    >
                      <option value="">Select country</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="DRC">DRC</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-[11px] font-medium text-gray-500">Province</label>
                    <select
                      value={selectedProvinceId}
                      onChange={e => {
                        const id = e.target.value
                        setSelectedProvinceId(id)
                        const found = provinceOptions.find(p => String(p.id) === String(id))
                        setProfileProvince(found?.name || '')
                      }}
                      className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900"
                      disabled={!profileCountry}
                    >
                      <option value="">Select province</option>
                      {provinceOptions.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {profileCountry === 'Rwanda' && (
                    <>
                      <div className="flex flex-col">
                        <label className="mb-1 text-[11px] font-medium text-gray-500">District</label>
                        <select
                          value={selectedDistrictId}
                          onChange={e => {
                            const id = e.target.value
                            setSelectedDistrictId(id)
                            const found = districtOptions.find(d => String(d.id) === String(id))
                            setProfileDistrict(found?.name || '')
                          }}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900"
                          disabled={!selectedProvinceId}
                        >
                          <option value="">Select district</option>
                          {districtOptions.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 text-[11px] font-medium text-gray-500">Sector</label>
                        <select
                          value={profileSector}
                          onChange={e => setProfileSector(e.target.value)}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900"
                          disabled={!selectedDistrictId}
                        >
                          <option value="">Select sector</option>
                          {sectorOptions.map(s => (
                            <option key={s.id} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {profileCountry === 'DRC' && (
                    <>
                      <div className="flex flex-col">
                        <label className="mb-1 text-[11px] font-medium text-gray-500">City</label>
                        <select
                          value={selectedCityId}
                          onChange={e => {
                            const id = e.target.value
                            setSelectedCityId(id)
                            const found = cityOptions.find(c => String(c.id) === String(id))
                            setProfileDistrict(found?.name || '')
                          }}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900"
                          disabled={!selectedProvinceId}
                        >
                          <option value="">Select city</option>
                          {cityOptions.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col">
                        <label className="mb-1 text-[11px] font-medium text-gray-500">Territory</label>
                        <select
                          value={selectedTerritoryId}
                          onChange={e => {
                            const id = e.target.value
                            setSelectedTerritoryId(id)
                            const found = territoryOptions.find(t => String(t.id) === String(id))
                            setProfileSector(found?.name || '')
                          }}
                          className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900"
                          disabled={!selectedProvinceId}
                        >
                          <option value="">Select territory</option>
                          {territoryOptions.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2 flex items-center justify-between mt-1">
                    <div>
                      <span className="font-medium">Current listing location:</span>{' '}
                      <span>{listingLocation || '-'}</span>
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-indigo-700"
                    >
                      Save location
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-1">Membership</h3>
              <p className="text-sm text-gray-500">Free plan • upgrade options coming soon.</p>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-5 md:p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <span className="text-emerald-600 text-2xl">✓</span>
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">
                  Ad submitted successfully
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  Your listing has been saved. It may take a short time to be reviewed and appear to buyers.
                </p>
                {lastListing && (
                  <p className="mt-2 text-[11px] md:text-xs text-gray-500">
                    Listing <span className="font-semibold text-gray-800">#{lastListing.id}</span>
                    {lastListing.title && (
                      <>
                        {' '}
                        • <span className="font-medium text-gray-800">{lastListing.title}</span>
                      </>
                    )}
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 rounded-full border border-gray-200 text-xs md:text-sm text-gray-700 hover:bg-gray-50"
                >
                  View my listings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccessModal(false)
                    setEditingId(null)
                    setFormStep(1)
                    setShowFormModal(true)
                  }}
                  className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-xs md:text-sm text-white"
                >
                  Post another ad
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="pt-6 rounded-2xl bg-white shadow-sm border border-gray-100 p-4 max-w-xl">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-3">
              Settings
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              This is a basic settings stub. You can extend it later to update profile and preferences.
            </p>
            <form
              onSubmit={e => {
                e.preventDefault()
                toast.message('Settings saved (demo only)')
              }}
              className="space-y-3 text-sm"
            >
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Display name</label>
                <input
                  type="text"
                  defaultValue={user?.first_name || ''}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notification emails</label>
                <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900">
                  <option>All notifications</option>
                  <option>Only important updates</option>
                  <option>No email notifications</option>
                </select>
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
              >
                Save changes
              </button>
            </form>
          </div>
        )}

        {activeTab === 'common' && (
          <div className="pt-6 rounded-2xl bg-white shadow-sm border border-gray-100 p-4 text-sm text-gray-600">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-2">
              Common ads
            </h2>
            <p>
              This section can highlight featured or commonly used ad templates. For now it is a placeholder.
            </p>
          </div>
        )}

        {activeTab === 'chats' && (
          <div className="pt-6 rounded-2xl bg-white shadow-sm border border-gray-100 p-4 text-sm text-gray-600">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-2">
              My chats
            </h2>
            <p>Chat and messaging integration is not implemented yet. You can plug your chat system here later.</p>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="pt-6 rounded-2xl bg-white shadow-sm border border-gray-100 p-4 text-sm text-gray-600">
            <h2 className="text-sm font-semibold tracking-wide text-gray-700 mb-2">
              Messages
            </h2>
            <p>This is a placeholder inbox area for buyer messages and inquiries.</p>
          </div>
        )}

        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
              ref={formCardRef}
              className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-4 md:p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">
                  {editingId ? `Edit listing #${editingId}` : 'Create new listing'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="text-xs text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <div className="font-medium text-gray-700">Step {formStep} of 5</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span
                        key={s}
                        className={`h-1.5 w-6 rounded-full ${
                          formStep === s
                            ? 'bg-indigo-600'
                            : formStep > s
                            ? 'bg-indigo-200'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {formStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Category</label>
                      <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        className="rounded-full bg-white border border-gray-200 px-3 py-2 text-gray-900"
                      >
                        <option value="">Select category</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {showStep1Errors && !categoryId && (
                        <p className="mt-1 text-[11px] text-red-500">Category is required.</p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Sub category</label>
                      <select
                        value={vehicleSubcat}
                        onChange={e => setVehicleSubcat(e.target.value)}
                        className="rounded-full bg-white border border-gray-200 px-3 py-2 text-gray-900"
                      >
                        <option value="">Select sub category</option>
                        {isVehicles && (
                          <>
                            <option value="cars_for_sale">Cars for sale</option>
                            <option value="cars_for_rent">Cars for rent</option>
                          </>
                        )}
                        {isHouses && (
                          <>
                            <option value="houses_for_sale">Houses for sale</option>
                            <option value="houses_for_rent">Houses for rent</option>
                          </>
                        )}
                      </select>
                      {showStep1Errors && (!vehicleSubcat && (isVehicles || isHouses)) && (
                        <p className="mt-1 text-[11px] text-red-500">Sub category is required.</p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="rounded-full bg-white border border-gray-200 px-3 py-2 text-gray-900"
                      />
                      {showStep1Errors && !title && (
                        <p className="mt-1 text-[11px] text-red-500">Title is required.</p>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                        {vehicleSubcat === 'cars_for_rent' || vehicleSubcat === 'houses_for_rent'
                          ? 'Rent details'
                          : 'Price'}
                      </label>

                      {vehicleSubcat === 'cars_for_rent' || vehicleSubcat === 'houses_for_rent' ? (
                        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_80px] gap-2 items-center">
                            <div>
                              <span className="block text-[11px] font-medium text-gray-600 mb-0.5">Amount</span>
                              <input
                                type="number"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full rounded-full bg-white border border-gray-200 px-3 py-2 text-xs md:text-sm text-gray-900"
                              />
                            </div>
                            <div>
                              <span className="block text-[11px] font-medium text-gray-600 mb-0.5">Rent period</span>
                              <select
                                value={vehicleRentalPeriod}
                                onChange={e => setVehicleRentalPeriod(e.target.value)}
                                className="w-full rounded-full bg-white border border-gray-200 px-3 py-2 text-xs md:text-sm text-gray-900"
                              >
                                <option value="">Select period</option>
                                {vehicleSubcat === 'cars_for_rent' && (
                                  <>
                                    <option value="daily">Per day</option>
                                    <option value="weekly">Per week</option>
                                    <option value="monthly">Per month</option>
                                  </>
                                )}
                                {vehicleSubcat === 'houses_for_rent' && (
                                  <option value="monthly">Per month</option>
                                )}
                              </select>
                            </div>
                            <div>
                              <span className="block text-[11px] font-medium text-gray-600 mb-0.5">Currency</span>
                              <select
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                                className="w-full rounded-full bg-white border border-gray-200 px-2 py-2 text-xs md:text-sm text-gray-900 text-center"
                              >
                                <option value="RWF">RWF</option>
                                <option value="USD">$</option>
                              </select>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-400">
                            {vehicleSubcat === 'cars_for_rent'
                              ? 'Example: 40,000 RWF per day, or 250,000 RWF per month.'
                              : 'Example: 300,000 RWF per month.'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={price}
                              onChange={e => setPrice(e.target.value)}
                              className="flex-1 rounded-full bg-white border border-gray-200 px-3 py-2 text-gray-900"
                            />
                            <select
                              value={currency}
                              onChange={e => setCurrency(e.target.value)}
                              className="w-20 rounded-full bg-white border border-gray-200 px-2 py-2 text-xs text-gray-900"
                            >
                              <option value="RWF">RWF</option>
                              <option value="USD">$</option>
                            </select>
                          </div>
                          <p className="mt-1 text-[11px] text-gray-400">Enter total price, then choose RWF or USD.</p>
                        </>
                      )}

                      {showStep1Errors && !price && (
                        <p className="mt-1 text-[11px] text-red-500">Amount is required.</p>
                      )}
                    </div>

                    {/* Transaction kept in state (sell/rent) but field hidden for now */}

                    <div className="flex flex-col md:col-span-2">
                      <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Location</label>

                      {profileCountry === 'Rwanda' && (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 space-y-2">
                          <div className="text-[11px] text-gray-500">Rwanda • Province / District / Sector</div>
                          <input
                            type="text"
                            value={listingLocation}
                            readOnly
                            className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs md:text-sm text-gray-900"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] md:text-xs">
                            <div className="flex flex-col">
                              <span className="mb-0.5 text-gray-500">Province</span>
                              <select
                                value={listingProvinceId}
                                onChange={e => {
                                  setListingProvinceId(e.target.value)
                                  setListingDistrictId('')
                                  setListingSectorName('')
                                }}
                                className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900 bg-white"
                              >
                                <option value="">Select province</option>
                                {listingProvinceOptions.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col">
                              <span className="mb-0.5 text-gray-500">District</span>
                              <select
                                value={listingDistrictId}
                                onChange={e => {
                                  setListingDistrictId(e.target.value)
                                  setListingSectorName('')
                                }}
                                className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900 bg-white"
                                disabled={!listingProvinceId}
                              >
                                <option value="">Select district</option>
                                {listingDistrictOptions.map(d => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col">
                              <span className="mb-0.5 text-gray-500">Sector</span>
                              <select
                                value={listingSectorName}
                                onChange={e => setListingSectorName(e.target.value)}
                                className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900 bg-white"
                                disabled={!listingDistrictId}
                              >
                                <option value="">Select sector</option>
                                {listingSectorOptions.map(s => (
                                  <option key={s.id} value={s.name}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <p className="mt-1 text-[11px] text-gray-500">
                            Buyers will see this full location in your ad and in AI description.
                          </p>
                        </div>
                      )}

                      {profileCountry === 'DRC' && (
                        <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 space-y-2">
                          <div className="text-[11px] text-gray-500">DRC • Province / City or Territory</div>
                          <input
                            type="text"
                            value={listingLocation}
                            readOnly
                            className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs md:text-sm text-gray-900"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] md:text-xs">
                            <div className="flex flex-col">
                              <span className="mb-0.5 text-gray-500">Province</span>
                              <select
                                value={listingProvinceId}
                                onChange={e => {
                                  setListingProvinceId(e.target.value)
                                  setListingCityId('')
                                  setListingTerritoryId('')
                                }}
                                className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900 bg-white"
                              >
                                <option value="">Select province</option>
                                {listingProvinceOptions.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col">
                              <span className="mb-0.5 text-gray-500">City</span>
                              <select
                                value={listingCityId}
                                onChange={e => setListingCityId(e.target.value)}
                                className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900 bg-white"
                                disabled={!listingProvinceId}
                              >
                                <option value="">Select city</option>
                                {listingCityOptions.map(c => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col">
                              <span className="mb-0.5 text-gray-500">Territory</span>
                              <select
                                value={listingTerritoryId}
                                onChange={e => setListingTerritoryId(e.target.value)}
                                className="rounded-lg border border-gray-200 px-2 py-1.5 text-gray-900 bg-white"
                                disabled={!listingProvinceId}
                              >
                                <option value="">Select territory</option>
                                {listingTerritoryOptions.map(t => (
                                  <option key={t.id} value={t.id}>
                                    {t.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <p className="mt-1 text-[11px] text-gray-500">
                            Use either city or territory depending on where the car is parked.
                          </p>
                        </div>
                      )}

                      {profileCountry !== 'Rwanda' && profileCountry !== 'DRC' && (
                        <>
                          <input
                            type="text"
                            value={listingLocation}
                            onChange={e => setListingLocation(e.target.value)}
                            className="rounded-full bg-white border border-gray-200 px-3 py-2 text-gray-900"
                          />
                          <p className="mt-1 text-[11px] text-gray-400">
                            Default from your broker profile, but you can change it to where this car is located.
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className="mt-0.5 text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline text-left"
                          >
                            Change my location in profile
                          </button>
                        </>
                      )}

                      {showStep1Errors && !listingLocation && (
                        <p className="mt-1 text-[11px] text-red-500">Location is required.</p>
                      )}
                    </div>
                  </div>
                )}

                {formStep === 2 && (
                  <div className="space-y-3">
                    {isVehicles ? (
                      <VehicleForm
                        vehicleSubcat={vehicleSubcat}
                        setVehicleSubcat={setVehicleSubcat}
                        vehicleMake={vehicleMake}
                        setVehicleMake={setVehicleMake}
                        vehicleModel={vehicleModel}
                        setVehicleModel={setVehicleModel}
                        vehicleYear={vehicleYear}
                        setVehicleYear={setVehicleYear}
                        vehicleCondition={vehicleCondition}
                        setVehicleCondition={setVehicleCondition}
                        showStep2Errors={showStep2Errors}
                        vehicleMileage={vehicleMileage}
                        setVehicleMileage={setVehicleMileage}
                        vehicleTransmission={vehicleTransmission}
                        setVehicleTransmission={setVehicleTransmission}
                        vehicleFuel={vehicleFuel}
                        setVehicleFuel={setVehicleFuel}
                        vehicleEngineSize={vehicleEngineSize}
                        setVehicleEngineSize={setVehicleEngineSize}
                        vehicleDriveType={vehicleDriveType}
                        setVehicleDriveType={setVehicleDriveType}
                        vehicleExterior={vehicleExterior}
                        setVehicleExterior={setVehicleExterior}
                        vehicleInterior={vehicleInterior}
                        setVehicleInterior={setVehicleInterior}
                        vehicleDoors={vehicleDoors}
                        setVehicleDoors={setVehicleDoors}
                        vehicleSeats={vehicleSeats}
                        setVehicleSeats={setVehicleSeats}
                        vehicleRentalPeriod={vehicleRentalPeriod}
                        setVehicleRentalPeriod={setVehicleRentalPeriod}
                        vehicleAvailableFrom={vehicleAvailableFrom}
                        setVehicleAvailableFrom={setVehicleAvailableFrom}
                        vehicleNegotiable={vehicleNegotiable}
                        setVehicleNegotiable={setVehicleNegotiable}
                        vehicleInsuranceIncluded={vehicleInsuranceIncluded}
                        setVehicleInsuranceIncluded={setVehicleInsuranceIncluded}
                        partName={partName}
                        setPartName={setPartName}
                        partCompatible={partCompatible}
                        setPartCompatible={setPartCompatible}
                        partCondition={partCondition}
                        setPartCondition={setPartCondition}
                        partQuantity={partQuantity}
                        setPartQuantity={setPartQuantity}
                        partType={partType}
                        setPartType={setPartType}
                        rimSize={rimSize}
                        setRimSize={setRimSize}
                        boltPattern={boltPattern}
                        setBoltPattern={setBoltPattern}
                        rimOffset={rimOffset}
                        setRimOffset={setRimOffset}
                        rimMaterial={rimMaterial}
                        setRimMaterial={setRimMaterial}
                        rimFinish={rimFinish}
                        setRimFinish={setRimFinish}
                        rimCondition={rimCondition}
                        setRimCondition={setRimCondition}
                        tireIncluded={tireIncluded}
                        setTireIncluded={setTireIncluded}
                      />
                    ) : isHouses ? (
                      <div className="mt-2 bg-white border border-gray-200 rounded-2xl p-4 md:p-6 space-y-4 shadow-sm">
                        <div>
                          <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-1">House details</h4>
                          <p className="text-[11px] md:text-xs text-gray-500">
                            Add key details about this house so buyers can quickly understand what you are offering.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Bedrooms</label>
                            <input
                              type="number"
                              value={houseBedrooms}
                              onChange={e => setHouseBedrooms(e.target.value)}
                              className="mt-1 block w-full rounded-full bg-white border border-gray-300 px-3 py-2 text-sm text-gray-900"
                            />
                            {showStep2Errors && !houseBedrooms && (
                              <p className="mt-1 text-[11px] text-red-500">Bedrooms are required.</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Bathrooms</label>
                            <input
                              type="number"
                              value={houseBathrooms}
                              onChange={e => setHouseBathrooms(e.target.value)}
                              className="mt-1 block w-full rounded-full bg-white border border-gray-300 px-3 py-2 text-sm text-gray-900"
                            />
                            {showStep2Errors && !houseBathrooms && (
                              <p className="mt-1 text-[11px] text-red-500">Bathrooms are required.</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Area (sqm)</label>
                            <input
                              type="number"
                              value={houseArea}
                              onChange={e => setHouseArea(e.target.value)}
                              className="mt-1 block w-full rounded-full bg-white border border-gray-300 px-3 py-2 text-sm text-gray-900"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">Neighbourhood</label>
                            <input
                              type="text"
                              value={houseNeighbourhood}
                              onChange={e => setHouseNeighbourhood(e.target.value)}
                              placeholder="e.g. Kanombe, Kicukiro, Gacuriro"
                              className="mt-1 block w-full rounded-full bg-white border border-gray-300 px-3 py-2 text-sm text-gray-900"
                            />
                          </div>

                          <div>
                            <label className="block text-xs md:text-[13px] font-medium text-gray-800 mb-1">
                              Neighbourhood photos (optional)
                            </label>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={e => {
                                const files = Array.from(e.target.files || [])
                                if (files.length > 0) {
                                  setImages(prev => [...prev, ...files])
                                }
                              }}
                              className="mt-1 block w-full rounded-full bg-white border border-gray-300 px-3 py-2 text-xs text-gray-900"
                            />
                            {images.length > 0 && (
                              <div className="mt-2 grid grid-cols-5 gap-1">
                                {images.slice(0, 5).map((f, idx) => (
                                  <div
                                    key={idx}
                                    className="aspect-square rounded overflow-hidden border border-gray-200 bg-gray-100"
                                  >
                                    <img
                                      src={URL.createObjectURL(f)}
                                      alt="preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            <p className="mt-1 text-[10px] text-gray-400">
                              These photos will be uploaded together with your main listing images.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">No extra structured details for this category.</div>
                    )}
                  </div>
                )}

                {formStep === 3 && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-gray-500">
                      The AI description will use your title, price, make/model, year, mileage, fuel,
                      transmission and <span className="font-medium text-gray-700">location</span> to create an
                      attractive text that works well for SEO and social media sharing.
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1">
                      <button
                        type="button"
                        className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-800 rounded px-3 py-2 text-sm"
                        onClick={handleGenerate}
                      >
                        Generate Description
                      </button>
                      <button
                        type="button"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded px-3 py-2 text-sm"
                        onClick={() => {
                          if (descRef.current) descRef.current.focus()
                        }}
                      >
                        Edit Description
                      </button>
                      <button
                        type="button"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 py-2 text-sm"
                        onClick={() => {
                          navigator.clipboard.writeText(desc || '')
                          toast.message('Copied description')
                        }}
                      >
                        Copy Description
                      </button>
                    </div>

                    <textarea
                      ref={descRef}
                      className="mt-2 w-full min-h-28 border border-gray-200 bg-gray-50 rounded p-3 text-gray-900"
                      placeholder="Suggested Description (editable)"
                      value={desc}
                      onChange={e => setDesc(e.target.value)}
                    />

                    {isVehicles && (
                      <div className="mt-3 bg-white border border-gray-100 rounded-xl p-3 text-xs text-gray-700 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-800">Vehicle preview</span>
                          {vehicleSubcat && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold uppercase">
                              {vehicleSubcat.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500">
                          This is a quick summary of what buyers will see in your listing.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                          <div>
                            <span className="font-medium">Title:</span>{' '}
                            <span>{title || 'No title yet'}</span>
                          </div>
                          <div>
                            <span className="font-medium">Price:</span>{' '}
                            <span>
                              {price
                                ? `${currency === 'USD' ? '$' : 'RWF'} ${Number(price).toLocaleString()}`
                                : 'Not set'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Make / Model:</span>{' '}
                            <span>
                              {vehicleMake || vehicleModel
                                ? `${vehicleMake || ''} ${vehicleModel || ''}`.trim()
                                : 'Not set'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Year:</span>{' '}
                            <span>{vehicleYear || 'Not set'}</span>
                          </div>
                          <div>
                            <span className="font-medium">Mileage:</span>{' '}
                            <span>
                              {vehicleMileage ? `${vehicleMileage} km` : 'Not set'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Fuel / Transmission:</span>{' '}
                            <span>
                              {vehicleFuel || vehicleTransmission
                                ? `${vehicleFuel || ''} ${
                                    vehicleTransmission || ''
                                  }`.trim()
                                : 'Not set'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Location:</span>{' '}
                            <span>{listingLocation || 'Not set'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {formStep === 4 && (
                  <div className="space-y-3">
                    <div className="flex flex-col">
                      <label className="text-xs uppercase tracking-wide text-gray-500 mb-1">Images</label>
                      <input
                        type="file"
                        multiple
                        onChange={e => setImages(Array.from(e.target.files || []))}
                        className="rounded-full bg-white border border-gray-200 px-3 py-2 text-gray-900"
                      />
                    </div>

                    {images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {images.map((f, idx) => (
                          <div
                            key={idx}
                            className="relative w-24 h-20 overflow-hidden rounded border border-white/10"
                          >
                            <img
                              alt="preview"
                              src={URL.createObjectURL(f)}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 text-xs bg-rose-600 text-white rounded px-1"
                              onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {status && <div className="text-sm text-gray-700">{status}</div>}
                {errors && (
                  <ul className="text-sm text-red-500 list-disc pl-5">
                    {Object.entries(errors).map(([k, arr]) => (
                      <li key={k}>
                        {k}: {Array.isArray(arr) ? arr.join(', ') : String(arr)}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex justify-between items-center">
                  <div>
                    {formStep > 1 && (
                      <button
                        type="button"
                        onClick={() => setFormStep(s => Math.max(1, s - 1))}
                        className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-xs text-gray-800"
                      >
                        Back
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {formStep < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!validateStep(formStep)) return
                          setFormStep(s => Math.min(5, s + 1))
                        }}
                        className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-xs text-white"
                      >
                        Next
                      </button>
                    )}
                    {formStep === 5 && (
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-xs text-white"
                      >
                        Submit listing
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
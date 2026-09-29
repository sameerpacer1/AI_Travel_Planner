import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getErrorMessage } from '../lib/api.js';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Card, CardContent } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { formatCurrency, getDaysBetween } from '../lib/utils.js';
import {
  MapPin,
  Calendar,
  Users,
  Wallet,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

const INTEREST_OPTIONS = [
  { id: 'mountains', label: 'Mountains & Scenery', icon: '🏔️' },
  { id: 'photography', label: 'Photography', icon: '📸' },
  { id: 'food', label: 'Local Food & Cafes', icon: '🍲' },
  { id: 'heritage', label: 'History & Heritage', icon: '🏛️' },
  { id: 'adventure', label: 'Adventure & Thrills', icon: '🧗' },
  { id: 'beaches', label: 'Beaches & Water', icon: '🏖️' },
  { id: 'nature', label: 'Nature & Parks', icon: '🌲' },
  { id: 'shopping', label: 'Shopping & Bazaars', icon: '🛍️' },
  { id: 'relaxation', label: 'Relaxation & Wellness', icon: '🧘' },
  { id: 'nightlife', label: 'Nightlife & Lounges', icon: '🍸' },
];

const STYLE_OPTIONS = [
  { id: 'budget', label: 'Budget-Friendly', desc: 'Focus on low-cost stays, local transit, and high value' },
  { id: 'balanced', label: 'Balanced', desc: 'Comfortable balance of value, quality, and experiences' },
  { id: 'luxury', label: 'Luxury', desc: 'Premium hotels, fine dining, and private transfers' },
  { id: 'adventure', label: 'Adventure', desc: 'High adrenaline, outdoor hikes, and scenic exploration' },
  { id: 'relaxed', label: 'Relaxed & Slow', desc: 'Leisurely pace with plenty of free downtime' },
];

const TRANSPORT_OPTIONS = [
  { id: 'bus', label: 'Bus / Volvo' },
  { id: 'train', label: 'Train / Rail' },
  { id: 'flight', label: 'Flight' },
  { id: 'self_drive', label: 'Self Drive / Car' },
  { id: 'public_transit', label: 'Public Transit' },
  { id: 'any', label: 'Any / Flexible' },
];

const ACCOMMODATION_OPTIONS = [
  { id: 'budget_hotel', label: 'Budget Hotel' },
  { id: 'hostel', label: 'Backpacker Hostel' },
  { id: 'mid_range_hotel', label: 'Mid-Range Hotel' },
  { id: 'luxury_resort', label: 'Luxury Resort' },
  { id: 'homestay', label: 'Homestay / Airbnb' },
  { id: 'any', label: 'Any / Flexible' },
];

export function CreateTripPage() {
  const navigate = useNavigate();

  // Wizard state (Steps 1 to 7)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Form Fields
  const [origin, setOrigin] = useState('Ghaziabad');
  const [destination, setDestination] = useState('Manali');
  const [startDate, setStartDate] = useState('2026-10-10');
  const [endDate, setEndDate] = useState('2026-10-13');
  const [travelers, setTravelers] = useState(3);
  const [budget, setBudget] = useState(15000);
  const [currency, setCurrency] = useState('INR');
  const [interests, setInterests] = useState<string[]>(['mountains', 'photography', 'food']);
  const [travelStyle, setTravelStyle] = useState('budget');
  const [transportPreference, setTransportPreference] = useState('bus');
  const [accommodationPreference, setAccommodationPreference] = useState('budget_hotel');
  const [additionalPreferences, setAdditionalPreferences] = useState('');

  // Step Validation Error
  const [stepError, setStepError] = useState<string | null>(null);

  // Generation status states
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);

  const stepsList = [
    'Where to?',
    'Dates',
    'Travelers',
    'Budget',
    'Interests',
    'Style & Transit',
    'Review',
  ];

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const validateCurrentStep = (): boolean => {
    setStepError(null);

    if (currentStep === 1) {
      if (!origin.trim()) {
        setStepError('Please enter your departure city');
        return false;
      }
      if (!destination.trim()) {
        setStepError('Please enter your travel destination');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!startDate || !endDate) {
        setStepError('Please select both start and end dates');
        return false;
      }
      if (new Date(endDate) < new Date(startDate)) {
        setStepError('End date cannot be earlier than start date');
        return false;
      }
    }

    if (currentStep === 3) {
      if (travelers < 1 || travelers > 50) {
        setStepError('Travelers must be between 1 and 50');
        return false;
      }
    }

    if (currentStep === 4) {
      if (!budget || budget <= 0) {
        setStepError('Please specify a positive budget amount');
        return false;
      }
    }

    if (currentStep === 5) {
      if (interests.length === 0) {
        setStepError('Please select at least one interest or activity');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setStepError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // AI Generation Progress Stage Simulation while backend processes
  const generationMessages = [
    'Understanding your destination and travel dates...',
    'Analyzing route logistics and transportation preferences...',
    'Balancing your budget across stays, dining, and activities...',
    'Matching local highlights to your selected interests...',
    'Formulating transparent reasoning for each itinerary item...',
    'Finalizing your personalized day-by-day plan...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && !generationError) {
      interval = setInterval(() => {
        setGenerationStep((prev) => (prev < generationMessages.length - 1 ? prev + 1 : prev));
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isGenerating, generationError]);

  const handleCreateAndGenerate = async () => {
    if (!validateCurrentStep()) return;

    try {
      setIsGenerating(true);
      setGenerationStep(0);
      setGenerationError(null);

      // Step A: Save trip in database
      const tripPayload = {
        title: `Trip to ${destination}`,
        origin,
        destination,
        startDate,
        endDate,
        travelers,
        budget: Number(budget),
        currency,
        travelStyle,
        interests,
        transportPreference,
        accommodationPreference,
        additionalPreferences: additionalPreferences.trim() || undefined,
      };

      const createRes = await api.post('/trips', tripPayload);
      if (!createRes.data.success) {
        throw new Error(createRes.data.error?.message || 'Failed to create trip');
      }

      const tripId = createRes.data.data.trip.id;
      setCreatedTripId(tripId);

      // Step B: Trigger AI Generation
      try {
        const generateRes = await api.post(`/trips/${tripId}/generate`);
        if (generateRes.data.success) {
          navigate(`/trips/${tripId}`);
          return;
        }
      } catch (aiErr) {
        setGenerationError(getErrorMessage(aiErr));
      }
    } catch (err) {
      setGenerationError(getErrorMessage(err));
    }
  };

  const retryGeneration = async () => {
    if (!createdTripId) return;
    try {
      setGenerationError(null);
      setGenerationStep(0);
      const res = await api.post(`/trips/${createdTripId}/generate`);
      if (res.data.success) {
        navigate(`/trips/${createdTripId}`);
      }
    } catch (err) {
      setGenerationError(getErrorMessage(err));
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-surface">
        <div className="w-full max-w-lg text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-float">
          {generationError ? (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">AI Generation Notice</h3>
              <p className="text-xs text-slate-600 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 text-left">
                {generationError}
              </p>
              <p className="text-xs text-slate-500">
                Your trip parameters have been securely saved. You can retry once <code>GEMINI_API_KEY</code> is set in your server <code>.env</code> file, or open the trip draft.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Button variant="outline" size="sm" onClick={retryGeneration} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Retry Generation
                </Button>
                {createdTripId && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/trips/${createdTripId}`)}
                  >
                    View Trip Details
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-brand-600">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Crafting your itinerary
                </h3>
                <p className="text-xs text-brand-700 font-semibold mt-1">
                  TripWise AI • {destination}
                </p>
              </div>

              {/* Progress message tracker */}
              <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100/60 min-h-[72px] flex items-center justify-center">
                <p className="text-sm font-medium text-slate-700 animate-fade-in key={generationStep}">
                  {generationMessages[generationStep]}
                </p>
              </div>

              {/* Progress step indicators */}
              <div className="flex items-center justify-center gap-1.5">
                {generationMessages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx <= generationStep ? 'w-6 bg-brand-600' : 'w-2 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11px] text-slate-400">
                Validating activities with Gemini AI • No fake prices generated
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const durationDays = startDate && endDate ? getDaysBetween(startDate, endDate) : 1;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Wizard Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Step {currentStep} of {totalSteps}: {stepsList[currentStep - 1]}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Card */}
      <Card className="shadow-float border-slate-200/80 overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {stepError && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{stepError}</span>
            </div>
          )}

          {/* STEP 1: WHERE TO? */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Where are you going?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tell us where your journey begins and where you want to explore.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  label="Starting From (Origin City)"
                  placeholder="e.g. Ghaziabad, New Delhi, Mumbai"
                  startIcon={<Compass className="w-4 h-4" />}
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />

                <Input
                  label="Destination City / Region"
                  placeholder="e.g. Manali, Goa, Jaipur, Leh"
                  startIcon={<MapPin className="w-4 h-4 text-brand-600" />}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    Popular Destinations to Try
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['Manali', 'Goa', 'Jaipur', 'Kerala', 'Leh-Ladakh', 'Varanasi', 'Udaipur'].map(
                      (item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setDestination(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                            destination.toLowerCase() === item.toLowerCase()
                              ? 'bg-brand-50 border-brand-300 text-brand-700 font-semibold'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DATES */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">When are you going?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pick your trip start and end dates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <Input
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-brand-600" />
                  <div>
                    <p className="text-xs font-bold text-brand-900">Calculated Trip Length</p>
                    <p className="text-xs text-brand-700">{durationDays} days itinerary</p>
                  </div>
                </div>
                <Badge variant="info">{durationDays} Days</Badge>
              </div>
            </div>
          )}

          {/* STEP 3: WHO IS TRAVELLING? */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Who is travelling?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Total passenger count helps TripWise calibrate group transport and hotel rooms.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { count: 1, label: 'Solo', desc: '1 Traveler' },
                  { count: 2, label: 'Couple', desc: '2 Travelers' },
                  { count: 3, label: 'Friends', desc: '3 Travelers' },
                  { count: 4, label: 'Group / Family', desc: '4+ Travelers' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setTravelers(item.count)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      travelers === item.count
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Users className="w-5 h-5 mx-auto mb-2 text-slate-700" />
                    <p className="text-xs font-bold text-slate-900">{item.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <Input
                  label="Exact Traveler Count"
                  type="number"
                  min="1"
                  max="50"
                  value={travelers}
                  onChange={(e) => setTravelers(parseInt(e.target.value, 10) || 1)}
                />
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">What is your total budget?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  AI will allocate this budget between travel, hotel, food, and activities.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Total Budget (All travelers combined)"
                    type="number"
                    min="1000"
                    step="500"
                    startIcon={<Wallet className="w-4 h-4 text-emerald-600" />}
                    value={budget}
                    onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Quick Budget Presets (INR)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[10000, 15000, 25000, 40000, 75000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setBudget(val);
                        setCurrency('INR');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                        budget === val
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ₹{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between text-xs">
                <span className="text-emerald-900 font-medium">Estimated Budget per Traveler:</span>
                <span className="font-bold text-emerald-800 text-sm">
                  {formatCurrency(Math.round(budget / Math.max(1, travelers)), currency)}
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: INTERESTS */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">What do you enjoy?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your interests. TripWise will explain why each activity was chosen based on these tags.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {INTEREST_OPTIONS.map((item) => {
                  const isSelected = interests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20 font-semibold text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{item.label}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400">
                Selected: {interests.length} {interests.length === 1 ? 'interest' : 'interests'}
              </p>
            </div>
          )}

          {/* STEP 6: HOW DO YOU WANT TO TRAVEL? */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">How do you want to travel?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your travel pacing, transport method, and accommodation preferences.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Travel Style & Vibe
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {STYLE_OPTIONS.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTravelStyle(style.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        travelStyle === style.id
                          ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{style.label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Transport Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRANSPORT_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTransportPreference(t.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-colors ${
                        transportPreference === t.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Accommodation Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ACCOMMODATION_OPTIONS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAccommodationPreference(a.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition-colors ${
                        accommodationPreference === a.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Review & Preferences</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Add any specific requirements before generating your AI itinerary.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Trip Summary
                  </span>
                  <Badge variant="info">{durationDays} Days</Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ROUTE</span>
                    <span className="font-bold text-slate-800">{origin} → {destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DATES</span>
                    <span className="font-bold text-slate-800">{startDate} to {endDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TRAVELERS</span>
                    <span className="font-bold text-slate-800">{travelers} {travelers === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">BUDGET</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(budget, currency)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1 text-xs">
                  <span className="text-[11px] text-slate-500 mr-1">Interests:</span>
                  {interests.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-medium text-slate-700 capitalize"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Anything else? (Optional notes for the AI)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Vegetarian food options only, prefer scenic walking tours over crowded shopping streets, avoid late night travel..."
                  value={additionalPreferences}
                  onChange={(e) => setAdditionalPreferences(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-brand-50/70 border border-brand-100 flex items-center gap-2.5 text-xs text-brand-900">
                <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  Gemini AI will synthesize a day-by-day plan with transparent reasons for every activity.
                </span>
              </div>
            </div>
          )}

          {/* Navigation Controls Footer */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <Button variant="primary" size="md" onClick={handleNext} className="gap-1.5">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleCreateAndGenerate}
                className="gap-2 shadow-lg shadow-brand-500/25 px-6"
              >
                <Sparkles className="w-4 h-4" />
                Generate my itinerary
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

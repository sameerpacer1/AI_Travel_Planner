import React, { useState } from 'react';
import { api, getErrorMessage } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Card, CardContent } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  Users,
  Wallet,
  MessageSquare,
  Database,
} from 'lucide-react';

export function TravelInquirySection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: '',
    travel_dates: '',
    travelers_count: 1,
    budget: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'travelers_count' ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/inquiries', formData);
      setSubmittedInquiry(res.data?.data?.inquiry || { id: 'live-supabase-ref', name: formData.name });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="travel-inquiry" className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Heading & Value Prop */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700">
              <Database className="w-3.5 h-3.5 text-brand-600" />
              <span>Live Supabase Backend Integration</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Have Questions or Need a Custom Itinerary?
            </h2>

            <p className="text-slate-600 text-sm leading-relaxed">
              Fill out this travel consultation inquiry. Your details, preferences, and questions will be saved directly into our secure **Supabase cloud backend**, and our AI travel planning team will help customize your journey.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Direct Supabase Database Sync</h4>
                  <p className="text-xs text-slate-500">Every inquiry form is recorded in PostgreSQL on Supabase instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Custom Budget & Route Advice</h4>
                  <p className="text-xs text-slate-500">Get assistance on verified transport, hotels, and daily expenses.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">For Solo, Couples & Groups</h4>
                  <p className="text-xs text-slate-500">Tailored suggestions suited to your travel crew and pace.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form Card */}
          <div className="lg:col-span-7">
            <Card className="shadow-float border-slate-200/90 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6 sm:p-8">
                {submittedInquiry ? (
                  /* Success Confirmation State */
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <Badge variant="success" className="gap-1.5 px-3 py-1">
                      <Database className="w-3 h-3" />
                      Saved in Supabase Backend
                    </Badge>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Thank You, {submittedInquiry.name}!
                    </h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      Your travel inquiry has been successfully recorded in our Supabase database under reference ID:
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl inline-block text-xs font-mono font-semibold text-slate-800">
                      {submittedInquiry.id}
                    </div>
                    <div className="pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSubmittedInquiry(null);
                          setFormData({
                            name: '',
                            email: '',
                            phone: '',
                            destination: '',
                            travel_dates: '',
                            travelers_count: 1,
                            budget: '',
                            message: '',
                          });
                        }}
                      >
                        Submit Another Inquiry
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Active Form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="border-b border-slate-100 pb-4 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        Travel Inquiry & Consultation Form
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Send us your travel plans to get advice and personalized support.
                      </p>
                    </div>

                    {error && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Row 1: Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Full Name *</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Sameer Sharma"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>Email Address *</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. sameer@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone & Destination */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>Phone Number (Optional)</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>Dream Destination</span>
                        </label>
                        <input
                          type="text"
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          placeholder="e.g. Varanasi, Manali, Goa, Kerala"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 3: Travel Dates, Travelers & Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>Approx. Dates</span>
                        </label>
                        <input
                          type="text"
                          name="travel_dates"
                          value={formData.travel_dates}
                          onChange={handleChange}
                          placeholder="e.g. Nov 2026 or 5 days"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Travelers</span>
                        </label>
                        <input
                          type="number"
                          name="travelers_count"
                          min={1}
                          max={50}
                          value={formData.travelers_count}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <Wallet className="w-3.5 h-3.5 text-slate-400" />
                          <span>Target Budget</span>
                        </label>
                        <input
                          type="text"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          placeholder="e.g. ₹20,000"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 4: Message / Inquiry Details */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inquiry Details / What are you looking for? *</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about the sights you wish to see (e.g. Ganga Aarti in Varanasi, paragliding in Solang, beach huts in Goa), accommodation preferences, or questions."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-xs outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        size="md"
                        className="w-full gap-2 shadow-sm shadow-brand-500/25 py-3 text-xs font-bold"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Saving to Supabase Database...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Submit Inquiry & Save to Supabase</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

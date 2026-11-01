'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Store,
  Building,
  Receipt,
  Printer,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/app-shell';

export default function SetupWizardPage() {
  const router = useRouter();
  const { setUser, setAvailableOutlets, setSelectedOutlet } = useAppStore();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Brand
    brandName: 'RestoDesk Hospitality',
    brandSlug: 'restodesk-demo',
    timezone: 'Asia/Kolkata',
    currency: 'INR',

    // Step 2: Outlet
    outletName: 'Indiranagar Flagship',
    outletCode: 'BLR-IND-01',
    phone: '9876543210',
    email: 'indiranagar@restodesk.com',
    address: '100ft Road, 12th Main, HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    gstin: '29ABCDE1234F1Z5',
    fssaiNumber: '11223344556677',

    // Step 3: Taxes
    taxIncludedInPrice: false,
    defaultGstPercent: 5.0,

    // Step 4: Printer
    printerPaperWidth: '80mm' as '58mm' | '80mm',
    autoPrintKOT: true,
    autoPrintBill: true,
    adminPassword: 'Password@123',
  });

  const updateField = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.brandName) {
      toast.error('Please enter brand name');
      return;
    }
    if (step === 2 && (!formData.outletName || !formData.phone || !formData.city)) {
      toast.error('Please fill required outlet details');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCompleteSetup = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Setup submission failed');
      }

      setUser(data.user);
      if (data.outlet) {
        setAvailableOutlets([data.outlet]);
        setSelectedOutlet(data.outlet);
      }

      toast.success('Restaurant configured successfully! Launching dashboard...');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1 shadow-sm border border-orange-200 shrink-0 overflow-hidden">
              <Image
                src="/logo.png"
                alt="RestoDesk Logo"
                width={44}
                height={44}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                RestoDesk Setup Wizard
              </h1>
              <p className="text-xs text-muted-foreground">
                Configure your Brand, First Outlet, GST & Thermal Printers in 5 minutes
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            Skip to Dashboard
          </Button>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { num: 1, label: 'Brand', icon: Building },
            { num: 2, label: 'Outlet', icon: Store },
            { num: 3, label: 'Tax & GST', icon: Percent },
            { num: 4, label: 'Printers', icon: Printer },
            { num: 5, label: 'Review', icon: CheckCircle2 },
          ].map((s) => {
            const Icon = s.icon;
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200'
                    : isDone
                    ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                    : 'border-border bg-card text-muted-foreground opacity-60'
                }`}
              >
                <Icon className="h-4 w-4 mb-1" />
                <span className="text-[11px] font-semibold">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Wizard Card Body */}
        <Card className="rounded-2xl shadow-lg border">
          <CardHeader>
            <CardTitle className="text-xl">
              {step === 1 && 'Step 1: Brand & Organization Profile'}
              {step === 2 && 'Step 2: Primary Outlet & Compliance'}
              {step === 3 && 'Step 3: Tax Rates & Billing Rules'}
              {step === 4 && 'Step 4: Thermal Printers & KOT Hardware'}
              {step === 5 && 'Step 5: Review & Confirm Launch'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Set up your overall brand name, logo and default currency.'}
              {step === 2 && 'Enter outlet location, GSTIN for invoices, and FSSAI license.'}
              {step === 3 && 'Choose GST slab (5% restaurant standard or 12%/18%) and inclusive/exclusive mode.'}
              {step === 4 && 'Select your thermal paper width (58mm compact or 80mm standard) and print triggers.'}
              {step === 5 && 'Verify settings before generating your live restaurant workspace.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Brand / Company Name *</Label>
                    <Input
                      value={formData.brandName}
                      onChange={(e) => updateField('brandName', e.target.value)}
                      placeholder="e.g. Copper Chimney Hospitality"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Brand Slug (Identifier) *</Label>
                    <Input
                      value={formData.brandSlug}
                      onChange={(e) => updateField('brandSlug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="e.g. copper-chimney"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Default Currency</Label>
                    <Input value="INR (₹) - Indian Rupee" disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Timezone</Label>
                    <Input value="Asia/Kolkata (IST +5:30)" disabled />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Outlet Name *</Label>
                    <Input
                      value={formData.outletName}
                      onChange={(e) => updateField('outletName', e.target.value)}
                      placeholder="e.g. Indiranagar Flagship"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Outlet Short Code *</Label>
                    <Input
                      value={formData.outletCode}
                      onChange={(e) => updateField('outletCode', e.target.value.toUpperCase())}
                      placeholder="e.g. BLR-IND-01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Contact Phone (+91) *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="9876543210"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Outlet Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="indiranagar@restodesk.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Street Address *</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => updateField('address', e.target.value)}
                    placeholder="100ft Road, 12th Main, HAL 2nd Stage"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>City *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      placeholder="Bengaluru"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>State *</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      placeholder="Karnataka"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pincode</Label>
                    <Input
                      value={formData.postalCode}
                      onChange={(e) => updateField('postalCode', e.target.value)}
                      placeholder="560038"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <Label>GSTIN (15 Digits)</Label>
                    <Input
                      value={formData.gstin}
                      onChange={(e) => updateField('gstin', e.target.value.toUpperCase())}
                      placeholder="29ABCDE1234F1Z5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>FSSAI License Number (14 Digits)</Label>
                    <Input
                      value={formData.fssaiNumber}
                      onChange={(e) => updateField('fssaiNumber', e.target.value)}
                      placeholder="11223344556677"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Default GST Rate</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { percent: 5.0, title: '5% GST (Standard)', desc: '2.5% CGST + 2.5% SGST (No ITC)' },
                      { percent: 12.0, title: '12% GST', desc: '6% CGST + 6% SGST' },
                      { percent: 18.0, title: '18% GST (Liquor/Hotel)', desc: '9% CGST + 9% SGST' },
                    ].map((g) => (
                      <button
                        key={g.percent}
                        type="button"
                        onClick={() => updateField('defaultGstPercent', g.percent)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          formData.defaultGstPercent === g.percent
                            ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <div className="font-bold text-sm">{g.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{g.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Menu Pricing Mode</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateField('taxIncludedInPrice', false)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        !formData.taxIncludedInPrice
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-bold text-sm">Exclusive of Tax (Recommended)</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        GST added on subtotal during final bill generation.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField('taxIncludedInPrice', true)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.taxIncludedInPrice
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-bold text-sm">Inclusive of Tax</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Menu prices already include all applicable taxes.
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Receipt Paper Width</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => updateField('printerPaperWidth', '80mm')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.printerPaperWidth === '80mm'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-bold text-sm">80mm Thermal (Standard)</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Wide receipt with itemized GST split, logo, and QR code.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => updateField('printerPaperWidth', '58mm')}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        formData.printerPaperWidth === '58mm'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="font-bold text-sm">58mm Thermal (Compact)</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Compact 2-inch roll for fast food, cloud kitchens & cafes.
                      </div>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Automation Triggers</Label>
                  <label className="flex items-center gap-3 p-3 rounded-xl border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoPrintKOT}
                      onChange={(e) => updateField('autoPrintKOT', e.target.checked)}
                      className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold block text-foreground">
                        Auto-Print KOT on Punch
                      </span>
                      <span className="text-muted-foreground">
                        Automatically sends printed KOT slip to respective kitchen station.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoPrintBill}
                      onChange={(e) => updateField('autoPrintBill', e.target.checked)}
                      className="h-4 w-4 rounded text-orange-600 focus:ring-orange-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold block text-foreground">
                        Auto-Print Customer Receipt on Settlement
                      </span>
                      <span className="text-muted-foreground">
                        Triggers thermal printer immediately upon cash/card/UPI payment.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 p-4 border border-orange-200 dark:border-orange-900 text-xs space-y-2">
                  <div className="font-bold text-sm text-orange-900 dark:text-orange-200">
                    Configuration Summary
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-foreground">
                    <div>
                      <span className="text-muted-foreground">Brand:</span>{' '}
                      <strong>{formData.brandName}</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Outlet:</span>{' '}
                      <strong>{formData.outletName}</strong> ({formData.outletCode})
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span> {formData.city},{' '}
                      {formData.state}
                    </div>
                    <div>
                      <span className="text-muted-foreground">GST Rate:</span>{' '}
                      <strong>{formData.defaultGstPercent}% GST</strong> (
                      {formData.taxIncludedInPrice ? 'Inclusive' : 'Exclusive'})
                    </div>
                    <div>
                      <span className="text-muted-foreground">Receipt Width:</span>{' '}
                      <strong>{formData.printerPaperWidth} Thermal</strong>
                    </div>
                    <div>
                      <span className="text-muted-foreground">GSTIN:</span>{' '}
                      {formData.gstin || 'Unregistered'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Master Administrator Password</Label>
                  <Input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => updateField('adminPassword', e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    This password will be used for owner access and void/cancel authorization.
                  </p>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between border-t pt-4">
              {step > 1 ? (
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <Button onClick={handleNextStep} className="bg-orange-600 hover:bg-orange-700">
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteSetup}
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 font-semibold"
                >
                  {isLoading ? 'Configuring System...' : 'Launch RestoDesk'}
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

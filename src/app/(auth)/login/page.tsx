'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setAvailableOutlets, setSelectedOutlet } = useAppStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Forgot Password / OTP State
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpStep, setOtpStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent, customId?: string, customPw?: string) => {
    if (e) e.preventDefault();
    const loginId = customId || identifier;
    const loginPw = customPw || password;

    if (!loginId || !loginPw) {
      toast.error('Please enter your email/phone and password');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: loginId, password: loginPw }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      if (data.outlets && data.outlets.length > 0) {
        setAvailableOutlets(data.outlets);
        const defaultOutlet = data.outlets.find((o: any) => o.isDefault) || data.outlets[0];
        setSelectedOutlet(defaultOutlet);
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier) {
      toast.error('Please enter your email or phone number');
      return;
    }
    setIsOtpLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setOtpStep('VERIFY');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error('Please enter the OTP and your new password');
      return;
    }
    setIsOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier,
          otp,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      setIsForgotPasswordOpen(false);
      setOtpStep('REQUEST');
      setIdentifier(forgotIdentifier);
      setPassword(newPassword);
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setIsOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
      {/* Left Hero Column */}
      <div className="relative hidden md:flex md:w-1/2 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 p-12 text-white flex-col justify-between overflow-hidden">
        {/* Geometric Background Shapes */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-black/10 blur-xl" />

        {/* Brand Top */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-xl shrink-0 border border-white/30">
            <Image
              src="/logo.png"
              alt="RestoDesk Logo"
              width={56}
              height={56}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">RestoDesk</h1>
            <p className="text-xs text-orange-100 font-medium tracking-wide">
              RESTAURANT OPERATING SYSTEM & POS
            </p>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Designed for high-speed Indian restaurants & chains
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            Billing in 3 taps, live kitchen display, and multi-outlet CRM.
          </h2>
          <p className="text-sm text-orange-100 leading-relaxed">
            From single cafes to multi-chain brands. Complete table management, GST & FSSAI compliance, 58mm/80mm thermal receipts, offline PWA sync, and automated WhatsApp loyalty journeys.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs border border-white/15">
              <div className="text-lg font-bold">₹0.00 Void Loss</div>
              <div className="text-xs text-orange-100">Manager-authorized voids & KOT tracking</div>
            </div>
            <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs border border-white/15">
              <div className="text-lg font-bold">58mm & 80mm</div>
              <div className="text-xs text-orange-100">Direct thermal USB, LAN & Cloud printing</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-orange-200 flex items-center justify-between">
          <span>RestoDesk Hospitality Suite</span>
          <span>© 2026 RestoDesk Inc.</span>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-16 overflow-y-auto">
        <div className="mx-auto w-full max-w-md space-y-8">
          {/* Header */}
          <div className="space-y-2 text-center md:text-left">
            <div className="flex md:hidden justify-center mb-3">
              <div className="h-14 w-14 rounded-2xl bg-white p-1.5 shadow-md border border-orange-200 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="RestoDesk Logo"
                  width={56}
                  height={56}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Sign in to your restaurant
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your email and password to access your dashboard.
            </p>
          </div>

          {/* Main Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Email Address or Phone</Label>
              <div className="relative">
                <Input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@restaurant.com or phone"
                  className="pl-9 h-11"
                  required
                />
                <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-3.5" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs text-orange-600 hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="pl-9 h-11"
                  required
                />
                <Lock className="h-4 w-4 text-muted-foreground absolute left-3 top-3.5" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 font-semibold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 rounded-xl"
            >
              {isLoading ? 'Authenticating...' : 'Sign In to RestoDesk'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>

      {/* Forgot Password OTP Dialog */}
      <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
        <DialogContent className="sm:rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              {otpStep === 'REQUEST'
                ? 'Enter your registered email or +91 phone number to receive a 6-digit OTP.'
                : 'Enter the 6-digit OTP sent to your device and choose your new password.'}
            </DialogDescription>
          </DialogHeader>

          {otpStep === 'REQUEST' ? (
            <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-id">Email or Phone</Label>
                <Input
                  id="forgot-id"
                  placeholder="name@restaurant.com or phone"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isOtpLoading} className="w-full bg-orange-600 hover:bg-orange-700">
                {isOtpLoading ? 'Sending OTP...' : 'Send Verification OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="otp">6-Digit OTP</Label>
                <Input
                  id="otp"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="new-pw">New Password</Label>
                <Input
                  id="new-pw"
                  type="password"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isOtpLoading} className="w-full bg-orange-600 hover:bg-orange-700">
                {isOtpLoading ? 'Verifying...' : 'Set New Password & Sign In'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

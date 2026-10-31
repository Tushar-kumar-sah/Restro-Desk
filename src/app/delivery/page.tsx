'use client';

import React, { useState, useEffect } from 'react';
import {
  Bike,
  MapPin,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  DollarSign,
  ShieldCheck,
  Star,
  Layers,
  Power,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/formatters';
import { DeliveryBoyRecord, DeliveryZoneRecord } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function DeliveryFleetPage() {
  const [activeTab, setActiveTab] = useState<'fleet' | 'zones'>('fleet');
  const [boys, setBoys] = useState<DeliveryBoyRecord[]>([]);
  const [zones, setZones] = useState<DeliveryZoneRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // New Boy Modal
  const [isAddBoyOpen, setIsAddBoyOpen] = useState(false);
  const [boyForm, setBoyForm] = useState({
    name: '',
    phone: '',
    vehicleNumber: '',
    vehicleType: 'SCOOTER' as 'BIKE' | 'SCOOTER' | 'EV',
  });

  // New Zone Modal
  const [isAddZoneOpen, setIsAddZoneOpen] = useState(false);
  const [zoneForm, setZoneForm] = useState({
    name: '',
    coverageRadiusKm: 5,
    minOrderAmount: 250,
    deliveryFee: 40,
    estimatedMinutes: 35,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [boysRes, zonesRes] = await Promise.all([
        fetch('/api/delivery/boys'),
        fetch('/api/delivery/zones'),
      ]);
      const boysData = await boysRes.json();
      const zonesData = await zonesRes.json();
      if (boysData.success) setBoys(boysData.data);
      if (zonesData.success) setZones(zonesData.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load fleet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBoy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boyForm.name || !boyForm.phone || !boyForm.vehicleNumber) {
      toast.error('Please fill in all driver fields');
      return;
    }
    try {
      const res = await fetch('/api/delivery/boys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boyForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsAddBoyOpen(false);
        setBoyForm({ name: '', phone: '', vehicleNumber: '', vehicleType: 'SCOOTER' });
        fetchData();
      } else {
        toast.error(data.error || 'Failed to add driver');
      }
    } catch (err) {
      toast.error('Error onboarding driver');
    }
  };

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneForm.name) {
      toast.error('Please enter zone name');
      return;
    }
    try {
      const res = await fetch('/api/delivery/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsAddZoneOpen(false);
        setZoneForm({ name: '', coverageRadiusKm: 5, minOrderAmount: 250, deliveryFee: 40, estimatedMinutes: 35 });
        fetchData();
      } else {
        toast.error(data.error || 'Failed to add zone');
      }
    } catch (err) {
      toast.error('Error creating delivery zone');
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Delivery Fleet & Zones</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
              <Bike className="h-3 w-3" /> In-House Logistics
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your dedicated delivery riders, active shift rosters, and geographical delivery charge tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-1.5 border-slate-200"
            onClick={() => setIsAddZoneOpen(true)}
          >
            <MapPin className="h-4 w-4 text-emerald-600" /> New Delivery Zone
          </Button>
          <Button
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setIsAddBoyOpen(true)}
          >
            <Plus className="h-4 w-4" /> Onboard Driver
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="fleet" className="gap-2">
            <Bike className="h-4 w-4" /> Delivery Drivers ({boys.length})
          </TabsTrigger>
          <TabsTrigger value="zones" className="gap-2">
            <Navigation className="h-4 w-4" /> Delivery Zones & Charges ({zones.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: FLEET DRIVERS */}
        <TabsContent value="fleet" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {boys.map((boy) => {
              const statusColor =
                boy.status === 'AVAILABLE'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : boy.status === 'BUSY'
                  ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200';

              return (
                <Card key={boy.id} className="border-slate-200 shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">{boy.name}</CardTitle>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{boy.phone}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs font-semibold ${statusColor}`}>
                        {boy.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Vehicle:</span>
                        <span className="font-mono font-semibold text-slate-800">{boy.vehicleNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Type:</span>
                        <span className="font-medium text-slate-800">{boy.vehicleType}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400">Trips Today</span>
                        <p className="font-bold text-slate-900 text-sm">{boy.totalDeliveredToday}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400">Rating</span>
                        <p className="font-bold text-amber-600 text-sm flex items-center justify-center gap-0.5">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" /> {boy.rating}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: ZONES & PRICING */}
        <TabsContent value="zones" className="space-y-4 mt-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="py-3.5 px-4">Zone & Coverage</th>
                  <th className="py-3.5 px-4">Radius</th>
                  <th className="py-3.5 px-4">Min Order Amount</th>
                  <th className="py-3.5 px-4">Delivery Fee</th>
                  <th className="py-3.5 px-4">Estimated ETA</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zones.map((z) => (
                  <tr key={z.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {z.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {z.coverageRadiusKm} km
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatCurrency(z.minOrderAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {formatCurrency(z.deliveryFee)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> {z.estimatedMinutes} mins
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                        Active Zone
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL: ONBOARD DRIVER */}
      <Dialog open={isAddBoyOpen} onOpenChange={setIsAddBoyOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAddBoy}>
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <Bike className="h-5 w-5 text-blue-600" /> Onboard Delivery Driver
              </DialogTitle>
              <DialogDescription>
                Register an in-house fleet delivery boy for live order dispatching.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label>Driver Full Name</Label>
                <Input
                  placeholder="e.g. Ramesh Kumar"
                  value={boyForm.name}
                  onChange={(e) => setBoyForm({ ...boyForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Mobile Number (+91)</Label>
                <Input
                  placeholder="+919876543210"
                  value={boyForm.phone}
                  onChange={(e) => setBoyForm({ ...boyForm, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Vehicle Reg Number</Label>
                  <Input
                    placeholder="KA-01-AB-1234"
                    value={boyForm.vehicleNumber}
                    onChange={(e) => setBoyForm({ ...boyForm, vehicleNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Vehicle Type</Label>
                  <select
                    aria-label="Vehicle type"
                    className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-800"
                    value={boyForm.vehicleType}
                    onChange={(e) => setBoyForm({ ...boyForm, vehicleType: e.target.value as any })}
                  >
                    <option value="SCOOTER">Scooter</option>
                    <option value="BIKE">Motorcycle</option>
                    <option value="EV">Electric Vehicle</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddBoyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Save & Activate Driver
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: NEW DELIVERY ZONE */}
      <Dialog open={isAddZoneOpen} onOpenChange={setIsAddZoneOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAddZone}>
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" /> Add Delivery Zone
              </DialogTitle>
              <DialogDescription>
                Configure coverage radius, delivery fee, and minimum order rules.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label>Zone Name & Suburbs</Label>
                <Input
                  placeholder="e.g. Whitefield & ITPL (10-15 km)"
                  value={zoneForm.name}
                  onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Radius (km)</Label>
                  <Input
                    type="number"
                    value={zoneForm.coverageRadiusKm}
                    onChange={(e) => setZoneForm({ ...zoneForm, coverageRadiusKm: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Estimated Time (mins)</Label>
                  <Input
                    type="number"
                    value={zoneForm.estimatedMinutes}
                    onChange={(e) => setZoneForm({ ...zoneForm, estimatedMinutes: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Min Order Value (₹)</Label>
                  <Input
                    type="number"
                    value={zoneForm.minOrderAmount}
                    onChange={(e) => setZoneForm({ ...zoneForm, minOrderAmount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Delivery Fee (₹)</Label>
                  <Input
                    type="number"
                    value={zoneForm.deliveryFee}
                    onChange={(e) => setZoneForm({ ...zoneForm, deliveryFee: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddZoneOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Save Zone
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </AppShell>
  );
}

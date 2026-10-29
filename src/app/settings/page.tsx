'use client';

import React, { useState, useEffect } from 'react';
import {
  Store,
  Printer,
  ShieldCheck,
  Key,
  FileText,
  Save,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Globe,
  Sliders,
  DollarSign,
  QrCode,
  Smartphone,
  Building,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { formatIndianDate } from '@/lib/formatters';
import {
  StaffRecord,
  ApiKeyRecord,
  PrinterConfigRecord,
  AuditLogRecord,
} from '@/lib/mock-data';
import { toast } from 'sonner';

export default function SettingsHubPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  const initialTab = searchParams?.tab || 'outlets';
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Brand & Outlets state
  const [brand, setBrand] = useState<any>(null);
  const [outlets, setOutlets] = useState<any[]>([]);

  // Staff state
  const [staffList, setStaffList] = useState<StaffRecord[]>([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CASHIER' as any,
    pinCode: '1234',
  });

  // Printer state
  const [printerConfig, setPrinterConfig] = useState<PrinterConfigRecord | null>(null);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [keyName, setKeyName] = useState('');

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [auditActionFilter, setAuditActionFilter] = useState('ALL');

  const [loading, setLoading] = useState(true);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const [brandRes, outletsRes, staffRes, printerRes, keysRes, auditRes] = await Promise.all([
        fetch('/api/settings/brand'),
        fetch('/api/settings/outlets'),
        fetch('/api/settings/staff'),
        fetch('/api/settings/printers'),
        fetch('/api/settings/api-keys'),
        fetch('/api/audit-logs'),
      ]);

      const brandData = await brandRes.json();
      const outletsData = await outletsRes.json();
      const staffData = await staffRes.json();
      const printerData = await printerRes.json();
      const keysData = await keysRes.json();
      const auditData = await auditRes.json();

      if (brandData.success) setBrand(brandData.data);
      if (outletsData.success) setOutlets(outletsData.data);
      if (staffData.success) setStaffList(staffData.data);
      if (printerData.success) setPrinterConfig(printerData.data);
      if (keysData.success) setApiKeys(keysData.data);
      if (auditData.success) setAuditLogs(auditData.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleSaveBrand = async () => {
    try {
      const res = await fetch('/api/settings/brand', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brand),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      }
    } catch {
      toast.error('Failed to save brand details');
    }
  };

  const handleSavePrinter = async () => {
    if (!printerConfig) return;
    try {
      const res = await fetch('/api/settings/printers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(printerConfig),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      }
    } catch {
      toast.error('Failed to save printer settings');
    }
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email || !staffForm.phone) {
      toast.error('All fields are required');
      return;
    }
    try {
      const res = await fetch('/api/settings/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsAddStaffOpen(false);
        setStaffForm({ name: '', email: '', phone: '', role: 'CASHIER', pinCode: '1234' });
        fetchSettingsData();
      }
    } catch {
      toast.error('Failed to add employee');
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) {
      toast.error('Key name is required');
      return;
    }
    try {
      const res = await fetch('/api/settings/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: keyName }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('API Key generated successfully');
        setIsAddKeyOpen(false);
        setKeyName('');
        fetchSettingsData();
      }
    } catch {
      toast.error('Failed to create key');
    }
  };

  const filteredAuditLogs = auditLogs.filter(
    (l) => auditActionFilter === 'ALL' || l.action === auditActionFilter
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Settings & Administration</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              Supabase Connected
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure multi-outlet profiles, thermal printers, employee RBAC roles, developer API keys, and audit logs.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="bg-slate-100 p-1 border border-slate-200 flex flex-wrap gap-1">
          <TabsTrigger value="outlets" className="gap-2">
            <Store className="h-4 w-4" /> Brand & Outlets ({outlets.length})
          </TabsTrigger>
          <TabsTrigger value="printers" className="gap-2">
            <Printer className="h-4 w-4" /> Thermal Printers & Receipts
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Staff & RBAC Roles ({staffList.length})
          </TabsTrigger>
          <TabsTrigger value="apikeys" className="gap-2">
            <Key className="h-4 w-4" /> API Keys & Webhooks
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <FileText className="h-4 w-4" /> Immutable Audit Logs ({auditLogs.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BRAND & OUTLETS */}
        <TabsContent value="outlets" className="space-y-5 mt-4">
          {/* Brand Card */}
          {brand && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building className="h-5 w-5 text-emerald-600" /> Brand Identity & Company Details
                </CardTitle>
                <CardDescription>
                  Primary brand profile and operational defaults.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <Label>Brand / Company Name</Label>
                    <Input
                      value={brand.name || ''}
                      onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Default Currency</Label>
                    <Input
                      value={brand.currency || 'INR'}
                      onChange={(e) => setBrand({ ...brand, currency: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Timezone</Label>
                    <Input
                      value={brand.timezone || 'Asia/Kolkata'}
                      onChange={(e) => setBrand({ ...brand, timezone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button size="sm" className="bg-slate-900 text-white gap-1.5" onClick={handleSaveBrand}>
                    <Save className="h-4 w-4" /> Save Brand Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Outlets Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Active Outlets ({outlets.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {outlets.map((o) => (
                <Card key={o.id} className="border-slate-200 shadow-sm">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900">{o.name}</CardTitle>
                        <Badge variant="outline" className="font-mono text-xs mt-1">
                          {o.code}
                        </Badge>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 text-xs space-y-2">
                    <p className="text-slate-600 line-clamp-2">{o.address}, {o.city}</p>
                    <div className="pt-2 border-t border-slate-100 space-y-1 font-mono text-[11px] text-slate-500">
                      <p>GSTIN: {o.gstin || '29ABCDE1234F1Z5'}</p>
                      <p>FSSAI: {o.fssaiNumber || '11223344556677'}</p>
                      <p>Paper Width: {o.printerPaperWidth || '80mm'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: PRINTERS & BILLING */}
        <TabsContent value="printers" className="space-y-4 mt-4">
          {printerConfig && (
            <Card className="border-slate-200 shadow-sm max-w-3xl">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Printer className="h-5 w-5 text-blue-600" /> Thermal Printer & Receipt Slip Setup
                </CardTitle>
                <CardDescription>
                  Configure ESC/POS receipt thermal printers (58mm / 80mm) and custom bill typography.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4 text-xs">
                {/* Paper width selector */}
                <div className="space-y-1.5">
                  <Label>Receipt Paper Roll Width</Label>
                  <div className="grid grid-cols-2 gap-3 max-w-sm">
                    <button
                      type="button"
                      onClick={() => setPrinterConfig({ ...printerConfig, paperWidth: '80mm' })}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        printerConfig.paperWidth === '80mm'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      80mm (Standard POS / 48 Chars)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrinterConfig({ ...printerConfig, paperWidth: '58mm' })}
                      className={`p-3 rounded-xl border text-center font-bold transition-all ${
                        printerConfig.paperWidth === '58mm'
                          ? 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      58mm (Compact / 32 Chars)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <Label>Bill Header Title</Label>
                    <Input
                      value={printerConfig.headerTitle}
                      onChange={(e) => setPrinterConfig({ ...printerConfig, headerTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>GSTIN Number</Label>
                    <Input
                      value={printerConfig.gstin}
                      onChange={(e) => setPrinterConfig({ ...printerConfig, gstin: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Bill Header Subtitle / Address Lines</Label>
                  <textarea
                    aria-label="Bill header subtitle and address lines"
                    rows={2}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-800 font-mono"
                    value={printerConfig.headerSubtitle || ''}
                    onChange={(e) => setPrinterConfig({ ...printerConfig, headerSubtitle: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Bill Footer Message (Thank You Note / Social Links)</Label>
                  <textarea
                    aria-label="Bill footer message"
                    rows={2}
                    className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-800 font-mono"
                    value={printerConfig.footerMessage}
                    onChange={(e) => setPrinterConfig({ ...printerConfig, footerMessage: e.target.value })}
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printerConfig.printUpiQrOnBill}
                      onChange={(e) => setPrinterConfig({ ...printerConfig, printUpiQrOnBill: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Print Dynamic UPI QR Code on Customer Bill Slip</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={printerConfig.printAutoCut}
                      onChange={(e) => setPrinterConfig({ ...printerConfig, printAutoCut: e.target.checked })}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Trigger Hardware Auto-Cutter on Print Job Complete</span>
                  </label>
                </div>

                <div className="flex justify-end pt-3">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5" onClick={handleSavePrinter}>
                    <Save className="h-4 w-4" /> Save Printer Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 3: STAFF & RBAC */}
        <TabsContent value="staff" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Role-Based Access Control matrix (Owner, Manager, Cashier, Waiter, Kitchen, Marketing).
            </p>
            <Button size="sm" className="bg-slate-900 text-white gap-1.5" onClick={() => setIsAddStaffOpen(true)}>
              <UserPlus className="h-4 w-4" /> Onboard Employee
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Assigned Outlet</th>
                  <th className="py-3 px-4">Quick PIN</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {staffList.map((stf) => (
                  <tr key={stf.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{stf.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <p>{stf.email}</p>
                      <p className="font-mono text-slate-400">{stf.phone}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs font-semibold">
                        {stf.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{stf.outletName}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{stf.pinCode || '••••'}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                        Active
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* TAB 4: API KEYS */}
        <TabsContent value="apikeys" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Developer API credentials for POS hardware, aggregators, and accounting integrations.
            </p>
            <Button size="sm" className="bg-slate-900 text-white gap-1.5" onClick={() => setIsAddKeyOpen(true)}>
              <Plus className="h-4 w-4" /> Generate API Key
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {apiKeys.map((k) => (
              <Card key={k.id} className="border-slate-200 shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-bold text-slate-900">{k.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 text-xs space-y-2">
                  <p className="font-mono bg-slate-100 p-1.5 rounded text-slate-700 select-all">
                    {k.prefix}••••••••••••
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {k.permissions.map((p) => (
                      <Badge key={p} variant="secondary" className="text-[10px] font-mono">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 5: AUDIT LOGS */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <p className="text-sm text-slate-500">
              Immutable security audit trail of billing voids, discount overrides, cash drawer events, and system mutations.
            </p>

            <select
              aria-label="Filter audit logs by action"
              className="border border-slate-200 rounded-md text-xs px-2.5 py-2 bg-white text-slate-700"
              value={auditActionFilter}
              onChange={(e) => setAuditActionFilter(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="VOID_BILL">Voided Bills</option>
              <option value="APPLY_DISCOUNT">Discounts Applied</option>
              <option value="OPEN_CASH_DRAWER">Cash Drawer Openings</option>
              <option value="PRICE_UPDATE">Price Changes</option>
              <option value="STOCK_ADJUST">Stock Wastage</option>
            </select>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Audit Details</th>
                  <th className="py-3 px-4">Terminal IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                      {formatIndianDate(log.createdAt)} {new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          log.action === 'VOID_BILL'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : log.action === 'OPEN_CASH_DRAWER'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : log.action === 'APPLY_DISCOUNT'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.userName} ({log.userRole})
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-md">{log.details}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL: ONBOARD STAFF */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleAddStaffSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" /> Onboard Employee
              </DialogTitle>
              <DialogDescription>
                Add staff member and assign their system operational role.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label>Full Name</Label>
                <Input
                  placeholder="e.g. Anand Mahindra"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="employee@restodesk.com"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Mobile Number (+91)</Label>
                <Input
                  placeholder="+919876543210"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Assigned Role</Label>
                  <select
                    aria-label="Assigned employee role"
                    className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-800"
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as any })}
                  >
                    <option value="OWNER">Owner</option>
                    <option value="MANAGER">Manager</option>
                    <option value="CASHIER">Cashier</option>
                    <option value="WAITER">Waiter</option>
                    <option value="KITCHEN">Kitchen Chef</option>
                    <option value="MARKETING">Marketing</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Quick PIN</Label>
                  <Input
                    placeholder="4-digit PIN"
                    value={staffForm.pinCode}
                    onChange={(e) => setStaffForm({ ...staffForm, pinCode: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddStaffOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Save Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: GENERATE API KEY */}
      <Dialog open={isAddKeyOpen} onOpenChange={setIsAddKeyOpen}>
        <DialogContent className="max-w-sm">
          <form onSubmit={handleCreateApiKey}>
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" /> Generate Developer API Key
              </DialogTitle>
              <DialogDescription>
                Create a secret API key for external webhook integrations.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-3 text-xs">
              <div className="space-y-1">
                <Label>Integration Name</Label>
                <Input
                  placeholder="e.g. Swiggy Live Sync Connector"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddKeyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Generate Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

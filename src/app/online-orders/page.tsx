'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  Bike,
  UtensilsCrossed,
  RefreshCw,
  Bell,
  Search,
  Filter,
  Phone,
  MapPin,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  DollarSign,
  User,
  Power,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatCurrency, formatIndianDate } from '@/lib/formatters';
import { OnlineOrderRecord, DeliveryBoyRecord } from '@/lib/mock-data';
import { toast } from 'sonner';

export default function OnlineOrdersPage() {
  const [orders, setOrders] = useState<OnlineOrderRecord[]>([]);
  const [counts, setCounts] = useState<any>({ new: 0, preparing: 0, ready: 0, outForDelivery: 0, delivered: 0, totalRevenue: 0 });
  const [aggregatorStatus, setAggregatorStatus] = useState<any>({ zomatoOnline: true, swiggyOnline: true, lastSyncedAt: '' });
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Reject dialog
  const [rejectOrder, setRejectOrder] = useState<OnlineOrderRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Kitchen at peak capacity');

  // Accept modal with prep time
  const [acceptOrderData, setAcceptOrderData] = useState<OnlineOrderRecord | null>(null);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(25);

  // Assign delivery boy dialog
  const [assignOrder, setAssignOrder] = useState<OnlineOrderRecord | null>(null);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoyRecord[]>([]);
  const [selectedBoyId, setSelectedBoyId] = useState('');

  // Syncing indicator
  const [syncingChannel, setSyncingChannel] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (channelFilter !== 'ALL') params.append('channel', channelFilter);
      if (activeTab !== 'ALL') params.append('status', activeTab);

      const res = await fetch(`/api/online-orders?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setCounts(data.counts);
        setAggregatorStatus(data.aggregatorStatus);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load online orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const res = await fetch('/api/delivery/boys?status=AVAILABLE');
      const data = await res.json();
      if (data.success) {
        setDeliveryBoys(data.data);
        if (data.data.length > 0) setSelectedBoyId(data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryBoys();
  }, [channelFilter, activeTab]);

  const handleAcceptOrder = async () => {
    if (!acceptOrderData) return;
    try {
      const res = await fetch(`/api/online-orders/${acceptOrderData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ACCEPT',
          prepTimeMinutes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setAcceptOrderData(null);
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to accept order');
      }
    } catch (err) {
      toast.error('Error accepting order');
    }
  };

  const handleRejectOrder = async () => {
    if (!rejectOrder) return;
    try {
      const res = await fetch(`/api/online-orders/${rejectOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          rejectReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.warning(data.message);
        setRejectOrder(null);
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to reject order');
      }
    } catch (err) {
      toast.error('Error rejecting order');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/online-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'STATUS_CHANGE',
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchOrders();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAssignDriver = async () => {
    if (!assignOrder || !selectedBoyId) return;
    try {
      const res = await fetch('/api/delivery/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: assignOrder.id,
          deliveryBoyId: selectedBoyId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setAssignOrder(null);
        fetchOrders();
        fetchDeliveryBoys();
      } else {
        toast.error(data.error || 'Failed to assign driver');
      }
    } catch (err) {
      toast.error('Error assigning delivery driver');
    }
  };

  const handleToggleStore = async (channel: 'ZOMATO' | 'SWIGGY', currentStatus: boolean) => {
    try {
      const res = await fetch('/api/online-orders/aggregators/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_STATUS',
          channel,
          isOpen: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setAggregatorStatus(data.data);
      }
    } catch (err) {
      toast.error('Failed to toggle store status');
    }
  };

  const handleSyncMenu = async (channel: 'ZOMATO' | 'SWIGGY') => {
    try {
      setSyncingChannel(channel);
      const res = await fetch('/api/online-orders/aggregators/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SYNC_MENU',
          channel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      }
    } catch (err) {
      toast.error('Failed to sync catalog');
    } finally {
      setSyncingChannel(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.aggregatorOrderId && o.aggregatorOrderId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Aggregators Control Strip */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-emerald-400">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Aggregator & Online Hub</h1>
            <p className="text-xs text-slate-400">
              Live bi-directional integration for Zomato, Swiggy, Direct Web & Table QR Orders.
            </p>
          </div>
        </div>

        {/* Aggregator Switches */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Zomato */}
          <div className="bg-slate-800/90 border border-slate-700/80 px-3.5 py-2 rounded-xl flex items-center gap-3">
            <span className="font-bold text-xs text-red-400 tracking-wide">ZOMATO</span>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 px-2 text-xs font-semibold rounded-lg gap-1 ${
                aggregatorStatus.zomatoOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
              }`}
              onClick={() => handleToggleStore('ZOMATO', aggregatorStatus.zomatoOnline)}
            >
              <Power className="h-3 w-3" />
              {aggregatorStatus.zomatoOnline ? 'Online' : 'Offline'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={syncingChannel === 'ZOMATO'}
              className="h-7 px-2 text-[11px] border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700 gap-1"
              onClick={() => handleSyncMenu('ZOMATO')}
            >
              <RefreshCw className={`h-3 w-3 ${syncingChannel === 'ZOMATO' ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>

          {/* Swiggy */}
          <div className="bg-slate-800/90 border border-slate-700/80 px-3.5 py-2 rounded-xl flex items-center gap-3">
            <span className="font-bold text-xs text-orange-400 tracking-wide">SWIGGY</span>
            <Button
              size="sm"
              variant="ghost"
              className={`h-7 px-2 text-xs font-semibold rounded-lg gap-1 ${
                aggregatorStatus.swiggyOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
              }`}
              onClick={() => handleToggleStore('SWIGGY', aggregatorStatus.swiggyOnline)}
            >
              <Power className="h-3 w-3" />
              {aggregatorStatus.swiggyOnline ? 'Online' : 'Offline'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={syncingChannel === 'SWIGGY'}
              className="h-7 px-2 text-[11px] border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700 gap-1"
              onClick={() => handleSyncMenu('SWIGGY')}
            >
              <RefreshCw className={`h-3 w-3 ${syncingChannel === 'SWIGGY' ? 'animate-spin' : ''}`} />
              Sync
            </Button>
          </div>

          {/* Direct Store URL Button */}
          <Button
            size="sm"
            variant="secondary"
            className="h-9 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-sm"
            onClick={() => window.open('/order', '_blank')}
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open Web Store
          </Button>
        </div>
      </div>

      {/* Incoming Order Flash Alert Banner */}
      {counts.new > 0 && (
        <div className="bg-red-500 text-white px-5 py-3 rounded-xl shadow flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 animate-bounce" />
            <span className="font-bold text-sm">
              {counts.new} New Online Order(s) waiting for acceptance! Action required.
            </span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="text-xs font-bold text-red-600 bg-white hover:bg-slate-100"
            onClick={() => setActiveTab('NEW')}
          >
            Review Now
          </Button>
        </div>
      )}

      {/* Order Status Tabs Ribbon */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'ALL', label: 'All Orders', count: orders.length },
          { id: 'NEW', label: 'New Action Needed', count: counts.new, alert: counts.new > 0 },
          { id: 'PREPARING', label: 'In Kitchen', count: counts.preparing },
          { id: 'READY', label: 'Food Ready / Pickup', count: counts.ready },
          { id: 'OUT_FOR_DELIVERY', label: 'On Road (Dispatched)', count: counts.outForDelivery },
          { id: 'DELIVERED', label: 'Delivered', count: counts.delivered },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white border-slate-700'
                  : tab.alert
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search order #, customer, phone..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            aria-label="Filter orders by channel"
            className="border border-slate-200 rounded-md text-xs px-2.5 py-2 bg-white text-slate-700"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
          >
            <option value="ALL">All Order Channels</option>
            <option value="ZOMATO">Zomato</option>
            <option value="SWIGGY">Swiggy</option>
            <option value="DIRECT_WEB">Direct Store Web</option>
            <option value="QR_TABLE">Table QR Dine-In</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1 border-slate-200"
            onClick={fetchOrders}
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No active orders in this view</p>
            <p className="text-xs text-slate-400 mt-0.5">Incoming online and QR orders will appear here in real-time.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const channelBadge =
              order.channel === 'ZOMATO'
                ? 'bg-red-50 text-red-700 border-red-200'
                : order.channel === 'SWIGGY'
                ? 'bg-orange-50 text-orange-700 border-orange-200'
                : order.channel === 'DIRECT_WEB'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200';

            const statusBadge =
              order.status === 'NEW'
                ? 'bg-red-500 text-white animate-pulse'
                : order.status === 'PREPARING'
                ? 'bg-amber-100 text-amber-800'
                : order.status === 'READY'
                ? 'bg-emerald-100 text-emerald-800'
                : order.status === 'OUT_FOR_DELIVERY'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-slate-100 text-slate-700';

            return (
              <Card key={order.id} className="border-slate-200 shadow-sm hover:shadow transition-shadow flex flex-col justify-between overflow-hidden">
                <CardHeader className="p-4 pb-2 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className={`text-[10px] font-bold ${channelBadge}`}>
                          {order.channel}
                        </Badge>
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {order.orderNumber}
                        </span>
                      </div>
                      {order.aggregatorOrderId && (
                        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                          Ref: {order.aggregatorOrderId}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${statusBadge}`}>
                        {order.status}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  {/* Customer & Address Details */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{order.customerName}</span>
                      <span className="font-mono text-slate-500 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" /> {order.customerPhone}
                      </span>
                    </div>

                    {order.deliveryAddress && (
                      <p className="text-slate-500 flex items-start gap-1 text-[11px] leading-tight">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{order.deliveryAddress}</span>
                      </p>
                    )}

                    {order.tableId && (
                      <p className="text-emerald-700 font-semibold text-[11px]">
                        Dine-In • Table {order.tableId.toUpperCase()}
                      </p>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center text-slate-700">
                        <span>
                          <strong className="text-slate-900">{it.qty}x</strong> {it.itemName}
                        </span>
                        <span className="font-mono text-slate-500">{formatCurrency(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Kitchen Notes */}
                  {order.kitchenNotes && (
                    <div className="bg-amber-50 p-2 rounded text-[11px] text-amber-800 border border-amber-200 italic flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-600 shrink-0" />
                      &quot;{order.kitchenNotes}&quot;
                    </div>
                  )}

                  {/* Total & Payment details */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Total:</span>
                      <span className="font-extrabold text-sm text-slate-900 ml-1">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-mono">
                      {order.paymentMethod === 'ONLINE_PREPAID' ? 'PREPAID' : 'COD'}
                    </Badge>
                  </div>

                  {/* Delivery Boy details if assigned */}
                  {order.deliveryBoyName && (
                    <div className="bg-blue-50 p-2 rounded border border-blue-100 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1 text-blue-900 font-medium">
                        <Bike className="h-3.5 w-3.5 text-blue-600" /> {order.deliveryBoyName}
                      </span>
                      <span className="font-mono text-blue-700 text-[11px]">{order.deliveryBoyPhone}</span>
                    </div>
                  )}

                  {/* ACTION BUTTONS (Context-Aware) */}
                  <div className="pt-2">
                    {/* NEW ORDER -> ACCEPT / REJECT */}
                    {order.status === 'NEW' && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 gap-1"
                          onClick={() => setRejectOrder(order)}
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                          onClick={() => setAcceptOrderData(order)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Accept Order
                        </Button>
                      </div>
                    )}

                    {/* PREPARING -> MARK READY */}
                    {order.status === 'PREPARING' && (
                      <Button
                        size="sm"
                        className="w-full text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1"
                        onClick={() => handleStatusChange(order.id, 'READY')}
                      >
                        <UtensilsCrossed className="h-3.5 w-3.5" /> Mark Food Ready
                      </Button>
                    )}

                    {/* READY -> ASSIGN FLEET OR RIDER PICKUP */}
                    {order.status === 'READY' && (
                      <div>
                        {order.channel === 'DIRECT_WEB' ? (
                          <Button
                            size="sm"
                            className="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1"
                            onClick={() => setAssignOrder(order)}
                          >
                            <Bike className="h-3.5 w-3.5" /> Assign In-House Fleet
                          </Button>
                        ) : (
                          <div className="text-center text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-200">
                            Waiting for {order.channel} partner rider arrival
                          </div>
                        )}
                      </div>
                    )}

                    {/* OUT FOR DELIVERY -> MARK DELIVERED */}
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <Button
                        size="sm"
                        className="w-full text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        onClick={() => handleStatusChange(order.id, 'DELIVERED')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Delivered
                      </Button>
                    )}

                    {/* DELIVERED -> STATUS BADGE */}
                    {order.status === 'DELIVERED' && (
                      <div className="text-center text-xs text-emerald-700 font-semibold bg-emerald-50 py-1 rounded border border-emerald-200">
                        Order Fulfilled Successfully
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* ACCEPT ORDER MODAL (PREP TIME SELECTION) */}
      <Dialog open={!!acceptOrderData} onOpenChange={() => setAcceptOrderData(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Accept Order #{acceptOrderData?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Set estimated kitchen prep time. A KOT will automatically print to kitchen stations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-xs">Kitchen Preparation Time</Label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 25, 35, 45].map((mins) => (
                <Button
                  key={mins}
                  type="button"
                  variant={prepTimeMinutes === mins ? 'default' : 'outline'}
                  size="sm"
                  className={prepTimeMinutes === mins ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                  onClick={() => setPrepTimeMinutes(mins)}
                >
                  {mins}m
                </Button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              Aggregator rider dispatch ETA will automatically synchronize to {prepTimeMinutes} minutes.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAcceptOrderData(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAcceptOrder}
            >
              Confirm & Fire KOT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT ORDER MODAL */}
      <Dialog open={!!rejectOrder} onOpenChange={() => setRejectOrder(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base text-red-700 flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Reject Order #{rejectOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Select the reason for order cancellation. This will be transmitted to the customer & aggregator.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-xs">Cancellation Reason</Label>
            <select
              aria-label="Order cancellation reason"
              className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-800"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            >
              <option value="Kitchen at peak capacity">Kitchen at peak capacity / High dinner rush</option>
              <option value="Item out of stock">Raw ingredients / Item out of stock</option>
              <option value="Outlet closing soon">Outlet closing soon / Power outage</option>
              <option value="Delivery address out of service area">Address out of delivery radius</option>
            </select>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRejectOrder(null)}>
              Keep Order
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRejectOrder}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ASSIGN FLEET MODAL */}
      <Dialog open={!!assignOrder} onOpenChange={() => setAssignOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Bike className="h-5 w-5 text-blue-600" />
              Dispatch Order #{assignOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription>
              Select an available in-house delivery rider.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label className="text-xs">Available Drivers ({deliveryBoys.length})</Label>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {deliveryBoys.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded">
                  No delivery boys currently AVAILABLE. Check Delivery Fleet tab to update roster.
                </p>
              ) : (
                deliveryBoys.map((boy) => (
                  <div
                    key={boy.id}
                    onClick={() => setSelectedBoyId(boy.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedBoyId === boy.id
                        ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs text-slate-900">{boy.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {boy.vehicleNumber} ({boy.vehicleType}) • {boy.totalDeliveredToday} trips today
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs text-emerald-700 bg-emerald-50">
                      ★ {boy.rating}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAssignOrder(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={deliveryBoys.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
              onClick={handleAssignDriver}
            >
              <Bike className="h-4 w-4" /> Dispatch Rider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

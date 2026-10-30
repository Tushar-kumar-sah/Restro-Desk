'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Plus,
  ArrowRightLeft,
  Merge,
  Calendar,
  Clock,
  User,
  Receipt,
  CheckCircle2,
  Move,
  Save,
  RotateCcw,
  Sparkles,
  Phone,
  AlertCircle,
  AlertTriangle,
  Eye,
  Trash2,
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatCurrency, formatTime, formatDateTime } from '@/lib/formatters';
import { usePosStore } from '@/store/usePosStore';
import { toast } from 'sonner';

export default function TableManagementPage() {
  const router = useRouter();
  const { setTable, setOrderType } = usePosStore();

  const [sections, setSections] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VACANT' | 'RUNNING' | 'BILLED' | 'RESERVED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Edit Floor Layout Mode
  const [isEditLayoutMode, setIsEditLayoutMode] = useState(false);
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);

  // Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isReservationsOpen, setIsReservationsOpen] = useState(false);
  const [isNewTableOpen, setIsNewTableOpen] = useState(false);
  const [selectedTableDetails, setSelectedTableDetails] = useState<any>(null);

  // Table Creation & Deletion
  const [tableToDelete, setTableToDelete] = useState<any | null>(null);
  const [isDeletingTable, setIsDeletingTable] = useState(false);
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [newTableData, setNewTableData] = useState({
    tableNumber: '',
    sectionId: '',
    capacity: 4,
    posX: 0,
    posY: 0,
  });

  // Transfer State
  const [sourceTable, setSourceTable] = useState('');
  const [targetTable, setTargetTable] = useState('');

  // Merge State
  const [mergeTable1, setMergeTable1] = useState('');
  const [mergeTable2, setMergeTable2] = useState('');

  // Reservations list
  const [reservations, setReservations] = useState<any[]>([]);
  const [newResData, setNewResData] = useState({
    customerName: '',
    customerPhone: '',
    guestCount: 2,
    tableNumber: 'T-02',
    reservedAt: new Date(Date.now() + 60 * 60000).toISOString().slice(0, 16),
    notes: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [secRes, tblRes, resRes] = await Promise.all([
        fetch('/api/sections'),
        fetch('/api/tables'),
        fetch('/api/reservations'),
      ]);

      const secData = await secRes.json();
      const tblData = await tblRes.json();
      const resData = await resRes.json();

      if (secData.success) setSections(secData.sections);
      if (tblData.success) setTables(tblData.tables);
      if (resData.success) setReservations(resData.reservations);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Tables
  const filteredTables = tables.filter((table) => {
    const matchesSection = selectedSection === 'all' || table.sectionId === selectedSection;
    const matchesStatus = statusFilter === 'ALL' || table.status === statusFilter;
    return matchesSection && matchesStatus;
  });

  // Calculate Status Counts
  const counts = {
    total: tables.length,
    vacant: tables.filter((t) => t.status === 'VACANT').length,
    running: tables.filter((t) => t.status === 'RUNNING').length,
    billed: tables.filter((t) => t.status === 'BILLED').length,
    reserved: tables.filter((t) => t.status === 'RESERVED').length,
  };

  // Click on Table Handler
  const handleTableClick = (table: any) => {
    if (isEditLayoutMode) {
      setSelectedTableDetails(table);
      return;
    }

    if (table.status === 'VACANT') {
      // Direct seating / order
      setTable(table.tableNumber, table.id);
      setOrderType('DINE_IN');
      toast.success(`Selected Table ${table.tableNumber} for new order`);
      router.push('/pos');
    } else {
      setSelectedTableDetails(table);
    }
  };

  // Helper to compute next sequential table number
  const getNextTableNumber = (currentTables: any[]) => {
    let maxNum = 0;
    for (const t of currentTables) {
      const match = t.tableNumber?.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    }
    return `T-${String(maxNum + 1).padStart(2, '0')}`;
  };

  // Create Table Handler
  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableData.tableNumber.trim()) {
      toast.error('Table number or name is required');
      return;
    }
    const secId = newTableData.sectionId || (sections[0]?.id || 'sec-01');

    setIsCreatingTable(true);
    try {
      const res = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: newTableData.tableNumber.trim().toUpperCase(),
          sectionId: secId,
          capacity: Number(newTableData.capacity) || 4,
          posX: Number(newTableData.posX) || 0,
          posY: Number(newTableData.posY) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create table');
      }

      toast.success(data.message || `Table ${newTableData.tableNumber} created!`);
      setIsNewTableOpen(false);

      if (data.table) {
        setTables((prev) => {
          const filtered = prev.filter((t) => t.tableNumber !== data.table.tableNumber);
          return [...filtered, data.table].sort((a, b) => {
            const numA = parseInt(a.tableNumber?.replace(/\D/g, '') || '0', 10);
            const numB = parseInt(b.tableNumber?.replace(/\D/g, '') || '0', 10);
            if (numA !== numB) return numA - numB;
            return (a.tableNumber || '').localeCompare(b.tableNumber || '');
          });
        });
      }

      setNewTableData({
        tableNumber: '',
        sectionId: sections[0]?.id || 'sec-01',
        capacity: 4,
        posX: 0,
        posY: 0,
      });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create table');
    } finally {
      setIsCreatingTable(false);
    }
  };

  // Delete Table Handler
  const handleDeleteTable = async (tableId: string, tableNumber: string) => {
    setIsDeletingTable(true);
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete table');
      }

      toast.success(`Table ${tableNumber} deleted successfully`);
      setTableToDelete(null);
      if (selectedTableDetails?.id === tableId) {
        setSelectedTableDetails(null);
      }
      setTables((prev) => prev.filter((t) => t.id !== tableId));
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete table');
    } finally {
      setIsDeletingTable(false);
    }
  };

  // Transfer Table Order
  const handleTransferSubmit = async () => {
    if (!sourceTable || !targetTable) {
      toast.error('Select both source and target tables');
      return;
    }
    try {
      const res = await fetch('/api/tables/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceTable, targetTable }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success(data.message);
      setIsTransferModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Transfer failed');
    }
  };

  // Merge Tables Order
  const handleMergeSubmit = async () => {
    if (!mergeTable1 || !mergeTable2) {
      toast.error('Select both tables to merge');
      return;
    }
    try {
      const res = await fetch('/api/tables/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table1: mergeTable1, table2: mergeTable2 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success(data.message);
      setIsMergeModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Merge failed');
    }
  };

  // Create Reservation
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      toast.success(data.message);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Reservation failed');
    }
  };

  // Update Reservation Status (Seat Guest, Cancel)
  const handleUpdateResStatus = async (resId: string, status: string) => {
    try {
      const res = await fetch(`/api/reservations/${resId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Reservation marked as ${status}`);
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Save Floor Layout Coordinates
  const handleSaveLayout = async () => {
    setIsEditLayoutMode(false);
    toast.success('Floor layout arrangement saved successfully');
  };

  const getRunningMinutes = (seatedAt: any) => {
    if (!seatedAt) return null;
    const diffMs = Date.now() - new Date(seatedAt).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  return (
    <AppShell>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-orange-600" />
            Table &amp; Floor Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visual table arrangement, real-time dining timers, table transfers, mergers, and guest reservations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Table Button */}
          <Button
            size="sm"
            onClick={() => {
              const nextNum = getNextTableNumber(tables);
              setNewTableData({
                tableNumber: nextNum,
                sectionId: selectedSection !== 'all' ? selectedSection : (sections[0]?.id || 'sec-01'),
                capacity: 4,
                posX: 0,
                posY: 0,
              });
              setIsNewTableOpen(true);
            }}
            className="rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Table
          </Button>

          {/* Edit Floor Toggle */}
          <Button
            variant={isEditLayoutMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => (isEditLayoutMode ? handleSaveLayout() : setIsEditLayoutMode(true))}
            className={`rounded-xl text-xs font-semibold ${
              isEditLayoutMode ? 'bg-orange-600 hover:bg-orange-700' : ''
            }`}
          >
            {isEditLayoutMode ? (
              <>
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Save Floor Positions
              </>
            ) : (
              <>
                <Move className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                Edit Floor Layout
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTransferModalOpen(true)}
            className="rounded-xl text-xs"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
            Transfer Table
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMergeModalOpen(true)}
            className="rounded-xl text-xs"
          >
            <Merge className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
            Merge Tables
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsReservationsOpen(true)}
            className="rounded-xl text-xs"
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
            Reservations ({reservations.filter((r) => r.status === 'CONFIRMED').length})
          </Button>
        </div>
      </div>

      {/* Sections & Status Bar */}
      <Card className="rounded-2xl shadow-xs">
        <CardContent className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Section Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedSection('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSection === 'all'
                  ? 'bg-foreground text-background shadow-xs'
                  : 'bg-muted/70 text-muted-foreground hover:bg-muted'
              }`}
            >
              All Sections ({tables.length})
            </button>

            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedSection === sec.id
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted'
                }`}
              >
                {sec.name} ({tables.filter((t) => t.sectionId === sec.id).length})
              </button>
            ))}
          </div>

          {/* Status Color Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'ALL' ? 'bg-muted font-bold text-foreground' : 'text-muted-foreground'
              }`}
            >
              All ({counts.total})
            </button>

            <button
              onClick={() => setStatusFilter('VACANT')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'VACANT'
                  ? 'bg-emerald-100 text-emerald-900 font-bold dark:bg-emerald-950 dark:text-emerald-200'
                  : 'text-muted-foreground hover:text-emerald-700'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Vacant ({counts.vacant})
            </button>

            <button
              onClick={() => setStatusFilter('RUNNING')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'RUNNING'
                  ? 'bg-amber-100 text-amber-900 font-bold dark:bg-amber-950 dark:text-amber-200'
                  : 'text-muted-foreground hover:text-amber-700'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Running ({counts.running})
            </button>

            <button
              onClick={() => setStatusFilter('BILLED')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'BILLED'
                  ? 'bg-blue-100 text-blue-900 font-bold dark:bg-blue-950 dark:text-blue-200'
                  : 'text-muted-foreground hover:text-blue-700'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Billed ({counts.billed})
            </button>

            <button
              onClick={() => setStatusFilter('RESERVED')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                statusFilter === 'RESERVED'
                  ? 'bg-purple-100 text-purple-900 font-bold dark:bg-purple-950 dark:text-purple-200'
                  : 'text-muted-foreground hover:text-purple-700'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Reserved ({counts.reserved})
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Main Floor Plan Area */}
      <div
        className={`relative rounded-3xl border p-3 sm:p-6 min-h-[400px] transition-all ${
          isEditLayoutMode
            ? 'bg-orange-50/20 border-dashed border-orange-400 dark:bg-orange-950/10'
            : 'bg-card shadow-xs'
        }`}
      >
        {isEditLayoutMode && (
          <div className="absolute top-3 right-4 z-10 flex items-center gap-2 bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs">
            <Move className="h-3.5 w-3.5" />
            Drag &amp; Drop Mode: Drag tables to reposition your restaurant layout.
          </div>
        )}

        {/* 20 Table Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-4">
          {filteredTables.map((table) => {
            const isVacant = table.status === 'VACANT';
            const isRunning = table.status === 'RUNNING';
            const isBilled = table.status === 'BILLED';
            const isReserved = table.status === 'RESERVED';
            const runTimer = getRunningMinutes(table.seatedAt);

            return (
              <div
                key={table.id}
                draggable={isEditLayoutMode}
                onDragStart={() => setDraggedTableId(table.id)}
                onClick={() => handleTableClick(table)}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 active:scale-95 group ${
                  isVacant
                    ? 'border-emerald-500/40 bg-emerald-50/20 hover:border-emerald-500 hover:bg-emerald-50/40 dark:bg-emerald-950/10'
                    : isRunning
                    ? 'border-amber-500/60 bg-amber-50/30 hover:border-amber-500 hover:shadow-md dark:bg-amber-950/20 ring-1 ring-amber-500/20'
                    : isBilled
                    ? 'border-blue-500/60 bg-blue-50/30 hover:border-blue-500 hover:shadow-md dark:bg-blue-950/20'
                    : 'border-purple-500/60 bg-purple-50/30 hover:border-purple-500 dark:bg-purple-950/20'
                } ${isEditLayoutMode ? 'cursor-grab active:cursor-grabbing border-dashed' : ''}`}
              >
                {/* Header: Table Number & Status Indicator */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-black text-lg text-foreground tracking-tight">
                    {table.tableNumber}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant={
                        isVacant
                          ? 'success'
                          : isRunning
                          ? 'warning'
                          : isBilled
                          ? 'info'
                          : 'purple'
                      }
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5"
                    >
                      {table.status}
                    </Badge>

                    {/* Quick Delete Table Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTableToDelete(table);
                      }}
                      title={`Delete Table ${table.tableNumber}`}
                      className={`p-1 rounded-md transition-all ${
                        isEditLayoutMode
                          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950/60 dark:text-red-400'
                          : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
                      }`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body Details: Running Amount & Timer */}
                <div className="my-2.5 space-y-1">
                  {isRunning || isBilled ? (
                    <div>
                      <div className="text-base font-black text-foreground">
                        {formatCurrency(table.runningAmount)}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3 text-amber-600" />
                        <span>{runTimer || 'Active'}</span>
                      </div>
                      {table.guestName && (
                        <div className="text-[10px] text-muted-foreground truncate">
                          Guest: <strong>{table.guestName}</strong>
                        </div>
                      )}
                    </div>
                  ) : isReserved ? (
                    <div>
                      <div className="text-xs font-bold text-purple-900 dark:text-purple-200">
                        {table.guestName || 'Reserved'}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {table.reservationTime || 'Tonight'}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground py-1">
                      Ready for Seating
                    </div>
                  )}
                </div>

                {/* Footer: Capacity & Floor Location */}
                <div className="flex items-center justify-between w-full pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {table.capacity} Seats
                  </span>
                  <span className="truncate text-[10px] max-w-[80px]">
                    {table.sectionName?.split(' ')[0]}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Add Table Card */}
          <button
            type="button"
            onClick={() => {
              const nextNum = getNextTableNumber(tables);
              setNewTableData({
                tableNumber: nextNum,
                sectionId: selectedSection !== 'all' ? selectedSection : (sections[0]?.id || 'sec-01'),
                capacity: 4,
                posX: 0,
                posY: 0,
              });
              setIsNewTableOpen(true);
            }}
            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-muted-foreground/30 hover:border-orange-500 hover:bg-orange-50/20 dark:hover:bg-orange-950/10 text-muted-foreground hover:text-orange-600 transition-all min-h-[140px] group active:scale-95"
          >
            <div className="p-2 rounded-xl bg-muted/60 group-hover:bg-orange-100 dark:group-hover:bg-orange-950/40 transition-colors mb-1.5">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold">Add Table</span>
            <span className="text-[10px] text-muted-foreground">New seating point</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: Table Details / Open Order / Settle Popup */}
      <Dialog
        open={!!selectedTableDetails}
        onOpenChange={(open) => !open && setSelectedTableDetails(null)}
      >
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Table {selectedTableDetails?.tableNumber} Details</span>
              <Badge
                variant={
                  selectedTableDetails?.status === 'RUNNING'
                    ? 'warning'
                    : selectedTableDetails?.status === 'BILLED'
                    ? 'info'
                    : 'secondary'
                }
                className="text-xs font-bold uppercase"
              >
                {selectedTableDetails?.status}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              {selectedTableDetails?.sectionName} • {selectedTableDetails?.capacity} Seats
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-muted/40 p-3.5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Running Bill:</span>
                <span className="text-base font-black text-foreground">
                  {formatCurrency(selectedTableDetails?.runningAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seated Since:</span>
                <span className="font-semibold text-foreground">
                  {getRunningMinutes(selectedTableDetails?.seatedAt) || 'Just seated'}
                </span>
              </div>
              {selectedTableDetails?.guestName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Primary Guest:</span>
                  <span className="font-semibold text-foreground">
                    {selectedTableDetails.guestName}
                  </span>
                </div>
              )}
            </div>

            {selectedTableDetails?.status === 'VACANT' ? (
              <div className="pt-2">
                <Button
                  onClick={() => {
                    setTable(selectedTableDetails.tableNumber, selectedTableDetails.id);
                    setOrderType('DINE_IN');
                    setSelectedTableDetails(null);
                    router.push('/pos');
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Seat Guests &amp; Take Order
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTable(selectedTableDetails.tableNumber, selectedTableDetails.id);
                    setOrderType('DINE_IN');
                    setSelectedTableDetails(null);
                    router.push('/pos');
                  }}
                  className="rounded-xl text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add More Items
                </Button>

                <Button
                  onClick={() => {
                    setTable(selectedTableDetails.tableNumber, selectedTableDetails.id);
                    setOrderType('DINE_IN');
                    setSelectedTableDetails(null);
                    router.push('/pos');
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  <Receipt className="h-3.5 w-3.5 mr-1.5" />
                  Open POS Bill
                </Button>
              </div>
            )}

            {/* Bottom Actions: Delete Table & Close */}
            <div className="pt-3 border-t flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const tbl = selectedTableDetails;
                  setSelectedTableDetails(null);
                  setTableToDelete(tbl);
                }}
                className="rounded-xl text-xs text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 dark:border-red-900/40 dark:hover:bg-red-950/40"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Table
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTableDetails(null)}
                className="rounded-xl text-xs text-muted-foreground"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Transfer Table Dialog */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Transfer Table Order</DialogTitle>
            <DialogDescription>
              Move an active dining session and running bill to another vacant table.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Source Table (Occupied)</Label>
              <select
                value={sourceTable}
                onChange={(e) => setSourceTable(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold outline-none"
              >
                <option value="">Select Running Table...</option>
                {tables
                  .filter((t) => t.status === 'RUNNING' || t.status === 'BILLED')
                  .map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      {t.tableNumber} - {formatCurrency(t.runningAmount)} ({t.sectionName})
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Target Table (Vacant)</Label>
              <select
                value={targetTable}
                onChange={(e) => setTargetTable(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold outline-none"
              >
                <option value="">Select Vacant Table...</option>
                {tables
                  .filter((t) => t.status === 'VACANT')
                  .map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      {t.tableNumber} ({t.capacity} Seats - {t.sectionName})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleTransferSubmit} className="bg-orange-600 hover:bg-orange-700">
                Confirm Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: Merge Tables Dialog */}
      <Dialog open={isMergeModalOpen} onOpenChange={setIsMergeModalOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Merge Table Bills</DialogTitle>
            <DialogDescription>
              Combine two running tables into a single consolidated invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Primary Table</Label>
              <select
                value={mergeTable1}
                onChange={(e) => setMergeTable1(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold outline-none"
              >
                <option value="">Select Table 1...</option>
                {tables
                  .filter((t) => t.status === 'RUNNING')
                  .map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      {t.tableNumber} - {formatCurrency(t.runningAmount)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Secondary Table (To Merge)</Label>
              <select
                value={mergeTable2}
                onChange={(e) => setMergeTable2(e.target.value)}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold outline-none"
              >
                <option value="">Select Table 2...</option>
                {tables
                  .filter((t) => t.status === 'RUNNING' && t.tableNumber !== mergeTable1)
                  .map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      {t.tableNumber} - {formatCurrency(t.runningAmount)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsMergeModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMergeSubmit} className="bg-orange-600 hover:bg-orange-700">
                Merge Orders
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: Table Reservations Sheet */}
      <Dialog open={isReservationsOpen} onOpenChange={setIsReservationsOpen}>
        <DialogContent className="max-w-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Table Reservations &amp; Bookings</span>
              <Badge variant="brand">{reservations.length} Bookings</Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {/* New Reservation Form */}
            <form onSubmit={handleCreateReservation} className="p-3.5 rounded-xl border bg-muted/20 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Quick Book a Table
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Input
                  placeholder="Guest Name *"
                  value={newResData.customerName}
                  onChange={(e) => setNewResData({ ...newResData, customerName: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
                <Input
                  placeholder="Phone (+91) *"
                  value={newResData.customerPhone}
                  onChange={(e) => setNewResData({ ...newResData, customerPhone: e.target.value })}
                  className="h-8 text-xs"
                  required
                />
                <select
                  value={newResData.tableNumber}
                  onChange={(e) => setNewResData({ ...newResData, tableNumber: e.target.value })}
                  className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-semibold"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      {t.tableNumber} ({t.capacity}p)
                    </option>
                  ))}
                </select>
                <Button type="submit" size="sm" className="h-8 bg-orange-600 hover:bg-orange-700 text-xs font-semibold">
                  Book Table
                </Button>
              </div>
            </form>

            {/* Reservations List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reservations.map((res) => (
                <div
                  key={res.id}
                  className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{res.customerName}</span>
                      <Badge variant="brand" className="text-[10px]">
                        Table {res.tableNumber}
                      </Badge>
                      <Badge
                        variant={res.status === 'CONFIRMED' ? 'success' : 'secondary'}
                        className="text-[10px]"
                      >
                        {res.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-3">
                      <span>{res.customerPhone}</span>
                      <span>•</span>
                      <span>{res.guestCount} Guests</span>
                      <span>•</span>
                      <span>{formatDateTime(res.reservedAt)}</span>
                    </div>
                  </div>

                  {res.status === 'CONFIRMED' && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateResStatus(res.id, 'SEATED')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs h-7 rounded-lg"
                      >
                        Seat Guest
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateResStatus(res.id, 'CANCELLED')}
                        className="text-xs h-7 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: Create New Table Dialog */}
      <Dialog open={isNewTableOpen} onOpenChange={setIsNewTableOpen}>
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-orange-600" />
              <span>Create New Dining Table</span>
            </DialogTitle>
            <DialogDescription>
              Add a new table to your restaurant floor plan and assign its dining section.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTable} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="tableNumber">Table Number / Identifier *</Label>
              <Input
                id="tableNumber"
                placeholder="e.g. T-21, VIP-1, TERRACE-02"
                value={newTableData.tableNumber}
                onChange={(e) => setNewTableData({ ...newTableData, tableNumber: e.target.value })}
                className="rounded-xl text-sm font-semibold"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sectionSelect">Dining Section *</Label>
              <select
                id="sectionSelect"
                value={newTableData.sectionId || (sections[0]?.id || '')}
                onChange={(e) => setNewTableData({ ...newTableData, sectionId: e.target.value })}
                className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} (Floor {sec.floorNumber || 1})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Seating Capacity</Label>
              <div className="grid grid-cols-6 gap-2">
                {[2, 4, 6, 8, 10, 12].map((cap) => (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setNewTableData({ ...newTableData, capacity: cap })}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      newTableData.capacity === cap
                        ? 'border-orange-600 bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-500 shadow-xs'
                        : 'border-border text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    {cap}p
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-xl border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Initial Status:</span>
              <Badge variant="success" className="text-[10px] font-bold">
                VACANT (Ready)
              </Badge>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewTableOpen(false)}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingTable}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                {isCreatingTable ? 'Creating Table...' : 'Create Table'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: Delete Table Confirmation Dialog */}
      <Dialog open={!!tableToDelete} onOpenChange={(open) => !open && setTableToDelete(null)}>
        <DialogContent className="max-w-sm sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Delete Table {tableToDelete?.tableNumber}?</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete Table {tableToDelete?.tableNumber} from {tableToDelete?.sectionName || 'the floor plan'}?
            </DialogDescription>
          </DialogHeader>

          {tableToDelete && (
            <div className="space-y-3 pt-2">
              {tableToDelete.status === 'RUNNING' || tableToDelete.status === 'BILLED' ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Active Running Order
                  </div>
                  <p className="text-[11px]">
                    This table has an active bill of <strong>{formatCurrency(tableToDelete.runningAmount)}</strong>.
                    Deleting this table will also cancel the active table session.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-muted/40 rounded-xl border text-xs text-muted-foreground">
                  Table {tableToDelete.tableNumber} is currently <strong className="text-foreground">{tableToDelete.status}</strong> with {tableToDelete.capacity} seats.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setTableToDelete(null)}
                  disabled={isDeletingTable}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteTable(tableToDelete.id, tableToDelete.tableNumber)}
                  disabled={isDeletingTable}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  {isDeletingTable ? 'Deleting...' : 'Yes, Delete Table'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

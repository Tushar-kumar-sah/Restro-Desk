'use client';

import React, { useState, useEffect } from 'react';
import {
  Send,
  MessageSquare,
  Mail,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Tag,
  DollarSign,
  TrendingUp,
  Eye,
  Plus,
  Play,
  Pause,
  Filter,
  Search,
  Sparkles,
  ArrowRight,
  Gift,
  Cake,
  Heart,
  RotateCcw,
  Star,
  ExternalLink,
  ChevronRight,
  Copy,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { formatCurrency, formatIndianDate } from '@/lib/formatters';
import {
  CampaignItem,
  JourneyItem,
  MessageTemplateItem,
  CampaignChannelType,
} from '@/lib/mock-data';
import { toast } from 'sonner';

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'journeys' | 'templates' | 'simulator'>('campaigns');
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [journeys, setJourneys] = useState<JourneyItem[]>([]);
  const [templates, setTemplates] = useState<MessageTemplateItem[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    name: '',
    channel: 'WHATSAPP' as CampaignChannelType,
    segmentId: 'seg-01',
    segmentName: 'All Registered Customers',
    recipientCount: 420,
    templateId: 'tmpl-01',
    templateName: 'Weekend Feast 20% WhatsApp',
    couponCode: 'WEEKEND20',
    scheduleType: 'NOW' as 'NOW' | 'SCHEDULED',
    scheduledAt: '',
  });

  // Test sender modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('+919876543210');
  const [testContent, setTestContent] = useState('');
  const [testChannel, setTestChannel] = useState<'WHATSAPP' | 'SMS' | 'EMAIL'>('WHATSAPP');
  const [testSending, setTestSending] = useState(false);

  // New Template modal
  const [isNewTemplateOpen, setIsNewTemplateOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    channel: 'WHATSAPP' as CampaignChannelType,
    category: 'PROMOTIONAL' as any,
    header: '',
    content: '',
    footer: '',
  });

  // Selected campaign recipient logs dialog
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data);
        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneys = async () => {
    try {
      const res = await fetch('/api/campaigns/journeys');
      const data = await res.json();
      if (data.success) {
        setJourneys(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/campaigns/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    fetchJourneys();
    fetchTemplates();
  }, []);

  const handleToggleJourney = async (id: string, currentName: string) => {
    try {
      const res = await fetch('/api/campaigns/journeys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchJourneys();
      }
    } catch (err) {
      toast.error('Failed to toggle journey');
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone) {
      toast.error('Please enter a recipient phone number or email');
      return;
    }
    try {
      setTestSending(true);
      const res = await fetch('/api/campaigns/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: testPhone,
          channel: testChannel,
          content: testContent || 'Hi {name}! Treat yourself this weekend at {outlet}. Enjoy flat 20% OFF with code {coupon}!',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsTestModalOpen(false);
      } else {
        toast.error(data.error || 'Failed to dispatch test');
      }
    } catch (err) {
      toast.error('Error sending test message');
    } finally {
      setTestSending(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.content) {
      toast.error('Template name and content are required');
      return;
    }
    try {
      const res = await fetch('/api/campaigns/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Template submitted and approved!');
        setIsNewTemplateOpen(false);
        setTemplateForm({
          name: '',
          channel: 'WHATSAPP',
          category: 'PROMOTIONAL',
          header: '',
          content: '',
          footer: '',
        });
        fetchTemplates();
      }
    } catch (err) {
      toast.error('Failed to save template');
    }
  };

  const handleCreateCampaignSubmit = async () => {
    if (!wizardData.name) {
      toast.error('Please enter a campaign name');
      return;
    }
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wizardData.name,
          channel: wizardData.channel,
          segmentId: wizardData.segmentId,
          segmentName: wizardData.segmentName,
          templateId: wizardData.templateId,
          templateName: wizardData.templateName,
          couponCode: wizardData.couponCode,
          status: wizardData.scheduleType === 'SCHEDULED' ? 'SCHEDULED' : 'COMPLETED',
          scheduledAt: wizardData.scheduleType === 'SCHEDULED' ? wizardData.scheduledAt : undefined,
          totalRecipients: wizardData.recipientCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setIsWizardOpen(false);
        setWizardStep(1);
        fetchCampaigns();
      }
    } catch (err) {
      toast.error('Failed to create campaign');
    }
  };

  const handleViewCampaignLogs = async (campaign: CampaignItem) => {
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCampaign(data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch campaign logs');
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.segmentName && c.segmentName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesChannel = channelFilter === 'ALL' || c.channel === channelFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesChannel && matchesStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Campaigns & Marketing Suite</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
              <Zap className="h-3 w-3 fill-emerald-500 text-emerald-500" /> WhatsApp & SMS Ready
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Design targeted campaigns, configure automated guest journeys, and track revenue conversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setTestContent(templates[0]?.content || '');
              setIsTestModalOpen(true);
            }}
          >
            <Smartphone className="h-4 w-4 text-emerald-600" /> Send Test Message
          </Button>
          <Button
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Create Campaign
          </Button>
        </div>
      </div>

      {/* KPI Metrics Ribbon */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Messages Sent</span>
                <Send className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">{summary.totalSent.toLocaleString('en-IN')}</p>
              <p className="text-xs text-slate-500 mt-1">Across 3 channels</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Delivery Rate</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-emerald-600 mt-2">{summary.deliveryRate}%</p>
              <p className="text-xs text-slate-500 mt-1">DND filter enforced</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Read / Open Rate</span>
                <Eye className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-xl font-bold text-purple-600 mt-2">{summary.readRate}%</p>
              <p className="text-xs text-slate-500 mt-1">WhatsApp 92% peak</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Attributed Sales</span>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-slate-900 mt-2">{formatCurrency(summary.totalRevenueAttributed)}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">+{summary.totalConversions} redemptions</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-800">Available Credits</span>
                <Sparkles className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-emerald-700 mt-2">{summary.availableCredits.toLocaleString()}</p>
              <p className="text-xs text-emerald-700 mt-1">Mock Adapter active</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <TabsList className="bg-slate-100 p-1 border border-slate-200">
          <TabsTrigger value="campaigns" className="gap-2">
            <Send className="h-4 w-4" /> Broadcast Campaigns
          </TabsTrigger>
          <TabsTrigger value="journeys" className="gap-2">
            <RotateCcw className="h-4 w-4" /> Automated Journeys ({journeys.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <MessageSquare className="h-4 w-4" /> Message Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: CAMPAIGNS LIST */}
        <TabsContent value="campaigns" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search campaigns, audience..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                aria-label="Filter by marketing channel"
                className="border border-slate-200 rounded-md text-xs px-2.5 py-2 bg-white text-slate-700"
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
              >
                <option value="ALL">All Channels</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
              </select>

              <select
                aria-label="Filter by campaign status"
                className="border border-slate-200 rounded-md text-xs px-2.5 py-2 bg-white text-slate-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Campaign Name</th>
                    <th className="py-3.5 px-4">Channel</th>
                    <th className="py-3.5 px-4">Target Audience</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Delivery Funnel</th>
                    <th className="py-3.5 px-4">Revenue Attributed</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Send className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        No marketing campaigns found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCampaigns.map((cmp) => {
                      const channelColor =
                        cmp.channel === 'WHATSAPP'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : cmp.channel === 'SMS'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200';

                      const statusColor =
                        cmp.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : cmp.status === 'SCHEDULED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700';

                      return (
                        <tr key={cmp.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-900">{cmp.name}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                              <span>Created {formatIndianDate(cmp.createdAt)}</span>
                              {cmp.couponCode && (
                                <span className="flex items-center gap-1 font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  <Tag className="h-3 w-3" /> {cmp.couponCode}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <Badge variant="outline" className={`gap-1.5 text-xs font-medium ${channelColor}`}>
                              {cmp.channel === 'WHATSAPP' && <MessageSquare className="h-3 w-3" />}
                              {cmp.channel === 'SMS' && <Smartphone className="h-3 w-3" />}
                              {cmp.channel === 'EMAIL' && <Mail className="h-3 w-3" />}
                              {cmp.channel}
                            </Badge>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-800">{cmp.segmentName}</span>
                            <p className="text-xs text-slate-400">{cmp.totalRecipients} guests</p>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                              {cmp.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            {cmp.status === 'SCHEDULED' ? (
                              <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" /> Scheduled
                              </span>
                            ) : (
                              <div className="space-y-1 w-44">
                                <div className="flex justify-between text-xs text-slate-600">
                                  <span>Delivered: {cmp.deliveredCount}/{cmp.sentCount}</span>
                                  <span className="font-semibold text-emerald-600">{cmp.readCount} read</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                  <div
                                    className="bg-emerald-500 h-1.5"
                                    style={{ width: `${(cmp.readCount / cmp.totalRecipients) * 100}%` }}
                                  />
                                  <div
                                    className="bg-blue-300 h-1.5"
                                    style={{
                                      width: `${((cmp.deliveredCount - cmp.readCount) / cmp.totalRecipients) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{formatCurrency(cmp.revenueAttributed)}</p>
                            <p className="text-xs text-emerald-600 font-medium">
                              {cmp.convertedCount} diners converted
                            </p>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs gap-1"
                              onClick={() => handleViewCampaignLogs(cmp)}
                            >
                              <Eye className="h-3.5 w-3.5" /> Logs
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: AUTOMATED JOURNEYS */}
        <TabsContent value="journeys" className="space-y-4 mt-4">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-600" /> Always-On Lifecycle Marketing Flows
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                These journeys execute automatically 24x7 when events occur (e.g. guest signs up, bill is paid, or birthday arrives).
              </p>
            </div>
            <Badge className="bg-emerald-600 text-white font-medium">
              {journeys.filter((j) => j.isActive).length} Active Flows
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {journeys.map((j) => {
              const triggerIcon =
                j.triggerType === 'WELCOME' ? (
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                ) : j.triggerType === 'BIRTHDAY' ? (
                  <Cake className="h-5 w-5 text-pink-600" />
                ) : j.triggerType === 'ANNIVERSARY' ? (
                  <Heart className="h-5 w-5 text-red-600" />
                ) : j.triggerType === 'POST_VISIT' ? (
                  <Star className="h-5 w-5 text-amber-500" />
                ) : j.triggerType === 'WIN_BACK' ? (
                  <RotateCcw className="h-5 w-5 text-blue-600" />
                ) : (
                  <Clock className="h-5 w-5 text-purple-600" />
                );

              return (
                <Card key={j.id} className="border-slate-200 shadow-sm hover:shadow transition-shadow">
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          {triggerIcon}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold text-slate-900">{j.name}</CardTitle>
                          <Badge variant="outline" className="text-[10px] uppercase font-mono mt-0.5">
                            Trigger: {j.triggerType}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={j.isActive ? 'default' : 'outline'}
                        className={`text-xs gap-1 h-8 ${j.isActive ? 'bg-emerald-600 hover:bg-emerald-700' : 'text-slate-500'}`}
                        onClick={() => handleToggleJourney(j.id, j.name)}
                      >
                        {j.isActive ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </>
                        ) : (
                          <>
                            <Pause className="h-3.5 w-3.5" /> Paused
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-0 space-y-3">
                    <p className="text-xs text-slate-500 leading-relaxed">{j.description}</p>

                    {/* Step details */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Badge className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0">
                            Step 1
                          </Badge>
                          {j.steps[0]?.channel} Delivery
                        </span>
                        <span className="text-slate-400">
                          {j.steps[0]?.delayHours === 0 ? 'Instant' : `Wait ${j.steps[0]?.delayHours}h after event`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 italic line-clamp-2">
                        &quot;{j.steps[0]?.templateContent}&quot;
                      </p>
                    </div>

                    {/* Stats Ribbon */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
                      <div>
                        <span className="text-[11px] text-slate-400">Dispatched</span>
                        <p className="text-sm font-semibold text-slate-800">{j.totalTriggered}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400">Redemptions</span>
                        <p className="text-sm font-semibold text-emerald-600">{j.conversions}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400">Sales Generated</span>
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(j.revenueAttributed)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 3: MESSAGE TEMPLATES */}
        <TabsContent value="templates" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Approved message creatives with dynamic variable interpolation ({'{name}'}, {'{points}'}, {'{coupon}'}, {'{outlet}'}).
            </p>
            <Button
              size="sm"
              className="gap-1.5 bg-slate-900 text-white"
              onClick={() => setIsNewTemplateOpen(true)}
            >
              <Plus className="h-4 w-4" /> New Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tmpl) => (
              <Card key={tmpl.id} className="border-slate-200 shadow-sm flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">{tmpl.name}</CardTitle>
                      <Badge variant="outline" className="text-[10px] mt-1 font-mono">
                        {tmpl.category}
                      </Badge>
                    </div>
                    <Badge
                      className={`text-[10px] ${
                        tmpl.channel === 'WHATSAPP'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tmpl.channel === 'SMS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {tmpl.channel}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3 flex-1 flex flex-col justify-between">
                  {tmpl.header && (
                    <p className="text-xs font-semibold text-slate-800 bg-slate-50 p-1.5 rounded border border-slate-100">
                      {tmpl.header}
                    </p>
                  )}

                  <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 font-sans leading-relaxed border border-slate-100 whitespace-pre-line">
                    {tmpl.content}
                  </div>

                  {tmpl.footer && <p className="text-[11px] text-slate-400 italic">{tmpl.footer}</p>}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Meta Approved
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => {
                        setTestContent(tmpl.content);
                        setTestChannel(tmpl.channel);
                        setIsTestModalOpen(true);
                      }}
                    >
                      <Send className="h-3 w-3" /> Test Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL: CAMPAIGN CREATION WIZARD */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              Campaign Launch Wizard (Step {wizardStep} of 4)
            </DialogTitle>
            <DialogDescription>
              {wizardStep === 1 && 'Define your marketing campaign name and target channel'}
              {wizardStep === 2 && 'Select the customer segment and audience size'}
              {wizardStep === 3 && 'Choose an approved message template and coupon offer'}
              {wizardStep === 4 && 'Review campaign dispatch schedule and estimated credits'}
            </DialogDescription>
          </DialogHeader>

          {/* Wizard Step 1: Basics & Channel */}
          {wizardStep === 1 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Campaign Title</Label>
                <Input
                  placeholder="e.g. Weekend Biryani Feast WhatsApp Blast"
                  value={wizardData.name}
                  onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Delivery Channel</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'WHATSAPP', name: 'WhatsApp', icon: MessageSquare, desc: 'High open rates (90%+), rich text' },
                    { id: 'SMS', name: 'SMS', icon: Smartphone, desc: 'Reliable fallback, zero internet needed' },
                    { id: 'EMAIL', name: 'Email', icon: Mail, desc: 'Visual newsletters, high detail' },
                  ].map((ch) => {
                    const isSelected = wizardData.channel === ch.id;
                    return (
                      <div
                        key={ch.id}
                        onClick={() => setWizardData({ ...wizardData, channel: ch.id as any })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <ch.icon className={`h-5 w-5 mb-2 ${isSelected ? 'text-emerald-600' : 'text-slate-500'}`} />
                        <p className="font-semibold text-xs text-slate-900">{ch.name}</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{ch.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Wizard Step 2: Target Segment */}
          {wizardStep === 2 && (
            <div className="space-y-3 py-2">
              <Label>Select Target Customer Segment</Label>
              <div className="space-y-2">
                {[
                  { id: 'seg-01', name: 'All Registered Customers', count: 420, desc: 'Complete guest database with valid phone numbers' },
                  { id: 'seg-04', name: 'VIP Platinum Guests (Spend > ₹10,000)', count: 65, desc: 'Highest lifetime spenders & frequent diners' },
                  { id: 'seg-02', name: 'Loyal Diners (5+ Total Visits)', count: 180, desc: 'Repeat customers with active points balance' },
                  { id: 'seg-05', name: 'Lapsed Diners (No visit in 30-60 Days)', count: 185, desc: 'Reactivation target for weekend offers' },
                ].map((seg) => {
                  const isSelected = wizardData.segmentId === seg.id;
                  return (
                    <div
                      key={seg.id}
                      onClick={() =>
                        setWizardData({
                          ...wizardData,
                          segmentId: seg.id,
                          segmentName: seg.name,
                          recipientCount: seg.count,
                        })
                      }
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-xs text-slate-900">{seg.name}</p>
                        <p className="text-[11px] text-slate-500">{seg.desc}</p>
                      </div>
                      <Badge variant="outline" className="text-xs font-mono">
                        {seg.count} guests
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Wizard Step 3: Template & Coupon */}
          {wizardStep === 3 && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Select Message Creative</Label>
                <select
                  aria-label="Select message creative template"
                  className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-800"
                  value={wizardData.templateId}
                  onChange={(e) => {
                    const found = templates.find((t) => t.id === e.target.value);
                    setWizardData({
                      ...wizardData,
                      templateId: e.target.value,
                      templateName: found?.name || '',
                    });
                  }}
                >
                  {templates
                    .filter((t) => t.channel === wizardData.channel)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Attach Coupon Voucher (Optional)</Label>
                <Input
                  placeholder="e.g. WEEKEND20, FLAT150"
                  value={wizardData.couponCode}
                  onChange={(e) => setWizardData({ ...wizardData, couponCode: e.target.value })}
                />
                <p className="text-[11px] text-slate-400">
                  This coupon will be auto-substituted into {'{coupon}'} in the message text.
                </p>
              </div>

              {/* Preview card */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
                <p className="font-semibold text-slate-700 mb-1">Live Message Preview:</p>
                <p className="text-slate-600 italic">
                  {templates.find((t) => t.id === wizardData.templateId)?.content.replace('{coupon}', wizardData.couponCode || 'WEEKEND20')}
                </p>
              </div>
            </div>
          )}

          {/* Wizard Step 4: Schedule & Dispatch */}
          {wizardStep === 4 && (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Campaign Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-emerald-700">Campaign:</span>
                    <p className="font-semibold text-emerald-950">{wizardData.name}</p>
                  </div>
                  <div>
                    <span className="text-emerald-700">Channel:</span>
                    <p className="font-semibold text-emerald-950">{wizardData.channel}</p>
                  </div>
                  <div>
                    <span className="text-emerald-700">Audience:</span>
                    <p className="font-semibold text-emerald-950">{wizardData.segmentName} ({wizardData.recipientCount} guests)</p>
                  </div>
                  <div>
                    <span className="text-emerald-700">Estimated Cost:</span>
                    <p className="font-semibold text-emerald-950">
                      {wizardData.recipientCount * (wizardData.channel === 'WHATSAPP' ? 2 : 1)} Credits
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Dispatch Timing</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      checked={wizardData.scheduleType === 'NOW'}
                      onChange={() => setWizardData({ ...wizardData, scheduleType: 'NOW' })}
                    />
                    <span>Send Immediately</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      checked={wizardData.scheduleType === 'SCHEDULED'}
                      onChange={() => setWizardData({ ...wizardData, scheduleType: 'SCHEDULED' })}
                    />
                    <span>Schedule for Later</span>
                  </label>
                </div>

                {wizardData.scheduleType === 'SCHEDULED' && (
                  <Input
                    type="datetime-local"
                    className="mt-2 text-xs"
                    value={wizardData.scheduledAt}
                    onChange={(e) => setWizardData({ ...wizardData, scheduledAt: e.target.value })}
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center w-full">
            {wizardStep > 1 ? (
              <Button variant="outline" size="sm" onClick={() => setWizardStep(wizardStep - 1)}>
                Back
              </Button>
            ) : (
              <div />
            )}

            {wizardStep < 4 ? (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  if (wizardStep === 1 && !wizardData.name) {
                    toast.error('Please enter a campaign name');
                    return;
                  }
                  setWizardStep(wizardStep + 1);
                }}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={handleCreateCampaignSubmit}
              >
                <Send className="h-4 w-4" />
                {wizardData.scheduleType === 'SCHEDULED' ? 'Schedule Campaign' : 'Blast to Audience'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: TEST SEND MESSAGE */}
      <Dialog open={isTestModalOpen} onOpenChange={setIsTestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-5 w-5 text-emerald-600" />
              Send Test Message
            </DialogTitle>
            <DialogDescription>
              Dispatches an instant message to verify delivery, variables, and typography.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Recipient Mobile (+91) or Email</Label>
              <Input
                placeholder="+919876543210"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Channel</Label>
              <select
                aria-label="Select test message channel"
                className="w-full border border-slate-200 rounded-md p-2 text-xs bg-white text-slate-800"
                value={testChannel}
                onChange={(e) => setTestChannel(e.target.value as any)}
              >
                <option value="WHATSAPP">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label>Message Content with Placeholders</Label>
              <textarea
                aria-label="Message content with placeholders"
                className="w-full border border-slate-200 rounded-md p-2 text-xs font-mono bg-white text-slate-800 h-28"
                value={testContent}
                onChange={(e) => setTestContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsTestModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={testSending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              onClick={handleSendTestMessage}
            >
              <Send className="h-4 w-4" />
              {testSending ? 'Dispatching...' : 'Send Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: CAMPAIGN RECIPIENTS LOG */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Eye className="h-5 w-5 text-blue-600" />
              Delivery Logs: {selectedCampaign?.name}
            </DialogTitle>
            <DialogDescription>
              Real-time delivery status, carrier timestamps, and open status.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-96 overflow-y-auto border rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b">
                <tr>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Phone</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Delivered At</th>
                  <th className="p-2.5">Read At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedCampaign?.recipients?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No recipient logs available.
                    </td>
                  </tr>
                ) : (
                  selectedCampaign?.recipients?.map((r: any) => (
                    <tr key={r.id}>
                      <td className="p-2.5 font-medium text-slate-800">{r.customerName}</td>
                      <td className="p-2.5 font-mono text-slate-600">{r.phone}</td>
                      <td className="p-2.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            r.status === 'READ'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.status === 'DELIVERED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-2.5 text-slate-500">
                        {r.deliveredAt ? new Date(r.deliveredAt).toLocaleTimeString('en-IN') : '—'}
                      </td>
                      <td className="p-2.5 text-slate-500">
                        {r.readAt ? new Date(r.readAt).toLocaleTimeString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AppShell>
  );
}

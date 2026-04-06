"use client";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { useLeads, usePipelineSummary, useBranches, useMutationWithToast } from "@/hooks/use-query";
import { leadsApi } from "@/lib/api";
import { formatDate, getLeadSourceLabel } from "@/lib/utils";
import { useForm } from "react-hook-form";
import {
  Plus, Target, Phone, Search, Instagram, MessageCircle,
  User, Globe, PhoneCall, ChevronRight,
} from "lucide-react";
import type { Lead, LeadStatus } from "@/types";
import { RouteGuard } from "@/components/layout/route-guard";

const PIPELINE_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-500",
  contacted: "bg-warning-500",
  trial: "bg-purple-500",
  registered: "bg-brand-500",
  paid: "bg-success-500",
  lost: "bg-danger-500",
};

const SOURCE_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  telegram: MessageCircle,
  referral: User,
  website: Globe,
  phone_call: PhoneCall,
  walk_in: User,
  other: User,
};

type Tab = "pipeline" | "list";

export default function LeadsPage() {
  const [tab, setTab] = useState<Tab>("pipeline");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const { data, isLoading } = useLeads({
    page, limit: 20,
    search: search || undefined,
    status: status || undefined,
    branchId: branchId || undefined,
  });
  const { data: pipeline } = usePipelineSummary(branchId || undefined);
  const { data: branches } = useBranches();

  const createMutation = useMutationWithToast(
    (data: Partial<Lead>) => leadsApi.create(data).then((r) => r.data.data),
    { successMessage: "Lead muvaffaqiyatli qo'shildi", invalidateKeys: ["leads", "pipeline-summary"] },
  );

  const updateMutation = useMutationWithToast(
    ({ id, data }: { id: string; data: Partial<Lead> }) =>
      leadsApi.update(id, data).then((r) => r.data.data),
    { successMessage: "Lead yangilandi", invalidateKeys: ["leads", "pipeline-summary"] },
  );

  const addActivityMutation = useMutationWithToast(
    ({ leadId, data }: { leadId: string; data: any }) =>
      leadsApi.addActivity(leadId, data).then((r) => r.data.data),
    { successMessage: "Faoliyat qo'shildi", invalidateKeys: ["leads"] },
  );

  const { register, handleSubmit, reset } = useForm<Partial<Lead>>();
  const { register: regActivity, handleSubmit: handleActivity, reset: resetActivity } = useForm<{ activityType: string; description: string }>();

  const onSubmit = async (data: Partial<Lead>) => {
    await createMutation.mutateAsync(data);
    setShowModal(false);
    reset();
  };

  const onActivity = async (data: { activityType: string; description: string }) => {
    if (!selectedLead) return;
    await addActivityMutation.mutateAsync({ leadId: selectedLead.id, data });
    setShowActivityModal(false);
    resetActivity();
  };

  const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "trial", "registered", "paid", "lost"];

  const grouped: Record<LeadStatus, Lead[]> = LEAD_STATUSES.reduce(
    (acc, s) => ({ ...acc, [s]: [] }),
    {} as Record<LeadStatus, Lead[]>,
  );
  data?.data?.forEach((lead) => {
    if (grouped[lead.pipelineStatus]) grouped[lead.pipelineStatus].push(lead);
  });

  const STATUS_LABELS: Record<LeadStatus, string> = {
    new: "Yangi",
    contacted: "Bog'lanildi",
    trial: "Sinov darsi",
    registered: "Ro'yxatdan o'tdi",
    paid: "To'ladi",
    lost: "Yo'qoldi",
  };

  return (
    <RouteGuard allowedRoles={["admin","manager"]}>
      <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">Leadlar (CRM)</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">Marketing voronkasi</p>
          </div>
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
            Yangi lead
          </Button>
        </div>

        {/* Pipeline summary */}
        {pipeline && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {pipeline.pipeline?.map((p: any) => (
              <Card key={p.status} padding="sm" className="text-center cursor-pointer hover:border-brand-200 transition-colors"
                onClick={() => { setStatus(p.status); setTab("list"); }}
              >
                <div className={`w-8 h-1.5 rounded-full mx-auto mb-2 ${PIPELINE_COLORS[p.status as LeadStatus]}`} />
                <p className="text-lg font-bold text-surface-900 dark:text-surface-50">{p.count}</p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{STATUS_LABELS[p.status as LeadStatus]}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit">
          {[{ key: "pipeline" as Tab, label: "Voronka" }, { key: "list" as Tab, label: "Ro'yxat" }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key ? "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-50 shadow-card" : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filters (list tab only) */}
        {tab === "list" && (
          <Card padding="sm">
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Ism yoki telefon..."
                  icon={<Search className="w-4 h-4" />}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <div className="w-44">
                <Select
                  options={[
                    { value: "", label: "Barcha statuslar" },
                    ...LEAD_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
                  ]}
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                />
              </div>
              <div className="w-44">
                <Select
                  options={[
                    { value: "", label: "Barcha filiallar" },
                    ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
                  ]}
                  value={branchId}
                  onChange={(e) => { setBranchId(e.target.value); setPage(1); }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Pipeline Kanban */}
        {tab === "pipeline" && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto">
            {LEAD_STATUSES.map((st) => (
              <div key={st} className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${PIPELINE_COLORS[st]}`} />
                  <span className="text-xs font-semibold text-surface-700 dark:text-surface-200">{STATUS_LABELS[st]}</span>
                  <span className="text-xs text-surface-400 dark:text-surface-500 ml-auto">{grouped[st].length}</span>
                </div>
                <div className="space-y-2">
                  {grouped[st].map((lead) => {
                    const SrcIcon = SOURCE_ICONS[lead.source] ?? User;
                    return (
                      <div
                        key={lead.id}
                        className="bg-white dark:bg-surface-900 rounded-xl border border-surface-100 dark:border-surface-800 p-3 shadow-card hover:shadow-card-md transition-shadow cursor-pointer group"
                        onClick={() => { setSelectedLead(lead); setShowActivityModal(true); }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar name={lead.fullName} size="xs" />
                          <p className="text-xs font-semibold text-surface-900 dark:text-surface-50 truncate">{lead.fullName}</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-surface-500 dark:text-surface-400 mb-2">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-surface-400 dark:text-surface-500">
                            <SrcIcon className="w-3 h-3" />
                            {getLeadSourceLabel(lead.source)}
                          </div>
                          <ChevronRight className="w-3 h-3 text-surface-300 group-hover:text-brand-500 transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List view */}
        {tab === "list" && (
          <Card padding="none">
            {data?.data?.length === 0 && !isLoading ? (
              <EmptyState icon={Target} title="Leadlar topilmadi" action={{ label: "Yangi lead", onClick: () => setShowModal(true) }} />
            ) : (
              <>
                <div className="divide-y divide-surface-50">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="px-5 py-4">
                          <div className="h-4 bg-surface-100 dark:bg-surface-800 rounded animate-pulse w-48 mb-2" />
                          <div className="h-3 bg-surface-50 dark:bg-surface-900/50 rounded animate-pulse w-32" />
                        </div>
                      ))
                    : data?.data?.map((lead) => {
                        const SrcIcon = SOURCE_ICONS[lead.source] ?? User;
                        return (
                          <div
                            key={lead.id}
                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-50 dark:hover:bg-surface-800 dark:bg-surface-900/50 transition-colors cursor-pointer"
                            onClick={() => { setSelectedLead(lead); setShowActivityModal(true); }}
                          >
                            <Avatar name={lead.fullName} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-surface-900 dark:text-surface-50">{lead.fullName}</p>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {lead.phone}
                                </span>
                                <span className="text-xs text-surface-400 dark:text-surface-500 flex items-center gap-1">
                                  <SrcIcon className="w-3 h-3" /> {getLeadSourceLabel(lead.source)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-surface-400 dark:text-surface-500">{formatDate(lead.createdAt)}</span>
                              <Badge status={lead.pipelineStatus} />
                            </div>
                          </div>
                        );
                      })}
                </div>
                {data && (
                  <Pagination
                    page={data.page} totalPages={data.totalPages}
                    total={data.total} limit={data.limit} onPageChange={setPage}
                  />
                )}
              </>
            )}
          </Card>
        )}
      </div>

      {/* Create Lead Modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); reset(); }}
        title="Yangi lead qo'shish"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => { setShowModal(false); reset(); }}>Bekor qilish</Button>
            <Button onClick={handleSubmit(onSubmit)} loading={createMutation.isPending}>Saqlash</Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="To'liq ism" placeholder="Jasur Toshmatov" required {...register("fullName", { required: true })} />
          <Input label="Telefon" placeholder="+998901234567" required {...register("phone", { required: true })} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Filial"
              required
              options={[
                { value: "", label: "Tanlang..." },
                ...(branches?.map((b) => ({ value: b.id, label: b.name })) ?? []),
              ]}
              {...register("branchId", { required: true })}
            />
            <Select
              label="Manba"
              options={[
                { value: "instagram", label: "Instagram" },
                { value: "telegram", label: "Telegram" },
                { value: "referral", label: "Tavsiya" },
                { value: "walk_in", label: "Shaxsan keldi" },
                { value: "website", label: "Veb-sayt" },
                { value: "phone_call", label: "Telefon" },
                { value: "other", label: "Boshqa" },
              ]}
              {...register("source")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1.5">Izoh</label>
            <textarea
              className="w-full rounded-xl border border-surface-200 dark:border-surface-700 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              rows={3}
              placeholder="Qo'shimcha ma'lumot..."
              {...register("notes")}
            />
          </div>
        </form>
      </Modal>

      {/* Lead Detail + Activity Modal */}
      <Modal
        open={showActivityModal && !!selectedLead}
        onClose={() => { setShowActivityModal(false); setSelectedLead(null); resetActivity(); }}
        title={selectedLead?.fullName ?? "Lead"}
        size="md"
        footer={
          <Button
            onClick={handleActivity(onActivity)}
            loading={addActivityMutation.isPending}
          >
            Faoliyat qo'shish
          </Button>
        }
      >
        {selectedLead && (
          <div className="space-y-5">
            {/* Lead info */}
            <div className="flex items-start gap-4">
              <Avatar name={selectedLead.fullName} size="md" />
              <div>
                <h3 className="text-base font-semibold text-surface-900 dark:text-surface-50">{selectedLead.fullName}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5" /> {selectedLead.phone}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge status={selectedLead.pipelineStatus} />
                  <span className="text-xs text-surface-400 dark:text-surface-500">{getLeadSourceLabel(selectedLead.source)}</span>
                </div>
              </div>
            </div>

            {/* Status change */}
            <div>
              <p className="text-sm font-medium text-surface-700 dark:text-surface-200 mb-2">Statusni o'zgartirish:</p>
              <div className="flex flex-wrap gap-2">
                {LEAD_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateMutation.mutate({ id: selectedLead.id, data: { pipelineStatus: s } })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedLead.pipelineStatus === s
                        ? `${PIPELINE_COLORS[s]} text-white border-transparent`
                        : "border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Add activity */}
            <div className="border-t border-surface-100 dark:border-surface-800 pt-4">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-200 mb-3">Yangi faoliyat:</p>
              <form className="space-y-3">
                <Select
                  options={[
                    { value: "call", label: "📞 Qo'ng'iroq" },
                    { value: "message", label: "💬 Xabar" },
                    { value: "meeting", label: "🤝 Uchrashuv" },
                    { value: "note", label: "📝 Izoh" },
                  ]}
                  {...regActivity("activityType")}
                />
                <textarea
                  className="w-full rounded-xl border border-surface-200 dark:border-surface-700 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                  rows={3}
                  placeholder="Faoliyat tavsifi..."
                  {...regActivity("description", { required: true })}
                />
              </form>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
    </RouteGuard>
  );
}

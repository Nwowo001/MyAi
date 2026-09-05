'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessStore } from '@/stores/useBusinessStore';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '@/lib/api/customer';
import { Customer, LeadStatus, CreateCustomerInput } from '@autoagent/shared';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const STAGE_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string; border: string }> = {
  [LeadStatus.NEW]: { label: 'New Lead', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  [LeadStatus.CONTACTED]: { label: 'Contacted', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  [LeadStatus.QUALIFIED]: { label: 'Qualified', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  [LeadStatus.PROPOSAL_SENT]: { label: 'Proposal Sent', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  [LeadStatus.WON]: { label: 'Won / Customer', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  [LeadStatus.LOST]: { label: 'Lost', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  [LeadStatus.UNQUALIFIED]: { label: 'Unqualified', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
};

export default function CustomersPage() {
  const activeBusiness = useBusinessStore((s) => s.activeBusiness);
  const formatCurrency = useBusinessStore((s) => s.formatCurrency);
  const businessId = activeBusiness?.id;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState<LeadStatus | 'ALL'>('ALL');
  const [toast, setToast] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [leadStatus, setLeadStatus] = useState<LeadStatus>(LeadStatus.NEW);
  const [budget, setBudget] = useState<string>('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const filters: { search?: string; leadStatus?: LeadStatus } = {};
      if (search.trim()) filters.search = search.trim();
      if (selectedStage !== 'ALL') filters.leadStatus = selectedStage;

      const data = await fetchCustomers(businessId, filters);
      setCustomers(data);
    } catch {
      showToast('Error loading customers');
    } finally {
      setLoading(false);
    }
  }, [businessId, search, selectedStage]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreateModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setTagsInput('');
    setLeadStatus(LeadStatus.NEW);
    setBudget('');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomer(c);
    setName(c.name);
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setNotes(c.notes || '');
    setTagsInput(c.tags.join(', '));
    setLeadStatus(c.latestLead?.status || LeadStatus.NEW);
    setBudget(c.latestLead?.budget ? String(c.latestLead.budget) : '');
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !name.trim()) return;

    setFormLoading(true);
    setFormError(null);

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const parsedBudget = budget ? parseFloat(budget) : null;

    try {
      if (editingCustomer) {
        await updateCustomer(businessId, editingCustomer.id, {
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          notes: notes.trim() || null,
          tags: parsedTags,
          leadStatus,
          budget: parsedBudget,
        });
        showToast('Customer updated successfully');
      } else {
        const input: CreateCustomerInput = {
          name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          notes: notes.trim() || null,
          tags: parsedTags,
          leadStatus,
          budget: parsedBudget,
        };
        await createCustomer(businessId, input);
        showToast('Customer created successfully');
      }

      setModalOpen(false);
      load();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save customer');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!businessId) return;
    try {
      await deleteCustomer(businessId, id);
      showToast('Customer deleted');
      setDeleteConfirmId(null);
      load();
    } catch {
      showToast('Failed to delete customer');
    }
  };

  // Pipeline stats
  const totalCount = customers.length;
  const newCount = customers.filter((c) => c.latestLead?.status === LeadStatus.NEW).length;
  const qualifiedCount = customers.filter((c) => c.latestLead?.status === LeadStatus.QUALIFIED).length;
  const proposalCount = customers.filter((c) => c.latestLead?.status === LeadStatus.PROPOSAL_SENT).length;
  const wonCount = customers.filter((c) => c.latestLead?.status === LeadStatus.WON).length;

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#0F172A] text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            Customers & Leads Pipeline
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track customer interactions, lead qualification stages, and WhatsApp contacts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-sm flex items-center space-x-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Pipeline Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Leads</p>
          <p className="text-xl font-bold text-[#0F172A] mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">New</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{newCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider">Qualified</p>
          <p className="text-xl font-bold text-purple-700 mt-1">{qualifiedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Proposal</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{proposalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">Won / Customers</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{wonCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Stage Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedStage('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedStage === 'ALL'
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            All Customers
          </button>

          {Object.values(LeadStatus).map((stage) => {
            const active = selectedStage === stage;
            const label = STAGE_CONFIG[stage].label;
            return (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Customers Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading customer directory...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A]">No Customers Found</h3>
            <p className="text-xs text-slate-500 mt-1">
              {search || selectedStage !== 'ALL'
                ? 'No matching customer records for the selected filters.'
                : 'Your customer database is empty. Add your first customer or connect WhatsApp.'}
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-[#10B981] text-white text-xs font-semibold hover:bg-[#059669] transition-all shadow-xs"
            >
              Add Customer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Customer</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4">Budget / Value</th>
                  <th className="py-3 px-4">Tags & Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {customers.map((c) => {
                  const stage = c.latestLead?.status || LeadStatus.NEW;
                  const stageStyle = STAGE_CONFIG[stage] || STAGE_CONFIG[LeadStatus.NEW];
                  const cleanPhone = c.phone ? c.phone.replace(/[^0-9]/g, '') : null;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Customer Profile */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0F172A]">{c.name}</p>
                            <p className="text-[11px] text-slate-400">Added {new Date(c.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {c.phone ? (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center space-x-1.5 text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#10B981]" />
                              <span>{c.phone}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">No phone</span>
                          )}
                          {c.email && (
                            <div className="flex items-center space-x-1.5 text-slate-500">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[150px]">{c.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stage Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-bold ${stageStyle.bg} ${stageStyle.text} ${stageStyle.border}`}
                        >
                          {stageStyle.label}
                        </span>
                      </td>

                      {/* Budget / Value */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {c.latestLead?.budget ? (
                          <span>{formatCurrency(c.latestLead.budget)}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Tags & Notes */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          {c.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {c.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {c.notes && (
                            <p className="text-[11px] text-slate-500 truncate" title={c.notes}>
                              {c.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(c.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#0F172A]">
                {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Okon"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    WhatsApp Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+2348012345678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="samuel@email.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pipeline Lead Stage
                  </label>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                  >
                    {Object.values(LeadStatus).map((stg) => (
                      <option key={stg} value={stg}>
                        {STAGE_CONFIG[stg]?.label || stg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Budget / Deal Value
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="VIP, Wholesale, Repeat"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notes & Inquiries
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Customer inquired about bulk orders via WhatsApp..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl text-white bg-[#10B981] hover:bg-[#059669] font-bold shadow-xs disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Delete Customer?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete this customer record and associated lead pipeline data? This action cannot be undone.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

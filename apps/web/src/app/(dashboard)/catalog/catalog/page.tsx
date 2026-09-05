'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBusinessStore } from '@/stores/useBusinessStore';
import {
  fetchOfferings,
  createOffering,
  updateOffering,
  deleteOffering,
  toggleOfferingActive,
} from '@/lib/api/catalog';
import type { Offering, CreateOfferingInput } from '@autoagent/shared';

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterType = 'ALL' | 'PRODUCT' | 'SERVICE';
type ModalMode = 'create' | 'edit' | null;

const EMPTY_FORM: CreateOfferingInput = {
  type: 'PRODUCT',
  name: '',
  description: '',
  price: 0,
  currency: 'NGN',
  durationMinutes: null,
  sku: '',
  stockQuantity: null,
  isActive: true,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Badge({ type }: { type: 'PRODUCT' | 'SERVICE' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        type === 'PRODUCT'
          ? 'bg-blue-50 text-blue-700'
          : 'bg-purple-50 text-purple-700'
      }`}
    >
      {type === 'PRODUCT' ? '📦 Product' : '⚙️ Service'}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
        active ? 'text-[#10B981]' : 'text-[#64748B]'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#10B981]' : 'bg-[#64748B]'}`}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function EmptyState({ filter, onAdd }: { filter: FilterType; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-3xl mb-4">
        {filter === 'SERVICE' ? '⚙️' : '📦'}
      </div>
      <h3 className="text-lg font-bold text-[#0F172A] mb-1">
        No {filter === 'ALL' ? 'offerings' : filter.toLowerCase() + 's'} yet
      </h3>
      <p className="text-sm text-[#64748B] mb-6 max-w-xs">
        Add your first{' '}
        {filter === 'SERVICE' ? 'service' : filter === 'PRODUCT' ? 'product' : 'product or service'}{' '}
        to start taking orders and bookings through your AI agent.
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold rounded-lg transition-all"
      >
        Add Offering
      </button>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

interface OfferingModalProps {
  mode: ModalMode;
  initial: CreateOfferingInput;
  currency: string;
  loading: boolean;
  onSubmit: (data: CreateOfferingInput) => void;
  onClose: () => void;
}

function OfferingModal({ mode, initial, currency, loading, onSubmit, onClose }: OfferingModalProps) {
  const [form, setForm] = useState<CreateOfferingInput>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const set = (key: keyof CreateOfferingInput, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#0F172A]">
            {mode === 'create' ? 'Add Offering' : 'Edit Offering'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Type toggle */}
          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
              Type
            </label>
            <div className="flex gap-2">
              {(['PRODUCT', 'SERVICE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  disabled={mode === 'edit'}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    form.type === t
                      ? 'bg-[#0F172A] text-white border-[#0F172A]'
                      : 'bg-white text-[#64748B] border-slate-200 hover:border-[#0F172A]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {t === 'PRODUCT' ? '📦 Product' : '⚙️ Service'}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={form.type === 'PRODUCT' ? 'e.g. Ankara Fabric Set' : 'e.g. Logo Design'}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] focus:outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief description of this offering..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
              Price <span className="text-[#64748B] font-normal">({currency})</span>
            </label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] focus:outline-none transition-all"
            />
          </div>

          {/* Service-specific: duration */}
          {form.type === 'SERVICE' && (
            <div>
              <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                value={form.durationMinutes ?? ''}
                onChange={(e) =>
                  set('durationMinutes', e.target.value ? parseInt(e.target.value) : null)
                }
                placeholder="e.g. 60"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] focus:outline-none transition-all"
              />
            </div>
          )}

          {/* Product-specific: SKU + Stock */}
          {form.type === 'PRODUCT' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">SKU</label>
                <input
                  type="text"
                  value={form.sku ?? ''}
                  onChange={(e) => set('sku', e.target.value || null)}
                  placeholder="e.g. FAB-001"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-1.5">
                  Stock Qty
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.stockQuantity ?? ''}
                  onChange={(e) =>
                    set('stockQuantity', e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="Leave blank = unlimited"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-[#020617] focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Active toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-[#F8FAFC] rounded-lg">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Active</p>
              <p className="text-xs text-[#64748B]">Visible to your AI agent and customers</p>
            </div>
            <button
              type="button"
              onClick={() => set('isActive', !form.isActive)}
              className={`relative w-10 h-6 rounded-full transition-all ${
                form.isActive ? 'bg-[#10B981]' : 'bg-slate-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  form.isActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-[#64748B] text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#10B981] hover:bg-[#059669] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-all"
            >
              {loading ? 'Saving…' : mode === 'create' ? 'Add Offering' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  const { activeBusiness, formatCurrency } = useBusinessStore();
  const businessId = activeBusiness?.id ?? '';

  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editTarget, setEditTarget] = useState<Offering | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const filters: { type?: 'PRODUCT' | 'SERVICE' } = {};
      if (filter === 'PRODUCT' || filter === 'SERVICE') {
        filters.type = filter;
      }
      const data = await fetchOfferings(businessId, filters);
      setOfferings(data);
      setError(null);
    } catch {
      setError('Could not load offerings. Make sure the API is running.');
    } finally {
      setLoading(false);
    }
  }, [businessId, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (data: CreateOfferingInput) => {
    if (!businessId) return;
    setModalLoading(true);
    try {
      const created = await createOffering(businessId, {
        ...data,
        currency: activeBusiness?.currency ?? 'NGN',
      });
      setOfferings((prev) => [created, ...prev]);
      setModalMode(null);
      showToast('Offering created successfully');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create offering');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async (data: CreateOfferingInput) => {
    if (!businessId || !editTarget) return;
    setModalLoading(true);
    try {
      const updated = await updateOffering(businessId, editTarget.id, data);
      setOfferings((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setModalMode(null);
      setEditTarget(null);
      showToast('Offering updated');
    } catch {
      setError('Failed to update offering');
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleActive = async (offering: Offering) => {
    try {
      const updated = await toggleOfferingActive(businessId, offering.id, !offering.isActive);
      setOfferings((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast(`Offering ${updated.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      setError('Failed to update status');
    }
  };

  const handleDelete = async (offeringId: string) => {
    try {
      await deleteOffering(businessId, offeringId);
      setOfferings((prev) => prev.filter((o) => o.id !== offeringId));
      setDeleteConfirm(null);
      showToast('Offering deleted');
    } catch {
      setError('Failed to delete offering');
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setModalMode('create');
  };

  const openEdit = (offering: Offering) => {
    setEditTarget(offering);
    setModalMode('edit');
  };

  const modalInitial: CreateOfferingInput = editTarget
    ? {
        type: editTarget.type,
        name: editTarget.name,
        description: editTarget.description,
        price: editTarget.price,
        currency: editTarget.currency,
        durationMinutes: editTarget.durationMinutes,
        sku: editTarget.sku,
        stockQuantity: editTarget.stockQuantity,
        isActive: editTarget.isActive,
      }
    : { ...EMPTY_FORM, currency: activeBusiness?.currency ?? 'NGN' };

  // Stats
  const products = offerings.filter((o) => o.type === 'PRODUCT');
  const services = offerings.filter((o) => o.type === 'SERVICE');
  const activeCount = offerings.filter((o) => o.isActive).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A]">Catalog</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Manage your products and services — your AI agent uses these for quotes & orders.
          </p>
        </div>
        <button
          id="add-offering-btn"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
        >
          <span className="text-base leading-none">+</span>
          Add Offering
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-sm font-medium rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          ✓ {toast}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: offerings.length, color: 'text-[#0F172A]' },
          { label: 'Products', value: products.length, color: 'text-blue-600' },
          { label: 'Services', value: services.length, color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
            {stat.label === 'Total' && (
              <p className="text-xs text-[#64748B] mt-0.5">{activeCount} active</p>
            )}
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white border border-slate-100 rounded-xl p-1 w-fit shadow-sm">
        {(['ALL', 'PRODUCT', 'SERVICE'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === f
                ? 'bg-[#0F172A] text-white'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {f === 'ALL' ? 'All' : f === 'PRODUCT' ? '📦 Products' : '⚙️ Services'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-1/2 mb-5" />
              <div className="h-6 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : offerings.length === 0 ? (
        <EmptyState filter={filter} onAdd={openCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {offerings.map((offering) => (
            <div
              key={offering.id}
              className={`group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-3 ${
                offering.isActive ? 'border-slate-100' : 'border-slate-100 opacity-60'
              }`}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[#0F172A] text-sm leading-snug truncate">
                    {offering.name}
                  </h3>
                  {offering.description && (
                    <p className="text-xs text-[#64748B] mt-0.5 line-clamp-2">
                      {offering.description}
                    </p>
                  )}
                </div>
                <Badge type={offering.type} />
              </div>

              {/* Price */}
              <div>
                <p className="text-xl font-extrabold text-[#10B981]">
                  {formatCurrency(offering.price)}
                </p>
                {offering.type === 'SERVICE' && offering.durationMinutes && (
                  <p className="text-xs text-[#64748B] mt-0.5">⏱ {offering.durationMinutes} min</p>
                )}
                {offering.type === 'PRODUCT' && offering.sku && (
                  <p className="text-xs text-[#64748B] mt-0.5">SKU: {offering.sku}</p>
                )}
                {offering.type === 'PRODUCT' && offering.stockQuantity !== null && (
                  <p className="text-xs text-[#64748B]">
                    Stock: {offering.stockQuantity === 0 ? '⚠️ Out of stock' : offering.stockQuantity}
                  </p>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                <StatusDot active={offering.isActive} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleActive(offering)}
                    title={offering.isActive ? 'Deactivate' : 'Activate'}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] transition-all text-xs"
                  >
                    {offering.isActive ? '⏸' : '▶'}
                  </button>
                  <button
                    onClick={() => openEdit(offering)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A] transition-all text-xs"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(offering.id)}
                    className="p-1.5 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all text-xs"
                  >
                    🗑
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offering Modal */}
      {modalMode && (
        <OfferingModal
          mode={modalMode}
          initial={modalInitial}
          currency={activeBusiness?.currency ?? 'NGN'}
          loading={modalLoading}
          onSubmit={modalMode === 'create' ? handleCreate : handleUpdate}
          onClose={() => {
            setModalMode(null);
            setEditTarget(null);
          }}
        />
      )}

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-[#0F172A] mb-2">Delete Offering?</h3>
            <p className="text-sm text-[#64748B] mb-6">
              This will permanently remove the offering. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-slate-200 text-[#64748B] text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

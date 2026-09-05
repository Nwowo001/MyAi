'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useBusinessStore } from '@/stores/useBusinessStore';
import {
  fetchOfferings,
  createOffering,
  updateOffering,
  deleteOffering,
  toggleOfferingActive,
} from '@/lib/api/catalog';
import { uploadImageFile } from '@/lib/api/upload';
import type { Offering, CreateOfferingInput } from '@autoagent/shared';
import {
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  Tag,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Package,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type FilterType = 'ALL' | 'PRODUCT' | 'SERVICE';
type ModalMode = 'create' | 'edit' | null;

interface SpecRow {
  key: string;
  value: string;
}

const COMMON_SPEC_SUGGESTIONS = [
  'Brand',
  'Color',
  'Size',
  'Material',
  'Weight',
  'Dimensions',
  'Warranty',
  'Condition',
];

const EMPTY_FORM: CreateOfferingInput = {
  type: 'PRODUCT',
  name: '',
  description: '',
  price: 0,
  currency: 'NGN',
  imageUrl: null,
  specifications: null,
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
          ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
          : 'bg-purple-50 text-purple-700 border border-purple-200/60'
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
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mb-4">
        {filter === 'SERVICE' ? '⚙️' : '📦'}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">
        No {filter === 'ALL' ? 'offerings' : filter.toLowerCase() + 's'} in your catalog yet
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        Add your first {filter === 'SERVICE' ? 'service' : filter === 'PRODUCT' ? 'product' : 'product or service'}{' '}
        with photos and specifications so your AI agent can recommend and sell it on WhatsApp.
      </p>
      <button
        onClick={onAdd}
        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add First Offering
      </button>
    </div>
  );
}

// ── Offering Modal with Image Upload & Specs ──────────────────────────────────

interface OfferingModalProps {
  mode: ModalMode;
  initial: CreateOfferingInput;
  currency: string;
  loading: boolean;
  onSubmit: (data: CreateOfferingInput) => void;
  onClose: () => void;
}

function OfferingModal({
  mode,
  initial,
  currency,
  loading,
  onSubmit,
  onClose,
}: OfferingModalProps) {
  const [form, setForm] = useState<CreateOfferingInput>(initial);
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form and specs from initial prop
  useEffect(() => {
    setForm(initial);
    if (initial.specifications && typeof initial.specifications === 'object') {
      const rows = Object.entries(initial.specifications).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setSpecs(rows);
    } else {
      setSpecs([]);
    }
    if (initial.imageUrl) {
      setCustomUrl(initial.imageUrl);
    }
  }, [initial]);

  const setField = (key: keyof CreateOfferingInput, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  // ── Image Upload Handling ──
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be under 10MB.');
      return;
    }

    setUploadingImage(true);
    setUploadError(null);

    try {
      const uploadedUrl = await uploadImageFile(file);
      setField('imageUrl', uploadedUrl);
      setCustomUrl(uploadedUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleApplyUrl = () => {
    if (customUrl.trim()) {
      setField('imageUrl', customUrl.trim());
      setShowUrlInput(false);
    }
  };

  // ── Specifications Handling ──
  const addSpecRow = (suggestedKey?: string) => {
    setSpecs((prev) => [...prev, { key: suggestedKey ?? '', value: '' }]);
  };

  const updateSpecKey = (index: number, newKey: string) => {
    setSpecs((prev) => {
      const updated = [...prev];
      if (updated[index]) updated[index].key = newKey;
      return updated;
    });
  };

  const updateSpecValue = (index: number, newValue: string) => {
    setSpecs((prev) => {
      const updated = [...prev];
      if (updated[index]) updated[index].value = newValue;
      return updated;
    });
  };

  const removeSpecRow = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Serialize specs array into Record<string, string>
    const cleanSpecs: Record<string, string> = {};
    for (const row of specs) {
      const k = row.key.trim();
      const v = row.value.trim();
      if (k && v) {
        cleanSpecs[k] = v;
      }
    }

    onSubmit({
      ...form,
      specifications: Object.keys(cleanSpecs).length > 0 ? cleanSpecs : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              {form.type === 'PRODUCT' ? <Package className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'create' ? 'Add Offering' : 'Edit Offering'}
              </h2>
              <p className="text-xs text-slate-400">
                Provide product details, photos, and specs for the WhatsApp AI agent.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Offering Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['PRODUCT', 'SERVICE'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setField('type', t)}
                  disabled={mode === 'edit'}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    form.type === t
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {t === 'PRODUCT' ? (
                    <>
                      <Package className="w-4 h-4" /> Physical / Digital Product
                    </>
                  ) : (
                    <>
                      <Wrench className="w-4 h-4" /> Service / Appointment
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── 1. Image Upload Section ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" /> Product Image
              </label>
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" /> {showUrlInput ? 'Upload file instead' : 'Or paste URL'}
              </button>
            </div>

            {uploadError && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {uploadError}
              </div>
            )}

            {form.imageUrl ? (
              /* Image Preview Box */
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group h-44 flex items-center justify-center">
                <img
                  src={form.imageUrl}
                  alt={form.name || 'Product'}
                  className="w-full h-full object-contain p-2"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow hover:bg-slate-50 cursor-pointer"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setField('imageUrl', null);
                      setCustomUrl('');
                    }}
                    className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : showUrlInput ? (
              /* Direct URL Input */
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/product-photo.jpg"
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg cursor-pointer transition"
                >
                  Apply
                </button>
              </div>
            ) : (
              /* Drag & Drop / Click Upload Box */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/20 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:border-emerald-300 flex items-center justify-center transition">
                  {uploadingImage ? (
                    <span className="inline-block animate-spin text-lg">⏳</span>
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    {uploadingImage ? 'Uploading to storage…' : 'Click or drop product photo here'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Supports PNG, JPG, WebP up to 10MB
                  </span>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Title / Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder={form.type === 'PRODUCT' ? 'e.g. Vintage Leather Handbag' : 'e.g. 60-Min Consultation'}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={form.description ?? ''}
              onChange={(e) => setField('description', e.target.value || null)}
              placeholder="Detailed description of features, benefits, and specifications..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Price ({currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="number"
                min={0}
                step="0.01"
                value={form.price || ''}
                onChange={(e) => setField('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            {form.type === 'SERVICE' ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.durationMinutes ?? ''}
                  onChange={(e) =>
                    setField('durationMinutes', e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="e.g. 60"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    value={form.sku ?? ''}
                    onChange={(e) => setField('sku', e.target.value || null)}
                    placeholder="e.g. HND-01"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Stock Qty
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.stockQuantity ?? ''}
                    onChange={(e) =>
                      setField('stockQuantity', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="Unlimited"
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── 2. Product Specifications Builder ── */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" /> Specifications & Attributes
                </label>
                <p className="text-[11px] text-slate-500">
                  Custom specs used by the AI agent to answer customer inquiries on WhatsApp.
                </p>
              </div>
              <button
                type="button"
                onClick={() => addSpecRow()}
                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Spec
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-400 self-center mr-1">Quick add:</span>
              {COMMON_SPEC_SUGGESTIONS.map((item) => {
                const alreadyAdded = specs.some((s) => s.key.toLowerCase() === item.toLowerCase());
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => addSpecRow(item)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                      alreadyAdded
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    + {item}
                  </button>
                );
              })}
            </div>

            {/* Spec Rows */}
            {specs.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400">
                No specifications added yet. Click "+ Add Spec" or use the quick tags above.
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {specs.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Spec Name (e.g. Color)"
                      value={row.key}
                      onChange={(e) => updateSpecKey(idx, e.target.value)}
                      className="w-1/3 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. Midnight Black)"
                      value={row.value}
                      onChange={(e) => updateSpecValue(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete spec"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-900">Publish in Catalog</p>
              <p className="text-xs text-slate-500">Visible to your AI agent and customers</p>
            </div>
            <button
              type="button"
              onClick={() => setField('isActive', !form.isActive)}
              className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${
                form.isActive ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
                  form.isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>Saving…</span>
                </>
              ) : mode === 'create' ? (
                'Create Offering'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Catalog Page ─────────────────────────────────────────────────────────

export default function CatalogPage() {
  const activeBusiness = useBusinessStore((s) => s.activeBusiness);
  const formatCurrency = useBusinessStore((s) => s.formatCurrency);
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
      showToast(`"${created.name}" created successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offering');
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
      showToast(`"${updated.name}" updated successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offering');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (offeringId: string) => {
    if (!businessId) return;
    try {
      await deleteOffering(businessId, offeringId);
      setOfferings((prev) => prev.filter((o) => o.id !== offeringId));
      setDeleteConfirm(null);
      showToast('Offering deleted.');
    } catch {
      setError('Failed to delete offering.');
    }
  };

  const handleToggle = async (offering: Offering) => {
    if (!businessId) return;
    try {
      const updated = await toggleOfferingActive(businessId, offering.id, !offering.isActive);
      setOfferings((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      showToast(`Offering ${updated.isActive ? 'activated' : 'deactivated'}.`);
    } catch {
      setError('Failed to toggle status.');
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
        imageUrl: editTarget.imageUrl,
        specifications: editTarget.specifications,
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catalog</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your products and services with photos and specifications for automated WhatsApp sales.
          </p>
        </div>
        <button
          id="add-offering-btn"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Offering
        </button>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 ml-4 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Offerings', value: offerings.length, color: 'text-slate-900' },
          { label: 'Products', value: products.length, color: 'text-blue-600' },
          { label: 'Services', value: services.length, color: 'text-purple-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            {stat.label === 'Total Offerings' && (
              <p className="text-xs text-slate-400 mt-0.5">{activeCount} active in catalog</p>
            )}
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        {(['ALL', 'PRODUCT', 'SERVICE'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              filter === f
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {f === 'ALL' ? 'All Offerings' : f === 'PRODUCT' ? '📦 Products' : '⚙️ Services'}
          </button>
        ))}
      </div>

      {/* Offerings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="h-36 bg-slate-100 rounded-lg w-full" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-6 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : offerings.length === 0 ? (
        <EmptyState filter={filter} onAdd={openCreate} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offerings.map((offering) => {
            const specEntries = offering.specifications ? Object.entries(offering.specifications) : [];

            return (
              <div
                key={offering.id}
                className={`group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${
                  offering.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60'
                }`}
              >
                {/* Product Image Banner */}
                <div className="relative h-44 w-full bg-slate-50 border-b border-slate-100 overflow-hidden flex items-center justify-center">
                  {offering.imageUrl ? (
                    <img
                      src={offering.imageUrl}
                      alt={offering.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="text-4xl text-slate-300 flex flex-col items-center gap-1">
                      {offering.type === 'PRODUCT' ? <Package className="w-10 h-10 text-slate-300" /> : <Wrench className="w-10 h-10 text-slate-300" />}
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">No Photo</span>
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    <Badge type={offering.type} />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
                      {offering.name}
                    </h3>
                    {offering.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {offering.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Meta info */}
                  <div>
                    <p className="text-xl font-extrabold text-emerald-600 font-mono">
                      {formatCurrency(offering.price)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      {offering.type === 'SERVICE' && offering.durationMinutes && (
                        <span>⏱ {offering.durationMinutes} min</span>
                      )}
                      {offering.type === 'PRODUCT' && offering.sku && (
                        <span>SKU: <strong className="text-slate-600">{offering.sku}</strong></span>
                      )}
                      {offering.type === 'PRODUCT' && offering.stockQuantity !== null && (
                        <span>
                          {offering.stockQuantity === 0 ? (
                            <span className="text-rose-600 font-semibold">Out of stock</span>
                          ) : (
                            <span>Stock: {offering.stockQuantity}</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Specifications Pills */}
                  {specEntries.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex flex-wrap gap-1.5">
                        {specEntries.slice(0, 3).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                          >
                            <span className="text-slate-400 font-normal">{k}:</span> {v}
                          </span>
                        ))}
                        {specEntries.length > 3 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{specEntries.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer Controls */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggle(offering)}
                      className="cursor-pointer"
                      title="Toggle active status"
                    >
                      <StatusDot active={offering.isActive} />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(offering)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                      >
                        Edit
                      </button>

                      {deleteConfirm === offering.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(offering.id)}
                            className="px-2 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="px-1.5 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(offering.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                          title="Delete offering"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
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
    </div>
  );
}

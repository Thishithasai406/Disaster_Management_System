import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Bell, Plus, Trash2, BellOff, Send, AlertTriangle, Info, Zap, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAlerts, createAlert, deactivateAlert,
  deleteAlert, ALERT_TYPES, ALERT_TARGETS,
} from '../../api/alertService';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/EmptyState';
import { alertTypeConfig, timeAgo } from '../../utils/helpers';

/* ── Create alert form modal ───────────────────────────────────────────────── */
const CreateAlertModal = ({ onClose, onCreate }) => {
  const formik = useFormik({
    initialValues: { title: '', message: '', type: 'info', target: 'all' },
    validationSchema: Yup.object({
      title:   Yup.string().min(5, 'Min 5 chars').required('Title required'),
      message: Yup.string().min(10, 'Min 10 chars').required('Message required'),
      type:    Yup.string().oneOf(ALERT_TYPES).required(),
      target:  Yup.string().oneOf(ALERT_TARGETS).required(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try { await onCreate(values); }
      finally { setSubmitting(false); }
    },
  });
  const fld = n => ({ ...formik.getFieldProps(n), error: formik.touched[n] && formik.errors[n] });

  const TYPE_CONFIG = {
    info:       { label: 'Info',       color: '#22d3ee', icon: '💬' },
    warning:    { label: 'Warning',    color: '#facc15', icon: '⚠️' },
    critical:   { label: 'Critical',   color: '#f43f5e', icon: '🚨' },
    evacuation: { label: 'Evacuation', color: '#f97316', icon: '🏃' },
  };

  return (
    <Modal open onClose={onClose} title="📢 Broadcast Alert" size="xl">
      {/* 2-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1px 1fr', gap: '0 2rem', alignItems: 'start' }}>

        {/* LEFT — Alert Type */}
        <div style={{ paddingRight: '0.25rem' }}>
          <p className="text-xs font-semibold text-slate-500 mb-3" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Alert Type <span className="text-red-400">*</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {ALERT_TYPES.map(t => {
              const cfg = TYPE_CONFIG[t];
              const sel = formik.values.type === t;
              return (
                <button key={t} type="button"
                  onClick={() => formik.setFieldValue('type', t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.875rem',
                    border: `1px solid ${sel ? cfg.color : 'rgba(255,255,255,0.07)'}`,
                    background: sel ? `${cfg.color}15` : 'rgba(255,255,255,0.02)',
                    color: sel ? cfg.color : '#64748b',
                    boxShadow: sel ? `0 0 0 2px ${cfg.color}30, 0 4px 12px ${cfg.color}20` : 'none',
                    transform: sel ? 'translateX(3px)' : 'none',
                    transition: 'all 0.18s ease',
                    fontSize: '0.875rem', fontWeight: 600,
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}>
                  <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ background: 'rgba(255,255,255,0.06)', alignSelf: 'stretch' }} />

        {/* RIGHT — Target + Title + Message */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '0.25rem' }}>

          {/* Target audience */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-3" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Target Audience <span className="text-red-400">*</span>
            </p>
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {[
                { value: 'all',       label: '👥 Everyone' },
                { value: 'citizen',   label: '🏠 Citizens' },
                { value: 'volunteer', label: '🦺 Volunteers' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => formik.setFieldValue('target', opt.value)}
                  style={{
                    flex: 1, padding: '0.6rem 0.5rem',
                    borderRadius: '0.75rem', border: '1px solid',
                    fontSize: '0.8125rem', fontWeight: 600,
                    transition: 'all 0.18s ease', cursor: 'pointer',
                    borderColor: formik.values.target === opt.value ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.07)',
                    background:  formik.values.target === opt.value ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                    color:       formik.values.target === opt.value ? '#a5b4fc' : '#64748b',
                    boxShadow:   formik.values.target === opt.value ? '0 0 0 1px rgba(99,102,241,0.3)' : 'none',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Input label="Alert Title" placeholder="e.g. Flash Flood Warning" required {...fld('title')} />
          <Textarea label="Message" placeholder="Provide clear instructions for the target audience…"
            rows={3} required {...fld('message')} />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="danger" size="sm" loading={formik.isSubmitting}
          onClick={formik.handleSubmit} leftIcon={<Send className="w-3.5 h-3.5" />}>
          Broadcast Alert
        </Button>
      </div>
    </Modal>
  );
};

/* ── Alert card ────────────────────────────────────────────────────────────── */
const AlertRow = ({ alert, onDeactivate, onDelete, deactivating, deleting }) => {
  const cfg = alertTypeConfig(alert.type);
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 hover:translate-y-[-1px] ${!alert.active ? 'opacity-55' : ''}`}
      style={{
        background: `linear-gradient(135deg, ${cfg.bg} 0%, rgba(15,23,42,0.6) 100%)`,
        borderColor: cfg.border,
        boxShadow: `0 4px 24px ${cfg.border}`,
        padding: '1.5rem',
      }}>

      {/* Top row: icon + meta + actions */}
      <div className="flex items-start justify-between gap-4">

        {/* Icon tile + title block */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Large icon tile */}
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl"
            style={{ background: `${cfg.border}30`, border: `1px solid ${cfg.border}` }}>
            {cfg.icon}
          </div>

          {/* Title + badges */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-1.5">
              <p className="text-base font-bold text-white font-display">{alert.title}</p>
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ color: cfg.color, background: `${cfg.border}50`, border: `1px solid ${cfg.border}` }}>
                {alert.type}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/[0.08] text-slate-500 bg-white/[0.03]">
                → {alert.target}
              </span>
              {!alert.active && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{alert.message}</p>
          </div>
        </div>

        {/* Action buttons top-right */}
        <div className="flex items-center gap-1 shrink-0">
          {alert.active && (
            <button onClick={() => onDeactivate(alert.id)} disabled={deactivating === alert.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 border border-transparent hover:border-yellow-500/20 transition-all"
              title="Deactivate">
              {deactivating === alert.id ? <Spinner size="sm" /> : <><BellOff className="w-3.5 h-3.5" />Mute</>}
            </button>
          )}
          <button onClick={() => onDelete(alert.id)} disabled={deleting === alert.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
            title="Delete">
            {deleting === alert.id ? <Spinner size="sm" /> : <><Trash2 className="w-3.5 h-3.5" />Delete</>}
          </button>
        </div>
      </div>

      {/* Footer: sent-by + timestamp */}
      <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: `1px solid ${cfg.border}50` }}>
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: `${cfg.border}40` }}>
          <span style={{ fontSize: '0.6rem' }}>👤</span>
        </div>
        <p className="text-xs text-slate-500">
          Sent by <span className="text-slate-400 font-medium">{alert.sent_by || 'Admin'}</span>
        </p>
        <span className="text-slate-700">·</span>
        <p className="text-xs text-slate-600">{timeAgo(alert.created_at)}</p>
      </div>
    </div>
  );
};

/* ── Main page ─────────────────────────────────────────────────────────────── */
const AlertsManagement = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [typeFilter, setType]       = useState('');
  const [deactivating, setDeact]    = useState(null);
  const [deleting, setDeleting]     = useState(null);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['admin-alerts', typeFilter],
    queryFn: () => getAlerts({ type: typeFilter || undefined }),
    refetchInterval: 15000,
  });

  const createMut = useMutation({
    mutationFn: createAlert,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-alerts'] }); setShowCreate(false); toast.success('Alert broadcast!'); },
    onError: () => toast.error('Broadcast failed.'),
  });

  const handleDeactivate = async (id) => {
    setDeact(id);
    try {
      await deactivateAlert(id);
      // Optimistic update — flip active=false immediately
      qc.setQueryData(['admin-alerts', typeFilter], (old = []) =>
        old.map((a) => (a.id === id ? { ...a, active: false } : a))
      );
      toast.success('Alert deactivated');
    } catch { toast.error('Failed'); }
    finally { setDeact(null); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteAlert(id);
      // Optimistic update — remove immediately from cache
      qc.setQueryData(['admin-alerts', typeFilter], (old = []) =>
        old.filter((a) => a.id !== id)
      );
      toast.success('Alert deleted');
    } catch { toast.error('Failed'); }
    finally { setDeleting(null); }
  };

  const active   = alerts.filter(a => a.active);
  const inactive = alerts.filter(a => !a.active);

  return (
    <div className="animate-fade-in-up" style={{ paddingBottom: '3rem', paddingLeft: '1rem', paddingRight: '1rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="text-2xl font-bold text-white font-display">Alerts Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            {active.length} active · {inactive.length} inactive
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn btn-danger btn-sm">
          <Send className="w-4 h-4" /> Broadcast Alert
        </button>
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2" style={{ marginBottom: '2rem' }}>
        {['', ...ALERT_TYPES].map(t => (
          <button key={t} onClick={() => setType(t)}
            className={`filter-pill capitalize ${typeFilter === t ? 'filter-pill-active' : ''}`}>
            {t || 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : alerts.length === 0 ? (
        <EmptyState icon={Bell} title="No alerts yet" description="Broadcast your first alert now."
          action={<button onClick={() => setShowCreate(true)} className="btn btn-primary btn-sm"><Plus className="w-3.5 h-3.5" /> Create Alert</button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {active.length > 0 && (
            <>
              <div className="section-label flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Active Alerts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {active.map(a => (
                  <AlertRow key={a.id} alert={a} onDeactivate={handleDeactivate} onDelete={handleDelete}
                    deactivating={deactivating} deleting={deleting} />
                ))}
              </div>
            </>
          )}
          {inactive.length > 0 && (
            <>
              <div className="section-label mt-3">Inactive</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {inactive.map(a => (
                  <AlertRow key={a.id} alert={a} onDeactivate={handleDeactivate} onDelete={handleDelete}
                    deactivating={deactivating} deleting={deleting} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {showCreate && (
        <CreateAlertModal
          onClose={() => setShowCreate(false)}
          onCreate={async (payload) => createMut.mutateAsync(payload)}
        />
      )}
    </div>
  );
};

export default AlertsManagement;

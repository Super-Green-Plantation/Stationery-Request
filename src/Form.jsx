import { useState } from 'react';

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

const ITEMS = [
    { id: 'T-Shirt', label: 'T-Shirt', icon: '👕', hasSize: true },
    { id: 'Mug', label: 'Mug', icon: '☕', hasSize: false },
    { id: 'Umbrella', label: 'Umbrella', icon: '☂️', hasSize: false },
    { id: 'Stationery', label: 'Stationery', icon: '✏️', hasSize: false },
    // Add more items here
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const BRANCHES = ['Head Office',
    'Galle',
    'Tangalle',
    'Matara',
    'Middeniya',
    'Mathugama',
    'Colombo',
    'Thanamalwila',
    'Moraketiya',
    'Rathnapura',
    'Welimada',
];

// selectedItems shape: { [itemId]: { qty: number, size: string } }

export default function MerchandiseRequestForm() {
    const [empNo, setEmpNo] = useState('');
    const [empName, setEmpName] = useState('');
    const [branch, setBranch] = useState('');
    const [selectedItems, setSelectedItems] = useState({});
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState('idle');

    const toggleItem = (id) => {
        setSelectedItems(prev => {
            const next = { ...prev };
            if (next[id]) { delete next[id]; }
            else { next[id] = { qty: 1, size: '' }; }
            return next;
        });
    };

    const changeQty = (id, delta) => {
        setSelectedItems(prev => ({
            ...prev,
            [id]: { ...prev[id], qty: Math.max(1, Math.min(20, prev[id].qty + delta)) }
        }));
    };

    const setSize = (id, size) => {
        setSelectedItems(prev => ({
            ...prev,
            [id]: { ...prev[id], size }
        }));
    };

    const totalItems = Object.values(selectedItems).reduce((s, i) => s + i.qty, 0);

    const handleSubmit = async () => {
        if (!empNo || !empName || !branch) { setStatus('error'); return; }
        if (Object.keys(selectedItems).length === 0) { setStatus('error'); return; }

        const missingSizes = ITEMS
            .filter(i => i.hasSize && selectedItems[i.id] && !selectedItems[i.id].size)
            .map(i => i.label);
        if (missingSizes.length > 0) { setStatus('error'); return; }

        setStatus('loading');

        const date = new Date().toLocaleDateString('en-GB');

        // One row per item
        const rows = ITEMS
            .filter(i => selectedItems[i.id])
            .map(i => ({
                date,
                empNo,
                empName,
                branch,
                item: i.id,
                size: selectedItems[i.id].size || '—',
                quantity: selectedItems[i.id].qty,
                notes: notes || '—',
            }));

        try {
            await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rows),
            });
            setStatus('success');
            setEmpNo(''); setEmpName(''); setBranch('');
            setSelectedItems({}); setNotes('');
        } catch {
            setStatus('error');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f1117',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '48px 16px',
            fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

            <div style={{ width: '100%', maxWidth: 520 }}>

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18,
                        }}>🌿</div>
                        <span style={{ fontSize: 13, color: '#6b7280', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>
                            SUPER GREEN PLANTATION
                        </span>
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 600, color: '#f9fafb', margin: 0, lineHeight: 1.2 }}>
                        Stationery Request

                    </h1>
                    <p style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                        Select items and submit — your request goes directly to the sheet.
                    </p>
                </div>

                {/* Employee Info */}
                <div style={{
                    background: '#1a1d27', border: '1px solid #2a2d3a',
                    borderRadius: 14, padding: '20px', marginBottom: 12,
                }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', marginBottom: 14, textTransform: 'uppercase' }}>
                        Employee details
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[
                            { placeholder: 'Employee number', value: empNo, set: setEmpNo, mono: true },
                            { placeholder: 'Full name', value: empName, set: setEmpName },
                        ].map(({ placeholder, value, set, mono }) => (
                            <input
                                key={placeholder}
                                placeholder={placeholder}
                                value={value}
                                onChange={e => set(e.target.value)}
                                style={{
                                    background: '#0f1117', border: '1px solid #2a2d3a',
                                    borderRadius: 9, padding: '10px 14px',
                                    fontSize: 14, color: '#f9fafb', outline: 'none', width: '100%',
                                    fontFamily: mono ? "'DM Mono', monospace" : 'inherit',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = '#16a34a'}
                                onBlur={e => e.target.style.borderColor = '#2a2d3a'}
                            />
                        ))}
                        <select
                            value={branch}
                            onChange={e => setBranch(e.target.value)}
                            style={{
                                background: '#0f1117', border: '1px solid #2a2d3a',
                                borderRadius: 9, padding: '10px 14px',
                                fontSize: 14, color: branch ? '#f9fafb' : '#6b7280',
                                outline: 'none', width: '100%', boxSizing: 'border-box',
                                fontFamily: 'inherit',
                            }}
                            onFocus={e => e.target.style.borderColor = '#16a34a'}
                            onBlur={e => e.target.style.borderColor = '#2a2d3a'}
                        >
                            <option value="">Select branch</option>
                            {BRANCHES.map(b => <option key={b} style={{ color: '#f9fafb', background: '#1a1d27' }}>{b}</option>)}
                        </select>
                    </div>
                </div>

                {/* Item Selection */}
                <div style={{
                    background: '#1a1d27', border: '1px solid #2a2d3a',
                    borderRadius: 14, padding: '20px', marginBottom: 12,
                }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', marginBottom: 14, textTransform: 'uppercase' }}>
                        Select items {totalItems > 0 && <span style={{ color: '#16a34a', marginLeft: 6 }}>· {totalItems} total</span>}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {ITEMS.map(item => {
                            const selected = !!selectedItems[item.id];
                            return (
                                <div key={item.id}>
                                    {/* Item card */}
                                    <div
                                        onClick={() => toggleItem(item.id)}
                                        style={{
                                            background: selected ? 'rgba(22,163,74,0.1)' : '#0f1117',
                                            border: `1px solid ${selected ? '#16a34a' : '#2a2d3a'}`,
                                            borderRadius: 10, padding: '14px 16px',
                                            cursor: 'pointer', transition: 'all 0.15s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            {/* <span style={{ fontSize: 20 }}>{item.icon}</span> */}
                                            <span style={{ fontSize: 14, color: selected ? '#86efac' : '#9ca3af', fontWeight: selected ? 500 : 400 }}>
                                                {item.label}
                                            </span>
                                        </div>
                                        <div style={{
                                            width: 18, height: 18, borderRadius: '50%',
                                            border: `1.5px solid ${selected ? '#16a34a' : '#374151'}`,
                                            background: selected ? '#16a34a' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 10, color: '#fff', flexShrink: 0,
                                        }}>
                                            {selected && '✓'}
                                        </div>
                                    </div>

                                    {/* Expanded controls when selected */}
                                    {selected && (
                                        <div style={{
                                            background: '#0f1117', border: '1px solid #2a2d3a',
                                            borderTop: 'none', borderRadius: '0 0 10px 10px',
                                            padding: '12px 14px',
                                        }}>
                                            {/* Size pills for T-Shirt */}
                                            {item.hasSize && (
                                                <div style={{ marginBottom: 10 }}>
                                                    <p style={{ fontSize: 11, color: '#6b7280', marginBottom: 6 }}>Size</p>
                                                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                                        {SIZES.map(s => {
                                                            const active = selectedItems[item.id]?.size === s;
                                                            return (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => setSize(item.id, s)}
                                                                    style={{
                                                                        padding: '3px 10px', borderRadius: 99, fontSize: 11,
                                                                        border: `1px solid ${active ? '#16a34a' : '#2a2d3a'}`,
                                                                        background: active ? '#16a34a' : 'transparent',
                                                                        color: active ? '#fff' : '#9ca3af',
                                                                        cursor: 'pointer', fontFamily: 'inherit',
                                                                    }}
                                                                >{s}</button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Quantity */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 11, color: '#6b7280' }}>Qty</span>
                                                <button
                                                    onClick={() => changeQty(item.id, -1)}
                                                    style={{
                                                        width: 26, height: 26, borderRadius: 6,
                                                        border: '1px solid #2a2d3a', background: '#1a1d27',
                                                        color: '#9ca3af', cursor: 'pointer', fontSize: 16, lineHeight: 1,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}
                                                >−</button>
                                                <span style={{ fontSize: 14, fontWeight: 500, color: '#f9fafb', minWidth: 20, textAlign: 'center', fontFamily: "'DM Mono', monospace" }}>
                                                    {selectedItems[item.id].qty}
                                                </span>
                                                <button
                                                    onClick={() => changeQty(item.id, 1)}
                                                    style={{
                                                        width: 26, height: 26, borderRadius: 6,
                                                        border: '1px solid #2a2d3a', background: '#1a1d27',
                                                        color: '#9ca3af', cursor: 'pointer', fontSize: 16, lineHeight: 1,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}
                                                >+</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Notes */}
                <div style={{
                    background: '#1a1d27', border: '1px solid #2a2d3a',
                    borderRadius: 14, padding: '20px', marginBottom: 16,
                }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>
                        Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                    </p>
                    <textarea
                        placeholder="Any specific requests or details..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        style={{
                            width: '100%', background: '#0f1117', border: '1px solid #2a2d3a',
                            borderRadius: 9, padding: '10px 14px', fontSize: 14,
                            color: '#f9fafb', outline: 'none', resize: 'vertical',
                            fontFamily: 'inherit', boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = '#16a34a'}
                        onBlur={e => e.target.style.borderColor = '#2a2d3a'}
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={status === 'loading'}
                    style={{
                        width: '100%', padding: '13px',
                        background: status === 'loading' ? '#166534' : '#16a34a',
                        border: 'none', borderRadius: 10,
                        fontSize: 15, fontWeight: 600, color: '#fff',
                        cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', transition: 'background 0.15s',
                        opacity: status === 'loading' ? 0.7 : 1,
                    }}
                >
                    {status === 'loading' ? 'Submitting…' : `Submit request${totalItems > 0 ? ` · ${totalItems} item${totalItems > 1 ? 's' : ''}` : ''}`}
                </button>

                {status === 'success' && (
                    <div style={{
                        marginTop: 12, padding: '12px 16px', borderRadius: 10,
                        background: 'rgba(22,163,74,0.1)', border: '1px solid #16a34a',
                        fontSize: 13, color: '#86efac',
                    }}>
                        ✓ Request submitted — saved to the sheet.
                    </div>
                )}
                {status === 'error' && (
                    <div style={{
                        marginTop: 12, padding: '12px 16px', borderRadius: 10,
                        background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
                        fontSize: 13, color: '#fca5a5',
                    }}>
                        Please fill all required fields. T-Shirt requires a size selection.
                    </div>
                )}
            </div>
        </div>
    );
}
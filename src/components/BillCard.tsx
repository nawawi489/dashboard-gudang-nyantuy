import { ApprovalItem } from '../types'
import { formatIDR } from '../utils/format'

type Props = {
  trxId: string
  invoice?: string
  items: ApprovalItem[]
  onInputPaymentProof?: () => void
  ctaLabel?: string
}

export default function BillCard({ trxId, items, onInputPaymentProof, ctaLabel = 'Input Bukti Pembayaran' }: Props) {
  const headerItem = items[0]
  const totalAmount = headerItem.grandTotal || items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  return (
    <div className="approval-card">
      <div className="approval-card__header">
        <div className="approval-card__trx">{headerItem.nomorInvoice || trxId}</div>
        <div className="approval-card__tag">{headerItem.tag || 'PO'}</div>
      </div>
      <div className="approval-card__body">
        <div className="approval-card__title-row">
           <div className="approval-card__title">{headerItem.supplier}</div>
           <div className="approval-card__subtitle">{headerItem.date}</div>
        </div>
        <div className="approval-card__subtitle">{headerItem.outlet}</div>
        
        <div className="approval-card__divider" />
        
        <div className="item-list">
          {items.map((item, idx) => (
             <div key={idx} className="item-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{item.itemName}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{item.quantity} {item.unit} x {formatIDR(item.price)}</div>
                </div>
                <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {formatIDR(item.quantity * item.price)}
                </div>
             </div>
          ))}
        </div>

        <div className="approval-card__divider" />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600 }}>Total Tagihan</div>
            <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '18px' }}>{formatIDR(totalAmount)}</div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <button 
            className="btn" 
            style={{ 
              width: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px',
              backgroundColor: 'transparent',
              color: 'var(--primary)',
              border: '1px solid var(--primary)'
            }}
            onClick={onInputPaymentProof}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16L12 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 11L12 8 15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 16H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

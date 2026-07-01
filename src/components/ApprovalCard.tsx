import { formatIDR } from '../utils/format'
import { ApprovalItem } from '../types'

type Props = ApprovalItem & {
  onAccept?: () => void
  isSubmitting?: boolean
  isAccepted?: boolean
}

export default function ApprovalCard(props: Props) {
  const total = (props.price || 0) * (props.quantity || 0)
  const statusClass = props.status === 'Terima' ? 'status-terima' : props.status === 'Tolak' ? 'status-tolak' : 'status-pending'

  // Pastikan menampilkan props.status (yang berisi VerifikasiFinance dari ApprovalPage)
  const displayStatus = props.isAccepted ? 'Terima' : (props.status || 'Pending')

  return (
    <div className={`approval-card${props.isAccepted ? ' approval-card--accepted' : ''}`}>
      <div className="approval-card__header">
        <div className="approval-card__trx">#{props.trxId}</div>
        <div className={`approval-card__tag ${statusClass}`}>{displayStatus}</div>
      </div>
      <div className="approval-card__body">
        <div className="approval-card__title-row">
          <div className="approval-card__title">{props.itemName}</div>
          {props.itemId ? <div className="approval-card__itemid">{props.itemId}</div> : <span />}
        </div>
        <div className="approval-card__subtitle">{props.outlet}</div>
        {props.date ? <div className="approval-card__subtitle">{props.date}</div> : <span />}
        <div className="approval-card__divider" />
        <div className="approval-card__grid">
          <div>
            <div className="label">Supplier</div>
            <div className="approval-card__value">{props.supplier}</div>
          </div>
          <div>
            <div className="label">Jumlah PO</div>
            <div className="approval-card__value">{props.quantity} {props.unit}</div>
          </div>
          <div>
            <div className="label">Harga Satuan</div>
            <div className="approval-card__value">{formatIDR(props.price)}</div>
          </div>
          <div>
            <div className="label">Total Harga</div>
            <div className="approval-card__value" style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatIDR(total)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={props.onAccept}
            disabled={!props.onAccept || props.isSubmitting || props.isAccepted}
          >
            {props.isSubmitting ? 'Mengirim...' : 'Terima'}
          </button>
        </div>
      </div>
    </div>
  )
}

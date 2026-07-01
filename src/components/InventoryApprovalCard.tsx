import { formatIDR } from '../utils/format'
import { InventoryApprovalItem, InventoryApprovalStatus } from '../types'

type Props = InventoryApprovalItem & {
  onAccept?: () => void
  onReject?: () => void
  isSubmitting?: boolean
  isAccepted?: boolean
  isRejected?: boolean
}

export default function InventoryApprovalCard(props: Props) {
  const statusClass =
    props.status === 'Terima'
      ? 'status-terima'
      : props.status === 'Tolak'
        ? 'status-tolak'
        : 'status-pending'

  const displayStatus: InventoryApprovalStatus = props.isAccepted
    ? 'Terima'
    : props.isRejected
      ? 'Tolak'
      : (props.status || 'Pending')

  const finalClass = displayStatus === 'Terima' ? 'status-terima' : displayStatus === 'Tolak' ? 'status-tolak' : statusClass

  const decided = props.isAccepted || props.isRejected || props.status === 'Terima' || props.status === 'Tolak'

  return (
    <div
      className={`approval-card${props.isAccepted ? ' approval-card--accepted' : ''}${
        props.isRejected ? ' approval-card--rejected' : ''
      }`}
    >
      <div className="approval-card__header">
        <div className="approval-card__trx">#{props.trxId}</div>
        <div className={`approval-card__tag ${finalClass}`}>{displayStatus}</div>
      </div>
      <div className="approval-card__body">
        <div className="approval-card__title-row">
          <div className="approval-card__title">{props.itemName}</div>
          {props.itemId ? <div className="approval-card__itemid">{props.itemId}</div> : <span />}
        </div>
        <div className="approval-card__subtitle">{props.outlet}</div>
        {props.date ? <div className="approval-card__subtitle">{props.date}</div> : <span />}
        {props.spesifikasi ? (
          <div className="approval-card__subtitle" style={{ fontStyle: 'italic' }}>
            {props.spesifikasi}
          </div>
        ) : null}
        <div className="approval-card__divider" />
        <div className="approval-card__grid">
          <div>
            <div className="label">Jumlah</div>
            <div className="approval-card__value">{props.quantity}</div>
          </div>
          <div>
            <div className="label">Total Estimasi Biaya</div>
            <div className="approval-card__value" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {formatIDR(props.totalEstimasiBiaya || 0)}
            </div>
          </div>
          <div>
            <div className="label">Verifikasi SPV</div>
            <div className="approval-card__value">
              {props.verifikasiSpv ? 'Sudah' : 'Belum'}
            </div>
          </div>
          {typeof props.nominalDisetujui === 'number' && props.nominalDisetujui > 0 ? (
            <div>
              <div className="label">Nominal Disetujui</div>
              <div className="approval-card__value">{formatIDR(props.nominalDisetujui)}</div>
            </div>
          ) : null}
        </div>
        {!decided ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <button
              type="button"
              className="btn"
              style={{
                borderColor: '#dc2626',
                color: '#dc2626',
              }}
              onClick={props.onReject}
              disabled={!props.onReject || props.isSubmitting}
            >
              Tolak
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={props.onAccept}
              disabled={!props.onAccept || props.isSubmitting}
            >
              {props.isSubmitting ? 'Mengirim...' : 'Terima'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

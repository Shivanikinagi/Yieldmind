import { AGENT_ADDRESS, TREASURY_ADDRESS } from '../utils/contracts';
import { getAddressUrl, getCidUrl, getTxUrl, shortHash } from '../utils/proof';

function SponsorProof({ stats, integrations, latestHistory, currentExecution, updatedAt }) {
  const latestRecord = latestHistory || currentExecution || null;
  const filecoinUrl = latestRecord?.cid ? getCidUrl(latestRecord.cid) : null;
  const cards = [
    {
      name: 'Base',
      status: parseFloat(stats.principalLocked || '0') > 0 ? 'live' : 'awaiting',
      meta: 'Infra',
      value: `${stats.principalLocked} ETH locked`,
      links: [
        { label: `Treasury ${shortHash(TREASURY_ADDRESS)}`, href: getAddressUrl(TREASURY_ADDRESS) },
        { label: `Agent ${shortHash(AGENT_ADDRESS)}`, href: getAddressUrl(AGENT_ADDRESS) },
        latestRecord?.requestTxHash ? { label: 'Request tx', href: getTxUrl(latestRecord.requestTxHash) } : null,
        latestRecord?.completionTxHash ? { label: 'Completion tx', href: getTxUrl(latestRecord.completionTxHash) } : null,
      ].filter(Boolean),
    },
    {
      name: 'Lido',
      status: integrations?.lido?.status === 'simulated-testnet' ? 'simulated' : 'awaiting',
      meta: 'Track',
      value: integrations?.lido?.status === 'simulated-testnet' ? 'Yield model live' : 'Awaiting proof',
      links: [{ label: 'Treasury code', href: `${getAddressUrl(TREASURY_ADDRESS)}#code` }],
    },
    {
      name: 'Venice',
      status: latestRecord?.responsePreview ? 'live' : currentExecution ? 'running' : 'awaiting',
      meta: 'AI',
      value: latestRecord?.responsePreview ? 'Inference captured' : 'No finished run',
      links: [],
    },
    {
      name: 'Filecoin',
      status: latestRecord?.cid ? 'live' : currentExecution ? 'running' : 'awaiting',
      meta: 'Storage',
      value: latestRecord?.cid ? shortHash(latestRecord.cid, 12, 8) : 'No CID yet',
      links: filecoinUrl ? [{ label: 'Open CID', href: filecoinUrl }] : [],
    },
    {
      name: 'Zyfai',
      status: integrations?.zyfai?.status === 'connected' ? 'partial' : 'standby',
      meta: 'Track',
      value: integrations?.zyfai?.status === 'connected' ? 'Yield account linked' : 'Standby route',
      links: [],
    },
    {
      name: 'Status',
      status: integrations?.status?.status === 'targeted' ? 'targeted' : 'awaiting',
      meta: 'Track',
      value: 'Gasless execution target',
      links: [],
    },
  ];

  return (
    <div
      style={{
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)' }}>Sponsor Proof</h2>
        {updatedAt && (
          <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
            {new Date(updatedAt).toLocaleTimeString()}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
        }}
      >
        {cards.map((card) => (
          <div
            key={card.name}
            style={{
              background: 'var(--bg3)',
              border: '1px solid var(--border2)',
              borderRadius: '14px',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text)', fontWeight: '600' }}>{card.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '4px' }}>{card.meta}</div>
              </div>
              <ProofBadge status={card.status} />
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.75', marginBottom: card.links.length ? '10px' : '0' }}>
              {card.value}
            </div>

            {!!card.links.length && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {card.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--blue)', textDecoration: 'none', fontSize: '12px', lineHeight: '1.5' }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProofBadge({ status }) {
  const palette =
    status === 'live'
      ? { bg: 'var(--green-bg)', border: 'var(--green-border)', color: 'var(--green)', label: 'Live' }
      : status === 'running'
      ? { bg: 'var(--blue-bg)', border: 'var(--blue-border)', color: 'var(--blue)', label: 'Run' }
      : status === 'simulated'
      ? { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', label: 'Sim' }
      : status === 'partial'
      ? { bg: 'var(--blue-bg)', border: 'var(--blue-border)', color: 'var(--blue)', label: 'Part' }
      : status === 'targeted'
      ? { bg: 'var(--amber-bg)', border: 'var(--amber-border)', color: 'var(--amber)', label: 'Target' }
      : status === 'standby'
      ? { bg: 'var(--blue-bg)', border: 'var(--blue-border)', color: 'var(--blue)', label: 'Standby' }
      : { bg: 'var(--bg)', border: 'var(--border)', color: 'var(--text2)', label: 'Wait' };

  return (
    <div
      style={{
        padding: '3px 8px',
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: '999px',
        fontSize: '10px',
        color: palette.color,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {palette.label}
    </div>
  );
}

export default SponsorProof;

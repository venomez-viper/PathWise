import Skeleton from '../../components/Skeleton';

export default function DashboardSkeleton() {
  return (
    <div className="page">
      {/* Hero card skeleton */}
      <Skeleton
        height={120}
        borderRadius="2.5rem"
        style={{ marginBottom: '1.5rem' }}
      />

      {/* Stat tiles row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
          <Skeleton width="40%" height={10} borderRadius="var(--radius-sm)" style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Skeleton width={90} height={90} borderRadius="50%" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton width="80%" height={12} borderRadius="var(--radius-sm)" />
              <Skeleton width="60%" height={10} borderRadius="var(--radius-sm)" />
              <Skeleton width="40%" height={10} borderRadius="var(--radius-sm)" />
            </div>
          </div>
        </div>

        <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
          <Skeleton width="50%" height={10} borderRadius="var(--radius-sm)" style={{ marginBottom: 16 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)',
                padding: '1.25rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}>
                <Skeleton width={44} height={44} borderRadius="var(--radius-md)" />
                <Skeleton width="70%" height={12} borderRadius="var(--radius-sm)" />
                <Skeleton width="50%" height={10} borderRadius="var(--radius-sm)" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Active milestone + Recent tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1rem' }}>
        <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
          <Skeleton width="45%" height={12} borderRadius="var(--radius-sm)" style={{ marginBottom: 16 }} />
          <Skeleton width="75%" height={14} borderRadius="var(--radius-sm)" style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={10} borderRadius="var(--radius-sm)" style={{ marginBottom: 12 }} />
          <Skeleton height={5} borderRadius={999} style={{ marginBottom: 12 }} />
          <Skeleton width={120} height={12} borderRadius="var(--radius-sm)" />
        </div>

        <div className="panel" style={{ borderRadius: '2rem', padding: '1.5rem' }}>
          <Skeleton width="35%" height={10} borderRadius="var(--radius-sm)" style={{ marginBottom: 16 }} />
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Skeleton width={18} height={18} borderRadius="50%" />
              <Skeleton
                width={['90%', '75%', '85%', '60%'][i]}
                height={12}
                borderRadius="var(--radius-sm)"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

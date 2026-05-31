interface Props {
  name: string
  emoji?: string
  color?: string
  size?: 'sm' | 'lg'
}

// Deterministic color derived from the name.
const COLORS = ['#7c6bff', '#2dd4bf', '#38bdf8', '#fb923c', '#f472b6', '#f87171', '#a3e635', '#c084fc']

function colorFor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

export default function Avatar({ name, emoji, color, size = 'sm' }: Props) {
  const cls = size === 'lg' ? 'avatar lg' : 'avatar'
  const content = emoji || name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div className={cls} style={{ background: color ?? colorFor(name) }}>
      {content}
    </div>
  )
}

import { useNavigate } from 'react-router-dom'

interface Props {
  to: string
  label: string
}

export default function Fab({ to, label }: Props) {
  const navigate = useNavigate()
  return (
    <button className="fab" onClick={() => navigate(to)}>
      <span className="plus">＋</span>
      {label}
    </button>
  )
}

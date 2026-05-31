import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  title: string
  /** When set, the chevron navigates to this path ("the level you were at"). */
  backTo?: string
  /** Optional element rendered on the right (e.g. an edit/settings button). */
  right?: ReactNode
}

export default function AppBar({ title, backTo, right }: Props) {
  const navigate = useNavigate()
  return (
    <header className="appbar">
      {backTo && (
        <button className="iconbtn" aria-label="Back" onClick={() => navigate(backTo)}>
          ‹
        </button>
      )}
      <h1>{title}</h1>
      {right}
    </header>
  )
}

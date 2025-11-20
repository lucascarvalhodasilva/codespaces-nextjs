import { useCallback, useState } from 'react'
import Button from '@/shared/ui/Button'

export default function ClickCount() {
  const [count, setCount] = useState(0)
  const increment = useCallback(() => setCount(v => v + 1), [])
  return <Button onClick={increment}>Clicks: {count}</Button>
}
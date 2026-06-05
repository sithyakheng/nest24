import { useEffect, useState } from 'react'

export const useCountUp = (target: number, duration: number = 1500) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    if (target === 0) return
    
    let start = 0
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [target, duration])
  
  return count
}

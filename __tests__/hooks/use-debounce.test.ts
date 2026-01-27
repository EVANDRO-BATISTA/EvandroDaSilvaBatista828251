import { renderHook, act } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Update the value
    rerender({ value: 'updated', delay: 500 })

    // Value should still be initial before timeout
    expect(result.current).toBe('initial')

    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(500)
    })

    // Now it should be updated
    expect(result.current).toBe('updated')
  })

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    )

    // Make multiple rapid changes
    rerender({ value: 'change1', delay: 300 })
    act(() => {
      jest.advanceTimersByTime(100)
    })

    rerender({ value: 'change2', delay: 300 })
    act(() => {
      jest.advanceTimersByTime(100)
    })

    rerender({ value: 'final', delay: 300 })

    // Value should still be initial
    expect(result.current).toBe('initial')

    // Wait for the debounce
    act(() => {
      jest.advanceTimersByTime(300)
    })

    // Should be the final value, not intermediate ones
    expect(result.current).toBe('final')
  })

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 1000 } }
    )

    rerender({ value: 'updated', delay: 1000 })

    // Not enough time passed
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe('test')

    // Now enough time
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(result.current).toBe('updated')
  })

  it('should handle number values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 200 } }
    )

    rerender({ value: 42, delay: 200 })

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(result.current).toBe(42)
  })

  it('should handle object values', () => {
    const initialObj = { name: 'test' }
    const updatedObj = { name: 'updated' }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 200 } }
    )

    rerender({ value: updatedObj, delay: 200 })

    act(() => {
      jest.advanceTimersByTime(200)
    })

    expect(result.current).toEqual(updatedObj)
  })
})

import { useCallback, useState } from 'react'

interface State<D> {
  data: D | undefined
  error: Error | null
  isLoading: boolean
  isIdle: boolean
  isError: boolean
  isSuccess: boolean
}

const defaultInitialState: State<undefined> = {
  data: undefined,
  error: null,
  isLoading: false,
  isIdle: true,
  isError: false,
  isSuccess: false,
}

const defaultConfig = {
  throwOnError: false,
}

type Config = {
  throwOnError?: boolean
}

export const useAsync = <D = undefined>(initialData?: D, initialConfig?: Config) => {
  const config = { ...defaultConfig, ...initialConfig }
  const [state, setState] = useState<State<D>>({
    ...defaultInitialState,
    data: initialData,
  })

  const setData = useCallback((data: D) => {
    setState({
      data,
      error: null,
      isLoading: false,
      isIdle: false,
      isError: false,
      isSuccess: true,
    })
  }, [])

  const setError = useCallback((error: Error) => {
    setState({
      data: undefined,
      error,
      isLoading: false,
      isIdle: false,
      isError: true,
      isSuccess: false,
    })
  }, [])

  const run = useCallback(
    (promise: Promise<D | void>) => {
      if (!promise || !promise.then) {
        throw new Error('请传入 Promise 类型的数据')
      }

      setState((prevState) => ({
        ...prevState,
        isLoading: true,
        isIdle: false,
        isError: false,
        isSuccess: false,
      }))

      return promise
        .then((data) => {
          setData(data as D)
          return data
        })
        .catch((error) => {
          setError(error)
          if (config.throwOnError) {
            return Promise.reject(error)
          }
          return undefined
        })
    },
    [config.throwOnError, setData, setError]
  )

  const reset = useCallback(() => {
    setState({
      ...defaultInitialState,
      data: initialData,
    })
  }, [initialData])

  return {
    ...state,
    run,
    setData,
    setError,
    reset,
  }
}

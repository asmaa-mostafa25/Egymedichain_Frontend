import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for API data fetching
 * @param {Function} apiFunction - The API function to call
 * @param {Object} params - Parameters to pass to the API function
 * @param {Object} options - Options for the hook
 */
export const useApi = (apiFunction, params = {}, options = {}) => {
  const { 
    immediate = true, 
    onSuccess, 
    onError,
    transform,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (executeParams = params) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(executeParams);
      
      if (response.success) {
        const transformedData = transform ? transform(response.data) : response.data;
        setData(transformedData);
        onSuccess?.(transformedData);
        return { success: true, data: transformedData };
      } else {
        throw new Error(response.message || 'Request failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params, transform, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute(params);
    }
  }, []);

  const refetch = useCallback((newParams) => {
    return execute(newParams || params);
  }, [execute, params]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    setData,
  };
};

/**
 * Custom hook for debounced values
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for local storage
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

/**
 * Custom hook for keyboard shortcuts
 */
export const useKeyboardShortcut = (key, callback, options = {}) => {
  const { ctrl = false, shift = false, alt = false, meta = false } = options;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        event.ctrlKey === ctrl &&
        event.shiftKey === shift &&
        event.altKey === alt &&
        event.metaKey === meta
      ) {
        event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrl, shift, alt, meta, callback]);
};

/**
 * Custom hook for click outside detection
 */
export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
};

/**
 * Custom hook for window size
 */
export const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};

/**
 * Custom hook for media queries
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => window.matchMedia(query).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

/**
 * Custom hook for interval
 */
export const useInterval = (callback, delay) => {
  const savedCallback = useState(callback)[0];

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback(), delay);
      return () => clearInterval(id);
    }
  }, [delay, savedCallback]);
};

export default {
  useApi,
  useDebounce,
  useLocalStorage,
  useKeyboardShortcut,
  useClickOutside,
  useWindowSize,
  useMediaQuery,
  useInterval,
};

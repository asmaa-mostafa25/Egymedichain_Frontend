import { useState, useMemo, useCallback } from 'react';

/**
 * useTableFilters
 * ---------------
 * Reusable hook for client-side search + status filtering on any data array.
 *
 * @param {Array}    rows          - Raw data array to filter.
 * @param {Object}   options
 *   searchKeys     {string[]}     - Which row fields to match the search string against.
 *   statusKey      {string}       - Field used for the status filter (default: 'status').
 *   initialSearch  {string}       - Initial search text (default: '').
 *   initialStatus  {string}       - Initial status value (default: 'all').
 *
 * @returns {Object}
 *   filteredRows   {Array}        - The filtered result.
 *   search         {string}       - Current search text.
 *   status         {string}       - Current status filter value.
 *   setSearch      {Function}     - Update search text.
 *   setStatus      {Function}     - Update status filter.
 *   resetFilters   {Function}     - Reset both filters.
 *   activeCount    {number}       - Number of active filters (0, 1 or 2).
 */
const useTableFilters = (
  rows = [],
  {
    searchKeys    = ['id', 'entityName'],
    statusKey     = 'status',
    initialSearch = '',
    initialStatus = 'all',
  } = {}
) => {
  const [search, setSearch]   = useState(initialSearch);
  const [status, setStatus]   = useState(initialStatus);

  const filteredRows = useMemo(() => {
    let result = rows;

    // --- Search filter ---
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((row) =>
        searchKeys.some((key) =>
          String(row[key] ?? '').toLowerCase().includes(q)
        )
      );
    }

    // --- Status filter ---
    if (status !== 'all') {
      result = result.filter(
        (row) => String(row[statusKey] ?? '').toLowerCase() === status.toLowerCase()
      );
    }

    return result;
  }, [rows, search, status, searchKeys, statusKey]);

  const resetFilters = useCallback(() => {
    setSearch(initialSearch);
    setStatus(initialStatus);
  }, [initialSearch, initialStatus]);

  const activeCount = (search.trim() ? 1 : 0) + (status !== 'all' ? 1 : 0);

  return {
    filteredRows,
    search,
    status,
    setSearch,
    setStatus,
    resetFilters,
    activeCount,
  };
};

export default useTableFilters;
import { useState, useCallback, useMemo } from 'react';

/**
 * useTableSelection
 * -----------------
 * Reusable hook for managing row selection in any data table.
 *
 * @param {Array}  rows      - The current visible rows (must have an `id` field).
 * @param {string} idKey     - The key used as unique identifier (default: 'id').
 *
 * @returns {Object}
 *   selectedIds   {string[]}  - Array of selected row IDs
 *   allSelected   {boolean}   - True when every visible row is selected
 *   someSelected  {boolean}   - True when only some rows are selected
 *   noneSelected  {boolean}   - True when no rows are selected
 *   toggleAll     {Function}  - Select all / deselect all
 *   toggleRow     {Function}  - Toggle a single row by ID
 *   isSelected    {Function}  - Check if a specific ID is selected
 *   clearSelection{Function}  - Clear all selections
 *   setSelectedIds{Function}  - Direct setter (for edge-cases)
 */
const useTableSelection = (rows = [], idKey = 'id') => {
  const [selectedIds, setSelectedIds] = useState([]);

  const ids = useMemo(() => rows.map((r) => r[idKey]), [rows, idKey]);

  const allSelected  = ids.length > 0 && selectedIds.length === ids.length;
  const someSelected = selectedIds.length > 0 && !allSelected;
  const noneSelected = selectedIds.length === 0;

  const toggleAll = useCallback(() => {
    if (allSelected || someSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  }, [allSelected, someSelected, ids]);

  const toggleRow = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const isSelected = useCallback(
    (id) => selectedIds.includes(id),
    [selectedIds]
  );

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  // Reset selection when the rows dataset changes (e.g., after tab switch / filter)
  // Uncomment the lines below if you want auto-clear on rows change:
  // useEffect(() => { setSelectedIds([]); }, [rows]);

  return {
    selectedIds,
    allSelected,
    someSelected,
    noneSelected,
    toggleAll,
    toggleRow,
    isSelected,
    clearSelection,
    setSelectedIds,
  };
};

export default useTableSelection;
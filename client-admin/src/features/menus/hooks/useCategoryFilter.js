import { useState } from 'react';

export const useCategoryFilter = (items = [], searchFields = ['name']) => {
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  const filtered = items.filter((item) => {
    const matchesCategory = category === 'ALL' || item.category === category;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q || searchFields.some((field) => item[field]?.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return { category, setCategory, search, setSearch, filtered };
}; //filtrar items por categoría y búsqueda

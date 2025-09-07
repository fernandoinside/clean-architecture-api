'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface FilterState {
  searchTerm: string
  filters: Record<string, any>
  sortBy: string | null
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

interface FilterContextType {
  filterState: FilterState
  setSearchTerm: (term: string) => void
  setFilter: (key: string, value: any) => void
  clearFilter: (key: string) => void
  clearAllFilters: () => void
  setSorting: (sortBy: string | null, sortOrder: 'asc' | 'desc') => void
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  resetPagination: () => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

const initialState: FilterState = {
  searchTerm: '',
  filters: {},
  sortBy: null,
  sortOrder: 'asc',
  page: 1,
  limit: 10
}

interface FilteredDataProviderProps {
  children: ReactNode
}

/**
 * Provider para gerenciar estado de filtros, busca e paginação
 * Usado em páginas de listagem de dados
 */
export function FilteredDataProvider({ children }: FilteredDataProviderProps) {
  const [filterState, setFilterState] = useState<FilterState>(initialState)

  const setSearchTerm = (term: string) => {
    setFilterState(prev => ({
      ...prev,
      searchTerm: term,
      page: 1 // Reset página ao fazer busca
    }))
  }

  const setFilter = (key: string, value: any) => {
    setFilterState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value
      },
      page: 1 // Reset página ao filtrar
    }))
  }

  const clearFilter = (key: string) => {
    setFilterState(prev => {
      const newFilters = { ...prev.filters }
      delete newFilters[key]
      
      return {
        ...prev,
        filters: newFilters,
        page: 1
      }
    })
  }

  const clearAllFilters = () => {
    setFilterState(prev => ({
      ...prev,
      searchTerm: '',
      filters: {},
      page: 1
    }))
  }

  const setSorting = (sortBy: string | null, sortOrder: 'asc' | 'desc') => {
    setFilterState(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1 // Reset página ao ordenar
    }))
  }

  const setPage = (page: number) => {
    setFilterState(prev => ({
      ...prev,
      page
    }))
  }

  const setLimit = (limit: number) => {
    setFilterState(prev => ({
      ...prev,
      limit,
      page: 1 // Reset página ao mudar limite
    }))
  }

  const resetPagination = () => {
    setFilterState(prev => ({
      ...prev,
      page: 1
    }))
  }

  const value: FilterContextType = {
    filterState,
    setSearchTerm,
    setFilter,
    clearFilter,
    clearAllFilters,
    setSorting,
    setPage,
    setLimit,
    resetPagination
  }

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  )
}

/**
 * Hook para usar o contexto de filtros
 */
export function useFilteredData() {
  const context = useContext(FilterContext)
  
  if (context === undefined) {
    throw new Error('useFilteredData deve ser usado dentro de um FilteredDataProvider')
  }
  
  return context
}
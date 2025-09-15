'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, X, Filter } from 'lucide-react'

interface FilterOption {
  value: string
  count: number
}

interface PriceRange {
  min: number
  max: number
}

interface SearchFiltersData {
  categories: FilterOption[]
  attributes: {
    size: FilterOption[]
    color: FilterOption[]
    material: FilterOption[]
    brand: FilterOption[]
  }
  priceRange: PriceRange
}

interface ActiveFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  colors?: string[]
  materials?: string[]
  brands?: string[]
  inStock?: boolean
  sortBy?: string
}

interface SearchFiltersProps {
  filters: SearchFiltersData | null
  activeFilters: ActiveFilters
  onFiltersChange: (filters: ActiveFilters) => void
  isLoading?: boolean
  className?: string
}

export function SearchFilters({
  filters,
  activeFilters,
  onFiltersChange,
  isLoading = false,
  className = ''
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    size: false,
    color: false,
    material: false,
    brand: false
  })

  const [priceRange, setPriceRange] = useState({
    min: activeFilters.minPrice || filters?.priceRange.min || 0,
    max: activeFilters.maxPrice || filters?.priceRange.max || 200
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleFilterChange = (key: keyof ActiveFilters, value: any) => {
    const newFilters = { ...activeFilters, [key]: value }
    onFiltersChange(newFilters)
  }

  const handleArrayFilterToggle = (key: keyof ActiveFilters, value: string) => {
    const currentArray = (activeFilters[key] as string[]) || []
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    
    handleFilterChange(key, newArray.length > 0 ? newArray : undefined)
  }

  const handlePriceRangeChange = (type: 'min' | 'max', value: number) => {
    const newRange = { ...priceRange, [type]: value }
    setPriceRange(newRange)
    
    // Debounce price updates
    setTimeout(() => {
      handleFilterChange('minPrice', newRange.min > (filters?.priceRange.min || 0) ? newRange.min : undefined)
      handleFilterChange('maxPrice', newRange.max < (filters?.priceRange.max || 200) ? newRange.max : undefined)
    }, 300)
  }

  const clearAllFilters = () => {
    setPriceRange({
      min: filters?.priceRange.min || 0,
      max: filters?.priceRange.max || 200
    })
    onFiltersChange({})
  }

  const clearFilter = (key: keyof ActiveFilters) => {
    if (key === 'minPrice' || key === 'maxPrice') {
      setPriceRange({
        min: filters?.priceRange.min || 0,
        max: filters?.priceRange.max || 200
      })
      handleFilterChange('minPrice', undefined)
      handleFilterChange('maxPrice', undefined)
    } else {
      handleFilterChange(key, undefined)
    }
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (activeFilters.category) count++
    if (activeFilters.minPrice || activeFilters.maxPrice) count++
    if (activeFilters.sizes?.length) count++
    if (activeFilters.colors?.length) count++
    if (activeFilters.materials?.length) count++
    if (activeFilters.brands?.length) count++
    if (activeFilters.inStock) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!filters) return null

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden p-4 border-b">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-sm text-gray-900">Active Filters</h3>
              <button
                onClick={clearAllFilters}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.category && (
                <FilterTag
                  label={`Category: ${activeFilters.category}`}
                  onRemove={() => clearFilter('category')}
                />
              )}
              {(activeFilters.minPrice || activeFilters.maxPrice) && (
                <FilterTag
                  label={`Price: $${priceRange.min} - $${priceRange.max}`}
                  onRemove={() => clearFilter('minPrice')}
                />
              )}
              {activeFilters.sizes?.map(size => (
                <FilterTag
                  key={size}
                  label={`Size: ${size}`}
                  onRemove={() => handleArrayFilterToggle('sizes', size)}
                />
              ))}
              {activeFilters.colors?.map(color => (
                <FilterTag
                  key={color}
                  label={`Color: ${color}`}
                  onRemove={() => handleArrayFilterToggle('colors', color)}
                />
              ))}
              {activeFilters.materials?.map(material => (
                <FilterTag
                  key={material}
                  label={`Material: ${material}`}
                  onRemove={() => handleArrayFilterToggle('materials', material)}
                />
              ))}
              {activeFilters.brands?.map(brand => (
                <FilterTag
                  key={brand}
                  label={`Brand: ${brand}`}
                  onRemove={() => handleArrayFilterToggle('brands', brand)}
                />
              ))}
              {activeFilters.inStock && (
                <FilterTag
                  label="In Stock"
                  onRemove={() => clearFilter('inStock')}
                />
              )}
            </div>
          </div>
        )}

        <div className="p-4 space-y-6">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Sort By
            </label>
            <select
              value={activeFilters.sortBy || 'relevance'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="name_desc">Name: Z to A</option>
            </select>
          </div>

          {/* Categories */}
          <FilterSection
            title="Categories"
            isExpanded={expandedSections.category}
            onToggle={() => toggleSection('category')}
          >
            <div className="space-y-2">
              {filters.categories.map(category => (
                <FilterCheckbox
                  key={category.value}
                  label={category.value}
                  count={category.count}
                  checked={activeFilters.category === category.value}
                  onChange={() => handleFilterChange('category', 
                    activeFilters.category === category.value ? undefined : category.value
                  )}
                />
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection
            title="Price Range"
            isExpanded={expandedSections.price}
            onToggle={() => toggleSection('price')}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Min</label>
                  <input
                    type="number"
                    min={filters.priceRange.min}
                    max={filters.priceRange.max}
                    value={priceRange.min}
                    onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Max</label>
                  <input
                    type="number"
                    min={filters.priceRange.min}
                    max={filters.priceRange.max}
                    value={priceRange.max}
                    onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min={filters.priceRange.min}
                  max={filters.priceRange.max}
                  value={priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', parseInt(e.target.value))}
                  className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
                <input
                  type="range"
                  min={filters.priceRange.min}
                  max={filters.priceRange.max}
                  value={priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', parseInt(e.target.value))}
                  className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
            </div>
          </FilterSection>

          {/* Sizes */}
          {filters.attributes.size?.length > 0 && (
            <FilterSection
              title="Sizes"
              isExpanded={expandedSections.size}
              onToggle={() => toggleSection('size')}
            >
              <div className="grid grid-cols-3 gap-2">
                {filters.attributes.size.map(size => (
                  <FilterCheckbox
                    key={size.value}
                    label={size.value}
                    count={size.count}
                    checked={activeFilters.sizes?.includes(size.value) || false}
                    onChange={() => handleArrayFilterToggle('sizes', size.value)}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Colors */}
          {filters.attributes.color?.length > 0 && (
            <FilterSection
              title="Colors"
              isExpanded={expandedSections.color}
              onToggle={() => toggleSection('color')}
            >
              <div className="space-y-2">
                {filters.attributes.color.map(color => (
                  <FilterCheckbox
                    key={color.value}
                    label={color.value}
                    count={color.count}
                    checked={activeFilters.colors?.includes(color.value) || false}
                    onChange={() => handleArrayFilterToggle('colors', color.value)}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Materials */}
          {filters.attributes.material?.length > 0 && (
            <FilterSection
              title="Materials"
              isExpanded={expandedSections.material}
              onToggle={() => toggleSection('material')}
            >
              <div className="space-y-2">
                {filters.attributes.material.map(material => (
                  <FilterCheckbox
                    key={material.value}
                    label={material.value}
                    count={material.count}
                    checked={activeFilters.materials?.includes(material.value) || false}
                    onChange={() => handleArrayFilterToggle('materials', material.value)}
                  />
                ))}
              </div>
            </FilterSection>
          )}

          {/* Stock Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inStock"
              checked={activeFilters.inStock || false}
              onChange={(e) => handleFilterChange('inStock', e.target.checked ? true : undefined)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="inStock" className="text-sm text-gray-700">
              In Stock Only
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FilterSectionProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

function FilterSection({ title, isExpanded, onToggle, children }: FilterSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-2"
      >
        <h3 className="font-medium text-gray-900">{title}</h3>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {isExpanded && <div className="pt-2">{children}</div>}
    </div>
  )
}

interface FilterCheckboxProps {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
}

function FilterCheckbox({ label, count, checked, onChange }: FilterCheckboxProps) {
  return (
    <label className="flex items-center space-x-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
      />
      <span className="text-sm text-gray-700 group-hover:text-gray-900">
        {label}
        {count !== undefined && (
          <span className="text-gray-500 ml-1">({count})</span>
        )}
      </span>
    </label>
  )
}

interface FilterTagProps {
  label: string
  onRemove: () => void
}

function FilterTag({ label, onRemove }: FilterTagProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
      {label}
      <button
        onClick={onRemove}
        className="ml-2 hover:text-green-600"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

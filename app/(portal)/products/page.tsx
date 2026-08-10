'use client';

import { PageBody, PageToolbar, ToolbarRow } from '@/components/shared/page-layout';
import { PageHeader, ActionButton, StandardActions } from '@/components/shared/page-header';
import { SearchBar } from '@/components/shared/search-bar';
import { FilterChip, ToggleChip } from '@/components/shared/filter-chip';
import { SummaryCard } from '@/components/shared/summary-card';
import { DataTable, type Column, type RowAction } from '@/components/shared/data-table';
import { MetaPill, StatusPill } from '@/components/shared/status-pill';
import { EmptyState } from '@/components/shared/section-header';
import { ProductDrawer, PRODUCT_TONE } from '@/components/products/product-drawer';
import { useDemoLoading } from '@/hooks/use-demo-loading';
import {
  BRANDS,
  PRODUCT_STATUSES,
  categories,
  categoryName,
  categoryPath,
  leafCategories,
  products,
  totalAvailable,
  type Product,
} from '@/lib/data/catalog';
import { formatCurrency, formatDate } from '@/lib/data/seed';
import { motion } from 'framer-motion';
import {
  Boxes,
  CircleSlash,
  Eye,
  FileText,
  LayoutGrid,
  Layers,
  Package,
  PackageX,
  Pencil,
  RotateCcw,
  ShoppingCart,
  Table2,
  Tag,
  TrendingDown,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

const PRICE_BANDS = [
  { value: '0-10', label: 'Under $10' },
  { value: '10-100', label: '$10 – $100' },
  { value: '100-500', label: '$100 – $500' },
  { value: '500+', label: 'Over $500' },
];

const opts = (v: readonly string[]) => v.map((x) => ({ value: x, label: x }));

export default function ProductCatalogPage() {
  const loading = useDemoLoading();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [brand, setBrand] = useState('All');
  const [status, setStatus] = useState('All');
  const [price, setPrice] = useState('All');
  const [detail, setDetail] = useState<Product | null>(null);

  const categoryOptions = useMemo(
    () => leafCategories.map((c) => ({ value: c.id, label: c.name, hint: categoryPath(c.id) })),
    []
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== 'All' && p.categoryId !== category) return false;
      if (brand !== 'All' && p.brand !== brand) return false;
      if (status !== 'All' && p.status !== status) return false;
      if (price !== 'All') {
        if (price === '0-10' && p.price >= 10) return false;
        if (price === '10-100' && (p.price < 10 || p.price >= 100)) return false;
        if (price === '100-500' && (p.price < 100 || p.price >= 500)) return false;
        if (price === '500+' && p.price < 500) return false;
      }
      if (q && !`${p.name} ${p.code} ${p.brand} ${categoryName(p.categoryId)}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [search, category, brand, status, price]);

  const metrics = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.status === 'Active').length,
      low: products.filter((p) => p.status === 'Low Stock').length,
      out: products.filter((p) => p.status === 'Out of Stock').length,
      categories: leafCategories.length,
    }),
    []
  );

  const activeFilters =
    [category, brand, status, price].filter((v) => v !== 'All').length + (search.trim() ? 1 : 0);

  const clearFilters = () => {
    setSearch('');
    setCategory('All');
    setBrand('All');
    setStatus('All');
    setPrice('All');
  };

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Product',
      width: 'w-[260px]',
      sortValue: (p) => p.name,
      cell: (p) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `hsl(${p.hue}, 55%, 92%)` }}
          >
            <Package size={14} className="text-slate-600" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold text-main truncate">{p.name}</span>
            <span className="block text-[10.5px] text-muted-foreground">{p.code}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      secondary: true,
      sortValue: (p) => categoryName(p.categoryId),
      cell: (p) => <span className="truncate block">{categoryName(p.categoryId)}</span>,
    },
    { key: 'brand', header: 'Brand', secondary: true, sortValue: (p) => p.brand, cell: (p) => p.brand },
    { key: 'unit', header: 'Unit', secondary: true, cell: (p) => <span className="text-muted-foreground">{p.unit}</span> },
    {
      key: 'price',
      header: 'Selling price',
      align: 'right',
      sortValue: (p) => p.price,
      cell: (p) => <span className="font-semibold">{formatCurrency(p.price)}</span>,
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      sortValue: (p) => totalAvailable(p.id),
      cell: (p) => totalAvailable(p.id).toLocaleString(),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (p) => p.status,
      cell: (p) => <StatusPill label={p.status} tone={PRODUCT_TONE[p.status]} />,
    },
    {
      key: 'updated',
      header: 'Last updated',
      secondary: true,
      sortValue: (p) => p.updatedAt,
      cell: (p) => <span className="text-muted-foreground">{formatDate(p.updatedAt)}</span>,
    },
  ];

  const actions: RowAction<Product>[] = [
    { label: 'View product', icon: Eye, onSelect: setDetail },
    { label: 'Edit product', icon: Pencil, onSelect: (p) => toast.success('Edit form opened', { description: p.name }) },
    { label: 'Add to quotation', icon: FileText, divider: true, onSelect: (p) => toast.success('Added to quotation', { description: p.name }) },
    { label: 'Add to order', icon: ShoppingCart, onSelect: (p) => toast.success('Added to order', { description: p.name }) },
  ];

  return (
    <PageBody>
      <PageHeader
        title="Product Catalog"
        subtitle="Search the sellable range, check availability and build quotations."
        actions={
          <StandardActions
            addLabel="Add Product"
            onAdd={() => toast.info('New product', { description: 'Opens the product creation form.' })}
            onImport={() => toast.info('Import products', { description: 'Upload a price list to update the catalog.' })}
            onExport={() => toast.success('Export queued', { description: `${filtered.length} products will be written to CSV.` })}
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard index={0} label="Total products" value={metrics.total} icon={Package} color="#2563EB" />
        <SummaryCard index={1} label="Active" value={metrics.active} icon={Boxes} color="#059669" progress={(metrics.active / metrics.total) * 100} />
        <SummaryCard index={2} label="Low stock" value={metrics.low} icon={TrendingDown} color="#D97706" hint="At or below reorder level" />
        <SummaryCard index={3} label="Out of stock" value={metrics.out} icon={PackageX} color="#E11D48" />
        <SummaryCard index={4} label="Categories" value={metrics.categories} icon={Layers} color="#7C3AED" />
      </div>

      <PageToolbar>
        <ToolbarRow>
          <SearchBar value={search} onChange={setSearch} placeholder="Search product, code or brand…" className="w-full sm:w-[280px]" />
          <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50">
            <ToggleChip label="Grid" icon={LayoutGrid} active={view === 'grid'} onClick={() => setView('grid')} />
            <ToggleChip label="List" icon={Table2} active={view === 'list'} onClick={() => setView('list')} />
          </div>
          <FilterChip label="Category" icon={Layers} value={category} options={categoryOptions} onChange={setCategory} allLabel="All categories" searchable />
          <FilterChip label="Brand" icon={Tag} value={brand} options={opts(BRANDS)} onChange={setBrand} allLabel="All brands" />
          <FilterChip label="Availability" icon={CircleSlash} value={status} options={opts(PRODUCT_STATUSES)} onChange={setStatus} allLabel="Any status" />
          <FilterChip label="Price" value={price} options={PRICE_BANDS} onChange={setPrice} allLabel="Any price" />
          {activeFilters > 0 && (
            <ActionButton icon={RotateCcw} onClick={clearFilters}>
              Clear ({activeFilters})
            </ActionButton>
          )}
        </ToolbarRow>
      </PageToolbar>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-muted-foreground">
          <span className="font-semibold text-main tabular-nums">{filtered.length}</span> of{' '}
          {products.length} products
        </p>
        <MetaPill label="Prices exclude VAT" />
      </div>

      {view === 'list' ? (
        <DataTable
          rows={filtered}
          columns={columns}
          actions={actions}
          loading={loading}
          onRowClick={setDetail}
          pageSize={12}
          caption="Product catalog"
          emptyTitle="No products found"
          emptyHint="Try a different search term or clear the filters."
          emptyAction={<ActionButton icon={RotateCcw} onClick={clearFilters}>Clear filters</ActionButton>}
        />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="rounded-card border border-surface bg-card p-4 space-y-3">
              <div className="skeleton h-24 rounded-card" />
              <div className="skeleton h-3 w-2/3 rounded-md" />
              <div className="skeleton h-3 w-1/3 rounded-md" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-card border border-surface bg-card">
          <EmptyState icon={Package} title="No products found" hint="Try a different search term or clear the filters." />
          <div className="flex justify-center pb-6">
            <ActionButton icon={RotateCcw} onClick={clearFilters}>Clear filters</ActionButton>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {filtered.slice(0, 24).map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 12) * 0.03, duration: 0.3 }}
              onClick={() => setDetail(p)}
              className="rounded-card border border-surface bg-card overflow-hidden text-left hover:border-primary/30 card-shadow hover:card-shadow-hover transition-all"
            >
              <div
                className="h-24 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${p.hue}, 55%, 92%) 0%, hsl(${(p.hue + 30) % 360}, 55%, 84%) 100%)`,
                }}
              >
                <Package size={26} className="text-white/85" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12.5px] font-semibold text-main leading-snug">{p.name}</p>
                  <StatusPill size="sm" label={p.status} tone={PRODUCT_TONE[p.status]} />
                </div>
                <p className="text-[10.5px] text-muted-foreground mt-0.5">
                  {p.code} · {p.brand}
                </p>
                <div className="flex items-end justify-between gap-2 mt-3">
                  <span>
                    <span className="block text-[15px] font-bold text-main tabular-nums">
                      {formatCurrency(p.price)}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">per {p.unit}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-[11.5px] font-semibold text-main tabular-nums">
                      {totalAvailable(p.id).toLocaleString()}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">in stock</span>
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {view === 'grid' && filtered.length > 24 && (
        <p className="text-center text-[11.5px] text-muted-foreground">
          Showing the first 24 of {filtered.length}. Switch to list view to page through everything.
        </p>
      )}

      <ProductDrawer
        product={detail}
        onClose={() => setDetail(null)}
        onAction={(action, product) =>
          toast.success(action === 'quote' ? 'Added to quotation' : 'Added to order', {
            description: product.name,
          })
        }
      />
    </PageBody>
  );
}

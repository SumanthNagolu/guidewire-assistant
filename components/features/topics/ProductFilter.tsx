'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Product = {
  id: string;
  code: string;
  name: string;
};

interface ProductFilterProps {
  products: Product[];
  currentProduct?: string;
}

export default function ProductFilter({ products, currentProduct }: ProductFilterProps) {
  const router = useRouter();

  const handleProductChange = (value: string) => {
    if (value === 'all') {
      router.push('/topics');
    } else {
      router.push(`/topics?product=${value}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Filter:</span>
      <Select 
        value={currentProduct || 'all'} 
        onValueChange={handleProductChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Products" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            All Products
          </SelectItem>
          {products?.map((product) => (
            <SelectItem key={product.id} value={product.code}>
              {product.name} ({product.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


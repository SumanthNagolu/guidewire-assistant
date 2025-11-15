import { Metadata } from 'next'
import { TopicList } from '@/components/academy/topic-list/TopicList'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/server'
export const metadata: Metadata = {
  title: 'Topics | InTime Academy',
  description: 'Browse and learn from our comprehensive course topics',
}
export default async function TopicsPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('code')
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Course Topics
        </h1>
        <p className="text-gray-600 mt-2">
          Master each topic sequentially to build comprehensive expertise
        </p>
      </div>
      {products && products.length > 1 ? (
        <Tabs defaultValue={products[0].id} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            {products.map((product) => (
              <TabsTrigger key={product.id} value={product.id}>
                {product.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {products.map((product) => (
            <TabsContent key={product.id} value={product.id}>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>{product.description}</CardDescription>
                </CardHeader>
              </Card>
              <TopicList productId={product.id} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <TopicList />
      )}
    </div>
  )
}

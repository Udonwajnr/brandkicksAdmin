"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Edit, Calendar, Tag, Box, Layers, Info } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/app/context/context"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"

export default function ProductDetail() {
  const { slug } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const { api } = useAuth()

  useEffect(() => {
    if (slug) {
      fetchProduct()
    }
  }, [slug])

  const fetchProduct = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`http://localhost:8000/api/products/${slug}`)
      setProduct(response.data)
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageClick = (index) => {
    setSelectedImage(index)
  }

  const handleEditProduct = () => {
    router.push(`/products/${slug}/edit`)
  }

  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (!product) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(product.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
        <Button variant="outline" onClick={handleEditProduct}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Product
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Images */}
        <Card className="col-span-1 lg:col-span-2 border shadow-sm overflow-hidden">
          <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-muted">
            <Image
              src={product.images[selectedImage] || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              fill
              className="object-contain cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
            />
            {product.newlyAdded && <Badge className="absolute top-4 left-4 bg-green-500 hover:bg-green-600">New</Badge>}
          </div>

          <div className="flex space-x-2 p-4 overflow-x-auto">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`relative min-w-[80px] h-20 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                  selectedImage === index ? "border-primary" : "border-muted hover:border-muted-foreground"
                }`}
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={image || "/placeholder.svg?height=80&width=80"}
                  alt={`${product.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Product Details */}
        <Card className="col-span-1 border shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Product ID: {product._id}</p>
              </div>
              <div className="text-2xl font-bold">${product.price.toFixed(2)}</div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                {product.brand}
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
                {product.gender}
              </Badge>
              {product.newlyAdded && (
                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                  New Product
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                Description
              </h3>
              <p className="text-sm text-muted-foreground">
                {product.description || "No description available for this product."}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Layers className="h-4 w-4 mr-2 text-muted-foreground" />
                  Product Attributes
                </h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Brand:</div>
                  <div className="font-medium">{product.brand || "N/A"}</div>

                  <div className="text-muted-foreground">Gender:</div>
                  <div className="font-medium">{product.gender || "N/A"}</div>

                  <div className="text-muted-foreground">Status:</div>
                  <div className="font-medium">{product.newlyAdded ? "New" : "Regular"}</div>
                </div>
              </div>

              {product.color && product.color.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                    Available Colors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.color.map((color) => (
                      <Badge key={color} variant="outline">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {product.size && product.size.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <Box className="h-4 w-4 mr-2 text-muted-foreground" />
                    Available Sizes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.size.map((size) => (
                      <Badge key={size} variant="outline">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  Product Timeline
                </h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Created:</div>
                  <div className="font-medium">{formattedDate}</div>

                  <div className="text-muted-foreground">Last Updated:</div>
                  <div className="font-medium">
                    {new Date(product.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-white">
          <DialogHeader className="p-4 border-b">
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>
          <div className="relative bg-white rounded-lg overflow-hidden">
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-[16/9] w-full">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg?height=800&width=1200"}
                alt={product.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="bg-white p-4 border-t">
              <div className="flex justify-center space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${
                      selectedImage === index ? "border-primary" : "border-muted hover:border-muted-foreground"
                    }`}
                    onClick={() => handleImageClick(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg?height=64&width=64"}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="w-32">
          <Skeleton className="h-6" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Images Skeleton */}
        <Card className="col-span-1 lg:col-span-2 border shadow-sm overflow-hidden">
          <Skeleton className="aspect-square sm:aspect-[4/3] w-full" />
          <div className="flex space-x-2 p-4">
            {[1, 2, 3, 4].map((_, index) => (
              <Skeleton key={index} className="w-20 h-20 rounded-md" />
            ))}
          </div>
        </Card>

        {/* Product Details Skeleton */}
        <Card className="col-span-1 border shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="w-2/3">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>

              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>

              <div>
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-6 w-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


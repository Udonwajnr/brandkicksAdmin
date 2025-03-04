"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
// import { ToastAction } from "@/components/ui/toast"
import { FileUpload } from "@/app/component/FileUpload"

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    brand: "",
    gender: "",
    newlyAdded: true,
    colors: [""],
    sizes: [""],
    images: [""],
  })

  // For file previews
  const [selectedFiles, setSelectedFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProduct({ ...product, [name]: value })
  }

  const handleSelectChange = (name, value) => {
    setProduct({ ...product, [name]: value })
  }

  const handleCheckboxChange = (checked) => {
    setProduct({ ...product, newlyAdded: checked })
  }

  const handleArrayChange = (field, index, value) => {
    const newArray = [...product[field]]
    newArray[index] = value
    setProduct({ ...product, [field]: newArray })
  }

  const addArrayItem = (field) => {
    setProduct({ ...product, [field]: [...product[field], ""] })
  }

  const removeArrayItem = (field, index) => {
    const newArray = [...product[field]]
    newArray.splice(index, 1)
    setProduct({ ...product, [field]: newArray })
  }

  const handleFileSelect = (files) => {
    setSelectedFiles(files)

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const handleUploadComplete = (urls) => {
    // Update the product images with the uploaded URLs
    setProduct((prev) => ({
      ...prev,
      images: [...prev.images.filter((img) => img.trim()), ...urls],
    }))

    toast({
      title: "Upload Complete",
      description: `Successfully uploaded ${urls.length} ${urls.length === 1 ? "image" : "images"}.`,
    })
  }

  const removeImage = (index) => {
    const newImages = [...product.images]
    newImages.splice(index, 1)
    setProduct({ ...product, images: newImages })
  }

  const validateForm = () => {
    // Basic validation
    if (!product.name.trim()) return "Product name is required"
    if (!product.price || isNaN(Number.parseFloat(product.price))) return "Valid price is required"
    if (!product.description.trim()) return "Product description is required"
    if (!product.brand.trim()) return "Brand is required"
    if (!product.gender) return "Gender selection is required"

    // Validate arrays have at least one non-empty value
    if (!product.colors.some((color) => color.trim())) return "At least one color is required"
    if (!product.sizes.some((size) => size.trim())) return "At least one size is required"

    // Check if we have at least one image (either URL or selected file)
    if (!product.images.some((image) => image.trim()) && selectedFiles.length === 0) {
      return "At least one image is required"
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // First, upload any selected files that haven't been uploaded yet
      const uploadedImageUrls = []

      if (selectedFiles.length > 0) {
        // Upload each file
        for (const file of selectedFiles) {
          const formData = new FormData()
          formData.append("file", file)

          const response = await axios.post("http://localhost:8000/api/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })

          uploadedImageUrls.push(response.data.url)
        }
      }

      // Format the data for API
      const formattedProduct = {
        ...product,
        price: Number.parseFloat(product.price),
        // Filter out empty strings from arrays
        colors: product.colors.filter((color) => color.trim()),
        sizes: product.sizes.filter((size) => size.trim()),
        // Combine existing image URLs with newly uploaded ones
        images: [...product.images.filter((img) => img.trim()), ...uploadedImageUrls],
      }

      // Send the product data to the API
      const response = await axios.post("http://localhost:8000/api/products", formattedProduct)

      toast({
        title: "Success!",
        description: "Product created successfully",
      })

      // Redirect after successful creation
      router.push("/admin/products")
    } catch (error) {
      console.error("Error creating product:", error)

      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create product. Please try again.",
        variant: "destructive",
        action: (
          <Button altText="Try again" onClick={() => handleSubmit(e)}>
            Try again
          </Button>
        ),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        <Button variant="outline" onClick={() => router.push("/products")}>
          Go back
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Basic Information</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={product.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows={5}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={product.price}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={product.brand}
                      onChange={handleChange}
                      placeholder="Enter brand name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select onValueChange={(value) => handleSelectChange("gender", value)} value={product.gender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Unisex">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="newlyAdded" checked={product.newlyAdded} onCheckedChange={handleCheckboxChange} />
                      <Label htmlFor="newlyAdded">Mark as Newly Added</Label>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Product Variants</h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Colors</Label>
                  {product.colors.map((color, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={color}
                        onChange={(e) => handleArrayChange("colors", index, e.target.value)}
                        placeholder="Enter color"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem("colors", index)}
                        disabled={product.colors.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("colors")}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Color
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Sizes</Label>
                  {product.sizes.map((size, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={size}
                        onChange={(e) => handleArrayChange("sizes", index, e.target.value)}
                        placeholder="Enter size"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem("sizes", index)}
                        disabled={product.sizes.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("sizes")}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Product Images</h2>

              {/* Display already added image URLs */}
              {product.images.some((img) => img.trim()) && (
                <div className="mb-4">
                  <Label className="mb-2 block">Added Images</Label>
                  <div className="flex flex-wrap gap-2">
                    {product.images
                      .filter((img) => img.trim())
                      .map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Product ${index + 1}`}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* File upload component */}
              <FileUpload
                onUploadComplete={handleUploadComplete}
                onFileSelect={handleFileSelect}
                multiple={true}
                maxFiles={5}
                type="image"
              />
            </Card>

            <Card className="p-6">
              <Button type="submit" className="w-full bg-black hover:bg-gray-800" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </Button>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}


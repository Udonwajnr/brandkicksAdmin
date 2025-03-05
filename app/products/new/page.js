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
import { useAuth } from "@/app/context/context"
// import { ToastAction } from "@/components/ui/toast"
// import { FileUpload } from "@/app/component/FileUpload"
import FileUpload from "@/app/component/FileUpload"

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const {api} = useAuth()
  const [product, setProduct] = useState({
    name: "",
    price: "",
    description: "",
    brand: "",
    gender: "",
    newlyAdded: true,
    color: [""],
    size: [""],
    images: [],
  })

  // For file previews
  const [selectedFiles, setSelectedFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [imageTypeError, setImageTypeError] = useState('')
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name, value) => {
    setProduct((prev) => ({ ...prev, [name]: value }));
  };
  
  
  const handleCheckboxChange = (checked) => {
    setProduct((prev) => ({ ...prev, newlyAdded: checked }));
  };
  
  const handleArrayChange = (field, index, value) => {
    setProduct((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };
  
  const addArrayItem = (field) => {
    setProduct((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };
  
  const removeArrayItem = (field, index) => {
    setProduct((prev) => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };
  
  const removeImage = (index) => {
    setProduct((prev) => {
      const newImages = [...prev.images];
      newImages.splice(index, 1);
      return { ...prev, images: newImages };
    });
  };
  
  const validateForm = () => {
    if (!product.name.trim()) return "Product name is required";
    if (!product.price || isNaN(Number.parseFloat(product.price))) return "Valid price is required";
    if (!product.description.trim()) return "Product description is required";
    if (!product.brand.trim()) return "Brand is required";
    if (!product.gender) return "Gender selection is required";
  
    if (!product.color.some((color) => color.trim())) return "At least one color is required";
    if (!product.size.some((size) => size.trim())) return "At least one size is required";
  
    return null;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const payload = new FormData();
  
      Object.entries(product).forEach(([key, value]) => {
        if (key === "images" && Array.isArray(value)) {
          value.forEach((file) => payload.append("images", file));
        } else if (key ==="color" && value) {
          value.forEach((item) => payload.append("color", item));
        }else if (key ==="size" && value) {
          value.forEach((item) => payload.append("size", item));
        }
        else {
          payload.append(key, value);
        }
      });
  
      const response = await api.post("http://localhost:8000/api/products", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      toast.success("Product submitted successfully!");
      // router.push("/admin/products");
  
      // Reset form state
      setProduct({
        name: "",
        description: "",
        price: "",
        quantity: "",
        color: [],
        size: [],
        category: "",
        tags: "",
        discountPrice: "",
        images: [],
        returnPolicy: "",
      });
      setImagePreviews([]);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to submit product.");
    } finally {
      setIsLoading(false);
    }
  };

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
                  {product.color.map((color, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={color}
                        onChange={(e) => handleArrayChange("color", index, e.target.value)}
                        placeholder="Enter color"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem("color", index)}
                        disabled={product.color.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("color")}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Color
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Sizes</Label>
                  {product.size.map((size, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={size}
                        onChange={(e) => handleArrayChange("size", index, e.target.value)}
                        placeholder="Enter size"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeArrayItem("size", index)}
                        disabled={product.size.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem("size")}
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
              {/* {product.images.some((img) => typeof img === "string") && (
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
              )} */}

              {/* File upload component */}
              <FileUpload
                // onUploadComplete={handleUploadComplete}
                type="image"
                imagePreviews={imagePreviews}
                setProduct={setProduct}
                product={product}
                imageTypeError={imageTypeError}
                setImageTypeError={setImageTypeError}
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


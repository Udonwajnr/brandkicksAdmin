"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Printer, Mail, Phone, MapPin, Clock, CheckCircle, TruckIcon, Package, AlertCircle, Download, MessageSquare, Loader2, RefreshCw } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/app/context/context"

export default function OrderDetailPage() {
  const router = useRouter()
  const { orderNumber } = useParams()
  const [order, setOrder] = useState(null)
  const [orderStatus, setOrderStatus] = useState("")
  const [newNote, setNewNote] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const { api } = useAuth()

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails()
    }
  }, [orderNumber])

  const fetchOrderDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get(`http://localhost:8000/api/order/${orderNumber}`)

      const orderData = response.data
      console.log(orderData)
      setOrder(orderData)
      setOrderStatus(orderData.status)
    } catch (err) {
      console.error("Error fetching order details:", err)
      setError("Failed to load order details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800"
    
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status) => {
    if (!status) return <Package className="h-5 w-5" />
    
    switch (status.toLowerCase()) {
      case "order placed":
        return <Package className="h-5 w-5" />
      case "payment confirmed":
        return <CheckCircle className="h-5 w-5" />
      case "processing":
        return <Clock className="h-5 w-5" />
      case "shipped":
        return <TruckIcon className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const handleStatusChange = async (newStatus) => {
    setOrderStatus(newStatus)
  }

  const updateOrder = async () => {
    setIsUpdating(true)
    try {
      // In a real app, you would update the order status in the database
      await api.put(`http://localhost:8000/api/order/${orderNumber}`, {
        status: orderStatus
      })
      // Refresh order data after update
      await fetchOrderDetails()
      alert(`Order status updated to: ${orderStatus}`)
    } catch (err) {
      console.error("Error updating order:", err)
      alert("Failed to update order status. Please try again.")
    } finally {
      setIsUpdating(false)
    }
  }

  // const handleAddNote = async () => {
  //   if (newNote.trim()) {
  //     try {
  //       // In a real app, you would add the note to the database
  //       await api.post(`http://localhost:8000/api/order/${orderNumber}/notes`, {
  //         text: newNote,
  //         author: "Admin User" // This would come from auth context in a real app
  //       })
  //       // Refresh order data after adding note
  //       await fetchOrderDetails()
  //       setNewNote("")
  //     } catch (err) {
  //       console.error("Error adding note:", err)
  //       alert("Failed to add note. Please try again.")
  //     }
  //   }
  // }

  if (isLoading) {
    return <OrderDetailSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchOrderDetails} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Order Not Found</AlertTitle>
          <AlertDescription>The order you're looking for doesn't exist or has been removed.</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/orders")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push("/orders")}>
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
            <span className="text-gray-300">|</span>
            <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {new Date(order.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Invoice
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Mail className="h-4 w-4" />
            Email Customer
          </Button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary Card */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-medium">Order Summary</h2>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Customer Information</h3>
                  <p className="font-medium">{order.customer?.name}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{order.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.user?.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
                  <p className="font-medium">{order.customer?.name}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p>{order.shippingAddress?.street}</p>
                        <p>
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
                        </p>
                        <p>{order.shippingAddress?.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Method</h3>
                  <p>{order.paymentMethod}</p>
                  <p className="mt-1 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${order.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                </div> */}

                {/* <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Method</h3>
                  <p>{order.shippingMethod}</p>
                </div> */}
              </div>
            </div>
          </Card>

          {/* Order Items Card */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Order Items</h2>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-muted rounded-md p-1 flex-shrink-0">
                              <Image
                                src={item.product?.images[0] || "/placeholder.svg?height=80&width=80"}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                {item.color && (
                                  <>
                                    <span>Color: {item.color}</span>
                                    <span className="mx-1">•</span>
                                  </>
                                )}
                                {item.size && <span>Size: {item.size}</span>}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.sku}</TableCell>
                        <TableCell>${parseFloat(item.price).toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>

          {/* Order Timeline and Notes */}
         
        </div>

        <div className="space-y-6">
          {/* Order Actions Card */}
          {/* <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Order Actions</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Update Order Status</label>
                  <Select value={orderStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Processing">Processing</SelectItem>
                      <SelectItem value="Shipped">Shipped</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full bg-black hover:bg-gray-800" 
                  onClick={updateOrder}
                  disabled={isUpdating || orderStatus === order.status}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Order"
                  )}
                </Button>

                <div className="border-t pt-4 mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                        handleStatusChange("Cancelled");
                        updateOrder();
                      }
                    }}
                    disabled={order.status === "Cancelled" || isUpdating}
                  >
                    Cancel Order
                  </Button>
                </div>
              </div>
            </div>
          </Card> */}

          {/* Order Summary Card */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>

              <div className="space-y-3">
                {/* <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${parseFloat(order.shipping || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${parseFloat(order.tax || 0).toFixed(2)}</span>
                </div> */}
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-red-500">-${parseFloat(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${parseFloat(order.totalPrice || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Card */}
          {/* <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Customer</h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-medium text-muted-foreground">
                    {order.customer?.name ? order.customer.name.charAt(0) : "?"}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{order.customer?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customer?.since ? `Customer since ${new Date(order.customer.since).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'Customer'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-muted-foreground">Total Orders</p>
                  <p className="font-medium">{order.customer?.totalOrders || "N/A"}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded">
                  <p className="text-muted-foreground">Total Spent</p>
                  <p className="font-medium">
                    {order.customer?.totalSpent ? `$${parseFloat(order.customer.totalSpent).toFixed(2)}` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/users/${order.customer?.id || 1}`}>View Customer Profile</Link>
                </Button>
              </div>
            </div>
          </Card> */}
        </div>
      </div>
    </div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <span className="text-gray-300">|</span>
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-5 w-40 mt-1" />
        </div>

        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary Card Skeleton */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-6 w-24" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-6 w-48 mb-2" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Order Items Card Skeleton */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-7 w-36 mb-4" />

              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Tabs Skeleton */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="border-b px-6 pt-6">
              <Skeleton className="h-10 w-full max-w-md" />
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-1" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Order Actions Card Skeleton */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-7 w-36 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <div className="border-t pt-4 mt-4">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </Card>

          {/* Order Summary Card Skeleton */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-7 w-36 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Card Skeleton */}
          <Card className="border shadow-sm overflow-hidden">
            <div className="p-6">
              <Skeleton className="h-7 w-36 mb-4" />
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-20 w-full rounded" />
                <Skeleton className="h-20 w-full rounded" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

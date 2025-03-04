"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Printer,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  TruckIcon,
  Package,
  AlertCircle,
  Download,
  MessageSquare,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// This would normally come from an API or database
const getOrderDetails = (id) => {
  return {
    id: Number.parseInt(id),
    orderNumber: `ORD-${id.padStart(5, "0")}`,
    date: "March 15, 2023 at 10:30 AM",
    status: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Credit Card (Visa **** 4242)",
    shippingMethod: "Express Delivery",
    subtotal: 340.0,
    shipping: 15.0,
    tax: 28.05,
    discount: 0,
    total: 383.05,
    customer: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1 (555) 123-4567",
    },
    shippingAddress: {
      street: "123 Main Street, Apt 4B",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "United States",
    },
    billingAddress: {
      street: "123 Main Street, Apt 4B",
      city: "New York",
      state: "NY",
      zip: "10001",
      country: "United States",
    },
    items: [
      {
        id: 1,
        name: "Nike Air Force Max",
        sku: "NKE-AFM-001",
        color: "Black/Red",
        size: "42",
        price: 120.0,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        id: 2,
        name: "Air Jordan Retro",
        sku: "NKE-AJR-003",
        color: "White/Blue",
        size: "41",
        price: 220.0,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    timeline: [
      {
        status: "Order Placed",
        date: "March 15, 2023 at 10:30 AM",
        description: "Order was placed by customer",
      },
      {
        status: "Payment Confirmed",
        date: "March 15, 2023 at 10:32 AM",
        description: "Payment was successfully processed",
      },
      {
        status: "Processing",
        date: "March 15, 2023 at 11:45 AM",
        description: "Order is being prepared for shipping",
      },
    ],
    notes: [
      {
        author: "System",
        date: "March 15, 2023 at 10:30 AM",
        text: "Order automatically approved by payment system",
      },
      {
        author: "Admin User",
        date: "March 15, 2023 at 11:45 AM",
        text: "Customer requested express shipping via phone call",
      },
    ],
  }
}

export default function OrderDetailPage({ params }) {
  const router = useRouter()
  const order = getOrderDetails(params.id)
  const [orderStatus, setOrderStatus] = useState(order.status)
  const [newNote, setNewNote] = useState("")

  const getStatusColor = (status) => {
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

  const handleStatusChange = (newStatus) => {
    setOrderStatus(newStatus)
    // In a real app, you would update the order status in the database
    alert(`Order status updated to: ${newStatus}`)
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In a real app, you would add the note to the database
      alert(`Note added: ${newNote}`)
      setNewNote("")
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1" onClick={() => router.push("/admin/orders")}>
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
            <span className="text-gray-300">|</span>
            <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Placed on {order.date}</p>
        </div>

        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Summary Card */}
          <Card>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-medium">Order Summary</h2>
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(orderStatus)}`}>{orderStatus}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                  <p className="font-medium">{order.customer.name}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{order.customer.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{order.customer.phone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Address</h3>
                  <p className="font-medium">{order.customer.name}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p>{order.shippingAddress.street}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Method</h3>
                  <p>{order.paymentMethod}</p>
                  <p className="mt-1 text-sm">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${order.paymentStatus === "Paid" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Shipping Method</h3>
                  <p>{order.shippingMethod}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Items Card */}
          <Card>
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
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-50 p-1 flex-shrink-0">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                width={48}
                                height={48}
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                <span>Color: {item.color}</span>
                                <span className="mx-1">•</span>
                                <span>Size: {item.size}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{item.sku}</TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>

          {/* Order Timeline and Notes */}
          <Card>
            <Tabs defaultValue="timeline">
              <div className="border-b px-6 pt-6">
                <TabsList className="w-full max-w-md grid grid-cols-2">
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="timeline" className="p-6">
                <div className="space-y-6">
                  {order.timeline.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getStatusIcon(event.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{event.status}</h3>
                          <span className="text-xs text-gray-500">{event.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="p-6">
                <div className="space-y-6">
                  {order.notes.map((note, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{note.author}</h3>
                          <span className="text-xs text-gray-500">{note.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{note.text}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-2">Add a Note</h3>
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your note here..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Order Actions Card */}
          <Card>
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

                <Button className="w-full bg-black hover:bg-gray-800">Update Order</Button>

                <div className="border-t pt-4 mt-4">
                  <Button variant="outline" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50">
                    Cancel Order
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Summary Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-red-500">-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Customer Card */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium mb-4">Customer</h2>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">{order.customer.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-gray-500">Customer since Jan 2023</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-500">Total Orders</p>
                  <p className="font-medium">5</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-gray-500">Total Spent</p>
                  <p className="font-medium">$1,245.80</p>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/admin/users/1`}>View Customer Profile</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


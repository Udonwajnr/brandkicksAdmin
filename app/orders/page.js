"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, Eye, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Calendar, Package } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/app/context/context"

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { api } = useAuth()

  const itemsPerPage = 10

  // Fetch orders only once on component mount
  useEffect(() => {
    fetchOrders()
  }, [])

  // Handle filtering, sorting, and pagination on the client side
  useEffect(() => {
    if (orders.length > 0) {
      const filtered = filterOrders()
      const sorted = sortOrders(filtered)
      setFilteredOrders(sorted)
    }
  }, [orders]) // Removed unnecessary dependencies

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, dateFilter, sortBy])

  const fetchOrders = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simple GET request without params
      const response = await api.get("http://localhost:8000/api/order")
      
      const allOrders = response.data || []
      setOrders(allOrders)
      setFilteredOrders(allOrders)
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to load orders. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    return orders.filter((order) => {
      // Filter by search term
      const matchesSearch =
        searchTerm === "" ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toString().includes(searchTerm)

      // Filter by status
      const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase()

      // Filter by date
      let matchesDate = true
      if (dateFilter !== "all") {
        const orderDate = new Date(order.date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const thisWeekStart = new Date(today)
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())

        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

        const thisYearStart = new Date(today.getFullYear(), 0, 1)

        switch (dateFilter) {
          case "today":
            matchesDate = orderDate >= today
            break
          case "yesterday":
            matchesDate = orderDate >= yesterday && orderDate < today
            break
          case "week":
            matchesDate = orderDate >= thisWeekStart
            break
          case "month":
            matchesDate = orderDate >= thisMonthStart
            break
          case "year":
            matchesDate = orderDate >= thisYearStart
            break
        }
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }

  const sortOrders = (ordersToSort) => {
    return [...ordersToSort].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date) - new Date(a.date)
        case "oldest":
          return new Date(a.date) - new Date(b.date)
        case "total-high":
          return Number.parseFloat(b.total) - Number.parseFloat(a.total)
        case "total-low":
          return Number.parseFloat(a.total) - Number.parseFloat(b.total)
        default:
          return 0
      }
    })
  }

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800"

    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100"
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100"
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        {/* <Button className="bg-black hover:bg-gray-800 transition-colors">
          <Package className="h-4 w-4 mr-2" />
          Create Order
        </Button> */}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by order ID or customer name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* <div className="flex flex-col sm:flex-row gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Sort By
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort Orders</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={sortBy === "newest" ? "bg-muted" : ""}
                    onClick={() => setSortBy("newest")}
                  >
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={sortBy === "oldest" ? "bg-muted" : ""}
                    onClick={() => setSortBy("oldest")}
                  >
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={sortBy === "total-high" ? "bg-muted" : ""}
                    onClick={() => setSortBy("total-high")}
                  >
                    Total (High to Low)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className={sortBy === "total-low" ? "bg-muted" : ""}
                    onClick={() => setSortBy("total-low")}
                  >
                    Total (Low to High)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={fetchOrders} variant="outline" size="sm" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </Alert>
      ) : (
        <Card className="border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden sm:table-cell">Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-6 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-32" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Skeleton className="h-6 w-10" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-9 w-20 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                ) : paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="group transition-colors hover:bg-muted/30">
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{order.user.name}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{formatDate(order.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          {formatDate(order.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{order.orderItems?.length}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50">
                          ${Number.parseFloat(order.totalPrice).toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link href={`/orders/${order.orderNumber}`}>
                                <Button variant="outline" size="sm" className="transition-all">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View order details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchTerm || statusFilter !== "all" || dateFilter !== "all" ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p>No orders match your filters</p>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchTerm("")
                              setStatusFilter("all")
                              setDateFilter("all")
                              setSortBy("newest")
                            }}
                          >
                            Clear all filters
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p>No orders found</p>
                          <Button variant="link" className="gap-2">
                            <Package className="h-4 w-4" />
                            Create your first order
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <CardFooter className="flex items-center justify-between p-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-5 w-48" />
              ) : (
                <>
                  Showing {paginatedOrders.length} of {filteredOrders.length} orders
                </>
              )}
            </div>
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Show first page, last page, current page, and pages around current
                    let pageToShow
                    if (totalPages <= 5) {
                      pageToShow = i + 1
                    } else if (currentPage <= 3) {
                      pageToShow = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - 4 + i
                    } else {
                      pageToShow = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageToShow}
                        variant={currentPage === pageToShow ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(pageToShow)}
                      >
                        {pageToShow}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  )
}


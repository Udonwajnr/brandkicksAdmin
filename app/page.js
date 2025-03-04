import { Card } from "@/components/ui/card"
import { Package, ShoppingCart, Users, TrendingUp, ArrowUpRight, User } from "lucide-react"

export default function AdminDashboard() {
  // This would normally come from a database or API
  const stats = [
    { name: "Total Products", value: 120, icon: Package, change: "+12%" },
    { name: "Total Orders", value: 450, icon: ShoppingCart, change: "+18%" },
    { name: "Total Users", value: 850, icon: Users, change: "+7%" },
    { name: "Revenue", value: "$24,500", icon: TrendingUp, change: "+24%" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Icon className="h-6 w-6 text-gray-700" />
                </div>
                <span className="text-green-500 flex items-center text-sm font-medium">
                  {stat.change}
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Recent Orders</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((order) => (
              <div key={order} className="flex items-center justify-between border-b pb-3">
                <div>
                  <p className="font-medium">Order #{order + 1000}</p>
                  <p className="text-sm text-gray-500">2 items • $120</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Processing</span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-black font-medium">View all orders →</button>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">New Users</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((user) => (
              <div key={user} className="flex items-center border-b pb-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium">User #{user}</p>
                  <p className="text-sm text-gray-500">Joined today</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-black font-medium">View all users →</button>
        </Card>
      </div>
    </div>
  )
}


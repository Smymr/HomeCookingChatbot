import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowRight, Users, BookOpen, ChefHat } from "lucide-react";

const mockAnalyticsData = [
  { name: 'Jan', users: 40, recipes: 24, blogs: 12 },
  { name: 'Feb', users: 30, recipes: 13, blogs: 22 },
  { name: 'Mar', users: 20, recipes: 98, blogs: 22 },
  { name: 'Apr', users: 27, recipes: 39, blogs: 20 },
  { name: 'May', users: 18, recipes: 48, blogs: 31 },
  { name: 'Jun', users: 23, recipes: 38, blogs: 21 },
];

const StatCard = ({ title, value, icon, className }) => {
  return (
    <Card className={className}>
      <CardContent className="flex flex-row items-center justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-orange-600">{value}</h3>
        </div>
        <div className="text-orange-500">{icon}</div>
      </CardContent>
    </Card>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-orange-600">Ethiopian Nutrition Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage users, recipes, and blogs for Ethiopian cuisine platform
            </p>
          </div>
          <Link to="/admin">
            <Button className="inline-flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white">
              Go to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard 
            title="Total Users" 
            value="2,543" 
            icon={<Users className="h-6 w-6" />}
            className="bg-white border-orange-200"
          />
          <StatCard 
            title="Recipes" 
            value="187" 
            icon={<ChefHat className="h-6 w-6" />}
            className="bg-white border-orange-200" 
          />
          <StatCard 
            title="Blog Posts" 
            value="95" 
            icon={<BookOpen className="h-6 w-6" />}
            className="bg-white border-orange-200" 
          />
        </div>

        <Card className="bg-white border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-600">Platform Overview</CardTitle>
            <CardDescription>Monthly activity across all platform sections</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={mockAnalyticsData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#ea580c" name="Active Users" />
                <Bar dataKey="recipes" fill="#fb923c" name="New Recipes" />
                <Bar dataKey="blogs" fill="#fed7aa" name="Blog Posts" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-600">Featured Recipes</CardTitle>
              <CardDescription>Top-rated Ethiopian cuisine recipes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                <span className="font-medium">Doro Wat</span>
                <span className="text-sm text-orange-600">⭐ 4.9</span>
              </div>
              <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                <span className="font-medium">Injera</span>
                <span className="text-sm text-orange-600">⭐ 4.7</span>
              </div>
              <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                <span className="font-medium">Shiro</span>
                <span className="text-sm text-orange-600">⭐ 4.5</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardHeader>
              <CardTitle className="text-orange-600">Recent Blog Posts</CardTitle>
              <CardDescription>Latest culinary experiences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                <span className="font-medium">My Journey with Ethiopian Spices</span>
                <span className="text-sm text-muted-foreground">2 days ago</span>
              </div>
              <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                <span className="font-medium">Traditional Cooking Methods</span>
                <span className="text-sm text-muted-foreground">1 week ago</span>
              </div>
              <div className="flex justify-between items-center border-b border-orange-100 pb-2">
                <span className="font-medium">Vegan Ethiopian Dishes</span>
                <span className="text-sm text-muted-foreground">2 weeks ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;

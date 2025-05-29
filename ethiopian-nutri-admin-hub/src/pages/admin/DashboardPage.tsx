import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend as RechartsLegend } from "recharts";
import { useState, useEffect }
// Ensure Star is imported if you use it
from "react";
import { ACCESS_TOKEN_KEY, API_BASE_URL } from "@/config";
import { Star as StarIcon, Heart as HeartIcon, MessageSquare as MessageSquareIcon } from 'lucide-react'; // For icons

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

// Interface for Top Rated Recipe
interface TopRecipe {
  id: number;
  name_am: string;
  avg_rating: number;
  image_url?: string;
  // Add other fields if you want to display them
}

// Interface for Popular Blog
interface PopularBlog {
  id: number;
  title: string;
  author: string;
  likes: number;
  comments: unknown[]; // Can be more specific if you use comment details
  image_url?: string;
}

// Mock data for the chart (can be replaced with real data later)
const mockAnalyticsData = [
  { name: "Jan", users: 0, recipes: 0, blogs: 0 },
  { name: "Feb", users: 0, recipes: 0, blogs: 0 },
  { name: "Mar", users: 0, recipes: 0, blogs: 0 },
  { name: "Apr", users: 0, recipes: 0, blogs: 0 },
  { name: "May", users: 0, recipes: 0, blogs: 0 },
  { name: "Jun", users: 0, recipes: 0, blogs: 0 },
];


// In src/pages/admin/DashboardPage.tsx

// ... (imports, interfaces, getAuthToken, mockAnalyticsData remain the same) ...

const DashboardPage = () => {
  const { toast } = useToast();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [topRatedRecipes, setTopRatedRecipes] = useState<TopRecipe[]>([]);
  const [popularBlogs, setPopularBlogs] = useState<PopularBlog[]>([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [chartData, setChartData] = useState(mockAnalyticsData);


  useEffect(() => {
    const fetchDataCounts = async () => {
      // ... (fetchDataCounts implementation remains the same as previous correct version)
      setIsLoadingCounts(true);
      const token = getAuthToken();

      if (!token && (false)) { 
        toast({
          title: "Authentication Error",
          description: "Admin token not found. Please log in.",
          variant: "destructive",
        });
        setIsLoadingCounts(false);
        return;
      }
      try {
        const usersResponse = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }, 
        });
        if (!usersResponse.ok) console.error("Failed to fetch users"); 
        const usersData = await usersResponse.json().catch(() => []);
        setTotalUsers(usersData.length || 0);

        const recipesResponse = await fetch(`${API_BASE_URL}/api/admin/recipes?page=1&per_page=1`, {
          headers: { Authorization: `Bearer ${token}` }, 
        });
        if (!recipesResponse.ok) console.error("Failed to fetch recipes total");
        const recipesData = await recipesResponse.json().catch(() => ({ total: 0 }));
        setTotalRecipes(recipesData.total || 0);

        const blogsAdminResponse = await fetch(`${API_BASE_URL}/api/admin/blogs`, {
          headers: { Authorization: `Bearer ${token}` }, 
        });
        if (!blogsAdminResponse.ok) console.error("Failed to fetch blogs total");
        const blogsAdminData = await blogsAdminResponse.json().catch(() => []);
        setTotalBlogs(blogsAdminData.length || 0);
        
        setChartData(prevData => prevData.map(monthData => ({
            ...monthData,
            users: Math.floor((usersData.length || 0) / prevData.length) + (Math.floor(Math.random() * 20)-10) ,
            recipes: Math.floor((recipesData.total || 0) / prevData.length) + (Math.floor(Math.random() * 10)-5),
            blogs: Math.floor((blogsAdminData.length || 0) / prevData.length) + (Math.floor(Math.random() * 5)-2),
        })));
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    const fetchTrendingData = async () => {
      setIsLoadingTrending(true);
      try {
        const topRecipesApiUrl = `${API_BASE_URL}/api/trending?page=1&per_page=4`; // Using /trending for recipes
        console.log("Fetching top rated recipes from:", topRecipesApiUrl);
        const topRecipesResponse = await fetch(topRecipesApiUrl);
        if (!topRecipesResponse.ok) {
            const errorText = await topRecipesResponse.text();
            console.error("Top recipes response error:", topRecipesResponse.status, errorText);
            throw new Error(`Failed to fetch top rated recipes. Status: ${topRecipesResponse.status}`);
        }
        const topRecipesData = await topRecipesResponse.json();
        
        // Validate and transform avg_rating
        const validatedTopRecipes = (topRecipesData.recipes || []).map((recipe: any) => ({
            ...recipe,
            avg_rating: typeof recipe.avg_rating === 'string' ? parseFloat(recipe.avg_rating) : recipe.avg_rating,
        })).filter(recipe => typeof recipe.avg_rating === 'number' && !isNaN(recipe.avg_rating)); // Ensure it's a valid number after parsing

        setTopRatedRecipes(validatedTopRecipes);


        const popularBlogsApiUrl = `${API_BASE_URL}/api/blogs`; // Public endpoint for blogs
        console.log("Fetching popular blogs from:", popularBlogsApiUrl);
        const popularBlogsResponse = await fetch(popularBlogsApiUrl);
        if (!popularBlogsResponse.ok) {
            const errorText = await popularBlogsResponse.text();
            console.error("Popular blogs response error:", popularBlogsResponse.status, errorText);
            throw new Error(`Failed to fetch popular blogs. Status: ${popularBlogsResponse.status}`);
        }
        const popularBlogsData: PopularBlog[] = await popularBlogsResponse.json();
        
        const sortedBlogs = popularBlogsData.sort((a, b) => {
            if (b.likes === a.likes) {
                return (b.comments?.length || 0) - (a.comments?.length || 0);
            }
            return b.likes - a.likes;
        });
        setPopularBlogs(sortedBlogs.slice(0, 5));

      } catch (error) {
        console.error("Failed to fetch trending data:", error);
        toast({
          title: "Error Loading Trending Data",
          description: (error as Error).message || "Could not load trending recipes/blogs.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTrending(false);
      }
    };
    
    fetchDataCounts();
    fetchTrendingData();
  }, [toast]);

  // JSX Rendering part
  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-orange-50 to-yellow-50 min-h-full">
      {/* ... (Header and Count Cards remain the same) ... */}
       <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-orange-100 mt-2">Welcome to Yegna Taste Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-white border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              {isLoadingCounts ? "..." : totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Recipes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              {isLoadingCounts ? "..." : totalRecipes}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Blog Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              {isLoadingCounts ? "..." : totalBlogs}
            </div>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 bg-white border-orange-200 shadow-lg">
          {/* ... (Chart section remains the same) ... */}
           <CardHeader>
            <CardTitle className="bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">Platform Activity (Monthly)</CardTitle>
          </CardHeader>
          <CardContent>
            <AspectRatio ratio={16 / 8}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip wrapperStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '3px' }} />
                  <RechartsLegend />
                  <Bar dataKey="users" fill="#ea580c" name="Users" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recipes" fill="#fb923c" name="Recipes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="blogs" fill="#fed7aa" name="Blogs" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </AspectRatio>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-white border-orange-200 shadow-lg">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">Top Rated Recipes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTrending ? <p className="text-gray-500">Loading recipes...</p> :
                topRatedRecipes.length === 0 ? <p className="text-gray-500">No top rated recipes found.</p> : (
                  <div className="space-y-4">
                    {topRatedRecipes.map((recipe) => {
                      // More robust handling for avg_rating
                      const ratingDisplay = (typeof recipe.avg_rating === 'number' && !isNaN(recipe.avg_rating))
                        ? recipe.avg_rating.toFixed(1)
                        : 'N/A';

                      return (
                        <div key={recipe.id} className="border-b border-orange-100 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-800 truncate pr-2" title={recipe.name_am}>{recipe.name_am}</span>
                            <span className="bg-gradient-to-r from-orange-500 to-yellow-400 text-white text-sm px-2 py-0.5 rounded-full flex items-center">
                              <StarIcon className="h-3 w-3 mr-1 text-yellow-300 fill-yellow-300" /> {ratingDisplay}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200 shadow-lg">
            {/* ... (Most Popular Blogs section remains the same as previous correct version) ... */}
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">Most Popular Blogs</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTrending ? <p className="text-gray-500">Loading blogs...</p> :
                popularBlogs.length === 0 ? <p className="text-gray-500">No blogs found.</p> : (
                  <div className="space-y-4">
                    {popularBlogs.map((blog) => (
                      <div key={blog.id} className="border-b border-orange-100 pb-3 last:border-0 last:pb-0">
                        <p className="font-medium text-gray-800 truncate" title={blog.title}>{blog.title}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          by {blog.author}
                        </div>
                        <div className="flex items-center text-xs text-gray-600 mt-1.5 space-x-3">
                            <span className="flex items-center">
                                <HeartIcon className="h-3.5 w-3.5 mr-1 text-red-500 fill-red-500" /> {blog.likes}
                            </span>
                            <span className="flex items-center">
                                <MessageSquareIcon className="h-3.5 w-3.5 mr-1 text-blue-500" /> {blog.comments?.length || 0}
                            </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
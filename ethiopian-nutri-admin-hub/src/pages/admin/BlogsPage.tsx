import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, Trash, CheckCircle, XCircle, Eye } from "lucide-react";
import BlogPreview from "@/components/BlogPreview";
import { ACCESS_TOKEN_KEY } from "@/config"; // Assuming API_BASE_URL is also in config

// Interface for Comments based on your backend data
interface Comment {
  content: string;
  created_at: string;
  id: number;
  user_id: number;
}

// Interface for Blog Posts based on your backend data
interface BlogPost {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  author_id: number; // From your admin route for GET /blogs
  author?: string; // Optional: if you plan to fetch author details separately or if GET /api/blogs returns it
  created_at: string;
  likes?: number; // Optional, as it's not in admin GET /blogs
  comments?: Comment[]; // Optional, as it's not in admin GET /blogs
  status?: "Published" | "Pending";
}

const getAuthToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const API_BASE_URL = "https://homecookingchatbot.onrender.com";

const BlogsPage = () => {
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [previewBlog, setPreviewBlog] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        toast({ title: "Authentication Error", description: "No auth token found.", variant: "destructive" });
        setIsLoading(false);
        // Potentially redirect to login
        return;
      }

      try {
        // Using the admin endpoint to fetch blogs
        const response = await fetch(`${API_BASE_URL}/api/admin/blogs`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Omit<BlogPost, 'status' | 'author'>[] = await response.json();
        
        // You might need to fetch author usernames separately if not provided by /api/admin/blogs
        // For now, we'll use author_id or a placeholder
        const formattedData: BlogPost[] = data.map((blog) => ({
          ...blog,
          author: `User ID: ${blog.author_id}`, // Placeholder, ideally fetch username
          status: "Published", // Assuming these are published; adjust if status is available
        }));

        setBlogs(formattedData);
        toast({
          title: "Blogs Loaded",
          description: "Successfully fetched blogs from the server.",
        });
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
        toast({
          title: "Error Loading Blogs",
          description: (error as Error).message || "Could not fetch blogs.",
          variant: "destructive",
        });
        setBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [toast]);

  const handleDeleteBlog = async (blogId: number) => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You are not authorized. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete blog post ID: ${blogId}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true); // Indicate loading state during deletion
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/blogs/${blogId}`, { // Corrected endpoint
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete blog post." }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogId));
      toast({
        title: "Blog Deleted",
        description: `Blog post (ID: ${blogId}) has been successfully deleted.`,
      });

    } catch (error) {
      console.error("Failed to delete blog:", error);
      toast({
        title: "Error Deleting Blog",
        description: (error as Error).message || "Could not delete the blog post.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEditBlog = (blog: BlogPost) => {
    setEditingBlog({ ...blog }); // Create a copy for editing
    setIsDialogOpen(true);
  };

  const handlePreviewBlog = (blog: BlogPost) => {
    setPreviewBlog(blog);
    setIsPreviewOpen(true);
  };

  // const handleDeleteBlog = (blogId: number) => {
  //   // TODO: Implement API call to delete blog: DELETE /api/blogs/{blogId}
  //   // For now, updates UI optimistically
  //   setBlogs(blogs.filter(blog => blog.id !== blogId));
  //   toast({
  //     title: "Blog Deleted (UI)",
  //     description: "The blog post has been removed from the list. Implement backend deletion.",
  //   });
  // };

  const handleApproveBlog = (blogId: number) => {
    // TODO: Implement API call to approve blog (e.g., PUT /api/blogs/{blogId}/approve)
    // This would likely change its status on the backend.
    // For now, updates UI optimistically.
    setBlogs(blogs.map(blog =>
      blog.id === blogId ? { ...blog, status: "Published" } : blog
    ));
    setPreviewBlog(prev => prev && prev.id === blogId ? { ...prev, status: "Published" } : prev);
    setIsPreviewOpen(false);
    const blog = blogs.find(b => b.id === blogId);
    toast({
      title: "Blog Approved (UI)",
      description: `"${blog?.title}" has been marked as published. Implement backend approval.`,
    });
  };

  const handleRejectBlog = (blogId: number) => {
    // TODO: Implement API call to reject blog (e.g., DELETE /api/blogs/{blogId} or PUT /api/blogs/{blogId}/reject)
    // For now, updates UI optimistically by removing it.
    setBlogs(blogs.filter(blog => blog.id !== blogId));
    setIsPreviewOpen(false);
    const blog = blogs.find(b => b.id === blogId);
    toast({
      title: "Blog Rejected (UI)",
      description: `"${blog?.title}" has been removed. Implement backend rejection.`,
    });
  };

  const handleSaveBlog = () => {
    if (editingBlog) {
      // TODO: Implement API call to update blog: PUT /api/blogs/{editingBlog.id}
      // Body would contain { title, content, image_url }
      // For now, updates UI optimistically
      setBlogs(blogs.map(b => b.id === editingBlog.id ? editingBlog : b));
      setIsDialogOpen(false);
      setEditingBlog(null);
      toast({
        title: "Blog Updated (UI)",
        description: "Blog information has been updated locally. Implement backend update.",
      });
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Assuming status is now correctly part of the BlogPost items in the 'blogs' state
  const pendingBlogs = filteredBlogs.filter(blog => blog.status === "Pending");
  const publishedBlogs = filteredBlogs.filter(blog => blog.status === "Published");

  return (
    <div className="space-y-6 bg-gradient-to-br from-orange-50 to-yellow-50 min-h-screen p-6">
      <div className="bg-gradient-to-r from-orange-500 to-yellow-400 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Blog Management</h1>
            <p className="text-orange-100 mt-2">Review and manage blog posts</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search blogs..."
              className="pl-8 w-[250px] bg-white border-orange-200 text-gray-800"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Pending Approval Section */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
            Pending Approval ({pendingBlogs.length})
          </h2>
        </div>
        <div className="rounded-lg border border-orange-200 shadow-sm bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-orange-50 to-yellow-50">
                <TableHead className="font-semibold text-orange-700">Title</TableHead>
                <TableHead className="font-semibold text-orange-700">Author</TableHead>
                <TableHead className="font-semibold text-orange-700">Date</TableHead>
                <TableHead className="text-right font-semibold text-orange-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && pendingBlogs.length === 0 ? ( // Show loading only if pending is also expected from this fetch
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Loading pending blogs...
                  </TableCell>
                </TableRow>
              ) : !isLoading && pendingBlogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No pending blogs
                  </TableCell>
                </TableRow>
              ) : (
                pendingBlogs.map((blog) => (
                  <TableRow key={blog.id} className="hover:bg-orange-25">
                    <TableCell className="font-medium text-gray-800">{blog.title}</TableCell>
                    <TableCell className="text-gray-600">{blog.author}</TableCell>
                    <TableCell className="text-gray-600">{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewBlog(blog)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApproveBlog(blog.id)}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEditBlog(blog)} className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectBlog(blog.id)}
                        className="border-red-300 hover:bg-red-50 text-red-600 hover:border-red-400"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Published Blogs Section */}
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
            Published Blogs ({publishedBlogs.length})
          </h2>
        </div>
        <div className="rounded-lg border border-orange-200 shadow-sm bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-orange-50 to-yellow-50">
                <TableHead className="font-semibold text-orange-700">Title</TableHead>
                <TableHead className="font-semibold text-orange-700">Author</TableHead>
                <TableHead className="font-semibold text-orange-700">Date Published</TableHead>
                <TableHead className="text-right font-semibold text-orange-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    Loading published blogs...
                  </TableCell>
                </TableRow>
              ) : publishedBlogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No published blogs
                  </TableCell>
                </TableRow>
              ) : (
                publishedBlogs.map((blog) => (
                  <TableRow key={blog.id} className="hover:bg-orange-25">
                    <TableCell className="font-medium text-gray-800">{blog.title}</TableCell>
                    <TableCell className="text-gray-600">{blog.author}</TableCell>
                    <TableCell className="text-gray-600">{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePreviewBlog(blog)}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleEditBlog(blog)} className="border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400">
                        <Edit className="h-4 w-4" />
                      </Button>
                     <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Blog Preview Modal */}
      <BlogPreview
        blog={previewBlog}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onApprove={() => previewBlog && handleApproveBlog(previewBlog.id)}
        onReject={() => previewBlog && handleRejectBlog(previewBlog.id)}
      />

      {/* Edit Blog Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-orange-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-orange-600">Edit Blog</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
              <Input
                id="title"
                value={editingBlog?.title || ""}
                onChange={(e) => editingBlog && setEditingBlog({ ...editingBlog, title: e.target.value })}
                className="border-orange-300 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="author" className="text-sm font-medium text-gray-700">Author</label>
              <Input
                id="author"
                value={editingBlog?.author || ""}
                onChange={(e) => editingBlog && setEditingBlog({ ...editingBlog, author: e.target.value })}
                className="border-orange-300 focus:border-orange-500"
                // Admin might not always edit author, could be read-only
                // disabled 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="image_url" className="text-sm font-medium text-gray-700">Image URL</label>
              <Input
                id="image_url"
                value={editingBlog?.image_url || ""}
                onChange={(e) => editingBlog && setEditingBlog({ ...editingBlog, image_url: e.target.value })}
                className="border-orange-300 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium text-gray-700">Content</label>
              <Textarea
                id="content"
                value={editingBlog?.content || ""}
                onChange={(e) => editingBlog && setEditingBlog({ ...editingBlog, content: e.target.value })}
                className="border-orange-300 focus:border-orange-500 min-h-[150px]"
                rows={6}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                value={editingBlog?.status || "Pending"}
                onChange={(e) => editingBlog && setEditingBlog({ ...editingBlog, status: e.target.value as "Published" | "Pending" })}
                className="w-full rounded-md border border-orange-300 bg-background px-3 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="Published">Published</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-orange-300 text-gray-700 hover:bg-orange-50">Cancel</Button>
            <Button onClick={handleSaveBlog} className="bg-orange-600 hover:bg-orange-700 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogsPage;
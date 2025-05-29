import { useState, useEffect, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, Trash, Plus, Star, ChevronLeft, ChevronRight } from "lucide-react"; // Added Star for placeholder
import { ACCESS_TOKEN_KEY, API_BASE_URL } from "@/config";

// Recipe interface (as defined above)
interface Recipe {
  id: number;
  name_am: string;
  description?: string;
  instructions?: string;
  cooking_time_minutes?: number;
  servings?: number;
  image_url?: string;
  category_id?: number;
  // For simplicity, we'll display IDs. In a real app, you'd fetch category names.
  // cooking_range_id?: number;
  // dietary_category_id?: number;
}

interface PaginatedRecipesResponse {
  success: boolean;
  message: string;
  data: Recipe[];
  total: number;
  pages: number;
  current_page: number;
}


// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const RecipesPage = () => {
  const { toast } = useToast();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRecipe, setEditingRecipe] = useState<Partial<Recipe> | null>(null); // Use Partial for new recipes
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingRecipe, setIsAddingRecipe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const ITEMS_PER_PAGE = 10; // Or make this configurable

  const fetchRecipes = useCallback(async (page = 1, search = "") => {
    setIsLoading(true);
    const token = getAuthToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "No admin token found.", variant: "destructive" });
      setIsLoading(false);
      setRecipes([]);
      return;
    }

    let url = `${API_BASE_URL}/api/admin/recipes?page=${page}&per_page=${ITEMS_PER_PAGE}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    try {
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to fetch recipes" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: PaginatedRecipesResponse = await response.json();
      if (result.success) {
        setRecipes(result.data);
        setTotalPages(result.pages);
        setCurrentPage(result.current_page);
        setTotalRecipes(result.total);
      } else {
        throw new Error(result.message || "Failed to fetch recipes");
      }
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      toast({
        title: "Error Loading Recipes",
        description: (error as Error).message || "Could not fetch recipes.",
        variant: "destructive",
      });
      setRecipes([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalRecipes(0);
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // toast dependency for re-render consistency

  useEffect(() => {
    fetchRecipes(currentPage, searchTerm);
  }, [fetchRecipes, currentPage, searchTerm]);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleAddRecipe = () => {
    setEditingRecipe({
      name_am: "",
      description: "",
      instructions: "",
      cooking_time_minutes: 30,
      servings: 4,
      image_url: "",
      category_id: undefined, // Or a default category ID
    });
    setIsAddingRecipe(true);
    setIsDialogOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe({ ...recipe });
    setIsAddingRecipe(false);
    setIsDialogOpen(true);
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    const token = getAuthToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Not authorized.", variant: "destructive" });
      return;
    }
    if (!confirm(`Are you sure you want to delete this recipe (ID: ${recipeId})?`)) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/recipes/${recipeId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete recipe." }));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      toast({ title: "Recipe Deleted", description: "The recipe has been successfully deleted." });
      fetchRecipes(currentPage, searchTerm); // Refresh the list
    } catch (error) {
      toast({ title: "Error Deleting Recipe", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!editingRecipe) return;
    const token = getAuthToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Not authorized.", variant: "destructive" });
      return;
    }

    const method = isAddingRecipe ? "POST" : "PUT";
    const url = isAddingRecipe
      ? `${API_BASE_URL}/api/admin/recipes`
      : `${API_BASE_URL}/api/admin/recipes/${editingRecipe.id}`;

    // Ensure numeric fields are numbers
    const payload = {
        ...editingRecipe,
        cooking_time_minutes: Number(editingRecipe.cooking_time_minutes) || 0,
        servings: Number(editingRecipe.servings) || 1,
        category_id: editingRecipe.category_id ? Number(editingRecipe.category_id) : undefined,
        // Add other ID fields if they are part of your form
    };


    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || responseData.details || `HTTP error! status: ${response.status}`);
      }

      toast({
        title: isAddingRecipe ? "Recipe Added" : "Recipe Updated",
        description: responseData.message || `Recipe ${isAddingRecipe ? 'added' : 'updated'} successfully.`,
      });
      setIsDialogOpen(false);
      setEditingRecipe(null);
      fetchRecipes(isAddingRecipe ? 1 : currentPage, searchTerm); // Refresh list, go to page 1 if adding
    } catch (error) {
      toast({
        title: `Error ${isAddingRecipe ? 'Adding' : 'Updating'} Recipe`,
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };


  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-600">Recipe Management</h1>
        <div className="flex gap-4">
          <Button onClick={handleAddRecipe} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Recipe
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search recipes (name/desc)..."
              className="pl-8 w-[250px] border-orange-200"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-orange-200 shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50">
              <TableHead className="text-orange-700">Name (Amharic)</TableHead>
              <TableHead className="text-orange-700">Category ID</TableHead> {/* Placeholder */}
              <TableHead className="text-orange-700">Cooking Time</TableHead>
              <TableHead className="text-orange-700">Servings</TableHead>
              <TableHead className="text-right text-orange-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Loading recipes...
                </TableCell>
              </TableRow>
            ) : recipes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No recipes found {searchTerm && `for "${searchTerm}"`}.
                </TableCell>
              </TableRow>
            ) : (
              recipes.map((recipe) => (
                <TableRow key={recipe.id} className="hover:bg-orange-50">
                  <TableCell className="font-medium text-gray-800">{recipe.name_am}</TableCell>
                  <TableCell className="text-gray-600">{recipe.category_id || 'N/A'}</TableCell>
                  <TableCell className="text-gray-600">{recipe.cooking_time_minutes ? `${recipe.cooking_time_minutes} min` : 'N/A'}</TableCell>
                  <TableCell className="text-gray-600">{recipe.servings || 'N/A'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditRecipe(recipe)} className="border-orange-200 hover:bg-orange-50 text-orange-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteRecipe(recipe.id)} className="border-red-200 hover:bg-red-50 text-red-600">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination Controls */}
      {!isLoading && totalRecipes > 0 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            Showing page {currentPage} of {totalPages}. Total {totalRecipes} recipes.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-orange-300 hover:bg-orange-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-orange-300 hover:bg-orange-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}


      {/* Edit/Add Recipe Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-orange-200 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-orange-600">
              {isAddingRecipe ? "Add New Recipe" : "Edit Recipe"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Form Fields for Recipe */}
            <div className="space-y-1">
              <label htmlFor="name_am" className="text-sm font-medium text-gray-700">Name (Amharic) <span className="text-red-500">*</span></label>
              <Input
                id="name_am"
                value={editingRecipe?.name_am || ""}
                onChange={(e) => setEditingRecipe(prev => ({ ...prev, name_am: e.target.value }))}
                className="border-orange-300 focus:border-orange-500"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                id="description"
                value={editingRecipe?.description || ""}
                onChange={(e) => setEditingRecipe(prev => ({ ...prev, description: e.target.value }))}
                className="border-orange-300 focus:border-orange-500"
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="instructions" className="text-sm font-medium text-gray-700">Instructions</label>
              <Textarea
                id="instructions"
                value={editingRecipe?.instructions || ""}
                onChange={(e) => setEditingRecipe(prev => ({ ...prev, instructions: e.target.value }))}
                className="border-orange-300 focus:border-orange-500"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                <label htmlFor="cooking_time_minutes" className="text-sm font-medium text-gray-700">Cooking Time (min)</label>
                <Input
                    id="cooking_time_minutes"
                    type="number"
                    min="0"
                    value={editingRecipe?.cooking_time_minutes || ""}
                    onChange={(e) => setEditingRecipe(prev => ({ ...prev, cooking_time_minutes: parseInt(e.target.value) || undefined }))}
                    className="border-orange-300 focus:border-orange-500"
                />
                </div>
                <div className="space-y-1">
                <label htmlFor="servings" className="text-sm font-medium text-gray-700">Servings</label>
                <Input
                    id="servings"
                    type="number"
                    min="1"
                    value={editingRecipe?.servings || ""}
                    onChange={(e) => setEditingRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || undefined }))}
                    className="border-orange-300 focus:border-orange-500"
                />
                </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="image_url" className="text-sm font-medium text-gray-700">Image URL</label>
              <Input
                id="image_url"
                value={editingRecipe?.image_url || ""}
                onChange={(e) => setEditingRecipe(prev => ({ ...prev, image_url: e.target.value }))}
                className="border-orange-300 focus:border-orange-500"
              />
            </div>
             <div className="space-y-1">
                <label htmlFor="category_id" className="text-sm font-medium text-gray-700">Category ID</label>
                <Input /* Replace with Select if you fetch categories */
                    id="category_id"
                    type="number"
                    placeholder="Enter Category ID"
                    value={editingRecipe?.category_id || ""}
                    onChange={(e) => setEditingRecipe(prev => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="border-orange-300 focus:border-orange-500"
                />
            </div>
            {/* TODO: Add fields for cooking_range_id, dietary_category_id if needed, likely as Select components */}

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300 hover:bg-gray-100">Cancel</Button>
            <Button onClick={handleSaveRecipe} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isLoading ? "Saving..." : (isAddingRecipe ? "Add Recipe" : "Save Changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipesPage;
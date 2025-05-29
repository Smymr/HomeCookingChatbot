import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Edit, Trash, Plus } from "lucide-react";
import { ACCESS_TOKEN_KEY, API_BASE_URL } from "@/config"; // Import config

// User interface (as defined above)
interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

// Helper function to get auth token (ensure this is correctly implemented)
const getAuthToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null); // Adjusted type
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        toast({ title: "Authentication Error", description: "No admin token found.", variant: "destructive" });
        setIsLoading(false);
        setUsers([]); // Clear users if not authenticated
        return;
      }

      let url = `${API_BASE_URL}/api/admin/users`;
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }

      try {
        const response = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: "Failed to fetch users" }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: User[] = await response.json();
        setUsers(data);
        // Remove mockUsers related toast if you had one before
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error Loading Users",
          description: (error as Error).message || "Could not fetch users from the server.",
          variant: "destructive",
        });
        setUsers([]); // Clear users on error
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search term or fetch on explicit action if preferred
    const debounceTimeout = setTimeout(() => {
        fetchUsers();
    }, 300); // Fetch users after 300ms of no typing

    return () => clearTimeout(debounceTimeout);

  }, [searchTerm, toast]); // Re-fetch when searchTerm or toast (for re-renders) changes

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleEditUser = (user: User) => {
    // The backend doesn't provide 'joinDate', so if your form needs it, adjust accordingly
    // For now, we'll work with the User interface.
    setEditingUser({ ...user });
    setIsAddingUser(false);
    setIsDialogOpen(true);
  };

  const handleAddUser = () => {
    // For adding a new admin/user. This will require a POST to a backend endpoint.
    // The current backend code only shows GET and DELETE for users under /api/admin.
    // Registration is under /api/auth/register. If admins can create other admins directly,
    // you'd need a new endpoint like POST /api/admin/users.
    // For now, this will open a dialog with empty fields.
    setEditingUser({ id: 0, username: "", email: "", is_admin: true }); // Default to adding an admin
    setIsAddingUser(true);
    setIsDialogOpen(true);
    toast({ title: "Note", description: "Adding admin directly requires a specific backend endpoint."});
  };

  const handleDeleteUser = async (userId: number) => {
    const token = getAuthToken();
    if (!token) {
      toast({ title: "Authentication Error", description: "Not authorized.", variant: "destructive" });
      return;
    }
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete?.is_admin) {
        toast({ title: "Action Denied", description: "Backend prevents deleting other admins via this route.", variant: "destructive"});
        // Your backend logic: `if user.is_admin: return jsonify({"error": "Cannot delete another admin"}), 403`
        // This frontend check is a good UX addition.
        return;
    }

    if (!confirm(`Are you sure you want to delete user ID: ${userId}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete user." }));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }
      setUsers(users.filter(user => user.id !== userId));
      toast({ title: "User Deleted", description: "The user has been successfully deleted." });
    } catch (error) {
      toast({ title: "Error Deleting User", description: (error as Error).message, variant: "destructive" });
    }
  };

  const handleSaveUser = () => {
    // This function would handle saving an edited user or a new admin.
    // It will require a PUT (for edit) or POST (for new admin) to a backend endpoint.
    // Your current admin_bp doesn't have an endpoint for updating user roles or creating admins directly.
    // The /api/auth/register is for general user registration.
    if (editingUser) {
      if (isAddingUser) {
        // const newUser = { ...editingUser, id: Math.max(...users.map(u => u.id), 0) + 1 };
        // setUsers([...users, newUser]);
        toast({ title: "Feature Not Implemented", description: "Backend endpoint for adding admin directly needed." });
      } else {
        // setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
        toast({ title: "Feature Not Implemented", description: "Backend endpoint for updating user details needed." });
      }
      // For now, just closes dialog
      setIsDialogOpen(false);
      setEditingUser(null);
      setIsAddingUser(false);
    }
  };

  // filteredUsers is not strictly needed if backend handles search, but can be used for client-side quick filter
  // const filteredUsers = users; // Backend now handles search

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-orange-600">User Management</h1>
        <div className="flex gap-4">
          <Button onClick={handleAddUser} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Admin
          </Button>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users (name/email)..."
              className="pl-8 w-[250px] border-orange-200"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-orange-200 shadow-sm bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-orange-50">
              <TableHead className="text-orange-700">Username</TableHead>
              <TableHead className="text-orange-700">Email</TableHead>
              <TableHead className="text-orange-700">Role</TableHead>
              {/* <TableHead>Join Date</TableHead> */} {/* Removed as not in backend response */}
              <TableHead className="text-right text-orange-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No users found{searchTerm && ` for "${searchTerm}"`}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="hover:bg-orange-50">
                  <TableCell className="font-medium text-gray-800">{user.username}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      user.is_admin
                        ? "bg-orange-100 text-orange-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {user.is_admin ? "Admin" : "User"}
                    </span>
                  </TableCell>
                  {/* <TableCell>{new Date(user.joinDate).toLocaleDateString()}</TableCell> */}
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEditUser(user)} className="border-orange-200 hover:bg-orange-50 text-orange-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDeleteUser(user.id)} className="border-red-200 hover:bg-red-50 text-red-600">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit/Add User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-orange-200">
          <DialogHeader>
            <DialogTitle className="text-orange-600">
              {isAddingUser ? "Add New Admin" : "Edit User"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700">Username</label>
              <Input
                id="username"
                value={editingUser?.username || ""}
                onChange={(e) => editingUser && setEditingUser({ ...editingUser, username: e.target.value })}
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <Input
                id="email"
                type="email"
                value={editingUser?.email || ""}
                onChange={(e) => editingUser && setEditingUser({ ...editingUser, email: e.target.value })}
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
              <select
                id="role"
                value={editingUser?.is_admin ? "Admin" : "User"}
                onChange={(e) => editingUser && setEditingUser({ ...editingUser, is_admin: e.target.value === "Admin" })}
                className="w-full rounded-md border border-orange-200 bg-background px-3 py-2 text-sm focus:border-orange-500"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-orange-200 hover:bg-gray-100">Cancel</Button>
            <Button onClick={handleSaveUser} className="bg-orange-600 hover:bg-orange-700 text-white">
              {isAddingUser ? "Add Admin" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
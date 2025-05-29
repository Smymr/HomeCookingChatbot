
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Eye } from "lucide-react";

interface BlogPreviewProps {
  blog: {
    id: number;
    title: string;
    author: string;
    status: string;
    date: string;
    content: string;
    image?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const BlogPreview = ({ blog, isOpen, onClose, onApprove, onReject }: BlogPreviewProps) => {
  if (!blog) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-orange-200 max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl bg-gradient-to-r from-orange-600 to-yellow-500 bg-clip-text text-transparent">
              Blog Preview
            </DialogTitle>
            <Badge 
              variant={blog.status === "Published" ? "default" : "secondary"}
              className={blog.status === "Published" 
                ? "bg-green-100 text-green-800" 
                : "bg-yellow-100 text-yellow-800"
              }
            >
              {blog.status}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Blog Header */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">{blog.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(blog.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Blog Image (if exists) */}
          {blog.image && (
            <div className="rounded-lg overflow-hidden">
              <img 
                src={blog.image} 
                alt={blog.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Blog Content */}
          <div className="prose max-w-none">
            <div className="bg-white p-6 rounded-lg border border-orange-100">
              <h3 className="text-lg font-semibold text-orange-600 mb-3">Content</h3>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </div>
            </div>
          </div>

          {/* Engagement Preview */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-600 mb-2">Engagement Metrics</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>Expected high engagement</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={onClose} className="border-orange-200">
            Close
          </Button>
          <div className="flex gap-2">
            {blog.status === "Pending" && (
              <>
                <Button 
                  variant="outline" 
                  onClick={onReject}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Reject
                </Button>
                <Button 
                  onClick={onApprove}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  Approve & Publish
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlogPreview;

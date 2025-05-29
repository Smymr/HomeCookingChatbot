
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Send, Trash } from "lucide-react";

// Mock notification history data
const mockNotifications = [
  { 
    id: 1, 
    title: "New Recipe Collection", 
    message: "Check out our new collection of holiday recipes!",
    sentTo: "All Users",
    sentDate: "2023-12-15 14:30",
    status: "Sent"
  },
  { 
    id: 2, 
    title: "App Update Available", 
    message: "Update your app to access new features and improvements.",
    sentTo: "All Users",
    sentDate: "2023-11-22 09:15",
    status: "Sent"
  },
  { 
    id: 3, 
    title: "Premium User Features", 
    message: "Unlock exclusive recipes and tips by upgrading to premium.",
    sentTo: "Free Users",
    sentDate: "2023-10-30 16:45",
    status: "Sent"
  },
];

const NotificationsPage = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetAudience, setTargetAudience] = useState("all");
  const [isSending, setIsSending] = useState(false);

  const handleSendNotification = () => {
    if (!title || !message) {
      toast({
        title: "Error",
        description: "Please fill in both title and message fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    // Simulate sending notification
    setTimeout(() => {
      const newNotification = {
        id: Date.now(),
        title,
        message,
        sentTo: targetAudience === "all" ? "All Users" : targetAudience === "premium" ? "Premium Users" : "Free Users",
        sentDate: new Date().toLocaleString(),
        status: "Sent"
      };

      setNotifications([newNotification, ...notifications]);
      
      setTitle("");
      setMessage("");
      setTargetAudience("all");
      setIsSending(false);
      
      toast({
        title: "Notification Sent",
        description: "Your notification has been sent successfully.",
      });
    }, 1500);
  };

  const handleDeleteNotification = (notificationId: number) => {
    setNotifications(notifications.filter(notification => notification.id !== notificationId));
    toast({
      title: "Notification Deleted",
      description: "The notification has been removed from history.",
    });
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Push Notifications</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Send New Notification</CardTitle>
          <CardDescription>
            Create and send push notifications to app users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Notification Title</label>
            <Input
              id="title"
              placeholder="Enter notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">Message</label>
            <Textarea
              id="message"
              placeholder="Enter notification message"
              className="min-h-[100px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="audience" className="text-sm font-medium">Target Audience</label>
            <select
              id="audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Users</option>
              <option value="premium">Premium Users Only</option>
              <option value="free">Free Users Only</option>
            </select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="flex items-center gap-2" 
            onClick={handleSendNotification}
            disabled={isSending}
          >
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Notification
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Notification History</h2>
        
        <div className="rounded-lg border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Sent To</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No notifications found
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">{notification.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{notification.message}</TableCell>
                    <TableCell>{notification.sentTo}</TableCell>
                    <TableCell>{notification.sentDate}</TableCell>
                    <TableCell>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {notification.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" onClick={() => handleDeleteNotification(notification.id)}>
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
    </div>
  );
};

export default NotificationsPage;

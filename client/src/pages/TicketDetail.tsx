import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { ticketService, commentService, userService } from "@/lib/services";
import { insertCommentSchema, type Ticket, type Comment, type User, type InsertComment } from "@shared/schema";
import { Navigation } from "@/components/Navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar, 
  User as UserIcon, 
  Send, 
  Loader2,
  MessageSquare,
  Clock
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface CommentItemProps {
  comment: Comment;
  isAgent: boolean;
  currentUserId: string;
}

function CommentItem({ comment, isAgent, currentUserId }: CommentItemProps) {
  const isOwnComment = comment.authorId === currentUserId;
  const authorRole = comment.author?.role;
  
  return (
    <div 
      className={`p-4 rounded-lg ${
        authorRole === "agent" 
          ? "bg-primary/5 border border-primary/10" 
          : "bg-muted"
      }`}
      data-testid={`comment-${comment.id}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className={authorRole === "agent" ? "bg-primary text-primary-foreground" : ""}>
            {comment.author?.name?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {comment.author?.name || "Unknown User"}
            </span>
            {authorRole === "agent" && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Support Agent
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          <p className="mt-2 text-sm whitespace-pre-wrap">{comment.message}</p>
        </div>
      </div>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAgent } = useAuth();
  const { toast } = useToast();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [agents, setAgents] = useState<Omit<User, "password">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm<{ message: string }>({
    defaultValues: { message: "" },
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    
    try {
      const [ticketData, commentsData] = await Promise.all([
        ticketService.getById(id),
        commentService.getByTicketId(id),
      ]);
      
      setTicket(ticketData);
      setComments(commentsData);

      if (isAgent) {
        const agentsData = await userService.getAgents();
        setAgents(agentsData);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not load ticket details",
        variant: "destructive",
      });
      setLocation(isAgent ? "/agent" : "/client");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (data: { message: string }) => {
    if (!id || !data.message.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newComment = await commentService.create({
        ticketId: id,
        message: data.message.trim(),
      });
      setComments(prev => [...prev, newComment]);
      form.reset();
      toast({
        title: "Comment added",
        description: "Your response has been posted.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTicket = async (field: string, value: string | null) => {
    if (!id) return;
    
    setIsUpdating(true);
    try {
      const updated = await ticketService.update(id, { [field]: value });
      setTicket(updated);
      toast({
        title: "Ticket updated",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} has been updated.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Could not update ticket",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <Skeleton className="h-80" />
          </div>
        </main>
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => setLocation(isAgent ? "/agent" : "/client")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground font-mono mb-1">
                      #{ticket.id.slice(0, 8)}
                    </p>
                    <CardTitle className="text-2xl" data-testid="text-ticket-title">
                      {ticket.title}
                    </CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap" data-testid="text-ticket-description">
                    {ticket.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No comments yet. Be the first to respond!</p>
                  </div>
                ) : (
                  comments.map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      isAgent={isAgent}
                      currentUserId={user?.id || ""}
                    />
                  ))
                )}

                <Separator className="my-6" />

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleAddComment)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="message"
                      rules={{ required: "Please enter a message" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder={isAgent 
                                ? "Type your response to the customer..." 
                                : "Add more information or reply to the agent..."
                              }
                              className="min-h-24 resize-none"
                              data-testid="input-comment"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting || ticket.status === "closed"}
                        className="gap-2"
                        data-testid="button-submit-comment"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Response
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>

                {ticket.status === "closed" && (
                  <p className="text-sm text-muted-foreground text-center">
                    This ticket is closed. No more comments can be added.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created by</p>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{ticket.createdBy?.name || "Unknown"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(ticket.updatedAt), "MMM d, yyyy 'at' h:mm a")}</span>
                  </div>
                </div>

                {isAgent && (
                  <>
                    <Separator />

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => handleUpdateTicket("status", value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Priority</p>
                      <Select
                        value={ticket.priority}
                        onValueChange={(value) => handleUpdateTicket("priority", value)}
                        disabled={isUpdating}
                      >
                        <SelectTrigger data-testid="select-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                      <Select
                        value={ticket.assignedToId || "unassigned"}
                        onValueChange={(value) => 
                          handleUpdateTicket("assignedToId", value === "unassigned" ? null : value)
                        }
                        disabled={isUpdating}
                      >
                        <SelectTrigger data-testid="select-assignee">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {agents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>
                              {agent.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleUpdateTicket("status", "closed")}
                      disabled={isUpdating || ticket.status === "closed"}
                      data-testid="button-close-ticket"
                    >
                      Close Ticket
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

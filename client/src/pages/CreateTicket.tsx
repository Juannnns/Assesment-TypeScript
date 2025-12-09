import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTicketSchema, type InsertTicket } from "@shared/schema";
import { ticketService } from "@/lib/services";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

export default function CreateTicket() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<InsertTicket>({
    resolver: zodResolver(insertTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
    },
  });

  const handleSubmit = async (data: InsertTicket) => {
    setIsLoading(true);
    try {
      await ticketService.create(data);
      toast({
        title: "Ticket created!",
        description: "Your support ticket has been submitted successfully.",
      });
      setLocation("/client");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Could not create ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-3xl mx-auto px-4 md:px-6 py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => setLocation("/client")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Ticket</CardTitle>
            <CardDescription>
              Describe your issue in detail so our support team can assist you effectively.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief summary of your issue"
                          data-testid="input-ticket-title"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short, descriptive title for your support request.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your issue in detail. Include any relevant information such as error messages, steps to reproduce, or screenshots."
                          className="min-h-48 resize-none"
                          data-testid="input-ticket-description"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The more details you provide, the faster we can help you.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-ticket-priority">
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low - General questions or minor issues</SelectItem>
                          <SelectItem value="medium">Medium - Affects my work but has workaround</SelectItem>
                          <SelectItem value="high">High - Critical issue blocking my work</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How urgently do you need this issue resolved?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setLocation("/client")}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gap-2"
                    disabled={isLoading}
                    data-testid="button-submit-ticket"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Submit Ticket
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Send, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";

// Initialize EmailJS
emailjs.init("LWPy0M60E6P9nACN0");

const contactFormSchema = z.object({
  user_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  user_email: z.string().email("Please enter a valid email address").max(254),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export function ContactForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      user_name: "",
      user_email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    if (!formRef.current) return;
    
    setIsLoading(true);
    
    try {
      console.log("Sending EmailJS with data:", data);
      
      // Send admin copy to your inbox (template_x59a079)
      const adminResult = await emailjs.sendForm(
        "service_53j7hqq",
        "template_x59a079",
        formRef.current
      );
      console.log("Admin email result:", adminResult);

      // Send auto-reply to user (template_jiuuei9)  
      const userResult = await emailjs.send(
        "service_53j7hqq", 
        "template_jiuuei9",
        {
          user_name: data.user_name,
          user_email: data.user_email,
          subject: data.subject,
          message: data.message,
          to_email: data.user_email // Explicitly set recipient
        }
      );
      console.log("User email result:", userResult);

      toast({
        title: "Message sent successfully!",
        description: "Thank you for your message. I'll get back to you soon! You should also receive a confirmation email.",
      });
      
      form.reset();
    } catch (error) {
      console.error("EmailJS error:", error);
      toast({
        title: "Failed to send message", 
        description: error instanceof Error ? error.message : "Please try again later or contact me directly via email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-8">
        <div className="flex items-center mb-6">
          <Mail className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-2xl font-bold text-foreground">Send a Message</h3>
        </div>
        
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your full name" 
                        {...field} 
                        data-testid="input-contact-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="user_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="your.email@example.com" 
                        {...field} 
                        data-testid="input-contact-email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Project inquiry, collaboration, etc." 
                      {...field} 
                      data-testid="input-contact-subject"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell me about your project, timeline, budget, and how I can help..."
                      rows={5}
                      {...field}
                      data-testid="input-contact-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              disabled={isLoading}
              data-testid="button-contact-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
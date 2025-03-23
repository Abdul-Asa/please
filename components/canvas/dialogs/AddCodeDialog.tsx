import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCanvas } from "../useCanvas";
import { useState, FormEvent, ChangeEvent } from "react";
import { PlusIcon } from "lucide-react";
import type { Code } from "../types";

export function AddCodeDialog() {
  const { controls } = useCanvas();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [color, setColor] = useState("#22c55e"); // Default green color

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCode: Omit<Code, "id"> = {
      name: name.trim(),
      comment: comment.trim(),
      color,
      selections: [],
    };

    controls.addCode(newCode);

    // Reset form
    setName("");
    setComment("");
    setColor("#22c55e");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <PlusIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Code</DialogTitle>
          <DialogDescription>
            Create a new code to categorize and analyze your text. Each code can
            be assigned a name, description, and color.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              placeholder="Enter code name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setComment(e.target.value)
              }
              placeholder="Add a comment (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="color"
              value={color}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setColor(e.target.value)
              }
              className="h-10 w-full"
            />
          </div>
          <Button type="submit" className="w-full">
            Add Code
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

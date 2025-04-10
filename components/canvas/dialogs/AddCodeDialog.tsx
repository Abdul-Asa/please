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
import { TagIcon, PlusIcon } from "lucide-react";
import type { Code } from "../types";
import { PREDEFINED_COLORS } from "../constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AddCodeDialog() {
  const { controls, canvas } = useCanvas();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const usedColors = canvas.codes.map((code) => code.color);
  const availableColors = PREDEFINED_COLORS.filter(
    (color) => !usedColors.includes(color)
  );
  const [color, setColor] = useState(
    availableColors[Math.floor(Math.random() * availableColors.length)]
  );

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCode: Omit<Code, "id"> = {
      name: name.trim(),
      comment: comment.trim(),
      color,
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
        <Button
          variant="outline"
          size="icon"
          tooltip="Create new code"
          tooltipSide="right"
        >
          <TagIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new code</DialogTitle>
          <DialogDescription>
            Create a new code to categorize and analyze your text. Each code can
            be assigned a name, description, and color.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="A new code"
                required
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    className="shadow-sm"
                  >
                    <div
                      className="size-5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 flex flex-wrap gap-2 justify-center">
                  {showColorPicker ? (
                    <>
                      {availableColors.map((colorOption) => (
                        <Button
                          variant="ghost"
                          size="icon"
                          key={colorOption}
                          type="button"
                          className={`size-5 rounded-full border-2 ${
                            color === colorOption
                              ? "border-black dark:border-white"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: colorOption }}
                          onClick={() => setColor(colorOption)}
                        />
                      ))}
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        className="size-5 rounded-full border-2"
                        onClick={() => setShowColorPicker(false)}
                      >
                        <PlusIcon className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <div className=" gap-1 flex flex-col  items-center">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        type="color"
                        value={color}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setColor(e.target.value)
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => setShowColorPicker(true)}
                      >
                        Back to presets
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setComment(e.target.value)
              }
              placeholder="Comments about the code"
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create new code
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

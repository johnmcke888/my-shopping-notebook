// components/plans/AddPlanDialog.tsx

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus as PlusIcon } from 'lucide-react';
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
    Command,
    CommandInput,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown, BarChart2, Folders } from "lucide-react";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive } from "cmdk";

interface AddPlanDialogProps {
    onAddPlan: (plan: {
        name: string;
        priority: 'HIGH' | 'NORMAL' | 'LOW';
        budget: number;
        category?: string;
    }) => void;
}

export function AddPlanDialog({ onAddPlan }: AddPlanDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [priority, setPriority] = useState<'HIGH' | 'NORMAL' | 'LOW'>('NORMAL');
    const [budget, setBudget] = useState('');
    const [category, setCategory] = useState<string>("uncategorized");
    const [categories, setCategories] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem('categories');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [categoryInput, setCategoryInput] = useState("");
    const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const commandRef = useRef<HTMLDivElement>(null);


    // Sync categories to localStorage
    useEffect(() => {
        localStorage.setItem('categories', JSON.stringify(categories));
    }, [categories]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !budget) return;

        onAddPlan({
            name,
            priority,
            budget: Number(budget),
            category: category || undefined,
        });

        // Reset form and close dialog
        setName('');
        setPriority('NORMAL');
        setBudget('');
        setCategory("uncategorized");
        setOpen(false);
    };

    const handleCategoryInput = useCallback((value: string) => {
        console.log('Filtering categories:', value);
        setCategoryInput(value);

        if (Array.isArray(categories)) {
            const filtered = categories.filter(cat =>
                cat.toLowerCase().includes(value.toLowerCase())
            );
            console.log('Filtered categories:', filtered);
            setFilteredCategories(filtered);
        } else {
            setFilteredCategories([]);
        }
    }, [categories]);

    // Update category handling with proper focus management
    const handleAddCategory = useCallback(() => {
        if (!categoryInput) return;

        const newCategories = [...categories, categoryInput];
        setCategories(newCategories);
        setCategory(categoryInput);
        setCategoryInput('');

        // Ensure proper state sync with focus management
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    }, [categoryInput, categories, setCategory]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                    <PlusIcon className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Purchase Plan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">What do you want to buy?</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Standing Desk"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Command
                            ref={commandRef as React.RefObject<HTMLDivElement>}
                            className="rounded-lg border border-input"
                        >
                            <CommandInput
                                ref={inputRef}
                                placeholder="Type to search or add category..."
                                value={categoryInput}
                                onValueChange={setCategoryInput}
                                className="h-10"
                            />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="py-3 px-4 text-sm text-muted-foreground">
                                        {categoryInput ? (
                                            <div className="flex items-center justify-between">
                                                <span>Add category "{categoryInput}"</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 text-xs bg-primary/10 hover:bg-primary/20 text-primary"
                                                    onClick={() => {
                                                        if (categoryInput.trim()) {
                                                            setCategories(prev => [...new Set([...prev, categoryInput])]);
                                                            setCategory(categoryInput);
                                                            setCategoryInput("");
                                                        }
                                                    }}
                                                >
                                                    Add
                                                </Button>
                                            </div>
                                        ) : (
                                            "No matching categories found"
                                        )}
                                    </div>
                                </CommandEmpty>
                                <CommandGroup>
                                    {(categoryInput.length === 0 ||
                                        categoryInput.toLowerCase() === "uncategorized") && (
                                            <CommandItem
                                                value="uncategorized"
                                                onSelect={() => {
                                                    setCategory("uncategorized");
                                                    setCategoryInput("");
                                                }}
                                                className="text-sm text-muted-foreground hover:bg-accent/20 transition-colors"
                                            >
                                                Uncategorized
                                            </CommandItem>
                                        )}
                                    {[...categories]
                                        .filter(cat =>
                                            cat.toLowerCase().includes(categoryInput.toLowerCase()) &&
                                            cat !== "uncategorized"
                                        )
                                        .map((cat) => (
                                            <CommandItem
                                                key={cat}
                                                value={cat}
                                                onSelect={() => {
                                                    setCategory(cat);
                                                    setCategoryInput("");
                                                }}
                                                className="text-sm hover:bg-accent/20 transition-colors"
                                            >
                                                {cat}
                                            </CommandItem>
                                        ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                            value={priority}
                            onValueChange={(value: 'HIGH' | 'NORMAL' | 'LOW') => setPriority(value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HIGH">High Priority</SelectItem>
                                <SelectItem value="NORMAL">Normal Priority</SelectItem>
                                <SelectItem value="LOW">Low Priority</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="budget">Budget</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5">$</span>
                            <Input
                                id="budget"
                                type="number"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="pl-7"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full">
                        Add Plan
                    </Button>
                </form>
            </DialogContent>

            <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
                <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white">
                    <DialogHeader>
                        <DialogTitle>Enter new category name</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Input
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="bg-zinc-800 border-zinc-700"
                            placeholder="Category name"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCategoryModal(false)}
                            className="bg-transparent text-white border-zinc-700 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (newCategory && !categories.includes(newCategory)) {
                                    setCategories([...categories, newCategory]);
                                    setCategory(newCategory);
                                    setNewCategory('');
                                    setShowCategoryModal(false);
                                }
                            }}
                            className="bg-blue-500 hover:bg-blue-600"
                        >
                            OK
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
}
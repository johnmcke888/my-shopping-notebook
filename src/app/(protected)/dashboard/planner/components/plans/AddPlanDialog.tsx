'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { PurchasePlan } from '../../types';

interface AddPlanDialogProps {
    children: React.ReactNode; // Accept a trigger button as a child
    onAddPlan: (plan: Omit<PurchasePlan, 'id'>) => void;
}

export function AddPlanDialog({ children, onAddPlan }: AddPlanDialogProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [priority, setPriority] = useState<'HIGH' | 'NORMAL' | 'LOW'>('NORMAL');
    const [budget, setBudget] = useState('');
    const [category, setCategory] = useState('');

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
        setCategory('');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Purchase Plan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Plan Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., New Office Setup"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="category">Category (Optional)</Label>
                        <Input
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="e.g., Electronics, Furniture"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                            value={priority}
                            onValueChange={(value: 'HIGH' | 'NORMAL' | 'LOW') => setPriority(value)}
                        >
                            <SelectTrigger id="priority">
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HIGH">High</SelectItem>
                                <SelectItem value="NORMAL">Normal</SelectItem>
                                <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="budget">Budget</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
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
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Create Plan</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

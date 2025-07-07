'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Filter, Users } from 'lucide-react';
import type { Contribution, User, Project } from '@/lib/types';

interface ContributionFilterProps {
  contributions: Contribution[];
  project: Project;
  user: User | null;
  onFilterChange: (filteredContributions: Contribution[]) => void;
  onHighlightChange: (highlightUserId: string | null) => void;
}

export function ContributionFilter({ 
  contributions, 
  project, 
  user, 
  onFilterChange, 
  onHighlightChange 
}: ContributionFilterProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);

  // Get unique contributors
  const contributors = useMemo(() => {
    const uniqueUsers = new Map();
    contributions.forEach(contrib => {
      const userId = contrib.userId.toString();
      if (!uniqueUsers.has(userId)) {
        // Use userName if available, otherwise fallback to shortened user ID
        const displayName = contrib.userName || `User ${userId.slice(-6)}`;
        uniqueUsers.set(userId, {
          id: userId,
          name: displayName,
          avatar: contrib.userAvatar,
          count: 0
        });
      }
      uniqueUsers.get(userId).count++;
    });
    return Array.from(uniqueUsers.values()).sort((a, b) => b.count - a.count);
  }, [contributions]);

  // Filter contributions based on current settings
  const filteredContributions = useMemo(() => {
    let filtered = contributions;

    if (showOnlyMine && user) {
      filtered = filtered.filter(contrib => contrib.userId.toString() === user.id);
    } else if (selectedUserId) {
      filtered = filtered.filter(contrib => contrib.userId.toString() === selectedUserId);
    }

    return filtered;
  }, [contributions, selectedUserId, showOnlyMine, user]);

  // Update parent component when filters change
  React.useEffect(() => {
    onFilterChange(filteredContributions);
  }, [filteredContributions, onFilterChange]);

  // Update highlight when highlight mode changes
  React.useEffect(() => {
    if (highlightMode) {
      onHighlightChange(selectedUserId || (showOnlyMine && user ? user.id : null));
    } else {
      onHighlightChange(null);
    }
  }, [highlightMode, selectedUserId, showOnlyMine, user, onHighlightChange]);

  const isOwner = user && user.id === project.createdBy.toString();

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Contributions
        </h3>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {filteredContributions.length}
        </Badge>
      </div>

      {/* Quick filter for own contributions */}
      <div className="flex items-center space-x-2">
        <Switch
          id="show-mine"
          checked={showOnlyMine}
          onCheckedChange={(checked) => {
            setShowOnlyMine(checked);
            if (checked) {
              setSelectedUserId(null);
            }
          }}
        />
        <Label htmlFor="show-mine" className="text-sm">
          Show only my contributions
        </Label>
      </div>

      {/* User filter (for owners/admins) */}
      {isOwner && !showOnlyMine && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filter by contributor:</Label>
          <Select
            value={selectedUserId || "all"}
            onValueChange={(value) => setSelectedUserId(value === "all" ? null : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All contributors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All contributors ({contributions.length})</SelectItem>
              {contributors.map((contributor) => (
                <SelectItem key={contributor.id} value={contributor.id}>
                  {contributor.name} ({contributor.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Highlight mode toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="highlight-mode"
          checked={highlightMode}
          onCheckedChange={setHighlightMode}
        />
        <Label htmlFor="highlight-mode" className="text-sm flex items-center gap-1">
          {highlightMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          Highlight filtered contributions
        </Label>
      </div>

      {/* Clear filters */}
      {(selectedUserId || showOnlyMine) && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setSelectedUserId(null);
            setShowOnlyMine(false);
            setHighlightMode(false);
          }}
          className="w-full"
        >
          Clear Filters
        </Button>
      )}

      {/* Show summary */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Total contributions: {contributions.length}</p>
        <p>Contributors: {contributors.length}</p>
        {filteredContributions.length !== contributions.length && (
          <p className="text-blue-400">Showing: {filteredContributions.length} filtered</p>
        )}
      </div>
    </div>
  );
}

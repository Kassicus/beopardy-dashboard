"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Trash2, Trophy, Users } from "lucide-react";
import type { Tables } from "@/types/database";

export interface TeamMember {
  id: string;
  player_id: string;
  questions_seen: number;
  questions_correct: number;
  points_scored: number;
}

export interface TeamResult {
  id: string;
  team_name: string;
  team_color: string;
  is_winner: boolean;
  placement: number | null;
  members: TeamMember[];
}

interface TeamCardProps {
  team: TeamResult;
  teamIndex: number;
  players: Tables<"players">[];
  usedPlayerIds: string[];
  onUpdate: (team: TeamResult) => void;
  onRemove: () => void;
  canRemove: boolean;
  disabled?: boolean;
}

const TEAM_COLORS = [
  { value: "#EF4444", label: "Red" },
  { value: "#F97316", label: "Orange" },
  { value: "#EAB308", label: "Yellow" },
  { value: "#22C55E", label: "Green" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#6B7280", label: "Gray" },
];

export function TeamCard({
  team,
  teamIndex,
  players,
  usedPlayerIds,
  onUpdate,
  onRemove,
  canRemove,
  disabled = false,
}: TeamCardProps) {
  function updateTeam(field: keyof TeamResult, value: unknown) {
    onUpdate({ ...team, [field]: value });
  }

  function addMember() {
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      player_id: "",
      questions_seen: 0,
      questions_correct: 0,
      points_scored: 0,
    };
    updateTeam("members", [...team.members, newMember]);
  }

  function removeMember(memberId: string) {
    if (team.members.length <= 1) return;
    updateTeam(
      "members",
      team.members.filter((m) => m.id !== memberId)
    );
  }

  function updateMember(memberId: string, field: keyof TeamMember, value: unknown) {
    updateTeam(
      "members",
      team.members.map((m) => (m.id === memberId ? { ...m, [field]: value } : m))
    );
  }

  function getAvailablePlayers(currentPlayerId: string) {
    return players.filter(
      (p) => !usedPlayerIds.includes(p.id) || p.id === currentPlayerId
    );
  }

  function getPlayerName(playerId: string): string {
    return players.find((p) => p.id === playerId)?.name ?? "";
  }

  // Calculate team totals
  const teamTotalPoints = team.members.reduce((sum, m) => sum + m.points_scored, 0);
  const teamTotalCorrect = team.members.reduce((sum, m) => sum + m.questions_correct, 0);
  const teamTotalSeen = team.members.reduce((sum, m) => sum + m.questions_seen, 0);

  return (
    <Card
      variant="outlined"
      className={`
        relative overflow-hidden
        ${team.is_winner ? "ring-2 ring-beo-golden" : ""}
      `}
    >
      {/* Team color indicator */}
      {team.team_color && (
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ backgroundColor: team.team_color }}
        />
      )}

      <CardContent className="pt-6 pl-5">
        {/* Team Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Badge variant={team.is_winner ? "golden" : "default"} className="gap-1">
              {team.is_winner ? (
                <>
                  <Trophy className="h-3 w-3" /> Winner
                </>
              ) : (
                <>
                  <Users className="h-3 w-3" /> Team {teamIndex + 1}
                </>
              )}
            </Badge>
            {team.team_name && (
              <span className="font-semibold text-foreground">{team.team_name}</span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={!canRemove || disabled}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Team Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="col-span-2">
            <Input
              label="Team Name"
              value={team.team_name}
              onChange={(e) => updateTeam("team_name", e.target.value)}
              placeholder="e.g., Team Alpha"
              disabled={disabled}
            />
          </div>
          <Select
            label="Team Color"
            value={team.team_color}
            onChange={(e) => updateTeam("team_color", e.target.value)}
            options={TEAM_COLORS.map((c) => ({ value: c.value, label: c.label }))}
            placeholder="Select color..."
            disabled={disabled}
          />
          <Input
            label="Placement"
            type="number"
            value={team.placement ?? ""}
            onChange={(e) =>
              updateTeam("placement", e.target.value ? parseInt(e.target.value) : null)
            }
            min={1}
            max={10}
            disabled={disabled}
          />
        </div>

        {/* Winner Toggle */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={team.is_winner}
              onChange={(e) => updateTeam("is_winner", e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 rounded border-border text-beo-golden focus:ring-beo-golden"
            />
            <span className="text-sm font-medium">Winning Team</span>
          </label>
        </div>

        {/* Team Stats Summary */}
        <div className="bg-beo-cream/30 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">Team Totals:</span>
            <div className="flex gap-4">
              <span>
                <strong>{teamTotalPoints}</strong> points
              </span>
              <span>
                <strong>{teamTotalCorrect}</strong>/{teamTotalSeen} answered
              </span>
              <span>
                <strong>{team.members.length}</strong> members
              </span>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-text-secondary">Team Members</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMember}
              disabled={disabled}
              leftIcon={<Plus className="h-3 w-3" />}
            >
              Add Member
            </Button>
          </div>

          {team.members.map((member, memberIndex) => (
            <div
              key={member.id}
              className="grid grid-cols-12 gap-2 items-end p-3 bg-surface rounded-lg border border-border"
            >
              <div className="col-span-12 md:col-span-4">
                <Select
                  label={memberIndex === 0 ? "Player" : undefined}
                  value={member.player_id}
                  onChange={(e) => updateMember(member.id, "player_id", e.target.value)}
                  options={getAvailablePlayers(member.player_id).map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  placeholder="Select player..."
                  disabled={disabled}
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <Input
                  label={memberIndex === 0 ? "Seen" : undefined}
                  type="number"
                  value={member.questions_seen}
                  onChange={(e) =>
                    updateMember(member.id, "questions_seen", parseInt(e.target.value) || 0)
                  }
                  min={0}
                  disabled={disabled}
                />
              </div>
              <div className="col-span-4 md:col-span-2">
                <Input
                  label={memberIndex === 0 ? "Answered" : undefined}
                  type="number"
                  value={member.questions_correct}
                  onChange={(e) =>
                    updateMember(member.id, "questions_correct", parseInt(e.target.value) || 0)
                  }
                  min={0}
                  disabled={disabled}
                />
              </div>
              <div className="col-span-4 md:col-span-3">
                <Input
                  label={memberIndex === 0 ? "Points" : undefined}
                  type="number"
                  value={member.points_scored}
                  onChange={(e) =>
                    updateMember(member.id, "points_scored", parseInt(e.target.value) || 0)
                  }
                  disabled={disabled}
                />
              </div>
              <div className="col-span-12 md:col-span-1 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMember(member.id)}
                  disabled={team.members.length <= 1 || disabled}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

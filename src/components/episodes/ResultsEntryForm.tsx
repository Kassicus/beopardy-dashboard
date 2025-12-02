"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants";
import { Plus, Trash2, Trophy, Users, User } from "lucide-react";
import toast from "react-hot-toast";
import type { Tables } from "@/types/database";
import { TeamCard, type TeamResult, type TeamMember } from "./TeamCard";

interface ParticipantResult {
  id: string;
  player_id: string;
  questions_seen: number;
  questions_correct: number;
  points_scored: number;
  is_winner: boolean;
  placement: number | null;
  final_wager: number | null;
  final_correct: boolean | null;
}

interface ResultsEntryFormProps {
  episode: Tables<"episodes">;
  players: Tables<"players">[];
  existingResults?: Tables<"episode_appearances">[];
  existingTeams?: Tables<"episode_teams">[];
}

export function ResultsEntryForm({
  episode,
  players,
  existingResults = [],
  existingTeams = [],
}: ResultsEntryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [finalBeopardyWinnerId, setFinalBeopardyWinnerId] = useState<string>(
    episode.final_beopardy_winner_id ?? ""
  );

  const isTeamEpisode = episode.episode_type === "team";

  // Solo mode state
  const initialParticipants: ParticipantResult[] = existingResults.length > 0 && !isTeamEpisode
    ? existingResults.map((r) => {
        // Reverse Final Beopardy adjustment to show pre-FB score
        // (since we'll re-apply it when saving)
        let preFBPoints = r.points_scored;
        if (r.final_wager != null && r.final_correct !== null) {
          preFBPoints = r.final_correct
            ? r.points_scored - r.final_wager  // Was added, so subtract
            : r.points_scored + r.final_wager; // Was subtracted, so add back
        }
        return {
          id: r.id,
          player_id: r.player_id,
          questions_seen: r.questions_seen,
          questions_correct: r.questions_correct,
          points_scored: preFBPoints,
          is_winner: r.is_winner,
          placement: r.placement,
          final_wager: r.final_wager,
          final_correct: r.final_correct,
        };
      })
    : [createEmptyParticipant()];

  const [participants, setParticipants] = useState<ParticipantResult[]>(initialParticipants);

  // Team mode state
  const initialTeams: TeamResult[] = existingTeams.length > 0
    ? existingTeams.map((t) => ({
        id: t.id,
        team_name: t.team_name,
        team_color: t.team_color ?? "",
        is_winner: t.is_winner,
        placement: t.placement,
        final_wager: t.final_wager,
        final_correct: t.final_correct,
        members: existingResults
          .filter((r) => r.team_id === t.id)
          .map((r) => ({
            id: r.id,
            player_id: r.player_id,
            questions_seen: r.questions_seen,
            questions_correct: r.questions_correct,
            points_scored: r.points_scored,
            final_wager: r.final_wager,
            final_correct: r.final_correct,
          })),
      }))
    : [createEmptyTeam(), createEmptyTeam()];

  const [teams, setTeams] = useState<TeamResult[]>(initialTeams);

  function createEmptyParticipant(): ParticipantResult {
    return {
      id: crypto.randomUUID(),
      player_id: "",
      questions_seen: 0,
      questions_correct: 0,
      points_scored: 0,
      is_winner: false,
      placement: null,
      final_wager: null,
      final_correct: null,
    };
  }

  function createEmptyTeam(): TeamResult {
    return {
      id: crypto.randomUUID(),
      team_name: "",
      team_color: "",
      is_winner: false,
      placement: null,
      final_wager: null,
      final_correct: null,
      members: [createEmptyMember()],
    };
  }

  function createEmptyMember(): TeamMember {
    return {
      id: crypto.randomUUID(),
      player_id: "",
      questions_seen: 0,
      questions_correct: 0,
      points_scored: 0,
      final_wager: null,
      final_correct: null,
    };
  }

  // Solo mode functions
  function addParticipant() {
    setParticipants((prev) => [...prev, createEmptyParticipant()]);
  }

  function removeParticipant(id: string) {
    if (participants.length <= 1) {
      toast.error("At least one participant is required");
      return;
    }
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  function updateParticipant(id: string, field: keyof ParticipantResult, value: unknown) {
    setParticipants((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return { ...p, [field]: value };
      })
    );

    // If setting a winner, unset other winners
    if (field === "is_winner" && value === true) {
      setParticipants((prev) =>
        prev.map((p) => ({
          ...p,
          is_winner: p.id === id,
        }))
      );
    }
  }

  // Team mode functions
  function addTeam() {
    setTeams((prev) => [...prev, createEmptyTeam()]);
  }

  function removeTeam(teamId: string) {
    if (teams.length <= 2) {
      toast.error("At least two teams are required");
      return;
    }
    setTeams((prev) => prev.filter((t) => t.id !== teamId));
  }

  function updateTeam(updatedTeam: TeamResult) {
    setTeams((prev) => {
      // If this team is being set as winner, unset other winners
      if (updatedTeam.is_winner) {
        return prev.map((t) => ({
          ...t,
          is_winner: t.id === updatedTeam.id,
        }));
      }
      return prev.map((t) => (t.id === updatedTeam.id ? updatedTeam : t));
    });
  }

  // Helper functions
  function getPlayerName(playerId: string): string {
    return players.find((p) => p.id === playerId)?.name ?? "Unknown";
  }

  function getAvailablePlayers(currentPlayerId: string) {
    const selectedIds = participants
      .filter((p) => p.player_id !== currentPlayerId)
      .map((p) => p.player_id);

    return players.filter(
      (p) => !selectedIds.includes(p.id) || p.id === currentPlayerId
    );
  }

  function getAllUsedPlayerIds(): string[] {
    if (isTeamEpisode) {
      return teams.flatMap((t) => t.members.map((m) => m.player_id)).filter(Boolean);
    }
    return participants.map((p) => p.player_id).filter(Boolean);
  }

  function getAllParticipantPlayerIds(): string[] {
    if (isTeamEpisode) {
      return teams.flatMap((t) => t.members.map((m) => m.player_id)).filter(Boolean);
    }
    return participants.filter((p) => p.player_id).map((p) => p.player_id);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errors: string[] = [];

    if (isTeamEpisode) {
      // Team validation
      if (teams.length < 2) {
        errors.push("At least two teams are required");
      }

      teams.forEach((team, index) => {
        if (!team.team_name.trim()) {
          errors.push(`Team ${index + 1} needs a name`);
        }
        if (team.members.length === 0) {
          errors.push(`Team "${team.team_name || index + 1}" needs at least one member`);
        }
        if (team.members.some((m) => !m.player_id)) {
          errors.push(`All members of team "${team.team_name || index + 1}" must have a player selected`);
        }
      });

      const winnerCount = teams.filter((t) => t.is_winner).length;
      if (winnerCount === 0) {
        errors.push("Please select a winning team");
      } else if (winnerCount > 1) {
        errors.push("Only one winning team can be selected");
      }
    } else {
      // Solo validation
      if (participants.some((p) => !p.player_id)) {
        errors.push("All participants must have a player selected");
      }

      const winnerCount = participants.filter((p) => p.is_winner).length;
      if (winnerCount === 0) {
        errors.push("Please select a winner");
      } else if (winnerCount > 1) {
        errors.push("Only one winner can be selected");
      }
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      // Delete existing results and teams
      if (existingResults.length > 0) {
        const { error: deleteAppearancesError } = await supabase
          .from("episode_appearances")
          .delete()
          .eq("episode_id", episode.id);

        if (deleteAppearancesError) throw deleteAppearancesError;
      }

      if (existingTeams.length > 0) {
        const { error: deleteTeamsError } = await supabase
          .from("episode_teams")
          .delete()
          .eq("episode_id", episode.id);

        if (deleteTeamsError) throw deleteTeamsError;
      }

      if (isTeamEpisode) {
        // Insert teams first
        const teamsToInsert = teams.map((t) => {
          const memberPoints = t.members.reduce((sum, m) => sum + m.points_scored, 0);
          // Add or subtract Final Beopardy wager based on result
          let finalBeopardyPoints = 0;
          if (t.final_wager != null && t.final_correct !== null) {
            finalBeopardyPoints = t.final_correct ? t.final_wager : -t.final_wager;
          }
          return {
            episode_id: episode.id,
            team_name: t.team_name,
            team_color: t.team_color || null,
            is_winner: t.is_winner,
            placement: t.placement,
            total_points: memberPoints + finalBeopardyPoints,
            final_wager: t.final_wager,
            final_correct: t.final_correct,
          };
        });

        const { data: insertedTeams, error: insertTeamsError } = await supabase
          .from("episode_teams")
          .insert(teamsToInsert)
          .select();

        if (insertTeamsError) throw insertTeamsError;

        // Map original team IDs to inserted team IDs
        const teamIdMap = new Map<string, string>();
        teams.forEach((t, index) => {
          if (insertedTeams[index]) {
            teamIdMap.set(t.id, insertedTeams[index].id);
          }
        });

        // Insert appearances with team references
        const appearancesToInsert = teams.flatMap((t) =>
          t.members.map((m) => ({
            episode_id: episode.id,
            player_id: m.player_id,
            team_id: teamIdMap.get(t.id),
            questions_seen: m.questions_seen,
            questions_correct: m.questions_correct,
            points_scored: m.points_scored,
            is_winner: false, // For team episodes, is_winner is on the team, not individual
            placement: null,
            final_wager: m.final_wager,
            final_correct: m.final_correct,
          }))
        );

        const { error: insertAppearancesError } = await supabase
          .from("episode_appearances")
          .insert(appearancesToInsert);

        if (insertAppearancesError) throw insertAppearancesError;
      } else {
        // Solo mode: Insert appearances directly
        const resultsToInsert = participants.map((p) => {
          // Calculate Final Beopardy points adjustment
          let finalBeopardyPoints = 0;
          if (p.final_wager != null && p.final_correct !== null) {
            finalBeopardyPoints = p.final_correct ? p.final_wager : -p.final_wager;
          }
          return {
            episode_id: episode.id,
            player_id: p.player_id,
            team_id: null,
            questions_seen: p.questions_seen,
            questions_correct: p.questions_correct,
            points_scored: p.points_scored + finalBeopardyPoints,
            is_winner: p.is_winner,
            placement: p.placement,
            final_wager: p.final_wager,
            final_correct: p.final_correct,
          };
        });

        const { error: insertError } = await supabase
          .from("episode_appearances")
          .insert(resultsToInsert);

        if (insertError) throw insertError;
      }

      // Update episode with Final Beopardy winner
      const { error: updateEpisodeError } = await supabase
        .from("episodes")
        .update({
          final_beopardy_winner_id: finalBeopardyWinnerId || null,
        })
        .eq("id", episode.id);

      if (updateEpisodeError) throw updateEpisodeError;

      toast.success("Results saved successfully!");
      router.push(ROUTES.admin.episodes);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Episode Details */}
      <Card variant="outlined" className="mb-6">
        <CardHeader>
          <CardTitle>Episode Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Title:</span>
              <p className="font-medium">{episode.title}</p>
            </div>
            <div>
              <span className="text-text-muted">Season:</span>
              <p className="font-medium">{episode.season}</p>
            </div>
            <div>
              <span className="text-text-muted">Episode:</span>
              <p className="font-medium">{episode.episode_number}</p>
            </div>
            <div>
              <span className="text-text-muted">Air Date:</span>
              <p className="font-medium">{episode.air_date}</p>
            </div>
            <div>
              <span className="text-text-muted">Type:</span>
              <Badge variant={isTeamEpisode ? "rose" : "terracotta"} className="mt-1">
                {isTeamEpisode ? (
                  <>
                    <Users className="h-3 w-3 mr-1" /> Team
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" /> Solo
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Mode */}
      {isTeamEpisode ? (
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Teams</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTeam}
              disabled={isLoading}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Team
            </Button>
          </div>

          {teams.map((team, index) => (
            <TeamCard
              key={team.id}
              team={team}
              teamIndex={index}
              players={players}
              usedPlayerIds={getAllUsedPlayerIds().filter(
                (id) => !team.members.some((m) => m.player_id === id)
              )}
              onUpdate={updateTeam}
              onRemove={() => removeTeam(team.id)}
              canRemove={teams.length > 2}
              disabled={isLoading}
            />
          ))}
        </div>
      ) : (
        /* Solo Mode */
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Participants</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addParticipant}
              disabled={isLoading}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Participant
            </Button>
          </div>

          {participants.map((participant, index) => (
            <Card key={participant.id} variant="outlined">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={participant.is_winner ? "golden" : "default"}>
                      {participant.is_winner ? (
                        <>
                          <Trophy className="h-3 w-3 mr-1" /> Winner
                        </>
                      ) : (
                        `#${index + 1}`
                      )}
                    </Badge>
                    {participant.player_id && (
                      <span className="font-medium">
                        {getPlayerName(participant.player_id)}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParticipant(participant.id)}
                    disabled={participants.length <= 1 || isLoading}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Select
                      label="Player"
                      value={participant.player_id}
                      onChange={(e) =>
                        updateParticipant(participant.id, "player_id", e.target.value)
                      }
                      options={getAvailablePlayers(participant.player_id).map((p) => ({
                        value: p.id,
                        label: p.name,
                      }))}
                      placeholder="Select player..."
                      disabled={isLoading}
                    />
                  </div>

                  <Input
                    label="Questions Seen"
                    type="number"
                    value={participant.questions_seen}
                    onChange={(e) =>
                      updateParticipant(
                        participant.id,
                        "questions_seen",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min={0}
                    disabled={isLoading}
                  />

                  <Input
                    label="Questions Answered"
                    type="number"
                    value={participant.questions_correct}
                    onChange={(e) =>
                      updateParticipant(
                        participant.id,
                        "questions_correct",
                        parseInt(e.target.value) || 0
                      )
                    }
                    min={0}
                    disabled={isLoading}
                  />

                  <Input
                    label="Points Scored"
                    type="number"
                    value={participant.points_scored}
                    onChange={(e) =>
                      updateParticipant(
                        participant.id,
                        "points_scored",
                        parseInt(e.target.value) || 0
                      )
                    }
                    disabled={isLoading}
                  />

                  <Input
                    label="Placement"
                    type="number"
                    value={participant.placement ?? ""}
                    onChange={(e) =>
                      updateParticipant(
                        participant.id,
                        "placement",
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    min={1}
                    max={10}
                    disabled={isLoading}
                  />

                  <div className="col-span-2 flex items-end gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={participant.is_winner}
                        onChange={(e) =>
                          updateParticipant(participant.id, "is_winner", e.target.checked)
                        }
                        disabled={isLoading}
                        className="w-4 h-4 rounded border-border text-beo-terracotta focus:ring-beo-terracotta"
                      />
                      <span className="text-sm font-medium">Winner</span>
                    </label>
                  </div>
                </div>

                {/* Final Beopardy */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-text-secondary mb-3">Final Beopardy</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Wager"
                      type="number"
                      value={participant.final_wager ?? ""}
                      onChange={(e) =>
                        updateParticipant(
                          participant.id,
                          "final_wager",
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      min={0}
                      disabled={isLoading}
                      placeholder="0"
                    />
                    <Select
                      label="Result"
                      value={participant.final_correct === null ? "" : participant.final_correct ? "add" : "lose"}
                      onChange={(e) =>
                        updateParticipant(
                          participant.id,
                          "final_correct",
                          e.target.value === "" ? null : e.target.value === "add"
                        )
                      }
                      options={[
                        { value: "", label: "Did not participate" },
                        { value: "add", label: "Add wager to score" },
                        { value: "lose", label: "Lose wager from score" },
                      ]}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Final Beopardy Winner */}
      <Card variant="outlined" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-beo-golden" />
            Final Beopardy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            label="Final Beopardy Winner"
            value={finalBeopardyWinnerId}
            onChange={(e) => setFinalBeopardyWinnerId(e.target.value)}
            options={[
              { value: "", label: "No Final Beopardy / Not Applicable" },
              ...getAllParticipantPlayerIds().map((playerId) => ({
                value: playerId,
                label: getPlayerName(playerId),
              })),
            ]}
            disabled={isLoading}
          />
          <p className="mt-1.5 text-sm text-text-muted">
            Select the player who won Final Beopardy, or leave blank if there was no Final Beopardy round.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" isLoading={isLoading}>
          Save Results
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

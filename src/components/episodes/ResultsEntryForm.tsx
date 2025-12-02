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
import { Plus, Trash2, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import type { Tables } from "@/types/database";

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
}

export function ResultsEntryForm({
  episode,
  players,
  existingResults = [],
}: ResultsEntryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const initialParticipants: ParticipantResult[] = existingResults.length > 0
    ? existingResults.map((r) => ({
        id: r.id,
        player_id: r.player_id,
        questions_seen: r.questions_seen,
        questions_correct: r.questions_correct,
        points_scored: r.points_scored,
        is_winner: r.is_winner,
        placement: r.placement,
        final_wager: r.final_wager,
        final_correct: r.final_correct,
      }))
    : [createEmptyParticipant()];

  const [participants, setParticipants] = useState<ParticipantResult[]>(initialParticipants);

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

        // If setting winner, unset other winners
        if (field === "is_winner" && value === true) {
          return { ...p, [field]: value };
        }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    const errors: string[] = [];

    if (participants.some((p) => !p.player_id)) {
      errors.push("All participants must have a player selected");
    }

    const winnerCount = participants.filter((p) => p.is_winner).length;
    if (winnerCount === 0) {
      errors.push("Please select a winner");
    } else if (winnerCount > 1) {
      errors.push("Only one winner can be selected");
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    try {
      // Delete existing results if any
      if (existingResults.length > 0) {
        const { error: deleteError } = await supabase
          .from("episode_appearances")
          .delete()
          .eq("episode_id", episode.id);

        if (deleteError) throw deleteError;
      }

      // Insert new results
      const resultsToInsert = participants.map((p) => ({
        episode_id: episode.id,
        player_id: p.player_id,
        questions_seen: p.questions_seen,
        questions_correct: p.questions_correct,
        points_scored: p.points_scored,
        is_winner: p.is_winner,
        placement: p.placement,
        final_wager: p.final_wager,
        final_correct: p.final_correct,
      }));

      const { error: insertError } = await supabase
        .from("episode_appearances")
        .insert(resultsToInsert);

      if (insertError) throw insertError;

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
      <Card variant="outlined" className="mb-6">
        <CardHeader>
          <CardTitle>Episode Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Participants</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addParticipant}
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
                  disabled={participants.length <= 1}
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
                />

                <Input
                  label="Questions Correct"
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
                />

                <div className="col-span-2 flex items-end gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={participant.is_winner}
                      onChange={(e) =>
                        updateParticipant(participant.id, "is_winner", e.target.checked)
                      }
                      className="w-4 h-4 rounded border-border text-beo-terracotta focus:ring-beo-terracotta"
                    />
                    <span className="text-sm font-medium">Winner</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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

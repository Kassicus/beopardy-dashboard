"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatDate, formatNumber } from "@/lib/utils/formatters";

interface AppearanceData {
  episode_date: string;
  episode_title: string;
  points_scored: number;
  questions_correct: number;
  questions_seen: number;
  is_winner: boolean;
}

interface PerformanceTrendProps {
  appearances: AppearanceData[];
  playerName: string;
}

export function PerformanceTrend({ appearances, playerName }: PerformanceTrendProps) {
  const chartData = useMemo(() => {
    // Sort by date ascending for the chart
    return [...appearances]
      .sort((a, b) => new Date(a.episode_date).getTime() - new Date(b.episode_date).getTime())
      .map((appearance, index) => ({
        name: `Game ${index + 1}`,
        date: formatDate(appearance.episode_date, "MMM d"),
        fullDate: formatDate(appearance.episode_date),
        title: appearance.episode_title,
        points: appearance.points_scored,
        accuracy: appearance.questions_seen > 0
          ? Math.round((appearance.questions_correct / appearance.questions_seen) * 100)
          : 0,
        isWinner: appearance.is_winner,
      }));
  }, [appearances]);

  const avgPoints = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(chartData.reduce((sum, d) => sum + d.points, 0) / chartData.length);
  }, [chartData]);

  if (appearances.length < 2) {
    return null; // Don't show chart if less than 2 data points
  }

  return (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Performance Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={{ stroke: "#E5E7EB" }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={{ stroke: "#E5E7EB" }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickLine={{ stroke: "#E5E7EB" }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-border">
                        <p className="font-medium text-foreground mb-1">{data.title}</p>
                        <p className="text-sm text-text-muted mb-2">{data.fullDate}</p>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="text-beo-terracotta font-medium">Points:</span>{" "}
                            {formatNumber(data.points)}
                            {data.isWinner && " 🏆"}
                          </p>
                          <p>
                            <span className="text-beo-rose font-medium">Accuracy:</span>{" "}
                            {data.accuracy}%
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
              />
              <ReferenceLine
                yAxisId="left"
                y={avgPoints}
                stroke="#9CA3AF"
                strokeDasharray="5 5"
                label={{
                  value: `Avg: ${formatNumber(avgPoints)}`,
                  position: "right",
                  fill: "#9CA3AF",
                  fontSize: 12,
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="points"
                name="Points"
                stroke="#AC4838"
                strokeWidth={2}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isWinner) {
                    return (
                      <circle
                        key={`dot-${payload.name}`}
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill="#CFB56A"
                        stroke="#AC4838"
                        strokeWidth={2}
                      />
                    );
                  }
                  return (
                    <circle
                      key={`dot-${payload.name}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#AC4838"
                    />
                  );
                }}
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="accuracy"
                name="Accuracy %"
                stroke="#C57F87"
                strokeWidth={2}
                dot={{ r: 3, fill: "#C57F87" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-text-muted text-center mt-4">
          Gold dots indicate winning performances
        </p>
      </CardContent>
    </Card>
  );
}

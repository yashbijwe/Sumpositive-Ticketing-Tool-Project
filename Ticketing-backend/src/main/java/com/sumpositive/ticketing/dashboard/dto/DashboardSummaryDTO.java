package com.sumpositive.ticketing.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Aggregated dashboard metrics for tickets")
public record DashboardSummaryDTO(
        @Schema(description = "Status counts summary")
        StatusMetrics statusCounts,

        @Schema(description = "Priority counts summary")
        PriorityMetrics priorityCounts
) {
    @Schema(description = "Ticket counts broken down by status")
    public record StatusMetrics(
            @Schema(description = "Total number of tickets", example = "10")
            long total,

            @Schema(description = "Tickets in TO_DO status", example = "4")
            long toDo,

            @Schema(description = "Tickets in IN_PROGRESS status", example = "3")
            long inProgress,

            @Schema(description = "Tickets in DONE status", example = "3")
            long done
    ) {}

    @Schema(description = "Ticket counts broken down by priority")
    public record PriorityMetrics(
            @Schema(description = "Tickets with LOW priority", example = "2")
            long low,

            @Schema(description = "Tickets with MEDIUM priority", example = "5")
            long medium,

            @Schema(description = "Tickets with HIGH priority", example = "3")
            long high
    ) {}
}
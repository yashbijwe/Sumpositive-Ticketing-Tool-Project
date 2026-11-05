package com.sumpositive.ticketing.dashboard.controller;

import com.sumpositive.ticketing.common.exception.ErrorResponse;
import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO;
import com.sumpositive.ticketing.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "Endpoints for ticket dashboard metrics and aggregations")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/tickets")
    @Operation(summary = "Get ticket metrics", description = "Retrieves aggregate counts for ticket statuses and priorities")
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200", 
                    description = "Dashboard metrics retrieved successfully",
                    content = @Content(schema = @Schema(implementation = DashboardSummaryDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401", 
                    description = "Unauthorized - Missing or expired JWT",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public ResponseEntity<DashboardSummaryDTO> getDashboardTickets() {
        return ResponseEntity.ok(dashboardService.getDashboardMetrics());
    }
}
package com.sumpositive.ticketing.dashboard.controller;

import com.sumpositive.ticketing.dashboard.dto.DashboardSummaryDTO;
import com.sumpositive.ticketing.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/tickets")
    public ResponseEntity<DashboardSummaryDTO> getDashboardTickets(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(dashboardService.getDashboardMetrics(userDetails.getUsername()));
    }
}
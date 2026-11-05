package com.sumpositive.ticketing.user.controller;

import com.sumpositive.ticketing.user.dto.UserSummaryDTO;
import com.sumpositive.ticketing.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User endpoints for ticket assignee selection")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get assignment candidates", description = "Retrieves all registered users for ticket assignment dropdowns")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of candidate users retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT")
    })
    public ResponseEntity<List<UserSummaryDTO>> getUsers() {
        return ResponseEntity.ok(userService.getAllAssignmentCandidates());
    }
}
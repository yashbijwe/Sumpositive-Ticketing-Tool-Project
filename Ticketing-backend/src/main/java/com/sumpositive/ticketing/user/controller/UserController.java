package com.sumpositive.ticketing.user.controller;

import com.sumpositive.ticketing.user.dto.UpdateUserRequestDTO;
import com.sumpositive.ticketing.user.dto.UserSummaryDTO;
import com.sumpositive.ticketing.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Both Admin and standard User can retrieve candidate assignees
    @GetMapping
    public ResponseEntity<List<UserSummaryDTO>> getUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // 1) Admin only: Edit user details
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserSummaryDTO> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequestDTO request
    ) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // 2) Admin only: Remove user
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
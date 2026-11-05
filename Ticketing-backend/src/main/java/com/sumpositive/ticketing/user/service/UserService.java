package com.sumpositive.ticketing.user.service;

import com.sumpositive.ticketing.common.exception.ResourceNotFoundException;
import com.sumpositive.ticketing.user.dto.UserSummaryDTO;
import com.sumpositive.ticketing.user.entity.User;
import com.sumpositive.ticketing.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<UserSummaryDTO> getAllAssignmentCandidates() {
        return userRepository.findAll().stream()
                .map(this::toSummaryDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserSummaryDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return toSummaryDTO(user);
    }

    @Transactional(readOnly = true)
    public UserSummaryDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toSummaryDTO(user);
    }

    public UserSummaryDTO toSummaryDTO(User user) {
        return new UserSummaryDTO(user.getId(), user.getName(), user.getEmail());
    }
}
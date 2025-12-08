package com.microsservicos.userservice.controller;

import com.microsservicos.userservice.dto.LogDTO;
import com.microsservicos.userservice.entity.Log;
import com.microsservicos.userservice.service.LogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
@Tag(name = "Logs", description = "Endpoints for managing system logs")
public class LogController {

    private final LogService logService;

    @PostMapping
    @Operation(summary = "Create a new log")
    public ResponseEntity<Log> createLog(@RequestBody LogDTO logDTO) {
        return ResponseEntity.ok(logService.createLog(logDTO));
    }

    @GetMapping
    @Operation(summary = "List all logs")
    public ResponseEntity<List<Log>> getAllLogs() {
        return ResponseEntity.ok(logService.getAllLogs());
    }
}

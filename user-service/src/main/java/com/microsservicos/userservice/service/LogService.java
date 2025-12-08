package com.microsservicos.userservice.service;

import com.microsservicos.userservice.dto.LogDTO;
import com.microsservicos.userservice.entity.Log;
import com.microsservicos.userservice.repository.LogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LogService {

    private final LogRepository logRepository;

    public Log createLog(LogDTO logDTO) {
        Log log = Log.builder()
                .userEmail(logDTO.getUserEmail())
                .body(logDTO.getBody())
                .statusCode(logDTO.getStatusCode())
                .method(logDTO.getMethod())
                .service(logDTO.getService())
                .ip(logDTO.getIp())
                .path(logDTO.getPath())
                .build();
        return logRepository.save(log);
    }

    public List<Log> getAllLogs() {
        return logRepository.findAll();
    }
}

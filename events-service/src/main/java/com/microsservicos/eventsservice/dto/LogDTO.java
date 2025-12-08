package com.microsservicos.eventsservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogDTO {
    private String userEmail;
    private String body;
    private Integer statusCode;
    private String method;
    private String service;
    private String ip;
    private String path;
}

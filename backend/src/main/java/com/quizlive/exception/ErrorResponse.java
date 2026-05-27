package com.quizlive.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private LocalDateTime timestamp;
    private int status;
    private String message;
    private List<FieldErrorDetail> errors;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class FieldErrorDetail {
    private String field;
    private String message;
}

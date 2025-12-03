package com.microsservicos.userservice.exception;

public class PasswordAlreadySetException extends RuntimeException {
    public PasswordAlreadySetException(String message) {
        super(message);
    }
}

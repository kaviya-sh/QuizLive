package com.quizlive.api.controller;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.quizlive.api.dto.SessionDto;
import com.quizlive.api.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.io.ByteArrayOutputStream;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SessionController {
    private final SessionService sessionService;

    @PostMapping
    public ResponseEntity<SessionDto.CreateResponse> createSession(@RequestBody SessionDto.CreateRequest request) {
        return ResponseEntity.ok(sessionService.createSession(request.getQuizId()));
    }

    @GetMapping("/{roomCode}")
    public ResponseEntity<SessionDto.StateResponse> getSessionState(@PathVariable String roomCode) {
        return ResponseEntity.ok(sessionService.getSessionState(roomCode));
    }

    @PatchMapping("/{roomCode}/start")
    public ResponseEntity<Void> startSession(@PathVariable String roomCode) {
        sessionService.startSession(roomCode);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{roomCode}/next")
    public ResponseEntity<Void> nextQuestion(@PathVariable String roomCode) {
        sessionService.nextQuestion(roomCode);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{roomCode}/end")
    public ResponseEntity<Void> endSession(@PathVariable String roomCode) {
        sessionService.endSession(roomCode);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomCode}/qr")
    public ResponseEntity<byte[]> getQRCode(@PathVariable String roomCode) throws Exception {
        String url = "http://localhost:5173/join/" + roomCode;
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(url, BarcodeFormat.QR_CODE, 300, 300);
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .body(outputStream.toByteArray());
    }

    @GetMapping("/{roomCode}/participants")
    public ResponseEntity<List<SessionDto.ParticipantDto>> getParticipants(@PathVariable String roomCode) {
        return ResponseEntity.ok(sessionService.getParticipants(roomCode));
    }

    @DeleteMapping("/{roomCode}/participants/{participantId}")
    public ResponseEntity<Void> removeParticipant(@PathVariable String roomCode, @PathVariable String participantId) {
        sessionService.removeParticipant(roomCode, participantId);
        return ResponseEntity.ok().build();
    }
}

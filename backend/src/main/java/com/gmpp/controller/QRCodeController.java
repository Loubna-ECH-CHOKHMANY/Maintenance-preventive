package com.gmpp.controller;

import com.gmpp.service.QRCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/qrcode")
@RequiredArgsConstructor
@Tag(name = "QR Code", description = "Génération de QR codes pour machines et interventions")
public class QRCodeController {
    private final QRCodeService qrCodeService;

    @GetMapping(value = "/machine/{machineId}", produces = MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "QR Code pour une machine",
               description = "Retourne une image PNG du QR code contenant l'URL de la machine")
    public ResponseEntity<byte[]> getQRMachine(
            @PathVariable Long machineId, HttpServletRequest request) throws Exception {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .body(qrCodeService.genererQRCodeMachine(machineId, baseUrl));
    }

    @GetMapping(value = "/intervention/{interventionId}", produces = MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "QR Code pour une intervention")
    public ResponseEntity<byte[]> getQRIntervention(
            @PathVariable Long interventionId, HttpServletRequest request) throws Exception {
        String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .body(qrCodeService.genererQRCodeIntervention(interventionId, baseUrl));
    }
}

package com.gmpp.service;

import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.gmpp.repository.MachineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.HashMap;
import java.util.Map;

@Service @RequiredArgsConstructor
public class QRCodeService {
    private final MachineRepository machineRepo;

    public byte[] genererQRCodeMachine(Long machineId, String baseUrl) throws Exception {
        var machine = machineRepo.findById(machineId)
            .orElseThrow(() -> new RuntimeException("Machine non trouvée: " + machineId));

        String content = String.format(
            "%s/machines/%d?nom=%s&serie=%s",
            baseUrl, machineId,
            machine.getNom().replace(" ", "+"),
            machine.getNumeroSerie()
        );

        return genererQR(content, 400, 400);
    }

    public byte[] genererQRCodeIntervention(Long interventionId, String baseUrl) throws Exception {
        String content = baseUrl + "/interventions/" + interventionId;
        return genererQR(content, 300, 300);
    }

    private byte[] genererQR(String content, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 2);

        BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }
}

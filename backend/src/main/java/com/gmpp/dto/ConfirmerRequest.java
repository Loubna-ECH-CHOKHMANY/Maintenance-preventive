package com.gmpp.dto;
import com.gmpp.enums.EtatConstate;
import lombok.Data;
@Data
public class ConfirmerRequest {
    private String observations;
    private EtatConstate etatConstate;
    private Integer dureeMinutes;
}

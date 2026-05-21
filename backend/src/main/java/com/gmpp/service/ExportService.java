package com.gmpp.service;

import com.gmpp.entity.Intervention;
import com.gmpp.entity.PieceRechange;
import com.gmpp.repository.InterventionRepository;
import com.gmpp.repository.PieceRechangeRepository;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;

import com.opencsv.CSVWriter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;

import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.*;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExportService {

    private final InterventionRepository interventionRepo;
    private final PieceRechangeRepository pieceRepo;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FMT_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // ================= CSV =================

    public byte[] exportInterventionsCSV() throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVWriter w = new CSVWriter(sw)) {
            w.writeNext(new String[]{"ID","Machine","Technicien","Date Planifiée","Date Exécution","Durée","Statut"});
            for (Intervention i : interventionRepo.findAll()) {
                w.writeNext(new String[]{
                        String.valueOf(i.getId()),
                        i.getMachine() != null ? i.getMachine().getNom() : "",
                        i.getTechnicien() != null ? i.getTechnicien().getNomComplet() : "",
                        i.getDatePlanifiee() != null ? i.getDatePlanifiee().format(FMT) : "",
                        i.getDateReelleExecution() != null ? i.getDateReelleExecution().format(FMT) : "",
                        i.getDureeEffectiveMinutes() != null ? String.valueOf(i.getDureeEffectiveMinutes()) : "",
                        i.getStatut() != null ? i.getStatut().name() : ""
                });
            }
        }
        return sw.toString().getBytes("UTF-8");
    }

    public byte[] exportStockCSV() throws Exception {
        StringWriter sw = new StringWriter();
        try (CSVWriter w = new CSVWriter(sw)) {
            w.writeNext(new String[]{"Référence","Désignation","Stock"});
            for (PieceRechange p : pieceRepo.findAll()) {
                w.writeNext(new String[]{
                        nvl(p.getReference()),
                        nvl(p.getDesignation()),
                        p.getQuantiteStock() != null ? String.valueOf(p.getQuantiteStock()) : "0"
                });
            }
        }
        return sw.toString().getBytes("UTF-8");
    }

    // ================= EXCEL =================

    public byte[] exportInterventionsExcel() throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("Interventions");

            CellStyle hdr = wb.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = wb.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());

            hdr.setFont(font);
            hdr.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            hdr.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            hdr.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {"ID","Machine","Technicien","Date","Statut"};

            Row headerRow = sheet.createRow(0);
            for (int c = 0; c < headers.length; c++) {
                Cell cell = headerRow.createCell(c);
                cell.setCellValue(headers[c]);
                cell.setCellStyle(hdr);
            }

            List<Intervention> list = interventionRepo.findAll();

            for (int r = 0; r < list.size(); r++) {
                Intervention i = list.get(r);

                Row row = sheet.createRow(r + 1);

                row.createCell(0).setCellValue(i.getId());
                row.createCell(1).setCellValue(i.getMachine() != null ? i.getMachine().getNom() : "");
                row.createCell(2).setCellValue(i.getTechnicien() != null ? i.getTechnicien().getNomComplet() : "");
                row.createCell(3).setCellValue(i.getDatePlanifiee() != null ? i.getDatePlanifiee().format(FMT) : "");
                row.createCell(4).setCellValue(i.getStatut() != null ? i.getStatut().name() : "");
            }

            wb.write(out);
            return out.toByteArray();
        }
    }

    public byte[] exportStockExcel() throws Exception {
        try (XSSFWorkbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = wb.createSheet("Stock");

            String[] headers = {"Référence","Désignation","Stock"};

            Row headerRow = sheet.createRow(0);
            for (int c = 0; c < headers.length; c++) {
                Cell cell = headerRow.createCell(c);
                cell.setCellValue(headers[c]);
            }

            List<PieceRechange> pieces = pieceRepo.findAll();

            for (int r = 0; r < pieces.size(); r++) {
                PieceRechange p = pieces.get(r);

                Row row = sheet.createRow(r + 1);
                row.createCell(0).setCellValue(nvl(p.getReference()));
                row.createCell(1).setCellValue(nvl(p.getDesignation()));
                row.createCell(2).setCellValue(p.getQuantiteStock() != null ? p.getQuantiteStock() : 0);
            }

            wb.write(out);
            return out.toByteArray();
        }
    }

    // ================= PDF =================

    public byte[] exportRapportPDF(String titre, String contenu) throws Exception {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        Document doc = new Document(PageSize.A4);
        PdfWriter.getInstance(doc, out);

        doc.open();

        doc.add(new Paragraph(titre));

        LineSeparator sep = new LineSeparator();
        doc.add(new Chunk(sep));

        doc.close();

        return out.toByteArray();
    }

    private String nvl(String s) {
        return s != null ? s : "";
    }
}
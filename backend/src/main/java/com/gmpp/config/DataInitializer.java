package com.gmpp.config;

import com.gmpp.entity.*;
import com.gmpp.enums.*;
import com.gmpp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component @RequiredArgsConstructor @Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UtilisateurRepository userRepo;
    private final MachineRepository machineRepo;
    private final PointMaintenanceRepository pointRepo;
    private final InterventionRepository interventionRepo;
    private final PieceRechangeRepository pieceRepo;
    private final PanneCorrectifRepository panneRepo;
    private final PasswordEncoder encoder;

    @Override @Transactional
    public void run(String... args) {
        if (userRepo.count() > 0) { log.info("Données déjà initialisées"); return; }
        log.info("Initialisation des données de démonstration GMPP Pro...");
        initUsers();
        initMachines();
        initStock();
        log.info("Données de démonstration initialisées avec succès !");
    }

    private void initUsers() {
        userRepo.saveAll(List.of(
            Utilisateur.builder().nomComplet("Ahmed El Mansouri").matricule("ADM001")
                .email("admin@gmpp.ma").motDePasse(encoder.encode("Admin@2024"))
                .role(RoleUtilisateur.ADMIN).actif(true)
                .specialites(List.of(Specialite.MECANIQUE, Specialite.ELECTRIQUE)).build(),
            Utilisateur.builder().nomComplet("Fatima Benali").matricule("RESP001")
                .email("responsable@gmpp.ma").motDePasse(encoder.encode("Resp@2024"))
                .role(RoleUtilisateur.RESPONSABLE_MAINTENANCE).actif(true)
                .specialites(List.of(Specialite.HYDRAULIQUE, Specialite.PNEUMATIQUE)).build(),
            Utilisateur.builder().nomComplet("Khalid Tahiri").matricule("CHEF001")
                .email("chef@gmpp.ma").motDePasse(encoder.encode("Chef@2024"))
                .role(RoleUtilisateur.CHEF_EQUIPE).actif(true)
                .specialites(List.of(Specialite.MECANIQUE)).build(),
            Utilisateur.builder().nomComplet("Youssef Lahlou").matricule("TECH001")
                .email("tech1@gmpp.ma").motDePasse(encoder.encode("Tech@2024"))
                .role(RoleUtilisateur.TECHNICIEN).actif(true)
                .specialites(List.of(Specialite.MECANIQUE, Specialite.HYDRAULIQUE)).build(),
            Utilisateur.builder().nomComplet("Hamid Zouak").matricule("TECH002")
                .email("tech2@gmpp.ma").motDePasse(encoder.encode("Tech@2024"))
                .role(RoleUtilisateur.TECHNICIEN).actif(true)
                .specialites(List.of(Specialite.ELECTRIQUE, Specialite.PNEUMATIQUE)).build()
        ));
        log.info("5 utilisateurs créés");
    }

    private void initMachines() {
        List<Utilisateur> techs = userRepo.findAll();
        Utilisateur tech1 = techs.stream().filter(u -> u.getMatricule().equals("TECH001")).findFirst().orElse(null);
        Utilisateur tech2 = techs.stream().filter(u -> u.getMatricule().equals("TECH002")).findFirst().orElse(null);

        Machine m1 = machineRepo.save(Machine.builder()
            .nom("Presse Hydraulique PH-500").typeMachine(TypeMachine.HYDRAULIQUE)
            .marque("Bosch Rexroth").modele("PH-500-A").numeroSerie("BRX-2021-0042")
            .anneeFabrication(2021).dateMiseEnService(LocalDate.of(2021, 3, 15))
            .atelier("Atelier A").zone("Zone 1").ligneProduction("Ligne 01")
            .statut(StatutMachine.EN_SERVICE).compteurHoraire(4250L).build());

        Machine m2 = machineRepo.save(Machine.builder()
            .nom("Tour CNC Mazatrol").typeMachine(TypeMachine.CNC)
            .marque("Mazak").modele("Mazatrol-T32B").numeroSerie("MZK-2019-0118")
            .anneeFabrication(2019).dateMiseEnService(LocalDate.of(2019, 8, 1))
            .atelier("Atelier B").zone("Zone 2").ligneProduction("Ligne 02")
            .statut(StatutMachine.EN_SERVICE).compteurHoraire(8760L).build());

        Machine m3 = machineRepo.save(Machine.builder()
            .nom("Compresseur Atlas Copco").typeMachine(TypeMachine.PNEUMATIQUE)
            .marque("Atlas Copco").modele("GA-90-FF").numeroSerie("ATC-2020-0055")
            .anneeFabrication(2020).dateMiseEnService(LocalDate.of(2020, 1, 10))
            .atelier("Salle Compresseurs").zone("Zone 3").ligneProduction("Alimentation générale")
            .statut(StatutMachine.EN_MAINTENANCE).compteurHoraire(6300L).build());

        Machine m4 = machineRepo.save(Machine.builder()
            .nom("Robot Soudure KUKA").typeMachine(TypeMachine.ELECTRIQUE)
            .marque("KUKA").modele("KR-210-R2700").numeroSerie("KUK-2022-0031")
            .anneeFabrication(2022).dateMiseEnService(LocalDate.of(2022, 6, 1))
            .atelier("Atelier Soudure").zone("Zone 4").ligneProduction("Ligne 03")
            .statut(StatutMachine.EN_SERVICE).compteurHoraire(2100L).build());

        // Points maintenance
        PointMaintenance pm1 = pointRepo.save(PointMaintenance.builder()
            .machine(m1).typeOperation(TypeOperation.GRAISSAGE)
            .description("Graissage vérin principal").localisationSurMachine("Vérin central")
            .typeConsommable("Graisse lithium EP2").quantiteNecessaire(50.0).uniteQuantite("grammes")
            .frequence(FrequenceIntervention.HEBDOMADAIRE)
            .prochaineDatePrevue(LocalDate.now().plusDays(3)).build());

        PointMaintenance pm2 = pointRepo.save(PointMaintenance.builder()
            .machine(m1).typeOperation(TypeOperation.VIDANGE_HUILE)
            .description("Vidange huile hydraulique").localisationSurMachine("Réservoir hydraulique")
            .typeConsommable("Huile HLP 46").referenceConsommable("HLP46-20L")
            .quantiteNecessaire(20.0).uniteQuantite("litres")
            .frequence(FrequenceIntervention.MENSUELLE)
            .prochaineDatePrevue(LocalDate.now().plusDays(12)).build());

        pointRepo.save(PointMaintenance.builder()
            .machine(m2).typeOperation(TypeOperation.VERIFICATION_COURROIE)
            .description("Vérification courroie transmission").localisationSurMachine("Carter latéral")
            .frequence(FrequenceIntervention.MENSUELLE)
            .prochaineDatePrevue(LocalDate.now().plusDays(8)).build());

        pointRepo.save(PointMaintenance.builder()
            .machine(m3).typeOperation(TypeOperation.CONTROLE_FILTRES)
            .description("Contrôle et remplacement filtres air").localisationSurMachine("Filtre entrée")
            .frequence(FrequenceIntervention.TRIMESTRIELLE)
            .prochaineDatePrevue(LocalDate.now().plusDays(45)).build());

        // Interventions demo
        List<Utilisateur> users = userRepo.findAll();
        Utilisateur technicien = users.stream().filter(u -> u.getRole() == RoleUtilisateur.TECHNICIEN).findFirst().orElse(null);

        interventionRepo.saveAll(List.of(
            Intervention.builder().machine(m1).pointMaintenance(pm1).technicien(technicien)
                .datePlanifiee(LocalDateTime.now().minusDays(2)).dateReelleExecution(LocalDateTime.now().minusDays(2).plusHours(1))
                .dureeEffectiveMinutes(45).statut(StatutIntervention.TERMINEE)
                .observationsTechnicien("Graissage effectué, état normal").etatConstate(EtatConstate.NORMAL)
                .confirmeParTechnicien(true).valideParResponsable(true).build(),
            Intervention.builder().machine(m1).pointMaintenance(pm2).technicien(technicien)
                .datePlanifiee(LocalDateTime.now().plusDays(12))
                .statut(StatutIntervention.PLANIFIEE).build(),
            Intervention.builder().machine(m2).technicien(technicien)
                .datePlanifiee(LocalDateTime.now().minusDays(5))
                .statut(StatutIntervention.EN_RETARD).build(),
            Intervention.builder().machine(m3).technicien(technicien)
                .datePlanifiee(LocalDateTime.now().plusDays(2))
                .statut(StatutIntervention.PLANIFIEE).build(),
            Intervention.builder().machine(m4).technicien(technicien)
                .datePlanifiee(LocalDateTime.now().minusDays(1))
                .dateReelleExecution(LocalDateTime.now().minusDays(1).plusMinutes(90))
                .dureeEffectiveMinutes(90).statut(StatutIntervention.TERMINEE)
                .observationsTechnicien("Contrôle câblage effectué").etatConstate(EtatConstate.USURE_DETECTEE)
                .confirmeParTechnicien(true).build()
        ));

        // Panne demo
        panneRepo.save(PanneCorrectif.builder()
            .machine(m3).technicien(technicien).titre("Pression insuffisante sortie compresseur")
            .description("Le compresseur ne monte pas au-delà de 6 bars alors que le réglage est à 8 bars")
            .urgence(NiveauUrgence.HAUTE).statut(StatutPanne.EN_COURS)
            .dateDeclaration(LocalDateTime.now().minusHours(4))
            .causesIdentifiees("Soupape de sécurité défectueuse suspectée").build());

        log.info("4 machines, 4 points maintenance, 5 interventions, 1 panne créés");
    }

    private void initStock() {
        pieceRepo.saveAll(List.of(
            PieceRechange.builder().reference("ROUL-6205-2RS").designation("Roulement à billes 6205-2RS")
                .categorie(CategoriePiece.ROULEMENT).marque("SKF").fournisseur("Roulements Maroc")
                .unite("pièce").quantiteStock(8).seuilAlerteMin(3).seuilAlerteMax(20)
                .quantiteCommandeOptimale(10).prixUnitaire(45.0).emplacement("Rack A - Tiroir 3").build(),
            PieceRechange.builder().reference("FILT-HYD-001").designation("Filtre hydraulique 25 microns")
                .categorie(CategoriePiece.FILTRATION).marque("Parker").fournisseur("Parker Maroc")
                .unite("pièce").quantiteStock(2).seuilAlerteMin(2).seuilAlerteMax(10)
                .quantiteCommandeOptimale(5).prixUnitaire(120.0).emplacement("Rack B - Étagère 1").build(),
            PieceRechange.builder().reference("HUIL-HLP46-20L").designation("Huile hydraulique HLP 46 - 20L")
                .categorie(CategoriePiece.LUBRIFIANT).marque("Total").fournisseur("Total Maroc")
                .unite("bidon 20L").quantiteStock(4).seuilAlerteMin(2).seuilAlerteMax(12)
                .quantiteCommandeOptimale(6).prixUnitaire(280.0).emplacement("Zone Lubrifiants").build(),
            PieceRechange.builder().reference("GRAI-LIT-EP2-1KG").designation("Graisse lithium EP2 - 1kg")
                .categorie(CategoriePiece.LUBRIFIANT).marque("Shell").fournisseur("Shell Maroc")
                .unite("boîte 1kg").quantiteStock(0).seuilAlerteMin(3).seuilAlerteMax(15)
                .quantiteCommandeOptimale(8).prixUnitaire(85.0).emplacement("Zone Lubrifiants").build(),
            PieceRechange.builder().reference("COUR-V-A75").designation("Courroie trapézoïdale A75")
                .categorie(CategoriePiece.COURROIE).marque("Gates").fournisseur("Transbelt Maroc")
                .unite("pièce").quantiteStock(3).seuilAlerteMin(2).seuilAlerteMax(10)
                .quantiteCommandeOptimale(5).prixUnitaire(65.0).emplacement("Rack C - Tiroir 1").build(),
            PieceRechange.builder().reference("JOINT-SPI-40x60").designation("Joint SPI 40x60x10")
                .categorie(CategoriePiece.JOINT).marque("NOK").fournisseur("Joints & Étanchéité Maroc")
                .unite("pièce").quantiteStock(6).seuilAlerteMin(4).seuilAlerteMax(20)
                .quantiteCommandeOptimale(10).prixUnitaire(22.0).emplacement("Rack A - Tiroir 5").build(),
            PieceRechange.builder().reference("FILT-AIR-GA90").designation("Filtre air Atlas Copco GA90")
                .categorie(CategoriePiece.FILTRATION).marque("Atlas Copco").fournisseur("Atlas Copco Maroc")
                .unite("pièce").quantiteStock(1).seuilAlerteMin(1).seuilAlerteMax(5)
                .quantiteCommandeOptimale(2).prixUnitaire(450.0).emplacement("Rack D - Étagère 2").build()
        ));
        log.info("7 pièces de rechange créées");
    }
}

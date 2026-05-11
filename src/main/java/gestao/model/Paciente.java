package gestao.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nomeCompleto;
    @Column(unique = true)
    private String cpf;
    private String telefone;
    private LocalDate dataNascimento;
    private String email;
    
    @Column(columnDefinition = "TEXT")
    private String observacoes;
}
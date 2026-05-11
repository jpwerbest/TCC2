package gestao.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Consulta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    private LocalDateTime dataHora;
    private String status; // "AGENDADA", "REALIZADA", "CANCELADA"

    @Column(columnDefinition = "TEXT")
    private String registroAtendimento;

    private String observacoesAgendamento;
}
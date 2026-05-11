package gestao.repository;

import gestao.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
    // Busca todas as consultas de um paciente específico para o prontuário
    List<Consulta> findByPacienteId(Long pacienteId);
}
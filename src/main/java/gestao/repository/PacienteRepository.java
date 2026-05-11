package gestao.repository;

import gestao.model.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    // Aqui você pode criar buscas personalizadas, como buscar por CPF
    Paciente findByCpf(String cpf);
}
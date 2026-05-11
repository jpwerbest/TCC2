package gestao.controller;

import gestao.model.Paciente;
import gestao.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
// Modificação crucial: especificamos os métodos permitidos para evitar o erro 405 e CORS
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class PacienteController {

    @Autowired
    private PacienteRepository repository;

    // Listar todos os pacientes
    @GetMapping
    public List<Paciente> listar() {
        return repository.findAll();
    }

    // Buscar um paciente específico pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Salvar novo paciente
    @PostMapping
    public Paciente salvar(@RequestBody Paciente paciente) {
        return repository.save(paciente);
    }

    // Atualizar prontuário e dados do paciente
    @PutMapping("/{id}")
    public ResponseEntity<Paciente> atualizar(@PathVariable Long id, @RequestBody Paciente dadosAtualizados) {
        return repository.findById(id)
            .map(paciente -> {
                // Atualiza os campos garantindo que não sejam nulos
                if (dadosAtualizados.getNomeCompleto() != null) paciente.setNomeCompleto(dadosAtualizados.getNomeCompleto());
                if (dadosAtualizados.getTelefone() != null) paciente.setTelefone(dadosAtualizados.getTelefone());
                if (dadosAtualizados.getEmail() != null) paciente.setEmail(dadosAtualizados.getEmail());
                if (dadosAtualizados.getObservacoes() != null) paciente.setObservacoes(dadosAtualizados.getObservacoes());
                
                Paciente atualizado = repository.save(paciente);
                return ResponseEntity.ok(atualizado);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    // Deletar paciente
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
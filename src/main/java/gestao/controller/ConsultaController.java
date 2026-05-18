package gestao.controller; // Ajuste para sua package real

import gestao.model.Consulta;
import gestao.repository.ConsultaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/consultas")
@CrossOrigin(origins = "*") // Permite que o React (Porta 5173/3000) acesse o Java
public class ConsultaController {

    @Autowired
    private ConsultaRepository consultaRepository;

    @GetMapping
    public List<Consulta> listarTodas() {
        return consultaRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> agendar(@RequestBody Consulta consulta) {
        try {
            // Log para depuração no terminal do VS Code
            System.out.println("Recebendo agendamento para o paciente ID: " + 
                (consulta.getPaciente() != null ? consulta.getPaciente().getId() : "NULO"));

            if (consulta.getPaciente() == null || consulta.getPaciente().getId() == null) {
                return ResponseEntity.badRequest().body("Erro: Paciente não selecionado ou ID nulo.");
            }

            Consulta novaConsulta = consultaRepository.save(consulta);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaConsulta);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("Erro no Banco: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Consulta> buscarPorId(@PathVariable Long id) {
        return consultaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody Consulta consultaAtualizada) {
        return consultaRepository.findById(id).map(consulta -> {
            consulta.setStatus(consultaAtualizada.getStatus());
            if (consultaAtualizada.getDataHora() != null) {
                consulta.setDataHora(consultaAtualizada.getDataHora());
            }
            if (consultaAtualizada.getPaciente() != null) {
                consulta.setPaciente(consultaAtualizada.getPaciente());
            }
            // Permite atualizar (e limpar) o registro de atendimento e observações
            consulta.setRegistroAtendimento(consultaAtualizada.getRegistroAtendimento());
            if (consultaAtualizada.getObservacoesAgendamento() != null) {
                consulta.setObservacoesAgendamento(consultaAtualizada.getObservacoesAgendamento());
            }
            Consulta salva = consultaRepository.save(consulta);
            return ResponseEntity.ok(salva);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        if (!consultaRepository.existsById(id)) return ResponseEntity.notFound().build();
        consultaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
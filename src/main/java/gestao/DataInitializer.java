package gestao;

import gestao.model.Usuario;
import gestao.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // Cria usuário MÉDICO se não existir
        if (usuarioRepository.findByEmail("medico@clinic.com").isEmpty()) {
            Usuario medico = new Usuario();
            medico.setNome("Dr. João Silva");
            medico.setEmail("medico@clinic.com");
            medico.setSenha(passwordEncoder.encode("123456"));
            medico.setRole(Usuario.Role.MEDICO);
            usuarioRepository.save(medico);
        }

        // Cria usuário ASSISTENTE se não existir
        if (usuarioRepository.findByEmail("assistente@clinic.com").isEmpty()) {
            Usuario assistente = new Usuario();
            assistente.setNome("Ana Souza");
            assistente.setEmail("assistente@clinic.com");
            assistente.setSenha(passwordEncoder.encode("123456"));
            assistente.setRole(Usuario.Role.ASSISTENTE);
            usuarioRepository.save(assistente);
        }

        System.out.println("-----------------------------------------");
        System.out.println("USUÁRIOS DE TESTE CRIADOS:");
        System.out.println("  Médico:     medico@clinic.com / 123456");
        System.out.println("  Assistente: assistente@clinic.com / 123456");
        System.out.println("-----------------------------------------");
    }
}

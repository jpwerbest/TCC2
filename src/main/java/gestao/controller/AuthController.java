package gestao.controller;

import gestao.dto.LoginRequest;
import gestao.dto.LoginResponse;
import gestao.model.Usuario;
import gestao.repository.UsuarioRepository;
import gestao.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Busca o usuário pelo e-mail
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElse(null);

        // Verifica se existe e se a senha confere
        if (usuario == null || !passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("{\"message\": \"E-mail ou senha inválidos.\"}");
        }

        // Gera o token JWT
        String token = jwtUtil.gerarToken(usuario.getEmail(), usuario.getRole().name());

        // Retorna os dados do usuário + token para o frontend
        LoginResponse response = new LoginResponse(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole().name(),
                token
        );

        return ResponseEntity.ok(response);
    }
}

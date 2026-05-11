package gestao.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String nome;
    private String email;
    private String role;  // "MEDICO" ou "ASSISTENTE"
    private String token; // JWT
}

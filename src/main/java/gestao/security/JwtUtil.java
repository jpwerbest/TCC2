package gestao.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Chave secreta — em produção, mova para application.properties
    private static final String SECRET = "minha-chave-secreta-super-segura-mediclinic-2024";
    private static final long EXPIRACAO_MS = 86400000L; // 24 horas

    private final Key chave = Keys.hmacShaKeyFor(SECRET.getBytes());

    // Gera o token com email e role como claims
    public String gerarToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRACAO_MS))
                .signWith(chave, SignatureAlgorithm.HS256)
                .compact();
    }

    // Extrai o email (subject) do token
    public String extrairEmail(String token) {
        return getClaims(token).getSubject();
    }

    // Extrai a role do token
    public String extrairRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    // Valida se o token é legítimo e não expirou
    public boolean validarToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(chave)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}

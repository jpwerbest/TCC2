package gestao.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Desativa CSRF (usamos JWT, não sessão)
            .csrf(csrf -> csrf.disable())

            // Configura CORS para aceitar requisições do frontend React
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Sem sessão — stateless com JWT
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Regras de autorização por rota e role
            .authorizeHttpRequests(auth -> auth

                // Rota pública: login e h2-console
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()

                // Assistente pode visualizar e criar pacientes; edição/exclusão só para MEDICO
                .requestMatchers(HttpMethod.GET, "/api/pacientes/**").hasAnyRole("MEDICO", "ASSISTENTE")
                .requestMatchers(HttpMethod.POST, "/api/pacientes/**").hasAnyRole("MEDICO", "ASSISTENTE")
                .requestMatchers(HttpMethod.PUT, "/api/pacientes/**").hasRole("MEDICO")
                .requestMatchers(HttpMethod.DELETE, "/api/pacientes/**").hasRole("MEDICO")

                // Dashboard e consultas: ambos os roles
                .requestMatchers("/api/consultas/**").hasAnyRole("MEDICO", "ASSISTENTE")

                // Qualquer outra rota exige autenticação
                .anyRequest().authenticated()
            )

            // Permite o h2-console ser exibido em iframe
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))

            // Adiciona o filtro JWT antes do filtro padrão de autenticação
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource()
     {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
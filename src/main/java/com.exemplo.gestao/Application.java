package com.exemplo.gestao;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
S
@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        // Esta linha inicia todo o ecossistema do Spring
        SpringApplication.run(Application.class, args);
        System.out.println("-----------------------------------------");
        System.out.println("SISTEMA MÉDICO ON-LINE NA PORTA 8080");
        System.out.println("ACESSE O BANCO EM: http://localhost:8080/h2-console");
        System.out.println("-----------------------------------------");
    }
}
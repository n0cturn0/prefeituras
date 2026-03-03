package com.licitacao.saas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class CestaPrecosApplication {

	public static void main(String[] args) {
		SpringApplication.run(CestaPrecosApplication.class, args);
	}

}

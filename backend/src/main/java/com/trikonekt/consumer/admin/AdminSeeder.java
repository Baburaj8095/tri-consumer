package com.trikonekt.consumer.admin;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {
  private final AdminRepository adminRepository;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  public AdminSeeder(AdminRepository adminRepository) {
    this.adminRepository = adminRepository;
  }

  @Override
  public void run(String... args) {
    try {
      if (adminRepository.countAdmins() == 0) {
        // Seed default admin: admin / admin123
        adminRepository.createAdmin("admin", passwordEncoder.encode("admin123"));
        System.out.println("Default administrator 'admin' successfully seeded.");
      }
    } catch (Exception ex) {
      System.err.println("Error seeding default administrator: " + ex.getMessage());
    }
  }
}

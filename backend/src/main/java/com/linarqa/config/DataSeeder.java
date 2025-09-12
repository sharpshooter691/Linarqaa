package com.linarqa.config;

import com.linarqa.entity.Student;
import com.linarqa.entity.User;
import com.linarqa.repository.StudentRepository;
import com.linarqa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if no users exist
        if (userRepository.count() == 0) {
            seedUsers();
        }
        
        // Only seed if no students exist
        if (studentRepository.count() == 0) {
            seedStudents();
        }
    }

    private void seedUsers() {
        List<User> users = Arrays.asList(
            // Owner
            User.builder()
                .id(UUID.randomUUID())
                .email("admin@linarqa.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .fullName("Ahmed Benali")
                .fullNameArabic("أحمد بن علي")
                .phone("+212-6-12-34-56-78")
                .role(User.UserRole.OWNER)
                .languagePreference(User.LanguagePreference.FR)
                .active(true)
                .build(),
            
            // Staff members
            User.builder()
                .id(UUID.randomUUID())
                .email("staff1@linarqa.com")
                .passwordHash(passwordEncoder.encode("staff123"))
                .fullName("Fatima Zahra")
                .fullNameArabic("فاطمة الزهراء")
                .phone("+212-6-23-45-67-89")
                .role(User.UserRole.STAFF)
                .languagePreference(User.LanguagePreference.FR)
                .active(true)
                .build(),
            
            User.builder()
                .id(UUID.randomUUID())
                .email("staff2@linarqa.com")
                .passwordHash(passwordEncoder.encode("staff123"))
                .fullName("Karim Alami")
                .fullNameArabic("كريم العلمي")
                .phone("+212-6-34-56-78-90")
                .role(User.UserRole.STAFF)
                .languagePreference(User.LanguagePreference.AR)
                .active(true)
                .build()
        );

        userRepository.saveAll(users);
        System.out.println("✅ Users seeded successfully!");
    }

    private void seedStudents() {
        List<Student> students = Arrays.asList(
            // Petite Section Students
            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Amina")
                .lastName("Bouazza")
                .firstNameArabic("أمينة")
                .lastNameArabic("بوعزة")
                .birthDate(LocalDate.of(2020, 3, 15))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.PETITE)
                .classroom("Petite A")
                .guardianName("Mohammed Bouazza")
                .guardianNameArabic("محمد بوعزة")
                .guardianPhone("+212-6-11-22-33-44")
                .address("123 Rue Hassan II, Casablanca")
                .addressArabic("123 شارع الحسن الثاني، الدار البيضاء")
                .allergies("None")
                .notes("Very active child, loves drawing")
                .photoUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face")
                .status(Student.StudentStatus.ACTIVE)
                .build(),

            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Youssef")
                .lastName("Tazi")
                .firstNameArabic("يوسف")
                .lastNameArabic("التازي")
                .birthDate(LocalDate.of(2020, 7, 22))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.PETITE)
                .classroom("Petite A")
                .guardianName("Aicha Tazi")
                .guardianNameArabic("عائشة التازي")
                .guardianPhone("+212-6-22-33-44-55")
                .address("456 Avenue Mohammed V, Rabat")
                .addressArabic("456 شارع محمد الخامس، الرباط")
                .allergies("Peanuts")
                .notes("Shy at first, but very friendly")
                .photoUrl("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face")
                .status(Student.StudentStatus.ACTIVE)
                .build(),

            // Moyenne Section Students
            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Layla")
                .lastName("Cherkaoui")
                .firstNameArabic("ليلى")
                .lastNameArabic("شرقاوي")
                .birthDate(LocalDate.of(2019, 1, 10))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.MOYENNE)
                .classroom("Moyenne A")
                .guardianName("Hassan Cherkaoui")
                .guardianNameArabic("حسن شرقاوي")
                .guardianPhone("+212-6-33-44-55-66")
                .address("789 Boulevard Al Massira, Marrakech")
                .addressArabic("789 شارع المسيرة، مراكش")
                .allergies("None")
                .notes("Excellent in mathematics")
                .photoUrl("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face")
                .status(Student.StudentStatus.ACTIVE)
                .build(),

            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Adam")
                .lastName("Benjelloun")
                .firstNameArabic("آدم")
                .lastNameArabic("بنجلون")
                .birthDate(LocalDate.of(2019, 5, 18))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.MOYENNE)
                .classroom("Moyenne A")
                .guardianName("Nadia Benjelloun")
                .guardianNameArabic("نادية بنجلون")
                .guardianPhone("+212-6-44-55-66-77")
                .address("321 Rue Ibn Batouta, Tangier")
                .addressArabic("321 شارع ابن بطوطة، طنجة")
                .allergies("Dairy")
                .notes("Loves reading and storytelling")
                .status(Student.StudentStatus.ACTIVE)
                .build(),

            // Grande Section Students
            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Zara")
                .lastName("El Fassi")
                .firstNameArabic("زارا")
                .lastNameArabic("الفقاسي")
                .birthDate(LocalDate.of(2018, 9, 5))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.GRANDE)
                .classroom("Grande A")
                .guardianName("Omar El Fassi")
                .guardianNameArabic("عمر الفقاسي")
                .guardianPhone("+212-6-55-66-77-88")
                .address("654 Avenue Hassan II, Fes")
                .addressArabic("654 شارع الحسن الثاني، فاس")
                .allergies("None")
                .notes("Natural leader, helps other children")
                .status(Student.StudentStatus.ACTIVE)
                .build(),

            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Rayan")
                .lastName("Mansouri")
                .firstNameArabic("ريان")
                .lastNameArabic("المنصوري")
                .birthDate(LocalDate.of(2018, 12, 12))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.GRANDE)
                .classroom("Grande A")
                .guardianName("Samira Mansouri")
                .guardianNameArabic("سميرة المنصوري")
                .guardianPhone("+212-6-66-77-88-99")
                .address("987 Rue Atlas, Agadir")
                .addressArabic("987 شارع الأطلس، أكادير")
                .allergies("Shellfish")
                .notes("Very creative, loves art and music")
                .status(Student.StudentStatus.ACTIVE)
                .build(),

            // Additional students for variety
            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Nour")
                .lastName("Alaoui")
                .firstNameArabic("نور")
                .lastNameArabic("العلوي")
                .birthDate(LocalDate.of(2020, 4, 20))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.PETITE)
                .classroom("Petite B")
                .guardianName("Khalid Alaoui")
                .guardianNameArabic("خالد العلوي")
                .guardianPhone("+212-6-77-88-99-00")
                .address("147 Rue Ibn Khaldoun, Meknes")
                .addressArabic("147 شارع ابن خلدون، مكناس")
                .allergies("None")
                .notes("Very curious and asks many questions")
                .status(Student.StudentStatus.ACTIVE)
                .build(),

            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Khalil")
                .lastName("Bennani")
                .firstNameArabic("خليل")
                .lastNameArabic("بناني")
                .birthDate(LocalDate.of(2019, 8, 14))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.MOYENNE)
                .classroom("Moyenne B")
                .guardianName("Leila Bennani")
                .guardianNameArabic("ليلى بناني")
                .guardianPhone("+212-6-88-99-00-11")
                .address("258 Avenue Mohammed VI, Oujda")
                .addressArabic("258 شارع محمد السادس، وجدة")
                .allergies("None")
                .notes("Excellent in sports and physical activities")
                .status(Student.StudentStatus.ACTIVE)
                .build(),

            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Sara")
                .lastName("Idrissi")
                .firstNameArabic("سارة")
                .lastNameArabic("الإدريسي")
                .birthDate(LocalDate.of(2018, 2, 28))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.GRANDE)
                .classroom("Grande B")
                .guardianName("Ahmed Idrissi")
                .guardianNameArabic("أحمد الإدريسي")
                .guardianPhone("+212-6-99-00-11-22")
                .address("369 Boulevard Hassan I, Tetouan")
                .addressArabic("369 شارع الحسن الأول، تطوان")
                .allergies("None")
                .notes("Very organized and responsible")
                .status(Student.StudentStatus.ACTIVE)
                .build(),

            Student.builder()
                .id(UUID.randomUUID())
                .firstName("Mehdi")
                .lastName("Rahmani")
                .firstNameArabic("مهدي")
                .lastNameArabic("الرحماني")
                .birthDate(LocalDate.of(2018, 6, 8))
                .studentType(Student.StudentType.KINDERGARTEN)
                .level(Student.StudentLevel.GRANDE)
                .classroom("Grande B")
                .guardianName("Amina Rahmani")
                .guardianNameArabic("أمينة الرحماني")
                .guardianPhone("+212-6-00-11-22-33")
                .address("741 Rue Ibn Sina, Kenitra")
                .addressArabic("741 شارع ابن سينا، القنيطرة")
                .allergies("None")
                .notes("Loves science experiments")
                .status(Student.StudentStatus.ACTIVE)
                .build()
        );

        studentRepository.saveAll(students);
        System.out.println("✅ Students seeded successfully!");
        System.out.println("📊 Total students created: " + students.size());
    }
} 
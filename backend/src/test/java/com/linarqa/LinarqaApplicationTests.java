package com.linarqa;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = LinarqaApplication.class)
@ActiveProfiles("test")
class LinarqaApplicationTests {

    @Test
    void contextLoads() {
        // This test will pass if the Spring context loads successfully
    }
} 
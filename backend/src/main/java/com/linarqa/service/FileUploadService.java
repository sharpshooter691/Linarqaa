package com.linarqa.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileUploadService {

    private static final String UPLOAD_DIR = "uploads/students/";

    public String uploadFile(MultipartFile file) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);
        String filename = UUID.randomUUID().toString() + fileExtension;

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return the full URL for frontend access
        return "http://localhost:8080/api/uploads/students/" + filename;
    }

    public String saveBase64Image(String base64Data, String fileExtension) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String filename = UUID.randomUUID().toString() + fileExtension;

        // Decode base64 and save
        byte[] imageData = java.util.Base64.getDecoder().decode(base64Data);
        Path filePath = uploadPath.resolve(filename);
        Files.write(filePath, imageData);

        // Return the full URL for frontend access
        return "http://localhost:8080/api/uploads/students/" + filename;
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return ".jpg"; // Default extension
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    public boolean deleteFile(String fileUrl) {
        try {
            if (fileUrl != null && (fileUrl.startsWith("/api/uploads/students/") || fileUrl.startsWith("http://localhost:8080/api/uploads/students/"))) {
                String filename;
                if (fileUrl.startsWith("http://localhost:8080/api/uploads/students/")) {
                    filename = fileUrl.substring("http://localhost:8080/api/uploads/students/".length());
                } else {
                    filename = fileUrl.substring("/api/uploads/students/".length());
                }
                Path filePath = Paths.get(UPLOAD_DIR, filename);
                return Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            // Log error but don't throw
            System.err.println("Error deleting file: " + e.getMessage());
        }
        return false;
    }
} 
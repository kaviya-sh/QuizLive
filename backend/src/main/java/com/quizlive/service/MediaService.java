package com.quizlive.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {
    
    private final Cloudinary cloudinary;
    
    public String uploadFile(MultipartFile file) throws IOException {
        String publicId = "quizlive/" + UUID.randomUUID().toString();
        
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap(
                "public_id", publicId,
                "resource_type", "auto"
            )
        );
        
        return (String) uploadResult.get("secure_url");
    }
}
